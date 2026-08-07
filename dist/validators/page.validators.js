"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageIdValidation = exports.updatePageBuilderValidation = exports.updatePageValidation = exports.createPageValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createPageValidation = [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('slug').optional().trim().toLowerCase(),
    (0, express_validator_1.body)('content').optional(),
    (0, express_validator_1.body)('excerpt').optional().trim(),
    (0, express_validator_1.body)('featuredImage').optional().isURL().withMessage('Invalid featured image URL'),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    (0, express_validator_1.body)('isInMenu').optional().isBoolean().withMessage('isInMenu must be a boolean'),
    (0, express_validator_1.body)('menuOrder').optional().isInt({ min: 0 }).withMessage('menuOrder must be a non-negative integer'),
    (0, express_validator_1.body)('seo.title').optional().trim(),
    (0, express_validator_1.body)('seo.description').optional().trim(),
    (0, express_validator_1.body)('seo.keywords').optional().isArray().withMessage('seo.keywords must be an array'),
    (0, express_validator_1.body)('builderSections').optional().isArray().withMessage('builderSections must be an array'),
];
exports.updatePageValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid page ID'),
    (0, express_validator_1.body)('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    (0, express_validator_1.body)('slug').optional().trim().toLowerCase(),
    (0, express_validator_1.body)('content').optional(),
    (0, express_validator_1.body)('excerpt').optional().trim(),
    (0, express_validator_1.body)('featuredImage').optional().isURL().withMessage('Invalid featured image URL'),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    (0, express_validator_1.body)('isInMenu').optional().isBoolean().withMessage('isInMenu must be a boolean'),
    (0, express_validator_1.body)('menuOrder').optional().isInt({ min: 0 }).withMessage('menuOrder must be a non-negative integer'),
    (0, express_validator_1.body)('seo.title').optional().trim(),
    (0, express_validator_1.body)('seo.description').optional().trim(),
    (0, express_validator_1.body)('seo.keywords').optional().isArray().withMessage('seo.keywords must be an array'),
    (0, express_validator_1.body)('builderSections').optional().isArray().withMessage('builderSections must be an array'),
];
exports.updatePageBuilderValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid page ID'),
    (0, express_validator_1.body)('sections').isArray().withMessage('sections must be an array'),
];
exports.pageIdValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid page ID'),
];
