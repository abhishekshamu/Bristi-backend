"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const audit_service_1 = require("../services/audit.service");
const audit_repository_1 = require("../repositories/audit.repository");
const auditService = new audit_service_1.AuditService(new audit_repository_1.AuditLogRepository());
/**
 * Logs admin mutations to the audit trail. Placed on admin-only write routes,
 * it captures the acting admin, target entity and request context. Recording
 * is fire-and-forget so a slow audit write never blocks the request.
 */
const auditLog = (entityType, action) => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode < 400) {
                const entityId = req.params?.id ?? body?.data?._id ?? body?.data?.id;
                const user = req.user;
                void auditService
                    .log({
                    action,
                    entityType,
                    entityId: entityId ? String(entityId) : 'unknown',
                    userId: user?._id ? String(user._id) : 'system',
                    userName: user
                        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'Admin'
                        : 'System',
                    userEmail: user?.email,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                })
                    .catch(() => undefined);
            }
            return originalJson(body);
        };
        next();
    };
};
exports.auditLog = auditLog;
