"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewValidation = exports.updateReviewStatusValidation = exports.updateReviewValidation = exports.createReviewValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createReviewValidation = [
    (0, express_validator_1.body)('productId').isMongoId().withMessage('Invalid product ID'),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('title').optional().trim().escape(),
    (0, express_validator_1.body)('comment').trim().escape().notEmpty().withMessage('Comment is required'),
    (0, express_validator_1.body)('images').optional().isArray().withMessage('images must be an array'),
];
exports.updateReviewValidation = [
    (0, express_validator_1.param)('reviewId').isMongoId().withMessage('Invalid review ID'),
    (0, express_validator_1.body)('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('title').optional().trim().escape(),
    (0, express_validator_1.body)('comment').optional().trim().escape(),
];
exports.updateReviewStatusValidation = [
    (0, express_validator_1.param)('reviewId').isMongoId().withMessage('Invalid review ID'),
    (0, express_validator_1.body)('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid review status'),
];
exports.deleteReviewValidation = [
    (0, express_validator_1.param)('reviewId').isMongoId().withMessage('Invalid review ID'),
];
