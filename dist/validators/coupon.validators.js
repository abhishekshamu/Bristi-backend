"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCouponValidation = exports.updateCouponValidation = exports.createCouponValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCouponValidation = [
    (0, express_validator_1.body)('code').notEmpty().withMessage('Coupon code is required').trim(),
    (0, express_validator_1.body)('type').isIn(['percentage', 'fixed_amount', 'free_shipping', 'bogo']).withMessage('Coupon type must be percentage, fixed_amount, free_shipping or bogo'),
    (0, express_validator_1.body)('value').isNumeric().withMessage('Coupon value must be numeric'),
    (0, express_validator_1.body)('minimumPurchase').optional().isNumeric().withMessage('minimumPurchase must be numeric'),
    (0, express_validator_1.body)('maximumDiscount').optional().isNumeric().withMessage('maximumDiscount must be numeric'),
    (0, express_validator_1.body)('startsAt').optional().isISO8601().withMessage('Invalid startsAt date'),
    (0, express_validator_1.body)('expiresAt').optional().isISO8601().withMessage('Invalid expiresAt date'),
    (0, express_validator_1.body)('usageLimit').optional().isInt({ min: 0 }).withMessage('usageLimit must be a non-negative integer'),
    (0, express_validator_1.body)('perCustomerLimit').optional().isInt({ min: 0 }).withMessage('perCustomerLimit must be a non-negative integer'),
    (0, express_validator_1.body)('appliesTo').optional().isIn(['all', 'specific_products', 'specific_categories', 'specific_collections']).withMessage('Invalid appliesTo value'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    (0, express_validator_1.body)('appliesToSaleItems').optional().isBoolean().withMessage('appliesToSaleItems must be a boolean'),
];
exports.updateCouponValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid coupon ID'),
    (0, express_validator_1.body)('code').optional().trim(),
    (0, express_validator_1.body)('value').optional().isNumeric().withMessage('Coupon value must be numeric'),
    (0, express_validator_1.body)('type').optional().isIn(['percentage', 'fixed_amount', 'free_shipping', 'bogo']).withMessage('Coupon type must be percentage, fixed_amount, free_shipping or bogo'),
];
exports.validateCouponValidation = [
    (0, express_validator_1.body)('code').notEmpty().withMessage('Coupon code is required').trim(),
];
