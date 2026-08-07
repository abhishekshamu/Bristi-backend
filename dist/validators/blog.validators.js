"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogIdValidation = exports.updateBlogPostValidation = exports.createBlogPostValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createBlogPostValidation = [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('slug').optional().trim().toLowerCase(),
    (0, express_validator_1.body)('excerpt').optional().trim(),
    (0, express_validator_1.body)('content').optional(),
    (0, express_validator_1.body)('featuredImage').optional().isURL().withMessage('Invalid featured image URL'),
    (0, express_validator_1.body)('gallery').optional().isArray().withMessage('gallery must be an array'),
    (0, express_validator_1.body)('author').optional().trim(),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('tags must be an array'),
    (0, express_validator_1.body)('category').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    (0, express_validator_1.body)('featured').optional().isBoolean().withMessage('featured must be a boolean'),
    (0, express_validator_1.body)('seo.title').optional().trim(),
    (0, express_validator_1.body)('seo.description').optional().trim(),
    (0, express_validator_1.body)('seo.keywords').optional().isArray().withMessage('seo.keywords must be an array'),
];
exports.updateBlogPostValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid blog post ID'),
    (0, express_validator_1.body)('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    (0, express_validator_1.body)('slug').optional().trim().toLowerCase(),
    (0, express_validator_1.body)('excerpt').optional().trim(),
    (0, express_validator_1.body)('content').optional(),
    (0, express_validator_1.body)('featuredImage').optional().isURL().withMessage('Invalid featured image URL'),
    (0, express_validator_1.body)('gallery').optional().isArray().withMessage('gallery must be an array'),
    (0, express_validator_1.body)('author').optional().trim(),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('tags must be an array'),
    (0, express_validator_1.body)('category').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    (0, express_validator_1.body)('featured').optional().isBoolean().withMessage('featured must be a boolean'),
    (0, express_validator_1.body)('seo.title').optional().trim(),
    (0, express_validator_1.body)('seo.description').optional().trim(),
    (0, express_validator_1.body)('seo.keywords').optional().isArray().withMessage('seo.keywords must be an array'),
];
exports.blogIdValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid blog post ID'),
];
