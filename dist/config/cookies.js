"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = exports.csrfCookieOptions = exports.CSRF_COOKIE = exports.REFRESH_TOKEN_COOKIE = exports.ACCESS_TOKEN_COOKIE = void 0;
exports.ACCESS_TOKEN_COOKIE = 'bristi_access_token';
exports.REFRESH_TOKEN_COOKIE = 'bristi_refresh_token';
exports.CSRF_COOKIE = 'bristi_xsrf';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const secureOptions = (httpOnly, maxAge) => ({
    httpOnly,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge,
});
const daysFromEnv = (value, fallback) => {
    const days = Number.parseInt(value || '', 10);
    return Number.isFinite(days) && days > 0 ? days : fallback;
};
const accessMaxAge = () => daysFromEnv(process.env.JWT_EXPIRE, 30) * 24 * 60 * 60 * 1000;
const refreshMaxAge = () => daysFromEnv(process.env.JWT_REFRESH_TOKEN_DAYS || process.env.JWT_REFRESH_EXPIRE, 60) * 24 * 60 * 60 * 1000;
const csrfCookieOptions = () => ({
    httpOnly: false,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
});
exports.csrfCookieOptions = csrfCookieOptions;
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie(exports.ACCESS_TOKEN_COOKIE, accessToken, secureOptions(true, accessMaxAge()));
    res.cookie(exports.REFRESH_TOKEN_COOKIE, refreshToken, secureOptions(true, refreshMaxAge()));
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => {
    res.clearCookie(exports.ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(exports.REFRESH_TOKEN_COOKIE, { path: '/' });
};
exports.clearAuthCookies = clearAuthCookies;
