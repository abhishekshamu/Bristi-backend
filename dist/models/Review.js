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
exports.ReviewModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const ReviewSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    comment: {
        type: String,
        required: true,
    },
    images: [{
            type: String, // URL to image
        }],
    verifiedPurchase: {
        type: Boolean,
        default: false,
    },
    helpfulVotes: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    // For tracking helpful/unhelpful votes
    helpfulBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
    notHelpfulBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
}, {
    timestamps: true,
});
// Indexes
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ rating: -1 });
// Virtual for helpfulness percentage
ReviewSchema.virtual('helpfulnessPercentage').get(function () {
    const totalVotes = this.helpfulBy.length + this.notHelpfulBy.length;
    if (totalVotes === 0)
        return 0;
    return Math.round((this.helpfulBy.length / totalVotes) * 100);
});
// Pre-save hook to set userName from user if not provided
ReviewSchema.pre('save', function (next) {
    if (this.isNew && this.userId && !this.userName) {
        // In a real app, we'd populate the user to get their name
        // For now, we'll leave it as is and expect it to be set
    }
    next();
});
// Static method to update product rating
ReviewSchema.statics.updateProductRating = async function (productId) {
    const Review = mongoose_1.default.model('Review');
    const stats = await Review.aggregate([
        { $match: { productId: new mongoose_1.default.Types.ObjectId(productId), status: 'approved' } },
        {
            $group: {
                _id: '$productId',
                averageRating: { $avg: '$rating' },
                ratingCount: { $sum: 1 }
            }
        }
    ]);
    const Product = mongoose_1.default.model('Product');
    if (stats.length > 0) {
        await Product.updateOne({ _id: new mongoose_1.default.Types.ObjectId(productId) }, {
            'rating.average': parseFloat(stats[0].averageRating.toFixed(1)),
            'rating.count': stats[0].ratingCount
        });
    }
    else {
        await Product.updateOne({ _id: new mongoose_1.default.Types.ObjectId(productId) }, {
            'rating.average': 0,
            'rating.count': 0
        });
    }
};
// Post-save hook to update product rating
ReviewSchema.post('save', async function () {
    await this.constructor.updateProductRating(this.productId.toString());
});
// Post-remove hook to update product rating
ReviewSchema.post('remove', async function () {
    await this.constructor.updateProductRating(this.productId.toString());
});
exports.ReviewModel = mongoose_1.default.model('Review', ReviewSchema);
