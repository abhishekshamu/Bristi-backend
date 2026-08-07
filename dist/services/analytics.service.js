"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
class AnalyticsService {
    constructor(analyticsRepo) {
        this.analyticsRepo = analyticsRepo;
    }
    async createEvent(data) {
        return this.analyticsRepo.create({
            ...data,
            timestamp: data.timestamp || new Date()
        });
    }
    async getEventsByEventName(eventName, options = {}) {
        return this.analyticsRepo.findByEventName(eventName, options);
    }
    async getEventsByUser(userId, options = {}) {
        return this.analyticsRepo.findByUser(userId, options);
    }
    async getEventsBySession(sessionId, options = {}) {
        return this.analyticsRepo.findBySession(sessionId, options);
    }
    async getAllEvents(options = {}) {
        return this.analyticsRepo.paginate({}, options);
    }
    async getEventStats(startDate, endDate) {
        return this.analyticsRepo.getEventStats(startDate, endDate);
    }
    async getPopularEvents(limit = 10) {
        const stats = await this.analyticsRepo.getEventStats();
        return stats.slice(0, limit);
    }
    async getActiveUsers(startDate, endDate) {
        return this.analyticsRepo.aggregate([
            {
                $match: {
                    ...(startDate || endDate ? {
                        timestamp: {
                            ...(startDate ? { $gte: startDate } : {}),
                            ...(endDate ? { $lte: endDate } : {})
                        }
                    } : {}),
                    userId: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    eventCount: { $sum: 1 },
                    lastActive: { $max: '$timestamp' }
                }
            },
            { $sort: { lastActive: -1 } }
        ]);
    }
    async getPageViews(startDate, endDate) {
        return this.analyticsRepo.aggregate([
            {
                $match: {
                    eventName: 'page_view',
                    ...(startDate || endDate ? {
                        timestamp: {
                            ...(startDate ? { $gte: startDate } : {}),
                            ...(endDate ? { $lte: endDate } : {})
                        }
                    } : {})
                }
            },
            {
                $group: {
                    _id: {
                        url: '$url',
                        day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                    },
                    views: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            },
            { $sort: { views: -1 } }
        ]);
    }
}
exports.AnalyticsService = AnalyticsService;
