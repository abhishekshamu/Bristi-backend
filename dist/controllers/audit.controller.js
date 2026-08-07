"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const async_1 = require("../middleware/async");
class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
        this.getLogs = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 50, action, entityType, userId } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const filter = {};
            if (action)
                filter.action = action;
            if (entityType)
                filter.entityType = entityType;
            if (userId)
                filter.userId = userId;
            const result = await this.auditService.getLogs({ ...options, filter });
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: { page: result.page, limit: result.limit, total: result.total, pages: result.pages }
            });
        });
        this.getLogsByEntity = (0, async_1.asyncHandler)(async (req, res) => {
            const { entityType, entityId } = req.params;
            const logs = await this.auditService.getLogsByEntity(entityType, entityId);
            res.status(200).json({ success: true, data: logs });
        });
        this.getLogsByUser = (0, async_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const logs = await this.auditService.getLogsByUser(userId);
            res.status(200).json({ success: true, data: logs });
        });
    }
}
exports.AuditController = AuditController;
