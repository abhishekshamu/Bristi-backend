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
exports.CouponModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const CouponSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed_amount', 'free_shipping', 'bogo'],
        required: true,
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    minimumPurchase: {
        type: Number,
        min: 0,
    },
    maximumDiscount: {
        type: Number,
        min: 0,
    },
    startsAt: {
        type: Date,
    },
    expiresAt: {
        type: Date,
    },
    usageLimit: {
        type: Number,
        required: true,
        min: 0,
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    perCustomerLimit: {
        type: Number,
        min: 0,
    },
    customersUsed: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
    appliesTo: {
        type: String,
        enum: ['all', 'specific_products', 'specific_categories', 'specific_collections'],
        default: 'all',
    },
    productIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product',
        }],
    categoryIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category',
        }],
    collectionIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Collection',
        }],
    appliesToSaleItems: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ type: 1 });
CouponSchema.index({ isActive: 1 });
CouponSchema.index({ startsAt: 1 });
CouponSchema.index({ expiresAt: 1 });
CouponSchema.index({ appliesTo: 1 });
// Pre-save hook to uppercase code
CouponSchema.pre('save', function (next) {
    if (this.isModified('code')) {
        this.code = this.code.toUpperCase();
    }
    next();
});
// Virtual for checking if coupon is valid
CouponSchema.virtual('isValid').get(function () {
    const now = new Date();
    if (!this.isActive)
        return false;
    if (this.usageLimit > 0 && this.usageCount >= this.usageLimit)
        return false;
    if (this.startsAt && now < this.startsAt)
        return false;
    if (this.expiresAt && now > this.expiresAt)
        return false;
    return true;
});
// Method to calculate discount
CouponSchema.methods.calculateDiscount = function (cartTotal, shipping = 0) {
    if (!this.isValid)
        return 0;
    let discount = 0;
    switch (this.type) {
        case 'percentage':
            discount = Math.min(cartTotal * (this.value / 100), this.maximumDiscount || Number.MAX_VALUE);
            break;
        case 'fixed_amount':
            discount = Math.min(this.value, cartTotal);
            if (this.maximumDiscount) {
                discount = Math.min(discount, this.maximumDiscount);
            }
            break;
        case 'free_shipping':
            discount = shipping;
            if (this.maximumDiscount) {
                discount = Math.min(discount, this.maximumDiscount);
            }
            break;
        case 'bogo':
            // BOGO gives the cheapest item free when a full-price item is present
            discount = 0;
            break;
    }
    // Apply minimum purchase requirement
    if (this.minimumPurchase && cartTotal < this.minimumPurchase) {
        return 0;
    }
    return discount;
};
exports.CouponModel = mongoose_1.default.model('Coupon', CouponSchema);
