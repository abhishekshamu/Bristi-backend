"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const AnalyticsEvent_1 = require("../models/AnalyticsEvent");
const base_repository_1 = require("./base.repository");
class AnalyticsRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(AnalyticsEvent_1.AnalyticsEventModel);
    }
    async findByEventName(eventName, options = {}) {
        return this.findMany({ eventName }, { sort: { timestamp: -1 }, ...options });
    }
    async findByUser(userId, options = {}) {
        return this.findMany({ userId }, { sort: { timestamp: -1 }, ...options });
    }
    async findBySession(sessionId, options = {}) {
        return this.findMany({ sessionId }, { sort: { timestamp: -1 }, ...options });
    }
    async getEventStats(startDate, endDate) {
        const match = {};
        if (startDate || endDate) {
            match.timestamp = {};
            if (startDate)
                match.timestamp.$gte = startDate;
            if (endDate)
                match.timestamp.$lte = endDate;
        }
        return this.model.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$eventName',
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            }
        ]).exec();
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
