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
exports.AddressModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const AddressSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['billing', 'shipping', 'both'],
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    company: {
        type: String,
        trim: true,
    },
    addressLine1: {
        type: String,
        required: true,
        trim: true,
    },
    addressLine2: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    postalCode: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes
AddressSchema.index({ userId: 1 });
AddressSchema.index({ userId: 1, isDefault: 1 });
// Virtual for full name
AddressSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});
// Virtual for formatted address
AddressSchema.virtual('formattedAddress').get(function () {
    const lines = [
        this.addressLine1,
        this.addressLine2,
        `${this.city}, ${this.state} ${this.postalCode}`,
        this.country
    ].filter(Boolean);
    return lines.join('\n');
});
// Pre-save hook to ensure only one default address per type per user
AddressSchema.pre('save', async function (next) {
    if (this.isDefault) {
        // Unset any other default addresses of the same type for this user
        await this.constructor.updateMany({
            _id: { $ne: this._id },
            userId: this.userId,
            type: this.type,
            isDefault: true
        }, { $set: { isDefault: false } });
    }
    next();
});
exports.AddressModel = mongoose_1.default.model('Address', AddressSchema);
