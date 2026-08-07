"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFaqValidation = exports.createFaqValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createFaqValidation = [
    (0, express_validator_1.body)('question').trim().notEmpty().withMessage('Question is required'),
    (0, express_validator_1.body)('answer').trim().notEmpty().withMessage('Answer is required'),
    (0, express_validator_1.body)('category').trim().notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
exports.updateFaqValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid FAQ ID'),
    (0, express_validator_1.body)('question').optional().trim().notEmpty().withMessage('Question cannot be empty'),
    (0, express_validator_1.body)('answer').optional().trim().notEmpty().withMessage('Answer cannot be empty'),
    (0, express_validator_1.body)('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    (0, express_validator_1.body)('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];
