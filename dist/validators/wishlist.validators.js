"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlistValidation = exports.addToWishlistValidation = void 0;
const express_validator_1 = require("express-validator");
exports.addToWishlistValidation = [
    (0, express_validator_1.body)('productId').isMongoId().withMessage('Invalid product ID'),
];
exports.removeFromWishlistValidation = [
    (0, express_validator_1.param)('productId').isMongoId().withMessage('Invalid product ID'),
];
