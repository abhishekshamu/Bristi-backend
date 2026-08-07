"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusValidation = exports.refundPaymentValidation = exports.createRazorpayOrderValidation = exports.createStripeIntentValidation = exports.createPaymentValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createPaymentValidation = [
    (0, express_validator_1.body)('orderId').isMongoId().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('method').isIn(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'razorpay', 'stripe', 'cod'])
        .withMessage('Invalid payment method'),
    (0, express_validator_1.body)('transactionId').optional().trim(),
    (0, express_validator_1.body)('amount').isNumeric().withMessage('Amount must be numeric'),
    (0, express_validator_1.body)('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
];
exports.createStripeIntentValidation = [
    (0, express_validator_1.body)('orderId').isMongoId().withMessage('Invalid order ID'),
];
exports.createRazorpayOrderValidation = [
    (0, express_validator_1.body)('orderId').isMongoId().withMessage('Invalid order ID'),
];
exports.refundPaymentValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid payment ID'),
    (0, express_validator_1.body)('amount').optional().isNumeric().withMessage('Amount must be numeric'),
    (0, express_validator_1.body)('reason').optional().trim(),
];
exports.updatePaymentStatusValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid payment ID'),
    (0, express_validator_1.body)('status').isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled']).withMessage('Invalid payment status'),
];
