"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
// @ts-nocheck
const AuditLog_1 = require("../models/AuditLog");
const base_repository_1 = require("./base.repository");
class AuditLogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(AuditLog_1.AuditLogModel);
    }
    async findByEntity(entityType, entityId) {
        return this.findMany({ entityType, entityId }, { sort: { createdAt: -1 } });
    }
    async findByUser(userId, options = {}) {
        return this.findMany({ userId }, options);
    }
    async findByAction(action, options = {}) {
        return this.findMany({ action }, options);
    }
    async getRecent(limit = 100) {
        return this.findMany({}, { limit, sort: { createdAt: -1 } });
    }
}
exports.AuditLogRepository = AuditLogRepository;
