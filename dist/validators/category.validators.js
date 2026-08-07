"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryValidation = exports.createCategoryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCategoryValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Category name is required').trim(),
    (0, express_validator_1.body)('slug').optional().trim(),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('subtitle').optional(),
    (0, express_validator_1.body)('image').optional(),
    (0, express_validator_1.body)('bannerImage').optional(),
    (0, express_validator_1.body)('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    (0, express_validator_1.body)('seo.title').optional(),
    (0, express_validator_1.body)('seo.description').optional(),
    (0, express_validator_1.body)('parentId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid parent ID'),
];
exports.updateCategoryValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid category ID'),
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('slug').optional().trim(),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('subtitle').optional(),
    (0, express_validator_1.body)('image').optional(),
    (0, express_validator_1.body)('bannerImage').optional(),
    (0, express_validator_1.body)('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    (0, express_validator_1.body)('seo.title').optional(),
    (0, express_validator_1.body)('seo.description').optional(),
    (0, express_validator_1.body)('parentId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid parent ID'),
];
