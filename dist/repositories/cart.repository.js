"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRepository = void 0;
const Cart_1 = require("../models/Cart");
const base_repository_1 = require("./base.repository");
class CartRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Cart_1.CartModel);
    }
    async getCartByUserId(userId) {
        let cart = await this.findOne({ userId });
        if (!cart) {
            cart = await this.create({ userId });
        }
        return cart;
    }
    async getCartBySessionId(sessionId) {
        let cart = await this.findOne({ sessionId });
        if (!cart) {
            cart = await this.create({ sessionId });
        }
        return cart;
    }
    async clearByUserId(userId, session) {
        return this.deleteMany({ userId }, session);
    }
    async clearBySessionId(sessionId) {
        return this.deleteMany({ sessionId });
    }
    async updateItemQuantity(cartId, itemId, quantity) {
        if (quantity <= 0) {
            return this.findOneAndUpdate({ _id: cartId, 'items._id': itemId }, { $pull: { items: { _id: itemId } } });
        }
        return this.findOneAndUpdate({ _id: cartId, 'items._id': itemId }, { $set: { 'items.$.quantity': quantity } });
    }
    async removeItem(cartId, itemId) {
        return this.findOneAndUpdate({ _id: cartId, 'items._id': itemId }, { $pull: { items: { _id: itemId } } });
    }
}
exports.CartRepository = CartRepository;
