"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const media_repository_1 = require("../repositories/media.repository");
const admin_notifier_1 = require("./admin-notifier");
const User_1 = require("../models/User");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("../utils/exceptions");
const seo_1 = require("../utils/seo");
// Query param name → product field. Every marketing list has an independent
// boolean on the product; filters are combinable (AND).
const FLAG_FILTER_MAP = {
    newArrival: 'isNewArrival',
    bestSeller: 'isBestSeller',
    trending: 'isTrending',
    sale: 'isOnSale',
    featured: 'isFeatured',
    recommended: 'isRecommended',
    exclusive: 'isExclusive',
    limitedEdition: 'isLimitedEdition',
    editorsPick: 'isEditorsPick',
    premiumCollection: 'isPremiumCollection',
};
class ProductService {
    constructor(productRepo, categoryRepo, collectionRepo, reviewRepo, inventoryRepo, wishlistRepo, cartRepo, couponRepo, notificationService, mediaRepo = new media_repository_1.MediaRepository()) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.collectionRepo = collectionRepo;
        this.reviewRepo = reviewRepo;
        this.inventoryRepo = inventoryRepo;
        this.wishlistRepo = wishlistRepo;
        this.cartRepo = cartRepo;
        this.couponRepo = couponRepo;
        this.notificationService = notificationService;
        this.mediaRepo = mediaRepo;
    }
    async syncCategoryCount(categoryId) {
        if (!categoryId)
            return;
        const count = await this.productRepo.count({ category: categoryId, status: 'active' });
        await this.categoryRepo.updateById(categoryId.toString(), { productCount: count });
    }
    async syncInventory(product) {
        await this.inventoryRepo.upsertByProduct(product);
    }
    async checkLowStock(product) {
        if (!product.trackQuantity)
            return;
        const totalStock = product.variants && product.variants.length > 0
            ? product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
            : product.stock;
        if (totalStock <= (product.lowStockThreshold ?? 5)) {
            await (0, admin_notifier_1.notifyAdmins)(this.notificationService, {
                title: 'Low Stock Alert',
                message: `${product.name} has only ${totalStock} unit(s) left.`,
                type: 'warning',
                relatedId: product._id,
                relatedType: 'Product',
            });
        }
    }
    async createProduct(productData) {
        productData = (0, seo_1.normalizeSeo)(productData);
        if (productData.category) {
            const categoryExists = await this.categoryRepo.exists({ _id: productData.category });
            if (!categoryExists) {
                throw new exceptions_1.BadRequestException('Category not found');
            }
        }
        if (productData.collection) {
            const collectionExists = await this.collectionRepo.exists({ _id: productData.collection });
            if (!collectionExists) {
                throw new exceptions_1.BadRequestException('Collection not found');
            }
        }
        // Validate every marketing collection slug exists in the CMS
        if (productData.collections?.length) {
            const valid = await this.collectionRepo.exists({ slug: { $in: productData.collections } });
            const count = await this.collectionRepo.count({ slug: { $in: productData.collections } });
            if (!valid || count !== new Set(productData.collections).size) {
                throw new exceptions_1.BadRequestException('One or more collections do not exist');
            }
        }
        if (!productData.slug && productData.name) {
            productData.slug = this.generateSlug(productData.name);
        }
        if (productData.slug && await this.productRepo.findBySlug(productData.slug)) {
            throw new exceptions_1.BadRequestException('Product slug already exists');
        }
        if (productData.sku && await this.productRepo.findBySku(productData.sku)) {
            throw new exceptions_1.BadRequestException('Product SKU already exists');
        }
        // Keep collection.products array in sync when a collection is assigned
        if (productData.collection) {
            await this.collectionRepo.updateById(productData.collection.toString(), {
                $addToSet: { products: productData._id ? productData._id : undefined },
            }).catch(() => undefined);
        }
        const product = await this.productRepo.create(productData);
        // Sync inventory ledger + category count + low-stock alert
        await this.syncInventory(product);
        await this.syncCategoryCount(productData.category);
        if (productData.collection) {
            await this.collectionRepo.updateById(productData.collection.toString(), {
                $addToSet: { products: product._id },
            }).catch(() => undefined);
        }
        await this.checkLowStock(product);
        return product;
    }
    async getProductById(productId) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        return product;
    }
    async getProductBySlug(slug) {
        const product = await this.productRepo.findBySlug(slug);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        return product;
    }
    async updateProduct(productId, updateData) {
        updateData = (0, seo_1.normalizeSeo)(updateData);
        const existing = await this.productRepo.findById(productId);
        if (!existing) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        if (updateData.category) {
            const categoryExists = await this.categoryRepo.exists({ _id: updateData.category });
            if (!categoryExists) {
                throw new exceptions_1.BadRequestException('Category not found');
            }
        }
        if (updateData.collection) {
            const collectionExists = await this.collectionRepo.exists({ _id: updateData.collection });
            if (!collectionExists) {
                throw new exceptions_1.BadRequestException('Collection not found');
            }
        }
        if (updateData.collections?.length) {
            const count = await this.collectionRepo.count({ slug: { $in: updateData.collections } });
            if (count !== new Set(updateData.collections).size) {
                throw new exceptions_1.BadRequestException('One or more collections do not exist');
            }
        }
        if (updateData.name && !updateData.slug) {
            updateData.slug = this.generateSlug(updateData.name);
        }
        if (updateData.slug) {
            const matchingProduct = await this.productRepo.findBySlug(updateData.slug);
            if (matchingProduct && String(matchingProduct._id) !== productId)
                throw new exceptions_1.BadRequestException('Product slug already exists');
        }
        const updatedProduct = await this.productRepo.updateById(productId, updateData);
        if (!updatedProduct) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        // Keep everything synchronized: inventory, category counts (old + new), collections, low stock
        await this.syncInventory(updatedProduct);
        await this.syncCategoryCount(existing.category);
        await this.syncCategoryCount(updatedProduct.category);
        await this.syncCollections(existing, updatedProduct);
        await this.checkLowStock(updatedProduct);
        return updatedProduct;
    }
    async syncCollections(existing, updated) {
        const oldCollection = existing.collection ? existing.collection.toString() : null;
        const newCollection = updated.collection ? updated.collection.toString() : null;
        if (oldCollection && oldCollection !== newCollection) {
            await this.collectionRepo.updateById(oldCollection, { $pull: { products: existing._id } });
        }
        if (newCollection && oldCollection !== newCollection) {
            await this.collectionRepo.updateById(newCollection, { $addToSet: { products: existing._id } });
        }
    }
    async deleteProduct(productId) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        // Cascade cleanup: reviews, cart items, wishlists, coupons, collections, inventory
        await this.reviewRepo.deleteMany({ productId });
        await this.cartRepo.deleteMany({ 'items.productId': productId });
        // Wishlist stores ids in a `productIds` array — target that field
        await this.wishlistRepo.deleteMany({ productIds: productId });
        // Also pull the id from users' embedded wishlist arrays
        await User_1.UserModel.updateMany({ wishlist: productId }, { $pull: { wishlist: productId } });
        // Also pull the id from users' embedded wishlist arrays and carts
        await this.couponRepo.updateMany({ productIds: productId }, { $pull: { productIds: productId } });
        await this.collectionRepo.updateMany({ products: productId }, { $pull: { products: productId } });
        await this.inventoryRepo.deleteMany({ productId });
        // Cascade the product's own media library entries (URL-matched) so
        // deleted products do not leave orphaned MediaFile documents behind.
        const mediaUrls = [
            ...(product.images ?? []).map((img) => img?.url),
            ...(product.videos ?? []).map((v) => v?.url),
            ...(product.videos ?? []).map((v) => v?.thumbnail),
        ].filter(Boolean);
        if (mediaUrls.length > 0) {
            await this.mediaRepo.deleteMany({ url: { $in: mediaUrls } });
            await this.mediaRepo.deleteMany({ thumbnailUrl: { $in: mediaUrls } });
        }
        const deleted = await this.productRepo.deleteById(productId);
        if (!deleted) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        await this.syncCategoryCount(product.category);
        return true;
    }
    async getProducts(options = {}) {
        const filter = {};
        // Storefront defaults to live products only; an explicit `status` param
        // (used by the admin product manager) overrides that. `status=all` from
        // the admin list shows every status including draft/archived.
        if (options.status && options.status !== 'all')
            filter.status = options.status;
        else if (!options.status)
            filter.status = 'active';
        const paginateOptions = { ...options };
        // Multi-category support (OR semantics): `category` and/or `categories`
        // may be a single value, a comma-separated list, or a repeated query
        // param (array). Values may be category _ids or slugs — both are
        // resolved into _ids and applied as a single $in (union) filter. A
        // product only ever belongs to one category, so $in is the only
        // correct semantic.
        const categoryValues = this.collectListParam(options.category).concat(this.collectListParam(options.categories));
        if (categoryValues.length > 0) {
            const categoryIds = await this.resolveCategoryIds(categoryValues);
            // $in: [] matches nothing, so a stale/unknown slug yields an empty
            // (but valid) result instead of falling back to "all products".
            filter.category = categoryIds.length > 1 ? { $in: categoryIds } : categoryIds.length === 1 ? categoryIds[0] : { $in: [] };
        }
        if (options.collections) {
            const collectionList = Array.isArray(options.collections)
                ? options.collections
                : String(options.collections)
                    .split(',')
                    .map((slug) => slug.trim())
                    .filter(Boolean);
            filter.collections = collectionList.length > 1 ? { $in: collectionList } : collectionList[0];
        }
        if (options.collection)
            filter.collection = options.collection;
        // Independent marketing flags (combinable). Each param maps to a product
        // boolean field; multiple flags AND together. Accepts true/false/1/0.
        for (const [param, field] of Object.entries(FLAG_FILTER_MAP)) {
            const value = options[param];
            if (value === undefined || value === null)
                continue;
            const enabled = String(value).toLowerCase();
            if (enabled === 'true' || enabled === '1')
                filter[field] = true;
            else if (enabled === 'false' || enabled === '0')
                filter[field] = false;
        }
        if (options.minPrice !== undefined)
            filter.price = { ...filter.price, $gte: options.minPrice };
        if (options.maxPrice !== undefined)
            filter.price = { ...filter.price, $lte: options.maxPrice };
        // Server-side search (name / description / tags / sku) — the admin
        // product list searches across all pages, not just the current one.
        if (options.search) {
            const re = new RegExp(String(options.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [
                { name: { $regex: re } },
                { description: { $regex: re } },
                { tags: { $regex: re } },
                { sku: { $regex: re } },
            ];
        }
        for (const param of Object.keys(FLAG_FILTER_MAP))
            delete paginateOptions[param];
        delete paginateOptions.category;
        delete paginateOptions.categories;
        delete paginateOptions.collection;
        delete paginateOptions.collections;
        delete paginateOptions.featured;
        delete paginateOptions.status;
        delete paginateOptions.search;
        delete paginateOptions.minPrice;
        delete paginateOptions.maxPrice;
        return this.productRepo.paginate(filter, paginateOptions);
    }
    // Splits a query param into a list of values regardless of whether it
    // arrived as a single string, a comma-separated string, or a repeated
    // (array) param. Values are URL-decoded, trimmed and lowercased.
    collectListParam(value) {
        if (value === undefined || value === null)
            return [];
        const rawList = Array.isArray(value) ? value : String(value);
        const list = Array.isArray(rawList) ? rawList : [rawList];
        const values = [];
        for (const item of list) {
            for (const part of String(item).split(',')) {
                const cleaned = this.normalizeCategoryValue(part);
                if (cleaned)
                    values.push(cleaned);
            }
        }
        return values;
    }
    normalizeCategoryValue(value) {
        let cleaned = value.trim().toLowerCase();
        try {
            cleaned = decodeURIComponent(cleaned);
        }
        catch {
            // already decoded or not encodable — keep as-is
        }
        cleaned = cleaned.trim();
        return cleaned;
    }
    // Accepts a mix of category _ids and slugs; slugs are resolved to _ids
    // server-side so the client never needs to know category ids.
    async resolveCategoryIds(values) {
        const ids = new Set();
        const slugCandidates = [];
        for (const value of values) {
            if (mongoose_1.Types.ObjectId.isValid(value)) {
                ids.add(value);
            }
            else {
                slugCandidates.push(value);
            }
        }
        if (slugCandidates.length > 0) {
            const matches = await this.categoryRepo.findMany({ slug: { $in: slugCandidates } });
            for (const match of matches)
                ids.add(String(match._id));
        }
        return Array.from(ids);
    }
    async getFeaturedProducts(limit = 10) {
        return this.productRepo.findFeatured(limit);
    }
    async getNewArrivals(limit = 10) {
        return this.productRepo.findNewArrivals(limit);
    }
    async getOnSaleProducts(limit = 10) {
        return this.productRepo.findOnSale(limit);
    }
    async getBestSellers(limit = 10) {
        return this.productRepo.findBestSellers(limit);
    }
    async getTrendingProducts(limit = 10) {
        return this.productRepo.findTrending(limit);
    }
    async getRelatedProducts(productId, limit = 4) {
        const product = await this.productRepo.findById(productId);
        if (!product || !product.category) {
            return [];
        }
        return this.productRepo.findMany({
            category: product.category,
            _id: { $ne: product._id },
            status: 'active',
        }, { sort: { 'rating.average': -1 }, limit });
    }
    async getByIds(ids) {
        return this.productRepo.findByIds(ids);
    }
    async searchProducts(query, options = {}) {
        const searchOptions = { ...options };
        const collectionFilter = {};
        if (options.collections) {
            const collectionList = Array.isArray(options.collections)
                ? options.collections
                : String(options.collections)
                    .split(',')
                    .map((slug) => slug.trim())
                    .filter(Boolean);
            collectionFilter.collections = collectionList.length > 1 ? { $in: collectionList } : collectionList[0];
        }
        delete searchOptions.collections;
        return this.productRepo.searchWithFilter(query, searchOptions, collectionFilter);
    }
    async getProductsByCategory(categoryId, options = {}) {
        return this.productRepo.paginate({ category: categoryId, status: 'active' }, options);
    }
    async getProductsByCollection(collectionId, options = {}) {
        return this.productRepo.paginate({ collection: collectionId, status: 'active' }, options);
    }
    async getProductReviews(productId, options = {}) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        return this.reviewRepo.findByProductId(productId, options);
    }
    async addProductReview(productId, userId, reviewData) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        const existingReview = await this.reviewRepo.findByProductAndUser(productId, userId);
        if (existingReview) {
            throw new exceptions_1.BadRequestException('You have already reviewed this product');
        }
        const review = await this.reviewRepo.create({
            ...reviewData,
            productId,
            userId,
        });
        // Recompute product rating from approved reviews
        await this.recomputeRating(productId);
        return review;
    }
    async recomputeRating(productId) {
        const stats = await this.reviewRepo.getApprovedRatingStats(productId);
        await this.productRepo.updateById(productId, { rating: stats });
    }
    async updateProductStock(productId, quantity) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        const updated = await this.productRepo.updateById(productId, {
            stock: Math.max(0, quantity),
        });
        await this.syncInventory(updated);
        await this.checkLowStock(updated);
        return updated;
    }
    generateSlug(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
}
exports.ProductService = ProductService;
