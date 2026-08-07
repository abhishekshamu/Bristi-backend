"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItemRepository = void 0;
// @ts-nocheck
const InventoryItem_1 = require("../models/InventoryItem");
const base_repository_1 = require("./base.repository");
class InventoryItemRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(InventoryItem_1.InventoryItemModel);
    }
    async findByProductId(productId) {
        return this.findMany({ productId });
    }
    async findByProductAndVariant(productId, variantId) {
        const filter = { productId };
        if (variantId) {
            filter.variantId = variantId;
        }
        return this.findOne(filter);
    }
    async upsertByProduct(product, session) {
        const totalStock = product.variants && product.variants.length > 0
            ? product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
            : product.stock;
        const existing = await this.findOne({ productId: product._id });
        if (existing) {
            return this.updateById(existing._id.toString(), {
                sku: product.sku,
                quantity: Math.max(0, totalStock),
                reserved: Math.min(existing.reserved ?? 0, totalStock),
                reorderPoint: product.lowStockThreshold ?? 5,
                cost: product.costPrice ?? existing.cost,
                lastUpdated: new Date(),
            }, session);
        }
        return this.create({
            productId: product._id,
            sku: product.sku,
            quantity: Math.max(0, totalStock),
            reserved: 0,
            reorderPoint: product.lowStockThreshold ?? 5,
            cost: product.costPrice,
            location: { warehouse: 'Main' },
            lastUpdated: new Date(),
        }, session);
    }
    async applyOrderItem(productId, variantId, quantity, orderId, session) {
        const item = await this.findOne({ productId, variantId: variantId ?? null });
        if (!item)
            return null;
        const newQuantity = Math.max(0, (item.quantity ?? 0) - quantity);
        const newReserved = Math.max(0, (item.reserved ?? 0) + quantity);
        return this.updateById(item._id.toString(), {
            quantity: newQuantity,
            reserved: Math.min(newReserved, newQuantity),
            lastUpdated: new Date(),
            $push: {
                history: {
                    type: 'order',
                    quantity: -quantity,
                    reason: 'Stock deducted by order',
                    orderId,
                    date: new Date(),
                },
            },
        }, session);
    }
    async setHistoryOrderId(productId, variantId, orderId, session) {
        await this.updateMany({ productId, variantId: variantId ?? null, 'history.orderId': null }, { $set: { 'history.$[].orderId': orderId } }, session);
    }
    async restoreOrderItem(productId, variantId, quantity, orderId, reason, session) {
        const item = await this.findOne({ productId, variantId: variantId ?? null });
        if (!item)
            return null;
        const newQuantity = (item.quantity ?? 0) + quantity;
        const newReserved = Math.max(0, (item.reserved ?? 0) - quantity);
        return this.updateById(item._id.toString(), {
            quantity: newQuantity,
            reserved: newReserved,
            lastUpdated: new Date(),
            $push: {
                history: {
                    type: reason === 'refund' ? 'refund' : 'cancel',
                    quantity,
                    reason: reason === 'refund' ? 'Stock restored by refund' : 'Stock restored by order cancellation',
                    orderId,
                    date: new Date(),
                },
            },
        }, session);
    }
    async adjustStock(id, quantity, reason, session) {
        const item = await this.findById(id);
        if (!item)
            return null;
        const oldQuantity = item.quantity ?? 0;
        const newQuantity = Math.max(0, quantity);
        return this.updateById(id, {
            quantity: newQuantity,
            reserved: Math.min(item.reserved ?? 0, newQuantity),
            lastUpdated: new Date(),
            $push: {
                history: {
                    type: 'adjustment',
                    quantity: newQuantity - oldQuantity,
                    reason,
                    date: new Date(),
                },
            },
        }, session);
    }
    async updateStock(productId, variantId, quantityChange, type) {
        const item = await this.findByProductAndVariant(productId, variantId);
        if (!item) {
            return null;
        }
        const newQuantity = type === 'add'
            ? item.quantity + quantityChange
            : item.quantity - quantityChange;
        return this.updateById(item._id.toString(), {
            quantity: Math.max(0, newQuantity),
            lastUpdated: new Date(),
        });
    }
}
exports.InventoryItemRepository = InventoryItemRepository;
