"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const exceptions_1 = require("../utils/exceptions");
class InventoryService {
    constructor(inventoryRepo, productRepo) {
        this.inventoryRepo = inventoryRepo;
        this.productRepo = productRepo;
    }
    async getAllInventory(options) {
        const { page, limit } = options;
        // Populate `productId` so the admin inventory list can render product
        // names/skus instead of "Unknown Product".
        return this.inventoryRepo.paginate({}, {
            page,
            limit,
            sort: { lastUpdated: -1 },
            populate: 'productId',
        });
    }
    async getInventoryByProduct(productId) {
        if (!mongoose_1.default.isValidObjectId(productId)) {
            throw new exceptions_1.BadRequestException('Invalid product ID');
        }
        return this.inventoryRepo.findByProductId(productId);
    }
    async getLowStock() {
        const all = await this.inventoryRepo.findMany({});
        return all.filter((item) => item.quantity <= item.reorderPoint && item.quantity > 0);
    }
    async getOutOfStock() {
        const all = await this.inventoryRepo.findMany({});
        return all.filter((item) => item.quantity === 0);
    }
    async updateInventory(id, data) {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw new exceptions_1.BadRequestException('Invalid inventory item ID');
        }
        const current = await this.inventoryRepo.findById(id);
        if (!current) {
            throw new exceptions_1.NotFoundException('Inventory item not found');
        }
        const newQuantity = data.quantity;
        const reason = data.reason || 'Admin adjustment';
        if (typeof newQuantity === 'number' && newQuantity !== current.quantity) {
            await this.inventoryRepo.adjustStock(id, newQuantity, reason);
            await this.syncProductStock(current);
        }
        const updateData = {
            lastUpdated: new Date(),
        };
        if (typeof data.reorderPoint === 'number')
            updateData.reorderPoint = data.reorderPoint;
        if (typeof data.maxStockLevel === 'number')
            updateData.maxStockLevel = data.maxStockLevel;
        return this.inventoryRepo.updateById(id, updateData);
    }
    /**
     * Transfer stock between warehouses: reduces `quantity` on the source item
     * and records an outgoing transaction; increases the target item's quantity
     * (creating it if needed) and records an incoming transaction.
     */
    async transfer(id, payload) {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw new exceptions_1.BadRequestException('Invalid inventory item ID');
        }
        const { quantity, targetWarehouse, note } = payload;
        if (!targetWarehouse || !targetWarehouse.trim()) {
            throw new exceptions_1.BadRequestException('Target warehouse is required');
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new exceptions_1.BadRequestException('Transfer quantity must be a positive integer');
        }
        const source = await this.inventoryRepo.findById(id);
        if (!source) {
            throw new exceptions_1.NotFoundException('Inventory item not found');
        }
        const warehouse = this.warehouseOf(source);
        if (warehouse.toLowerCase() === targetWarehouse.trim().toLowerCase()) {
            throw new exceptions_1.BadRequestException('Source and target warehouse are the same');
        }
        if ((source.quantity ?? 0) < quantity) {
            throw new exceptions_1.BadRequestException(`Insufficient stock to transfer: ${source.quantity} available in ${warehouse}`);
        }
        const sourceWarehouse = warehouse;
        const target = await this.inventoryRepo.findOne({ productId: source.productId, 'location.warehouse': targetWarehouse.trim() });
        const reason = note?.trim() || `Transferred from ${sourceWarehouse} to ${targetWarehouse.trim()}`;
        if (target) {
            await this.inventoryRepo.updateById(target._id.toString(), {
                quantity: (target.quantity ?? 0) + quantity,
                lastUpdated: new Date(),
                $push: {
                    history: {
                        type: 'restock',
                        quantity,
                        reason: `Incoming transfer from ${sourceWarehouse}`,
                        date: new Date(),
                    },
                },
            });
        }
        else {
            await this.inventoryRepo.create({
                productId: source.productId,
                variantId: source.variantId,
                sku: `${source.sku}-${targetWarehouse.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
                quantity,
                reserved: 0,
                location: { warehouse: targetWarehouse.trim() },
                reorderPoint: source.reorderPoint,
                cost: source.cost,
                history: [{
                        type: 'restock',
                        quantity,
                        reason: `Incoming transfer from ${sourceWarehouse}`,
                        date: new Date(),
                    }],
                lastUpdated: new Date(),
            });
        }
        await this.inventoryRepo.updateById(id, {
            quantity: (source.quantity ?? 0) - quantity,
            reserved: Math.min(source.reserved ?? 0, Math.max(0, (source.quantity ?? 0) - quantity)),
            lastUpdated: new Date(),
            $push: {
                history: {
                    type: 'order',
                    quantity: -quantity,
                    reason,
                    date: new Date(),
                },
            },
        });
        await this.syncProductStock(source);
        return this.inventoryRepo.findById(id);
    }
    warehouseOf(item) {
        const location = item?.location;
        if (location && typeof location === 'object' && typeof location.warehouse === 'string') {
            return location.warehouse;
        }
        return 'Main';
    }
    async syncProductStock(current) {
        if (!mongoose_1.default.isValidObjectId(String(current.productId)))
            return;
        const items = await this.inventoryRepo.findByProductId(String(current.productId));
        const total = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
        await this.productRepo.findByIdAndUpdate(current.productId, { $set: { stock: total } });
    }
}
exports.InventoryService = InventoryService;
