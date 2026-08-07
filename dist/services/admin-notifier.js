"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdmins = notifyAdmins;
const admin_repository_1 = require("../repositories/admin.repository");
async function notifyAdmins(notificationService, data) {
    try {
        const adminRepo = new admin_repository_1.AdminRepository();
        const admins = await adminRepo.findMany({ isActive: true }, {});
        for (const admin of admins) {
            await notificationService.createNotification({
                userId: admin._id,
                title: data.title,
                message: data.message,
                type: data.type ?? 'info',
                relatedId: data.relatedId,
                relatedType: data.relatedType,
            });
        }
    }
    catch (err) {
        console.error('notifyAdmins failed:', err);
    }
}
