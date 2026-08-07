"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const exceptions_1 = require("../utils/exceptions");
class WishlistService {
    constructor(wishlistRepo, productRepo, userRepo) {
        this.wishlistRepo = wishlistRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }
    async getWishlistByUserId(userId) {
        let wishlist = await this.wishlistRepo.findByUserId(userId);
        if (!wishlist) {
            wishlist = await this.wishlistRepo.create({ userId, productIds: [] });
        }
        return wishlist;
    }
    async addToWishlist(userId, productId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        const wishlist = await this.wishlistRepo.findByUserId(userId);
        if (!wishlist) {
            return this.wishlistRepo.create({ userId, productIds: [productId] });
        }
        const exists = wishlist.productIds.some(id => id.toString() === productId);
        if (!exists) {
            wishlist.productIds.push(productId);
            return this.wishlistRepo.updateById(wishlist._id.toString(), { productIds: wishlist.productIds });
        }
        return wishlist;
    }
    async removeFromWishlist(userId, productId) {
        const wishlist = await this.wishlistRepo.findByUserId(userId);
        if (!wishlist) {
            throw new exceptions_1.NotFoundException('Wishlist not found');
        }
        wishlist.productIds = wishlist.productIds.filter(id => id.toString() !== productId);
        return this.wishlistRepo.updateById(wishlist._id.toString(), { productIds: wishlist.productIds });
    }
    async clearWishlist(userId) {
        const wishlist = await this.wishlistRepo.findByUserId(userId);
        if (!wishlist) {
            return false;
        }
        await this.wishlistRepo.updateById(wishlist._id.toString(), { productIds: [] });
        return true;
    }
    async checkInWishlist(userId, productId) {
        return this.wishlistRepo.hasProduct(userId, productId);
    }
    async getWishlistProducts(userId, options = {}) {
        const wishlist = await this.getWishlistByUserId(userId);
        if (wishlist.productIds.length === 0) {
            return {
                data: [],
                total: 0,
                page: 1,
                pages: 0
            };
        }
        return this.productRepo.paginate({ _id: { $in: wishlist.productIds }, status: 'active' }, options);
    }
    async getWishlistCount(userId) {
        const wishlist = await this.wishlistRepo.findByUserId(userId);
        return wishlist ? wishlist.productIds.length : 0;
    }
}
exports.WishlistService = WishlistService;
