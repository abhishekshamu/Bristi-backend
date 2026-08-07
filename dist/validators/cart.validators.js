"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCouponValidation = exports.updateCartItemValidation = exports.addToCartValidation = void 0;
const express_validator_1 = require("express-validator");
exports.addToCartValidation = [
    (0, express_validator_1.body)('productId').isMongoId().withMessage('Invalid product ID'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('variantId').optional().isString().notEmpty().isLength({ max: 120 }).withMessage('Invalid variant ID'),
    (0, express_validator_1.body)('selectedOptions').optional().isObject().withMessage('selectedOptions must be an object'),
];
exports.updateCartItemValidation = [
    (0, express_validator_1.param)('itemId').isMongoId().withMessage('Invalid cart item ID'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];
exports.applyCouponValidation = [
    (0, express_validator_1.body)('couponCode').notEmpty().withMessage('Coupon code is required').trim(),
];
