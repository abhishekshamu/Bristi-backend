"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const Order_1 = require("../models/Order");
const base_repository_1 = require("./base.repository");
class OrderRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Order_1.OrderModel);
    }
    async findByOrderNumber(orderNumber) {
        return this.findOne({ orderNumber });
    }
    async findByUserId(userId, options = {}) {
        return this.findMany({ userId }, options);
    }
    async findByStatus(status, options = {}) {
        return this.findMany({ status }, options);
    }
    async findRecent(limit = 10) {
        return this.findMany({}, { sort: { createdAt: -1 }, limit });
    }
    async getSalesStats(startDate, endDate) {
        return this.model.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    paymentStatus: 'paid',
                    status: { $in: ['processing', 'shipped', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: '$total' },
                    totalTax: { $sum: '$tax' },
                    totalShipping: { $sum: '$shipping' }
                }
            }
        ]).exec();
    }
    async getDailySales(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return this.model.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        }
                    },
                    totalSales: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]).exec();
    }
    async updateOrderStatus(orderId, status) {
        const updateData = { status };
        if (status === 'shipped') {
            updateData.shippedAt = new Date();
        }
        else if (status === 'delivered') {
            updateData.deliveredAt = new Date();
        }
        else if (status === 'cancelled') {
            updateData.cancelledAt = new Date();
        }
        return this.updateById(orderId, updateData);
    }
    async updatePaymentStatus(orderId, paymentStatus, paymentId) {
        const updateData = { paymentStatus };
        if (paymentId) {
            updateData.paymentId = paymentId;
        }
        if (paymentStatus === 'paid') {
            updateData.paidAt = new Date();
        }
        else if (paymentStatus === 'failed') {
            updateData.failedAt = new Date();
        }
        else if (paymentStatus === 'refunded') {
            updateData.refundedAt = new Date();
        }
        return this.updateById(orderId, updateData);
    }
    async addTrackingInfo(orderId, trackingNumber, trackingUrl) {
        return this.updateById(orderId, {
            trackingNumber,
            trackingUrl: trackingUrl || null
        });
    }
}
exports.OrderRepository = OrderRepository;
