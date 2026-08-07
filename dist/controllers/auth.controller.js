"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
const cookies_1 = require("../config/cookies");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = (0, async_1.asyncHandler)(async (req, res) => {
            const { user, accessToken, refreshToken } = await this.authService.register(req.body);
            (0, cookies_1.setAuthCookies)(res, accessToken, refreshToken);
            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    },
                    accessToken,
                    refreshToken
                }
            });
        });
        this.login = (0, async_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new exceptions_1.ValidationError('Please provide email and password');
            }
            const { user, accessToken, refreshToken } = await this.authService.login(email, password, {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            });
            (0, cookies_1.setAuthCookies)(res, accessToken, refreshToken);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    },
                    accessToken,
                    refreshToken
                }
            });
        });
        this.googleLogin = (0, async_1.asyncHandler)(async (req, res) => {
            const { credential } = req.body;
            if (!credential) {
                throw new exceptions_1.ValidationError('Please provide Google credential');
            }
            const { user, accessToken, refreshToken } = await this.authService.googleLogin(credential, {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            });
            (0, cookies_1.setAuthCookies)(res, accessToken, refreshToken);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        avatar: user.avatar,
                        authProvider: user.authProvider
                    },
                    accessToken,
                    refreshToken
                }
            });
        });
        this.requestOtp = (0, async_1.asyncHandler)(async (req, res) => {
            const { phone } = req.body;
            if (!phone) {
                throw new exceptions_1.ValidationError('Please provide phone number');
            }
            const result = await this.authService.requestOtp(phone);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        this.verifyOtp = (0, async_1.asyncHandler)(async (req, res) => {
            const { phone, otp } = req.body;
            if (!phone || !otp) {
                throw new exceptions_1.ValidationError('Please provide phone number and code');
            }
            const { user, accessToken, refreshToken } = await this.authService.verifyOtpAndLogin(phone, otp, {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            });
            (0, cookies_1.setAuthCookies)(res, accessToken, refreshToken);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        phone: user.phone,
                        authProvider: user.authProvider
                    },
                    accessToken,
                    refreshToken
                }
            });
        });
        this.refreshToken = (0, async_1.asyncHandler)(async (req, res) => {
            const cookieRefresh = req.cookies?.[cookies_1.REFRESH_TOKEN_COOKIE];
            const { refreshToken } = req.body;
            const token = typeof cookieRefresh === 'string' && cookieRefresh.length > 0 ? cookieRefresh : refreshToken;
            if (!token) {
                throw new exceptions_1.ValidationError('Please provide refresh token');
            }
            const { accessToken, refreshToken: nextRefreshToken, user } = await this.authService.refreshToken(token, {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            });
            (0, cookies_1.setAuthCookies)(res, accessToken, nextRefreshToken);
            res.status(200).json({
                success: true,
                data: {
                    accessToken,
                    refreshToken: nextRefreshToken,
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            });
        });
        this.logout = (0, async_1.asyncHandler)(async (req, res) => {
            const cookieRefresh = req.cookies?.[cookies_1.REFRESH_TOKEN_COOKIE];
            const { refreshToken } = req.body;
            const token = typeof cookieRefresh === 'string' && cookieRefresh.length > 0 ? cookieRefresh : refreshToken;
            const userId = req.user ? req.user.id : null;
            if (token && userId) {
                await this.authService.logout(userId, token);
            }
            (0, cookies_1.clearAuthCookies)(res);
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        });
        this.forgotPassword = (0, async_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            if (!email) {
                throw new exceptions_1.ValidationError('Please provide email');
            }
            const result = await this.authService.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: result.message
            });
        });
        this.resetPassword = (0, async_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            const { password } = req.body;
            if (!token) {
                throw new exceptions_1.ValidationError('Please provide token');
            }
            if (!password) {
                throw new exceptions_1.ValidationError('Please provide password');
            }
            const result = await this.authService.resetPassword(token, password);
            res.status(200).json({
                success: true,
                message: result.message
            });
        });
        this.verifyEmail = (0, async_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            if (!token) {
                throw new exceptions_1.ValidationError('Please provide token');
            }
            const result = await this.authService.verifyEmail(token);
            res.status(200).json({
                success: true,
                message: result.message
            });
        });
        this.getMe = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const user = await this.authService.getMe(userId);
            res.status(200).json({
                success: true,
                data: user
            });
        });
        this.updateProfile = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const user = await this.authService.updateProfile(userId, req.body);
            res.status(200).json({
                success: true,
                data: user
            });
        });
        this.changePassword = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new exceptions_1.ValidationError('Please provide current password and new password');
            }
            const result = await this.authService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: result.message
            });
        });
    }
}
exports.AuthController = AuthController;
