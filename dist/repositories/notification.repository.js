"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const Notification_1 = require("../models/Notification");
const base_repository_1 = require("./base.repository");
class NotificationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Notification_1.NotificationModel);
    }
    async findByUser(userId, options = {}) {
        return this.findMany({ userId }, { sort: { createdAt: -1 }, ...options });
    }
    async findUnreadByUser(userId) {
        return this.findMany({ userId, isRead: false }, { sort: { createdAt: -1 } });
    }
    async markAsRead(notificationId) {
        return this.updateById(notificationId, { isRead: true, readAt: new Date() });
    }
}
exports.NotificationRepository = NotificationRepository;
