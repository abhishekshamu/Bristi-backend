"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfProtection = void 0;
const crypto_1 = __importDefault(require("crypto"));
const cookies_1 = require("../config/cookies");
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'x-xsrf-token';
function safeEqual(a, b) {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length || ab.length === 0 || bb.length === 0) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(ab, bb);
}
/**
 * Double-submit CSRF protection.
 *
 * A non-httpOnly `bristi_xsrf` cookie is issued on every API response so the
 * browser's JavaScript can read it and send it back as `X-XSRF-TOKEN` (axios
 * does this automatically when `xsrfCookieName`/`xsrfHeaderName` are set).
 *
 * Only state-changing requests carrying an authentication cookie are checked —
 * anonymous mutations (login, register, contact, newsletter) are skipped so
 * first-visit flows never get blocked; SameSite=Lax already stops cookie
 * transmission on cross-site POSTs, this header check is defense-in-depth.
 */
const csrfProtection = (req, res, next) => {
    const existing = req.cookies?.[cookies_1.CSRF_COOKIE];
    if (typeof existing === 'string' && existing.length > 0) {
        res.cookie(cookies_1.CSRF_COOKIE, existing, (0, cookies_1.csrfCookieOptions)());
    }
    else {
        res.cookie(cookies_1.CSRF_COOKIE, crypto_1.default.randomBytes(32).toString('hex'), (0, cookies_1.csrfCookieOptions)());
    }
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }
    const hasSessionCookie = Boolean(req.cookies?.[cookies_1.ACCESS_TOKEN_COOKIE] || req.cookies?.[cookies_1.REFRESH_TOKEN_COOKIE]);
    if (!hasSessionCookie) {
        return next();
    }
    const headerToken = req.headers[CSRF_HEADER];
    const cookieToken = req.cookies?.[cookies_1.CSRF_COOKIE];
    if (typeof headerToken !== 'string' ||
        typeof cookieToken !== 'string' ||
        !safeEqual(headerToken, cookieToken)) {
        return res.status(403).json({ success: false, message: 'Invalid or missing CSRF token' });
    }
    next();
};
exports.csrfProtection = csrfProtection;
