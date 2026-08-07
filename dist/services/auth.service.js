"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const session_repository_1 = require("../repositories/session.repository");
const notification_service_1 = require("./notification.service");
const notification_repository_1 = require("../repositories/notification.repository");
const admin_notifier_1 = require("./admin-notifier");
const exceptions_1 = require("../utils/exceptions");
const crypto_1 = __importDefault(require("crypto"));
const LOCKOUT_THRESHOLD = 5; // failed attempts before lockout
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minute lockout window
class AuthService {
    constructor(userRepo, authRepo, jwtService, emailService, otpService, googleService, sessionRepo, loginHistoryRepo, adminRepo) {
        this.userRepo = userRepo;
        this.authRepo = authRepo;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.otpService = otpService;
        this.googleService = googleService;
        this.sessionRepo = sessionRepo;
        this.loginHistoryRepo = loginHistoryRepo;
        this.adminRepo = adminRepo;
    }
    async issueTokens(user) {
        const accessToken = this.jwtService.generateAccessToken(user);
        const refreshToken = this.jwtService.generateRefreshToken(user);
        const refreshExpiry = this.getRefreshExpiry();
        await this.authRepo.createRefreshToken(user._id.toString(), refreshToken, refreshExpiry);
        if (this.sessionRepo) {
            await this.sessionRepo.createSession({
                userId: user._id.toString(),
                tokenHash: session_repository_1.SessionRepository.hashToken(refreshToken),
            });
        }
        return { accessToken, refreshToken };
    }
    async recordLogin(entry) {
        if (!this.loginHistoryRepo)
            return;
        await this.loginHistoryRepo.record({
            userId: entry.userId,
            method: entry.method,
            success: entry.success,
            ip: entry.meta?.ip,
            userAgent: entry.meta?.userAgent,
            identifier: entry.identifier,
            failedReason: entry.failedReason,
        });
    }
    async enforceLockout(user, meta, identifier) {
        if (await this.userRepo.isAccountLocked(user)) {
            await this.recordLogin({
                userId: user._id?.toString(),
                method: 'email',
                success: false,
                meta,
                identifier,
                failedReason: 'account_locked',
            });
            throw new exceptions_1.BadRequestException('Account is temporarily locked due to too many failed attempts. Try again in 15 minutes.');
        }
    }
    normalizePhone(phone) {
        return phone.replace(/[^\d+]/g, '');
    }
    async googleLogin(credential, meta) {
        if (!this.googleService) {
            throw new exceptions_1.BadRequestException('Google sign-in is not available');
        }
        let profile;
        try {
            profile = await this.googleService.verifyIdToken(credential);
        }
        catch (err) {
            await this.recordLogin({
                method: 'google',
                success: false,
                meta,
                failedReason: 'token_verification_failed',
            });
            throw new exceptions_1.BadRequestException('Google authentication failed. Please try again.');
        }
        let user = await this.userRepo.findByGoogleId(profile.sub);
        if (!user && profile.email) {
            // A verified email on the ID token may be trusted for account linking.
            user = profile.emailVerified ? await this.userRepo.findByEmail(profile.email) : null;
            if (user) {
                await this.userRepo.updateById(user._id.toString(), { googleId: profile.sub });
            }
        }
        if (!user) {
            if (!profile.email) {
                throw new exceptions_1.BadRequestException('Your Google account has no email address we can use');
            }
            const existing = await this.userRepo.findByEmail(profile.email);
            if (existing) {
                throw new exceptions_1.BadRequestException('An account with this email already exists. Please log in with your email and password.');
            }
            user = await this.userRepo.create({
                email: profile.email,
                emailVerified: profile.emailVerified,
                firstName: profile.givenName || profile.name?.split(' ')[0] || 'Google',
                lastName: profile.familyName || profile.name?.split(' ').slice(1).join(' ') || 'User',
                avatar: profile.picture,
                authProvider: 'google',
                googleId: profile.sub,
                role: 'customer',
                status: 'active',
            });
        }
        if (user.status !== 'active') {
            await this.recordLogin({
                userId: user._id.toString(),
                method: 'google',
                success: false,
                meta,
                identifier: profile.email,
                failedReason: 'account_inactive',
            });
            throw new exceptions_1.BadRequestException('Account is not active');
        }
        await this.userRepo.clearFailedLogins(user._id.toString());
        await this.userRepo.updateLastLogin(user._id.toString());
        await this.recordLogin({
            userId: user._id.toString(),
            method: 'google',
            success: true,
            meta,
            identifier: profile.email,
        });
        const { accessToken, refreshToken } = await this.issueTokens(user);
        return { user: user.toObject(), accessToken, refreshToken };
    }
    async requestOtp(phone, _meta) {
        if (!this.otpService) {
            throw new exceptions_1.BadRequestException('Phone verification is not available');
        }
        return this.otpService.sendOtp(this.normalizePhone(phone));
    }
    async verifyOtpAndLogin(phone, otp, meta) {
        if (!this.otpService) {
            throw new exceptions_1.BadRequestException('Phone verification is not available');
        }
        const normalizedPhone = this.normalizePhone(phone);
        try {
            await this.otpService.verifyOtp(normalizedPhone, otp);
        }
        catch (error) {
            await this.recordLogin({
                method: 'phone',
                success: false,
                meta,
                identifier: normalizedPhone,
                failedReason: error?.message?.toLowerCase().includes('attempt') ? 'max_attempts' : 'wrong_code',
            });
            throw error;
        }
        let user = await this.userRepo.findByPhone(normalizedPhone);
        if (!user) {
            user = await this.userRepo.create({
                phone: normalizedPhone,
                phoneVerified: true,
                authProvider: 'phone',
                firstName: 'BRISTI',
                lastName: 'Member',
                role: 'customer',
                status: 'active',
            });
        }
        if (user.status !== 'active') {
            await this.recordLogin({
                userId: user._id.toString(),
                method: 'phone',
                success: false,
                meta,
                identifier: normalizedPhone,
                failedReason: 'account_inactive',
            });
            throw new exceptions_1.BadRequestException('Account is not active');
        }
        await this.userRepo.clearFailedLogins(user._id.toString());
        await this.userRepo.updateLastLogin(user._id.toString());
        await this.recordLogin({
            userId: user._id.toString(),
            method: 'phone',
            success: true,
            meta,
            identifier: normalizedPhone,
        });
        const { accessToken, refreshToken } = await this.issueTokens(user);
        return { user: user.toObject(), accessToken, refreshToken };
    }
    async register(userData) {
        const existingUser = await this.userRepo.findByEmail(userData.email);
        if (existingUser) {
            throw new exceptions_1.BadRequestException('User with this email already exists');
        }
        const user = await this.userRepo.create({
            ...userData,
            role: 'customer',
            status: 'active'
        });
        const accessToken = this.jwtService.generateAccessToken(user);
        const refreshToken = this.jwtService.generateRefreshToken(user);
        const refreshExpiry = this.getRefreshExpiry();
        await this.authRepo.createRefreshToken(user._id.toString(), refreshToken, refreshExpiry);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        await this.userRepo.setEmailVerificationToken(user._id.toString(), crypto_1.default.createHash('sha256').update(verificationToken).digest('hex'), new Date(Date.now() + 24 * 60 * 60 * 1000));
        await this.emailService.sendEmailVerificationEmail(user.email, verificationToken);
        // Notify admins of a new customer registration
        await this.notifyNewCustomer(user);
        return { user: user.toObject(), accessToken, refreshToken };
    }
    async notifyNewCustomer(user) {
        try {
            await (0, admin_notifier_1.notifyAdmins)(new notification_service_1.NotificationService(new notification_repository_1.NotificationRepository()), {
                title: 'New Customer Registration',
                message: `A new customer (${user.email}) has registered on the store.`,
                type: 'info',
                relatedId: user._id,
                relatedType: 'User',
            });
        }
        catch (err) {
            console.error('New customer notification failed:', err);
        }
    }
    async login(email, password, meta) {
        const user = await this.userRepo.findByCredentials(email);
        if (!user) {
            await this.recordLogin({
                method: 'email',
                success: false,
                meta,
                identifier: email,
                failedReason: 'user_not_found',
            });
            throw new exceptions_1.BadRequestException('Invalid credentials');
        }
        await this.enforceLockout(user, meta, email);
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            await this.userRepo.registerFailedLogin(user._id.toString());
            const failed = (user.failedLoginAttempts ?? 0) + 1;
            if (failed >= LOCKOUT_THRESHOLD) {
                await this.userRepo.lockAccount(user._id.toString(), new Date(Date.now() + LOCKOUT_DURATION_MS));
            }
            await this.recordLogin({
                userId: user._id.toString(),
                method: 'email',
                success: false,
                meta,
                identifier: email,
                failedReason: 'wrong_password',
            });
            throw new exceptions_1.BadRequestException('Invalid credentials');
        }
        if (user.status !== 'active') {
            await this.recordLogin({
                userId: user._id.toString(),
                method: 'email',
                success: false,
                meta,
                identifier: email,
                failedReason: 'account_inactive',
            });
            throw new exceptions_1.BadRequestException('Account is not active');
        }
        await this.userRepo.clearFailedLogins(user._id.toString());
        await this.userRepo.updateLastLogin(user._id.toString());
        await this.recordLogin({
            userId: user._id.toString(),
            method: 'email',
            success: true,
            meta,
            identifier: email,
        });
        const { accessToken, refreshToken } = await this.issueTokens(user);
        return { user: user.toObject(), accessToken, refreshToken };
    }
    async refreshToken(refreshToken, meta) {
        const payload = this.jwtService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new exceptions_1.UnauthorizedError('Invalid refresh token');
        }
        const storedToken = await this.authRepo.findRefreshToken(refreshToken);
        if (!storedToken) {
            await this.recordLogin({
                method: 'refresh',
                success: false,
                meta,
                identifier: payload.id,
                failedReason: 'token_not_found',
            });
            throw new exceptions_1.UnauthorizedError('Invalid or expired refresh token');
        }
        // Resolve the principal (customer first, then admin) and enforce activity.
        const user = await this.userRepo.findById(payload.id);
        if (user) {
            if (user.status !== 'active') {
                await this.authRepo.deleteRefreshToken(refreshToken);
                await this.sessionRepo?.revokeByHash(session_repository_1.SessionRepository.hashToken(refreshToken));
                await this.recordLogin({
                    userId: user._id.toString(),
                    method: 'refresh',
                    success: false,
                    meta,
                    failedReason: 'account_inactive',
                });
                throw new exceptions_1.UnauthorizedError('Account is not active');
            }
        }
        else {
            const admin = this.adminRepo ? await this.adminRepo.findById(payload.id) : null;
            if (!admin) {
                await this.authRepo.deleteRefreshToken(refreshToken);
                await this.recordLogin({
                    method: 'refresh',
                    success: false,
                    meta,
                    identifier: payload.id,
                    failedReason: 'principal_not_found',
                });
                throw new exceptions_1.UnauthorizedError('Invalid refresh token');
            }
            if (admin.isActive === false) {
                await this.authRepo.deleteRefreshToken(refreshToken);
                throw new exceptions_1.UnauthorizedError('Account is not active');
            }
            await this.authRepo.deleteRefreshToken(refreshToken);
            const accessToken = this.jwtService.generateAccessToken(admin);
            const nextRefreshToken = this.jwtService.generateRefreshToken(admin);
            await this.authRepo.createRefreshToken(admin._id.toString(), nextRefreshToken, this.getRefreshExpiry(), 'admin');
            return { accessToken, refreshToken: nextRefreshToken, user: admin.toObject() };
        }
        await this.authRepo.deleteRefreshToken(refreshToken);
        await this.sessionRepo?.revokeByHash(session_repository_1.SessionRepository.hashToken(refreshToken));
        const { accessToken, refreshToken: nextRefreshToken } = await this.issueTokens(user);
        await this.recordLogin({
            userId: user._id.toString(),
            method: 'refresh',
            success: true,
            meta,
        });
        return { accessToken, refreshToken: nextRefreshToken, user: user.toObject() };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.authRepo.deleteRefreshToken(refreshToken);
            await this.sessionRepo?.revokeByHash(session_repository_1.SessionRepository.hashToken(refreshToken));
        }
        await this.authRepo.deleteUserTokens(userId);
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(email) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            return { message: 'If your email is registered, you will receive a password reset link' };
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        await this.userRepo.setPasswordResetToken(user._id.toString(), crypto_1.default.createHash('sha256').update(resetToken).digest('hex'), new Date(Date.now() + 60 * 60 * 1000));
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
        return { message: 'If your email is registered, you will receive a password reset link' };
    }
    async resetPassword(token, password) {
        const user = await this.userRepo.findByResetToken(crypto_1.default.createHash('sha256').update(token).digest('hex'));
        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new exceptions_1.BadRequestException('Invalid or expired token');
        }
        await this.userRepo.updatePassword(user._id.toString(), password);
        await this.userRepo.clearPasswordResetToken(user._id.toString());
        // Revoke all sessions on password reset
        await this.authRepo.deleteUserTokens(user._id.toString());
        await this.sessionRepo?.revokeAllForUser(user._id.toString());
        return { message: 'Password has been reset successfully' };
    }
    async verifyEmail(token) {
        const user = await this.userRepo.findByEmailVerificationToken(crypto_1.default.createHash('sha256').update(token).digest('hex'));
        if (!user) {
            throw new exceptions_1.BadRequestException('Invalid or expired verification token');
        }
        await this.userRepo.verifyEmail(user._id.toString());
        // Email change invalidates existing refresh tokens
        await this.authRepo.deleteUserTokens(user._id.toString());
        return { message: 'Email verified successfully' };
    }
    async getMe(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        return user.toObject();
    }
    async updateProfile(userId, updateData) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        // Whitelist fields a customer may update. Never allow role/status/email/
        // password escalation through this endpoint.
        const allowed = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'preferences'];
        const update = {};
        for (const key of allowed) {
            if (updateData[key] !== undefined)
                update[key] = updateData[key];
        }
        if (Object.keys(update).length === 0) {
            return user.toObject();
        }
        const updatedUser = await this.userRepo.updateById(userId, update);
        return updatedUser.toObject();
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepo.findByIdWithPassword(userId);
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            throw new exceptions_1.BadRequestException('Current password is incorrect');
        }
        await this.userRepo.updatePassword(userId, newPassword);
        await this.authRepo.deleteUserTokens(userId);
        await this.sessionRepo?.revokeAllForUser(userId);
        return { message: 'Password changed successfully' };
    }
    async getAuthStats() {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [activeSessions, recentLogins, recentFailedLogins, loginsLast7Days, failedLoginsLast7Days] = await Promise.all([
            this.sessionRepo ? this.sessionRepo.countActive() : 0,
            this.loginHistoryRepo ? this.loginHistoryRepo.recent(20, { success: true }) : [],
            this.loginHistoryRepo ? this.loginHistoryRepo.recent(20, { success: false }) : [],
            this.loginHistoryRepo ? this.loginHistoryRepo.count({ success: true, createdAt: { $gte: since } }) : 0,
            this.loginHistoryRepo ? this.loginHistoryRepo.count({ success: false, createdAt: { $gte: since } }) : 0,
        ]);
        const [googleLogins, phoneLogins, emailLogins] = await Promise.all([
            this.loginHistoryRepo ? this.loginHistoryRepo.count({ method: 'google', success: true, createdAt: { $gte: since } }) : 0,
            this.loginHistoryRepo ? this.loginHistoryRepo.count({ method: 'phone', success: true, createdAt: { $gte: since } }) : 0,
            this.loginHistoryRepo ? this.loginHistoryRepo.count({ method: 'email', success: true, createdAt: { $gte: since } }) : 0,
        ]);
        return { activeSessions, recentLogins, recentFailedLogins, loginsLast7Days, failedLoginsLast7Days, googleLogins, phoneLogins, emailLogins };
    }
    getRefreshExpiry() {
        const configuredDays = Number.parseInt(process.env.JWT_REFRESH_TOKEN_DAYS || '60', 10);
        const days = Number.isFinite(configuredDays) && configuredDays > 0 ? configuredDays : 60;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
}
exports.AuthService = AuthService;
