"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
const Coupon_1 = require("../models/Coupon");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("../utils/exceptions");
class CollectionService {
    constructor(collectionRepo, productRepo) {
        this.collectionRepo = collectionRepo;
        this.productRepo = productRepo;
    }
    async getCollections(filter = {}, options = {}) {
        return this.collectionRepo.paginate(filter, options);
    }
    async getCollectionById(id) {
        const collection = await this.collectionRepo.findById(id);
        if (!collection) {
            throw new exceptions_1.AppError('Collection not found', 404);
        }
        return this.attachProductCount(collection);
    }
    async getCollectionBySlug(slug) {
        const collection = await this.collectionRepo.findBySlug(slug);
        if (!collection) {
            throw new exceptions_1.AppError('Collection not found', 404);
        }
        return this.attachProductCount(collection);
    }
    async getCollectionProducts(collectionIdOrSlug, options = {}) {
        // Accept either a Mongo id or a slug; products are matched through the
        // `collections` array on the Product document (OR / $in semantics).
        const isObjectId = mongoose_1.Types.ObjectId.isValid(collectionIdOrSlug);
        const collection = isObjectId
            ? await this.collectionRepo.findById(collectionIdOrSlug)
            : await this.collectionRepo.findBySlug(collectionIdOrSlug);
        if (!collection) {
            throw new exceptions_1.AppError('Collection not found', 404);
        }
        return this.productRepo.paginate({ collections: { $in: [collection.slug] }, status: 'active' }, options);
    }
    async getFeaturedCollections(limit = 3) {
        const collections = await this.collectionRepo.findMany({ featured: true, isActive: true }, { sort: { sortOrder: 1, createdAt: -1 }, limit });
        return this.attachProductCounts(collections);
    }
    async getCurrentCollections() {
        const now = new Date();
        const collections = await this.collectionRepo.findMany({
            isActive: true,
            $or: [
                { startDate: { $exists: false } },
                { startDate: { $lte: now } }
            ],
            $and: [
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: { $gte: now } }
                    ]
                }
            ]
        }, { sort: { sortOrder: 1, createdAt: -1 } });
        return this.attachProductCounts(collections);
    }
    async getCollectionCount() {
        return this.collectionRepo.count({ isActive: true });
    }
    async getUpcomingCollections() {
        const now = new Date();
        return this.collectionRepo.findMany({
            isActive: true,
            startDate: { $gt: now }
        }, { sort: { startDate: 1 } });
    }
    async createCollection(data) {
        return this.collectionRepo.create(data);
    }
    async updateCollection(id, data) {
        const updated = await this.collectionRepo.updateById(id, data);
        if (!updated) {
            throw new exceptions_1.NotFoundError('Collection not found');
        }
        return updated;
    }
    async deleteCollection(id) {
        const collection = await this.collectionRepo.findById(id);
        if (!collection) {
            throw new exceptions_1.NotFoundError('Collection not found');
        }
        // Remove this collection's slug from every product that carries it —
        // products disappear from the section automatically, nothing else breaks.
        await this.productRepo.updateMany({ collections: collection.slug }, { $pull: { collections: collection.slug } });
        // Pull the collection out of any coupon collection scopes
        await Coupon_1.CouponModel.updateMany({ collectionIds: collection._id }, { $pull: { collectionIds: collection._id } });
        return this.collectionRepo.deleteById(id);
    }
    async attachProductCounts(collections) {
        if (collections.length === 0)
            return collections;
        // Single aggregation instead of one count query per collection (N+1).
        const slugs = collections.map((c) => c.slug);
        const counts = await this.productRepo.aggregate([
            { $match: { collections: { $in: slugs }, status: 'active' } },
            { $unwind: '$collections' },
            { $match: { collections: { $in: slugs } } },
            { $group: { _id: '$collections', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((row) => [String(row._id), row.count]));
        return collections.map((c) => {
            const doc = c.toObject ? c.toObject() : c;
            return { ...doc, productCount: countMap.get(String(c.slug)) ?? 0 };
        });
    }
    async attachProductCount(collection) {
        const count = await this.productRepo.count({ collections: collection.slug, status: 'active' });
        return { ...collection.toObject ? collection.toObject() : collection, productCount: count };
    }
}
exports.CollectionService = CollectionService;
