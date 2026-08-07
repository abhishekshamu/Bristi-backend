"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markReadValidation = exports.createNotificationValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createNotificationValidation = [
    (0, express_validator_1.body)('userId').optional().isMongoId().withMessage('Invalid user ID'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Notification title is required').trim(),
    (0, express_validator_1.body)('message').notEmpty().withMessage('Notification message is required').trim(),
    (0, express_validator_1.body)('type').optional().isIn(['info', 'success', 'warning', 'error']).withMessage('Invalid notification type'),
    (0, express_validator_1.body)('isRead').optional().isBoolean(),
];
exports.markReadValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid notification ID'),
];
