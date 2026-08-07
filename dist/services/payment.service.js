"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const exceptions_1 = require("../utils/exceptions");
const stripe_1 = __importDefault(require("stripe"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
class PaymentService {
    constructor(paymentRepo, orderRepo) {
        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
    }
    async validateOrderOwnership(orderId, userId) {
        const order = await this.orderRepo.findById(orderId.toString());
        if (!order) {
            throw new exceptions_1.NotFoundError('Order not found');
        }
        // A payment may only be created against the caller's own order, and the
        // amount must match the order total exactly (no self-pricing).
        if (order.userId && String(order.userId) !== String(userId)) {
            throw new exceptions_1.ForbiddenError('Order does not belong to this user');
        }
        return order;
    }
    assertAmountMatches(order, amount) {
        if (Math.abs(Number(order.total) - Number(amount)) > 0.01) {
            throw new exceptions_1.BadRequestException('Amount does not match the order total');
        }
    }
    async createPayment(data) {
        if (!data.orderId || !data.userId || !data.amount || !data.method) {
            throw new exceptions_1.BadRequestException('Order ID, user ID, amount, and payment method are required');
        }
        const order = await this.validateOrderOwnership(data.orderId, String(data.userId));
        this.assertAmountMatches(order, data.amount);
        const payment = await this.paymentRepo.create({
            ...data,
            status: 'pending'
        });
        return payment;
    }
    async getPaymentById(id) {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) {
            throw new exceptions_1.NotFoundError('Payment not found');
        }
        return payment;
    }
    async getPaymentByOrderId(orderId) {
        return this.paymentRepo.findByOrderId(orderId);
    }
    async getPaymentByTransactionId(transactionId) {
        return this.paymentRepo.findByTransactionId(transactionId);
    }
    async getAllPayments(options = {}) {
        return this.paymentRepo.paginate({}, options);
    }
    async updatePaymentStatus(id, status, transactionId) {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) {
            throw new exceptions_1.NotFoundError('Payment not found');
        }
        const updateData = { status };
        if (transactionId) {
            updateData.transactionId = transactionId;
        }
        const updated = await this.paymentRepo.updateById(id, updateData);
        if (!updated) {
            throw new exceptions_1.NotFoundError('Payment not found');
        }
        if (status === 'completed') {
            await this.orderRepo.updatePaymentStatus(payment.orderId.toString(), 'paid', transactionId);
        }
        else if (status === 'failed') {
            await this.orderRepo.updatePaymentStatus(payment.orderId.toString(), 'failed');
        }
        return updated;
    }
    async createStripeIntent(amount, currency, orderId, userId) {
        const order = await this.validateOrderOwnership(orderId, userId);
        this.assertAmountMatches(order, amount);
        const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2023-10-16',
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency,
            metadata: { orderId: orderId.toString() }
        });
        return { clientSecret: paymentIntent.client_secret };
    }
    async createRazorpayOrder(amount, currency, orderId, userId) {
        const order = await this.validateOrderOwnership(orderId, userId);
        this.assertAmountMatches(order, amount);
        const razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || ''
        });
        const options = {
            amount: Math.round(amount * 100),
            currency: currency,
            receipt: orderId.toString(),
            payment_capture: 1
        };
        const razorpayOrder = await razorpay.orders.create(options);
        return razorpayOrder;
    }
    async verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, signature) {
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');
        return expectedSignature === signature;
    }
    async refundPayment(paymentId, amount, reason) {
        const payment = await this.paymentRepo.findById(paymentId);
        if (!payment) {
            throw new exceptions_1.NotFoundError('Payment not found');
        }
        const refundAmount = amount || payment.amount;
        if (payment.method === 'stripe' || payment.method === 'credit_card' || payment.method === 'debit_card') {
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
                apiVersion: '2023-10-16',
            });
            await stripe.refunds.create({
                payment_intent: payment.transactionId,
                amount: Math.round(refundAmount * 100),
                reason: 'requested_by_customer'
            });
        }
        else if (payment.method === 'razorpay') {
            const razorpay = new razorpay_1.default({
                key_id: process.env.RAZORPAY_KEY_ID || '',
                key_secret: process.env.RAZORPAY_KEY_SECRET || ''
            });
            await razorpay.payments.refund(payment.transactionId, {
                amount: Math.round(refundAmount * 100),
                notes: { reason: reason || '' }
            });
        }
        const updated = await this.paymentRepo.updateById(paymentId, {
            status: 'refunded',
            refundAmount,
            refundReason: reason
        });
        if (!updated) {
            throw new exceptions_1.NotFoundError('Payment not found');
        }
        await this.orderRepo.updatePaymentStatus(payment.orderId.toString(), 'refunded');
        return updated;
    }
}
exports.PaymentService = PaymentService;
