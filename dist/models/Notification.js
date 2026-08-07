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
exports.NotificationModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
    relatedId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'relatedType',
    },
    relatedType: {
        type: String,
        enum: ['Order', 'Product', 'User', 'Review', 'BlogPost', 'Message'],
    },
    // For notifications that don't relate to a specific model
    relatedRef: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'relatedRefType',
    },
    relatedRefType: {
        type: String,
        enum: ['Order', 'Product', 'User', 'Review', 'BlogPost', 'Message'],
    },
    actionUrl: {
        type: String,
    },
    actionText: {
        type: String,
    },
    expiresAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ relatedId: 1, relatedType: 1 });
// Pre-save hook to set expiration date (30 days from creation)
NotificationSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
        this.expiresAt = expiryDate;
    }
    next();
});
// Static method to mark notifications as read
NotificationSchema.statics.markAsRead = async function (userId, notificationIds) {
    return this.updateMany({ _id: { $in: notificationIds }, userId }, { $set: { isRead: true, readAt: new Date() } });
};
// Static method to delete expired notifications
NotificationSchema.statics.deleteExpired = async function () {
    return this.deleteMany({ expiresAt: { $lt: new Date() } });
};
exports.NotificationModel = mongoose_1.default.model('Notification', NotificationSchema);
