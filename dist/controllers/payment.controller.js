"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
function isAdminUser(user) {
    return !!user && (user.role === 'admin' || user.role === 'super_admin' || !!user.isAdmin);
}
function currentUserId(user) {
    return user ? String(user.id ?? user._id ?? '') : null;
}
class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
        this.createPayment = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = currentUserId(req.user);
            const payment = await this.paymentService.createPayment({ ...req.body, userId });
            res.status(201).json({
                success: true,
                data: payment
            });
        });
        this.getPaymentById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const payment = await this.paymentService.getPaymentById(id);
            const userId = currentUserId(req.user);
            if (!isAdminUser(req.user) && String(payment.userId) !== userId) {
                throw new exceptions_1.BadRequestException('Not authorized to view this payment');
            }
            res.status(200).json({
                success: true,
                data: payment
            });
        });
        this.getPaymentByOrderId = (0, async_1.asyncHandler)(async (req, res) => {
            const { orderId } = req.params;
            const payment = await this.paymentService.getPaymentByOrderId(orderId);
            if (!payment) {
                throw new exceptions_1.BadRequestException('No payment found for this order');
            }
            const userId = currentUserId(req.user);
            if (!isAdminUser(req.user) && String(payment.userId) !== userId) {
                throw new exceptions_1.BadRequestException('Not authorized to view this payment');
            }
            res.status(200).json({
                success: true,
                data: payment
            });
        });
        this.getAllPayments = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const result = await this.paymentService.getAllPayments(options);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        });
        this.updatePaymentStatus = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status, transactionId } = req.body;
            const payment = await this.paymentService.updatePaymentStatus(id, status, transactionId);
            res.status(200).json({
                success: true,
                data: payment
            });
        });
        this.createStripeIntent = (0, async_1.asyncHandler)(async (req, res) => {
            const { amount, currency, orderId } = req.body;
            const userId = currentUserId(req.user);
            const result = await this.paymentService.createStripeIntent(amount, currency || 'USD', orderId, userId || undefined);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        this.createRazorpayOrder = (0, async_1.asyncHandler)(async (req, res) => {
            const { amount, currency, orderId } = req.body;
            const userId = currentUserId(req.user);
            const result = await this.paymentService.createRazorpayOrder(amount, currency || 'INR', orderId, userId || undefined);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        this.refundPayment = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { amount, reason } = req.body;
            const result = await this.paymentService.refundPayment(id, amount, reason);
            res.status(200).json({
                success: true,
                data: result
            });
        });
    }
}
exports.PaymentController = PaymentController;
