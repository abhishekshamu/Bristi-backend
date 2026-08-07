"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferInventoryValidation = exports.updateInventoryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.updateInventoryValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid inventory item ID'),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    (0, express_validator_1.body)('reserved').optional().isInt({ min: 0 }).withMessage('Reserved must be a non-negative integer'),
    (0, express_validator_1.body)('reorderPoint').optional().isInt({ min: 0 }).withMessage('Reorder point must be a non-negative integer'),
    (0, express_validator_1.body)('maxStockLevel').optional().isInt({ min: 0 }).withMessage('Max stock level must be a non-negative integer'),
    (0, express_validator_1.body)('reason').optional().isString().withMessage('Reason must be a string'),
];
exports.transferInventoryValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid inventory item ID'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Transfer quantity must be a positive integer'),
    (0, express_validator_1.body)('targetWarehouse').isString().trim().notEmpty().withMessage('Target warehouse is required'),
    (0, express_validator_1.body)('note').optional().isString().withMessage('Note must be a string'),
];
