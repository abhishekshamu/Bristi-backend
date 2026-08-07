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
exports.CartModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const CartItemSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantId: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    selectedOptions: {
        type: Map,
        of: String,
    },
}, {
    _id: true, // Subdocument IDs needed for item-level cart operations
});
const CartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    sessionId: {
        type: String,
    },
    items: [CartItemSchema],
    totalItems: {
        type: Number,
        default: 0,
    },
    subtotal: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    shipping: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        default: 0,
    },
    couponCode: {
        type: String,
    },
    couponDiscount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Indexes
CartSchema.index({ userId: 1 }, { unique: true, sparse: true });
CartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });
CartSchema.index({ updatedAt: -1 });
// Virtual for item count
CartSchema.virtual('itemCount').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});
// Pre-save hook to calculate totals
CartSchema.pre('save', function (next) {
    // Calculate totals from items
    const subtotal = this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    this.subtotal = parseFloat(subtotal.toFixed(2));
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    // Apply coupon discount if exists
    this.total = parseFloat((this.subtotal + this.tax + this.shipping - this.discount - this.couponDiscount).toFixed(2));
    // Ensure total doesn't go below 0
    if (this.total < 0) {
        this.total = 0;
    }
    next();
});
// Method to add item to cart
CartSchema.methods.addItem = function (item) {
    // Check if item already exists in cart
    const existingItemIndex = this.items.findIndex((cartItem) => cartItem.productId.equals(item.productId) &&
        ((!cartItem.variantId && !item.variantId) ||
            (cartItem.variantId && item.variantId && String(cartItem.variantId) === String(item.variantId))));
    if (existingItemIndex > -1) {
        // Increase quantity
        this.items[existingItemIndex].quantity += item.quantity;
    }
    else {
        // Add new item
        this.items.push(item);
    }
    return this.save();
};
// Method to remove item from cart
CartSchema.methods.removeItem = function (productId, variantId) {
    this.items = this.items.filter(item => {
        const productMatch = item.productId.toString() === productId;
        const variantMatch = !variantId && !item.variantId ||
            (item.variantId && variantId && item.variantId.toString() === variantId);
        return !(productMatch && variantMatch);
    });
    return this.save();
};
// Method to update item quantity
CartSchema.methods.updateItemQuantity = function (productId, quantity, variantId) {
    const itemIndex = this.items.findIndex(item => {
        const productMatch = item.productId.toString() === productId;
        const variantMatch = !variantId && !item.variantId ||
            (item.variantId && variantId && item.variantId.toString() === variantId);
        return productMatch && variantMatch;
    });
    if (itemIndex > -1) {
        if (quantity <= 0) {
            this.items.splice(itemIndex, 1);
        }
        else {
            this.items[itemIndex].quantity = quantity;
        }
        return this.save();
    }
    return this;
};
// Method to clear cart
CartSchema.methods.clear = function () {
    this.items = [];
    this.totalItems = 0;
    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.discount = 0;
    this.couponCode = undefined;
    this.couponDiscount = 0;
    this.total = 0;
    return this.save();
};
exports.CartModel = mongoose_1.default.model('Cart', CartSchema);
