"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
class AuditService {
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
    }
    async log(data) {
        return this.auditRepo.create(data);
    }
    async getLogs(options = {}) {
        // The controller builds an action/entityType/userId filter and carries it
        // in options.filter; separate it from the pagination options.
        const { filter = {}, ...paginateOptions } = options;
        return this.auditRepo.paginate(filter, paginateOptions);
    }
    async getLogsByEntity(entityType, entityId) {
        return this.auditRepo.findByEntity(entityType, entityId);
    }
    async getLogsByUser(userId, options = {}) {
        return this.auditRepo.findByUser(userId, options);
    }
    async getLogsByAction(action, options = {}) {
        return this.auditRepo.findByAction(action, options);
    }
}
exports.AuditService = AuditService;
