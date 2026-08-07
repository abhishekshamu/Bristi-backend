"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrackingValidation = exports.cancelOrderValidation = exports.sendEmailValidation = exports.updateNotesValidation = exports.updatePaymentStatusValidation = exports.updateOrderStatusValidation = exports.getOrderValidation = exports.createOrderValidation = void 0;
const express_validator_1 = require("express-validator");
const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'razorpay', 'stripe', 'cod'];
const orderStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];
exports.createOrderValidation = [
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    (0, express_validator_1.body)('items.*.productId').isMongoId().withMessage('Invalid product ID'),
    (0, express_validator_1.body)('items.*.variantId').optional().isString().notEmpty().withMessage('Invalid variant ID'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('shippingAddress').isObject().withMessage('Shipping address is required'),
    (0, express_validator_1.body)('shippingAddress.fullName').optional().notEmpty().withMessage('Recipient name is required'),
    (0, express_validator_1.body)('shippingAddress.phone').optional().notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('billingAddress').optional().isObject(),
    (0, express_validator_1.body)('paymentMethod').isIn(paymentMethods).withMessage('Invalid payment method'),
    (0, express_validator_1.body)('couponCode').optional().trim(),
    (0, express_validator_1.body)('notes').optional().trim(),
    (0, express_validator_1.body)('guestEmail').optional().isEmail().withMessage('Invalid guest email'),
];
exports.getOrderValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid order ID'),
];
exports.updateOrderStatusValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('status').isIn(orderStatuses).withMessage('Invalid order status'),
    (0, express_validator_1.body)('note').optional().trim(),
];
exports.updatePaymentStatusValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('paymentStatus').isIn(paymentStatuses).withMessage('Invalid payment status'),
    (0, express_validator_1.body)('paymentId').optional().trim(),
];
exports.updateNotesValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('notes').optional().trim(),
];
exports.sendEmailValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('type').isIn(['confirmation', 'shipping', 'delivered']).withMessage('Invalid email type'),
];
exports.cancelOrderValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('reason').optional().trim(),
];
exports.addTrackingValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('trackingNumber').optional().trim(),
    (0, express_validator_1.body)('carrier').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(orderStatuses).withMessage('Invalid order status'),
];
