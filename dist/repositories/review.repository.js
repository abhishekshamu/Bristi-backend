"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const Review_1 = require("../models/Review");
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class ReviewRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Review_1.ReviewModel);
    }
    async findByProductId(productId, options = {}) {
        return this.findMany({ productId, status: 'approved' }, { sort: { createdAt: -1 }, ...options });
    }
    async findByUser(userId, options = {}) {
        return this.findMany({ userId }, options);
    }
    async findByProductAndUser(productId, userId) {
        return this.findOne({ productId, userId });
    }
    async getProductRating(productId) {
        return this.model.aggregate([
            { $match: { productId: new mongoose_1.Types.ObjectId(productId), status: 'approved' } },
            {
                $group: {
                    _id: '$productId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]).exec();
    }
    async getApprovedRatingStats(productId) {
        const stats = await this.model.aggregate([
            { $match: { productId: new mongoose_1.Types.ObjectId(productId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    average: { $avg: '$rating' },
                    count: { $sum: 1 },
                },
            },
        ]).exec();
        return {
            average: stats.length > 0 ? Number(Number(stats[0].average).toFixed(1)) : 0,
            count: stats.length > 0 ? stats[0].count : 0,
        };
    }
}
exports.ReviewRepository = ReviewRepository;
