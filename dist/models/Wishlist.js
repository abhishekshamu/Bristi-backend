"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const WishlistSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    productIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product',
        }],
}, {
    timestamps: true,
});
// Indexes
WishlistSchema.index({ userId: 1 }, { unique: true });
WishlistSchema.index({ productIds: 1 });
// Virtual for product count
WishlistSchema.virtual('productCount').get(function () {
    return this.productIds.length;
});
// Method to add product to wishlist
WishlistSchema.methods.addProduct = function (productId) {
    if (!this.productIds.some(id => id.toString() === productId)) {
        this.productIds.push(productId);
    }
    return this.save();
};
// Method to remove product from wishlist
WishlistSchema.methods.removeProduct = function (productId) {
    this.productIds = this.productIds.filter(id => id.toString() !== productId);
    return this.save();
};
// Method to check if product is in wishlist
WishlistSchema.methods.hasProduct = function (productId) {
    return this.productIds.some(id => id.toString() === productId);
};
exports.WishlistModel = mongoose_1.default.model('Wishlist', WishlistSchema);
