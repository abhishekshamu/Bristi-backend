"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async createNotification(notificationData) {
        return this.notificationRepo.create(notificationData);
    }
    async getUserNotifications(userId, options = {}) {
        return this.notificationRepo.paginate({ userId }, { sort: { createdAt: -1 }, ...options });
    }
    async getUnreadNotifications(userId) {
        return this.notificationRepo.findMany({ userId, isRead: false }, { sort: { createdAt: -1 } });
    }
    async markAsRead(userId, notificationId) {
        return this.notificationRepo.updateOne({ _id: notificationId, userId }, { isRead: true, readAt: new Date() });
    }
    async markAllAsRead(userId) {
        const notifications = await this.notificationRepo.findMany({ userId, isRead: false });
        for (const notification of notifications) {
            await this.notificationRepo.updateById(notification._id.toString(), { isRead: true, readAt: new Date() });
        }
    }
    async deleteNotification(userId, notificationId) {
        return this.notificationRepo.deleteOne({ _id: notificationId, userId });
    }
    async getNotificationCount(userId) {
        const total = await this.notificationRepo.count({ userId });
        const unread = await this.notificationRepo.count({ userId, isRead: false });
        return { total, unread };
    }
}
exports.NotificationService = NotificationService;
