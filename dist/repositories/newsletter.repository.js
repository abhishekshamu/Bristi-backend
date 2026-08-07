"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterRepository = void 0;
const NewsletterSubscriber_1 = require("../models/NewsletterSubscriber");
const base_repository_1 = require("./base.repository");
class NewsletterRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(NewsletterSubscriber_1.NewsletterSubscriberModel);
    }
    async findByEmail(email) {
        return this.findOne({ email: new RegExp(`^${email}$`, 'i') });
    }
    async findActive(options = {}) {
        return this.findMany({ isActive: true }, options);
    }
    async findBySource(source, options = {}) {
        return this.findMany({ source }, options);
    }
    async subscribe(data) {
        // Check if already exists
        const existing = await this.findByEmail(data.email);
        if (existing) {
            // If exists but inactive, reactivate
            if (!existing.isActive) {
                return this.updateById(existing._id.toString(), {
                    ...data,
                    isActive: true,
                    subscribedAt: new Date()
                });
            }
            // If already active, just return it
            return existing;
        }
        // Otherwise create new
        return this.create(data);
    }
    async unsubscribe(email) {
        return this.findOneAndUpdate({ email: new RegExp(`^${email}$`, 'i') }, { $set: { isActive: false, unsubscribedAt: new Date() } }, { new: true });
    }
    async getSubscriptionStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 },
                    active: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    }
                }
            }
        ]).exec();
    }
    async getGrowthStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return this.model.aggregate([
            {
                $match: {
                    subscribedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$subscribedAt' },
                        month: { $month: '$subscribedAt' },
                        day: { $dayOfMonth: '$subscribedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
            }
        ]).exec();
    }
}
exports.NewsletterRepository = NewsletterRepository;
