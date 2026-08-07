"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.optionalAuth = exports.protect = void 0;
const jwt_service_1 = require("../services/jwt.service");
const user_repository_1 = require("../repositories/user.repository");
const admin_repository_1 = require("../repositories/admin.repository");
const exceptions_1 = require("../utils/exceptions");
const cookies_1 = require("../config/cookies");
const userRepo = new user_repository_1.UserRepository();
const adminRepo = new admin_repository_1.AdminRepository();
const jwtService = new jwt_service_1.JwtService();
const ADMIN_ROLE_NAMES = new Set(['admin', 'super_admin', 'moderator', 'content_editor', 'support']);
/** A principal is active when: User docs have status === 'active', Admin docs have isActive === true. */
const isActivePrincipal = (principal) => {
    if (!principal)
        return false;
    if (principal.isActive === false)
        return false;
    if (principal.status !== undefined && principal.status !== 'active')
        return false;
    return true;
};
/** Accepts the session from an httpOnly cookie first, then a Bearer header (API clients). */
const extractAccessToken = (req) => {
    const cookieToken = req.cookies?.[cookies_1.ACCESS_TOKEN_COOKIE];
    if (typeof cookieToken === 'string' && cookieToken.length > 0)
        return cookieToken;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        const bearer = req.headers.authorization.split(' ')[1];
        if (bearer)
            return bearer;
    }
    return null;
};
const protect = async (req, res, next) => {
    const token = extractAccessToken(req);
    if (token) {
        try {
            // Verify token
            const decoded = jwtService.verifyAccessToken(token);
            if (!decoded?.id) {
                throw new exceptions_1.AppError('Invalid access token', 401);
            }
            // Resolve principal from token (customer first, then admin)
            const user = await userRepo.findById(decoded.id);
            if (!user) {
                const admin = await adminRepo.findById(decoded.id);
                if (!admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Not authorized to access this route'
                    });
                }
                if (!isActivePrincipal(admin)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Account is not active'
                    });
                }
                req.user = admin;
                req.authType = 'admin';
                return next();
            }
            if (!isActivePrincipal(user)) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is not active'
                });
            }
            req.user = user;
            req.authType = 'user';
            next();
        }
        catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};
exports.protect = protect;
const optionalAuth = async (req, res, next) => {
    const token = extractAccessToken(req);
    if (!token) {
        return next();
    }
    try {
        const decoded = jwtService.verifyAccessToken(token);
        if (decoded?.id) {
            const user = await userRepo.findById(decoded.id);
            if (user) {
                if (!isActivePrincipal(user))
                    req.user = undefined;
                else {
                    req.user = user;
                    req.authType = 'user';
                }
            }
            else {
                const admin = await adminRepo.findById(decoded.id);
                if (admin && isActivePrincipal(admin)) {
                    req.user = admin;
                    req.authType = 'admin';
                }
            }
        }
    }
    catch {
        // ignore invalid tokens on public routes
    }
    next();
};
exports.optionalAuth = optionalAuth;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        // Admin-gated routes may only be reached by Admin-document principals,
        // never by User documents (even one with a role string of 'admin').
        const wantsAdmin = roles.some((r) => ADMIN_ROLE_NAMES.has(r));
        if (wantsAdmin && req.authType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        if (!roles.includes(req.user.role) && !(roles.includes('admin') && req.user.role === 'super_admin')) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        next();
    };
};
exports.authorize = authorize;
