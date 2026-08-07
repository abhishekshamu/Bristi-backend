"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductsValidation = exports.updateProductValidation = exports.createProductValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createProductValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Product name is required').trim(),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Product description is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('sku').notEmpty().withMessage('SKU is required'),
    (0, express_validator_1.body)('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];
exports.updateProductValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid product ID'),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];
exports.searchProductsValidation = [
    (0, express_validator_1.query)('q').notEmpty().withMessage('Search query is required'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
];
