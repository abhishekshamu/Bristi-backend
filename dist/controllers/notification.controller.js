"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const async_1 = require("../middleware/async");
class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.createNotification = (0, async_1.asyncHandler)(async (req, res) => {
            const notification = await this.notificationService.createNotification(req.body);
            res.status(201).json({
                success: true,
                data: notification
            });
        });
        this.getUserNotifications = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }
            const { page = 1, limit = 20 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const result = await this.notificationService.getUserNotifications(userId, options);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        });
        this.getUnreadNotifications = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }
            const notifications = await this.notificationService.getUnreadNotifications(userId);
            res.status(200).json({
                success: true,
                data: notifications
            });
        });
        this.markAsRead = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }
            const notification = await this.notificationService.markAsRead(userId, id);
            res.status(200).json({
                success: true,
                data: notification
            });
        });
        this.markAllAsRead = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }
            await this.notificationService.markAllAsRead(userId);
            res.status(200).json({
                success: true,
                message: 'All notifications marked as read'
            });
        });
        this.deleteNotification = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }
            await this.notificationService.deleteNotification(userId, id);
            res.status(200).json({
                success: true,
                message: 'Notification deleted successfully'
            });
        });
        this.getNotificationCount = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }
            const count = await this.notificationService.getNotificationCount(userId);
            res.status(200).json({
                success: true,
                data: count
            });
        });
    }
}
exports.NotificationController = NotificationController;
