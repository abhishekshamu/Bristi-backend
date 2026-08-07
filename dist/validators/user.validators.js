"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidation = exports.preferencesValidation = exports.addressIdValidation = exports.updateAddressValidation = exports.createAddressValidation = exports.updateProfileValidation = void 0;
const express_validator_1 = require("express-validator");
const addressFields = [
    (0, express_validator_1.body)('type').isIn(['billing', 'shipping', 'both']),
    (0, express_validator_1.body)('firstName').trim().notEmpty(), (0, express_validator_1.body)('lastName').trim().notEmpty(),
    (0, express_validator_1.body)('addressLine1').trim().notEmpty(), (0, express_validator_1.body)('city').trim().notEmpty(),
    (0, express_validator_1.body)('state').trim().notEmpty(), (0, express_validator_1.body)('postalCode').trim().notEmpty(),
    (0, express_validator_1.body)('country').trim().notEmpty(), (0, express_validator_1.body)('phone').trim().notEmpty(),
];
exports.updateProfileValidation = [
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 1, max: 80 }),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 1, max: 80 }),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601().toDate(),
];
exports.createAddressValidation = addressFields;
exports.updateAddressValidation = [(0, express_validator_1.param)('addressId').trim().notEmpty(), ...addressFields.map((rule) => rule.optional())];
exports.addressIdValidation = [(0, express_validator_1.param)('addressId').trim().notEmpty()];
exports.preferencesValidation = [
    (0, express_validator_1.body)('newsletter').optional().isBoolean().toBoolean(),
    (0, express_validator_1.body)('marketing').optional().isBoolean().toBoolean(),
    (0, express_validator_1.body)('orderUpdates').optional().isBoolean().toBoolean(),
];
exports.changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('New password must contain at least one number'),
];
