"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRepository = void 0;
const Wishlist_1 = require("../models/Wishlist");
const base_repository_1 = require("./base.repository");
class WishlistRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Wishlist_1.WishlistModel);
    }
    async findByUserId(userId) {
        return this.findOne({ userId });
    }
    async createOrGet(userId) {
        let wishlist = await this.findByUserId(userId);
        if (!wishlist) {
            wishlist = await this.create({ userId, productIds: [] });
        }
        return wishlist;
    }
    async addProduct(userId, productId) {
        const wishlist = await this.createOrGet(userId);
        if (!wishlist.productIds.some(id => id.toString() === productId)) {
            wishlist.productIds.push(productId);
        }
        return this.updateById(wishlist._id.toString(), { productIds: wishlist.productIds });
    }
    async removeProduct(userId, productId) {
        const wishlist = await this.createOrGet(userId);
        wishlist.productIds = wishlist.productIds.filter(id => id.toString() !== productId);
        return this.updateById(wishlist._id.toString(), { productIds: wishlist.productIds });
    }
    async hasProduct(userId, productId) {
        const wishlist = await this.findByUserId(userId);
        if (!wishlist)
            return false;
        return wishlist.productIds.some(id => id.toString() === productId);
    }
    async getProductIds(userId) {
        const wishlist = await this.findByUserId(userId);
        if (!wishlist)
            return [];
        return wishlist.productIds.map(id => id.toString());
    }
}
exports.WishlistRepository = WishlistRepository;
