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
exports.InventoryItemModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const InventoryItemSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantId: {
        type: String,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    reserved: {
        type: Number,
        default: 0,
        min: 0,
    },
    location: {
        warehouse: {
            type: String,
            required: true,
        },
        aisle: {
            type: String,
        },
        shelf: {
            type: String,
        },
        bin: {
            type: String,
        },
    },
    reorderPoint: {
        type: Number,
        min: 0,
        default: 5,
    },
    maxStockLevel: {
        type: Number,
        min: 0,
    },
    cost: {
        type: Number,
        min: 0,
    },
    lastRestocked: {
        type: Date,
    },
    lastCounted: {
        type: Date,
    },
    supplier: {
        name: {
            type: String,
        },
        contact: {
            type: String,
        },
        leadTimeDays: {
            type: Number,
        },
    },
    history: [{
            type: {
                type: String,
                enum: ['order', 'restock', 'adjustment', 'cancel', 'refund', 'sale'],
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            reason: {
                type: String,
            },
            orderId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Order',
            },
            date: {
                type: Date,
                default: Date.now,
            },
        }],
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Indexes
InventoryItemSchema.index({ productId: 1 });
InventoryItemSchema.index({ variantId: 1 });
InventoryItemSchema.index({ sku: 1 });
InventoryItemSchema.index({ location: 1 });
InventoryItemSchema.index({ 'location.warehouse': 1 });
InventoryItemSchema.index({ 'reorderPoint': 1 });
// Virtual for available quantity
InventoryItemSchema.virtual('available').get(function () {
    return Math.max(0, this.quantity - this.reserved);
});
// Virtual for stock status
InventoryItemSchema.virtual('stockStatus').get(function () {
    const available = this.available;
    if (available === 0)
        return 'out_of_stock';
    if (available <= this.reorderPoint)
        return 'low_stock';
    return 'in_stock';
});
// Pre-save hook to ensure reserved doesn't exceed quantity
InventoryItemSchema.pre('save', function (next) {
    if (this.reserved > this.quantity) {
        this.reserved = this.quantity;
    }
    next();
});
// Static method to reserve inventory
InventoryItemSchema.statics.reserveInventory = async function (itemId, quantity) {
    const session = await this.startSession();
    session.startTransaction();
    try {
        const item = await this.findById(itemId).session(session);
        if (!item) {
            throw new Error('Inventory item not found');
        }
        if (item.available < quantity) {
            throw new Error('Insufficient inventory');
        }
        item.reserved += quantity;
        await item.save({ session });
        await session.commitTransaction();
        session.endSession();
        return item;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
// Static method to release inventory
InventoryItemSchema.statics.releaseInventory = async function (itemId, quantity) {
    const session = await this.startSession();
    session.startTransaction();
    try {
        const item = await this.findById(itemId).session(session);
        if (!item) {
            throw new Error('Inventory item not found');
        }
        item.reserved = Math.max(0, item.reserved - quantity);
        await item.save({ session });
        await session.commitTransaction();
        session.endSession();
        return item;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
// Static method to update inventory stock
InventoryItemSchema.statics.updateStock = async function (itemId, quantity, type) {
    const session = await this.startSession();
    session.startTransaction();
    try {
        const item = await this.findById(itemId).session(session);
        if (!item) {
            throw new Error('Inventory item not found');
        }
        switch (type) {
            case 'add':
                item.quantity += quantity;
                break;
            case 'subtract':
                item.quantity = Math.max(0, item.quantity - quantity);
                break;
            case 'set':
                item.quantity = Math.max(0, quantity);
                break;
        }
        // Ensure reserved doesn't exceed quantity
        if (item.reserved > item.quantity) {
            item.reserved = item.quantity;
        }
        item.lastRestocked = new Date();
        await item.save({ session });
        await session.commitTransaction();
        session.endSession();
        return item;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
exports.InventoryItemModel = mongoose_1.default.model('InventoryItem', InventoryItemSchema);
