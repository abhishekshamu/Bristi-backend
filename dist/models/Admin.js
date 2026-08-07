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
exports.AdminModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AdminSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
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
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator', 'content_editor', 'support'],
        required: true,
    },
    permissions: [{
            type: String,
        }],
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockedUntil: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });
// Pre-save hook to hash password
AdminSchema.pre('save', async function (next) {
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
AdminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Method to check if account is locked
AdminSchema.methods.isLocked = function () {
    return this.lockedUntil && this.lockedUntil > new Date();
};
// Method to increment failed login attempts
AdminSchema.methods.incrementFailedAttempts = async function () {
    this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
    if (this.failedLoginAttempts >= 5) {
        this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await this.save();
    return this.lockedUntil ? true : false;
};
// Method to reset failed login attempts
AdminSchema.methods.resetFailedLoginAttempts = async function () {
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
    await this.save();
};
// Method to get full name
AdminSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});
exports.AdminModel = mongoose_1.default.model('Admin', AdminSchema);
