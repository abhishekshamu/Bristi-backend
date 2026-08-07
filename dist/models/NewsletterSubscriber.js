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
exports.NewsletterSubscriberModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const NewsletterSubscriberSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    source: {
        type: String,
        enum: ['homepage', 'footer', 'popup', 'checkout', 'account_signup', 'social_media', 'blog', 'other'],
        default: 'homepage',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    subscribedAt: {
        type: Date,
        default: Date.now,
    },
    unsubscribedAt: {
        type: Date,
    },
    preferences: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'weekly',
        },
        topics: [{
                type: String,
                enum: ['new_arrivals', 'sales', 'blog', 'events', 'collaborations'],
            }],
    },
    doubleOptIn: {
        type: Boolean,
        default: false,
    },
    confirmationToken: {
        type: String,
    },
    confirmationExpires: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes
NewsletterSubscriberSchema.index({ email: 1 });
NewsletterSubscriberSchema.index({ isActive: 1 });
NewsletterSubscriberSchema.index({ subscribedAt: -1 });
NewsletterSubscriberSchema.index({ source: 1 });
NewsletterSubscriberSchema.index({ 'preferences.topics': 1 });
// Virtual for full name
NewsletterSubscriberSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim() || this.email.split('@')[0];
});
// Pre-save hook to handle double opt-in
NewsletterSubscriberSchema.pre('save', function (next) {
    if (this.isNew && this.doubleOptIn) {
        // Generate confirmation token
        this.confirmationToken = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        this.confirmationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    }
    next();
});
// Method to check if subscription is confirmed
NewsletterSubscriberSchema.methods.isConfirmed = function () {
    return !this.doubleOptIn || (this.confirmationToken && !this.confirmationExpires || this.confirmationExpires > new Date());
};
// Static method to find by email (case insensitive)
NewsletterSubscriberSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: new RegExp(`^${email}$`, 'i') });
};
exports.NewsletterSubscriberModel = mongoose_1.default.model('NewsletterSubscriber', NewsletterSubscriberSchema);
