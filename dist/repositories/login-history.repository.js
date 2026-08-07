"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHistoryRepository = void 0;
const LoginHistory_1 = require("../models/LoginHistory");
const base_repository_1 = require("./base.repository");
class LoginHistoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(LoginHistory_1.LoginHistoryModel);
    }
    async record(entry) {
        await this.create({
            userId: entry.userId || null,
            method: entry.method,
            success: entry.success,
            ip: entry.ip ? String(entry.ip).slice(0, 64) : undefined,
            userAgent: entry.userAgent ? String(entry.userAgent).slice(0, 300) : undefined,
            identifier: entry.identifier ? String(entry.identifier).slice(0, 128) : undefined,
            failedReason: entry.failedReason ? String(entry.failedReason).slice(0, 200) : undefined,
        });
    }
    async countFailuresSince(since) {
        return this.count({ success: false, createdAt: { $gte: since } });
    }
    async recent(limit, filter = {}) {
        return this.model.find(filter).sort({ createdAt: -1 }).limit(limit).lean().exec();
    }
}
exports.LoginHistoryRepository = LoginHistoryRepository;
