"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpValidation = exports.requestOtpValidation = exports.googleLoginValidation = exports.updateProfileValidation = exports.changePasswordValidation = exports.refreshTokenValidation = exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First name is required').trim(),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last name is required').trim(),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
exports.forgotPasswordValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];
exports.refreshTokenValidation = [
    (0, express_validator_1.body)('refreshToken').isString().notEmpty().withMessage('Refresh token is required'),
];
exports.changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('New password must contain at least one number'),
];
exports.updateProfileValidation = [
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 1, max: 80 }),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 1, max: 80 }),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601().toDate(),
];
const phoneValidation = (0, express_validator_1.body)('phone')
    .trim()
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Please provide a valid phone number in international format (e.g. +8801712345678)');
exports.googleLoginValidation = [
    (0, express_validator_1.body)('credential').isString().notEmpty().withMessage('Google credential is required'),
];
exports.requestOtpValidation = [phoneValidation];
exports.verifyOtpValidation = [
    phoneValidation,
    (0, express_validator_1.body)('otp').isString().matches(/^\d{6}$/).withMessage('Code must be exactly 6 digits'),
];
