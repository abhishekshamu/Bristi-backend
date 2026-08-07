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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: false,
        select: false,
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
    firstName: {
        type: String,
        required: false,
        default: 'BRISTI',
        trim: true,
    },
    lastName: {
        type: String,
        required: false,
        default: 'Member',
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    phoneVerified: {
        type: Boolean,
        default: false,
    },
    authProvider: {
        type: String,
        enum: ['email', 'google', 'phone'],
        default: 'email',
    },
    googleId: {
        type: String,
    },
    avatar: {
        type: String,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockedUntil: {
        type: Date,
    },
    rewardPoints: {
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'moderator'],
        default: 'customer',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'deleted'],
        default: 'active',
    },
    addresses: [{
            id: {
                type: String,
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
            isDefault: {
                type: Boolean,
            },
        }],
    preferences: {
        newsletter: {
            type: Boolean,
            default: true,
        },
        marketing: {
            type: Boolean,
            default: true,
        },
        orderUpdates: {
            type: Boolean,
            default: true,
        },
    },
    wishlist: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product',
        }],
}, {
    timestamps: true,
});
// Indexes
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ authProvider: 1 });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Method to get full name
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});
// Method to get default address
UserSchema.methods.getDefaultAddress = function () {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};
// Virtual for address count
UserSchema.virtual('addressCount').get(function () {
    return this.addresses.length;
});
// Virtual for wishlist count
UserSchema.virtual('wishlistCount').get(function () {
    return this.wishlist.length;
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
