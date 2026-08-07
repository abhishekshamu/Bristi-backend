"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const async_1 = require("../middleware/async");
const cookies_1 = require("../config/cookies");
class AdminController {
    constructor(adminService, userService, userRepo, productRepo, orderRepo, authRepo, authService) {
        this.adminService = adminService;
        this.userService = userService;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
        this.authRepo = authRepo;
        this.authService = authService;
        this.login = (0, async_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            const { admin, accessToken, refreshToken } = await this.adminService.login(email, password);
            (0, cookies_1.setAuthCookies)(res, accessToken, refreshToken);
            res.status(200).json({
                success: true,
                data: {
                    admin,
                    accessToken,
                    refreshToken
                }
            });
        });
        this.logout = (0, async_1.asyncHandler)(async (req, res) => {
            const cookieRefresh = req.cookies?.[cookies_1.REFRESH_TOKEN_COOKIE];
            const { refreshToken } = req.body;
            const token = typeof cookieRefresh === 'string' && cookieRefresh.length > 0 ? cookieRefresh : refreshToken;
            const adminId = req.user ? req.user.id : null;
            if (token && adminId && this.authRepo) {
                await this.authRepo.deleteRefreshToken(token).catch(() => undefined);
                await this.authRepo.deleteOwnerTokens(adminId, 'admin').catch(() => undefined);
            }
            (0, cookies_1.clearAuthCookies)(res);
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        });
        this.getAllAdmins = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const result = await this.adminService.getAllAdmins(options);
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
        this.getAdminById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const admin = await this.adminService.getAdminById(id);
            res.status(200).json({
                success: true,
                data: admin
            });
        });
        this.updateAdmin = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const admin = await this.adminService.updateAdmin(id, req.body, {
                id: req.user?._id?.toString(),
                role: req.user?.role
            });
            res.status(200).json({
                success: true,
                data: admin
            });
        });
        this.deleteAdmin = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.adminService.deleteAdmin(id, {
                id: req.user?._id?.toString(),
                role: req.user?.role
            });
            res.status(200).json({
                success: true,
                message: 'Admin deleted successfully'
            });
        });
        this.createAdmin = (0, async_1.asyncHandler)(async (req, res) => {
            const admin = await this.adminService.createAdmin(req.body, req.user?.role);
            res.status(201).json({
                success: true,
                data: admin
            });
        });
        this.getDashboardStats = (0, async_1.asyncHandler)(async (req, res) => {
            const userCount = await this.userRepo.count({});
            const productCount = await this.productRepo.count({});
            const orderCount = await this.orderRepo.count({});
            const recentOrders = await this.orderRepo.findRecent(10);
            const salesStats = await this.orderRepo.getSalesStats(new Date(0), new Date());
            const userStats = await this.userRepo.getUserStats();
            res.status(200).json({
                success: true,
                data: {
                    userCount,
                    productCount,
                    orderCount,
                    salesStats,
                    userStats,
                    recentOrders
                }
            });
        });
        this.getAuthStats = (0, async_1.asyncHandler)(async (req, res) => {
            if (!this.authService) {
                res.status(404).json({ success: false, message: 'Auth stats are not available' });
                return;
            }
            const stats = await this.authService.getAuthStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        });
        this.getMe = (0, async_1.asyncHandler)(async (req, res) => {
            const admin = await this.adminService.getAdminById(req.user?._id?.toString());
            res.status(200).json({
                success: true,
                data: admin
            });
        });
        this.changePassword = (0, async_1.asyncHandler)(async (req, res) => {
            const { currentPassword, newPassword } = req.body;
            const result = await this.adminService.changePassword(req.user?._id?.toString(), currentPassword, newPassword);
            res.status(200).json({
                success: true,
                data: result
            });
        });
    }
}
exports.AdminController = AdminController;
