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
exports.OrderModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const OrderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    guestEmail: {
        type: String,
    },
    items: [{
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            variantId: {
                type: String,
            },
            productName: {
                type: String,
                required: true,
            },
            variantName: {
                type: String,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
                min: 0,
            },
            total: {
                type: Number,
                required: true,
                min: 0,
            },
            sku: {
                type: String,
                required: true,
            },
            image: {
                type: String,
            },
        }],
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    tax: {
        type: Number,
        required: true,
        min: 0,
    },
    shipping: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'razorpay', 'stripe', 'cod'],
    },
    paymentId: {
        type: String,
    },
    shippingAddress: {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        company: {
            type: String,
        },
        addressLine1: {
            type: String,
            required: true,
        },
        addressLine2: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
    },
    billingAddress: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        company: {
            type: String,
        },
        addressLine1: {
            type: String,
        },
        addressLine2: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        postalCode: {
            type: String,
        },
        country: {
            type: String,
        },
        phone: {
            type: String,
        },
    },
    notes: {
        type: String,
    },
    trackingNumber: {
        type: String,
    },
    trackingUrl: {
        type: String,
    },
    couponCode: {
        type: String,
    },
    couponDiscount: {
        type: Number,
        default: 0,
        min: 0,
    },
    stockRestored: {
        type: Boolean,
        default: false,
    },
    statusHistory: [{
            status: {
                type: String,
                required: true,
            },
            note: {
                type: String,
            },
            changedBy: {
                type: String,
            },
            changedAt: {
                type: Date,
                default: Date.now,
            },
        }],
    emailHistory: [{
            type: {
                type: String,
                enum: ['confirmation', 'shipping', 'delivered'],
                required: true,
            },
            sentAt: {
                type: Date,
                default: Date.now,
            },
        }],
    paidAt: {
        type: Date,
    },
    failedAt: {
        type: Date,
    },
    refundedAt: {
        type: Date,
    },
    shippedAt: {
        type: Date,
    },
    deliveredAt: {
        type: Date,
    },
    cancelledAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'items.productId': 1 });
// Virtual for calculating totals if needed
OrderSchema.virtual('calculatedTotal').get(function () {
    return this.subtotal + this.tax + this.shipping - this.discount;
});
// Pre-save hook to generate order number
OrderSchema.pre('save', function (next) {
    if (!this.isNew)
        return next();
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `BRS-${year}${month}${day}-${random}`;
    }
    next();
});
// Method to calculate totals
OrderSchema.methods.calculateTotals = function () {
    const itemsTotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.subtotal = itemsTotal;
    // Tax and shipping would be calculated based on rules
    this.total = this.subtotal + this.tax + this.shipping - this.discount;
};
exports.OrderModel = mongoose_1.default.model('Order', OrderSchema);
