"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const async_1 = require("../middleware/async");
class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
        this.getAllInventory = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20 } = req.query;
            const result = await this.inventoryService.getAllInventory({
                page: parseInt(page),
                limit: parseInt(limit)
            });
            res.status(200).json({ success: true, data: result.data, pagination: result });
        });
        this.getInventoryByProduct = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const inventory = await this.inventoryService.getInventoryByProduct(productId);
            res.status(200).json({ success: true, data: inventory });
        });
        this.getLowStock = (0, async_1.asyncHandler)(async (req, res) => {
            const inventory = await this.inventoryService.getLowStock();
            res.status(200).json({ success: true, data: inventory });
        });
        this.getOutOfStock = (0, async_1.asyncHandler)(async (req, res) => {
            const inventory = await this.inventoryService.getOutOfStock();
            res.status(200).json({ success: true, data: inventory });
        });
        this.updateInventory = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const inventory = await this.inventoryService.updateInventory(id, req.body);
            res.status(200).json({ success: true, data: inventory });
        });
        this.transferInventory = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const inventory = await this.inventoryService.transfer(id, req.body);
            res.status(200).json({ success: true, data: inventory });
        });
    }
}
exports.InventoryController = InventoryController;
