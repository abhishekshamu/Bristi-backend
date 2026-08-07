"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsByEventNameValidation = exports.trackEventValidation = void 0;
const express_validator_1 = require("express-validator");
exports.trackEventValidation = [
    (0, express_validator_1.body)('eventName').notEmpty().withMessage('Event name is required').trim(),
    (0, express_validator_1.body)('userId').optional().isMongoId().withMessage('Invalid user ID'),
    (0, express_validator_1.body)('sessionId').optional().trim(),
    (0, express_validator_1.body)('url').optional().trim(),
    (0, express_validator_1.body)('referrer').optional().trim(),
    (0, express_validator_1.body)('deviceType').optional().trim(),
    (0, express_validator_1.body)('properties').optional().isObject(),
];
exports.getEventsByEventNameValidation = [
    (0, express_validator_1.param)('eventName').notEmpty().withMessage('Event name is required'),
];
