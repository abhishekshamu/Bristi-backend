"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminIdValidation = exports.updateAdminValidation = exports.createAdminValidation = void 0;
const express_validator_1 = require("express-validator");
const passwordRules = [
    (0, express_validator_1.body)('password')
        .if((0, express_validator_1.body)('password').exists())
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];
exports.createAdminValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('role').optional().isIn(['super_admin', 'admin', 'moderator', 'content_editor', 'support'])
        .withMessage('Invalid admin role'),
];
exports.updateAdminValidation = [
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 1, max: 80 }),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 1, max: 80 }),
    (0, express_validator_1.body)('role').optional().isIn(['super_admin', 'admin', 'moderator', 'content_editor', 'support'])
        .withMessage('Invalid admin role'),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('permissions').optional().isArray(),
    ...passwordRules,
];
exports.adminIdValidation = [
    (0, express_validator_1.param)('id').trim().isMongoId().withMessage('Invalid admin id'),
];
