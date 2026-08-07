"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
function isAdminUser(user) {
    return !!user && (user.role === 'admin' || user.role === 'super_admin' || !!user.isAdmin);
}
function actorName(user) {
    if (!user)
        return 'system';
    if (user.firstName)
        return `${user.firstName} ${user.lastName || ''}`.trim();
    return user.email || user.name || String(user._id || user.id || '');
}
class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
        this.createOrder = (0, async_1.asyncHandler)(async (req, res) => {
            // The authenticated user's id is authoritative — never trust a client-supplied userId
            const userId = req.user?.id ?? req.user?._id;
            const { items, shippingAddress, billingAddress, paymentMethod, couponCode, guestEmail, notes } = req.body;
            if (!items || !shippingAddress || !paymentMethod) {
                throw new exceptions_1.ValidationError('Please provide all required fields');
            }
            if (!userId && !guestEmail) {
                throw new exceptions_1.ValidationError('Authentication required, or provide a guest email for guest checkout');
            }
            try {
                const order = await this.orderService.createOrder({
                    userId,
                    guestEmail: userId ? undefined : guestEmail,
                    items,
                    shippingAddress,
                    billingAddress,
                    paymentMethod,
                    couponCode,
                    notes,
                });
                res.status(201).json({
                    success: true,
                    data: order
                });
            }
            catch (error) {
                throw new exceptions_1.BadRequestException(error.message || 'Failed to create order');
            }
        });
        this.getOrderById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const order = await this.orderService.getOrderById(id);
            const isAdmin = isAdminUser(req.user);
            if (!isAdmin && String(order.userId) !== String(req.user?.id ?? req.user?._id)) {
                throw new exceptions_1.BadRequestException('Not authorized to view this order');
            }
            res.status(200).json({
                success: true,
                data: order
            });
        });
        this.getOrderByNumber = (0, async_1.asyncHandler)(async (req, res) => {
            const { orderNumber } = req.params;
            const order = await this.orderService.getOrderByOrderNumber(orderNumber);
            const isAdmin = isAdminUser(req.user);
            if (!isAdmin && String(order.userId) !== String(req.user?.id ?? req.user?._id)) {
                throw new exceptions_1.BadRequestException('Not authorized to view this order');
            }
            res.status(200).json({
                success: true,
                data: order
            });
        });
        this.getUserOrders = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.params.userId ?? req.user?.id ?? req.user?._id;
            const { page = 1, limit = 20 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const result = await this.orderService.getUserOrders(userId, options);
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
        this.getAllOrders = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, status, paymentStatus, customer } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const filter = { status, paymentStatus };
            if (customer)
                filter.userId = customer;
            const result = await this.orderService.getAllOrders(filter, options);
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
        this.updateOrderStatus = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status, note } = req.body;
            if (!status) {
                throw new exceptions_1.ValidationError('Please provide order status');
            }
            const updatedOrder = await this.orderService.updateOrderStatus(id, status, actorName(req.user), note);
            res.status(200).json({
                success: true,
                data: updatedOrder
            });
        });
        this.updatePaymentStatus = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { paymentStatus, paymentId } = req.body;
            if (!paymentStatus) {
                throw new exceptions_1.ValidationError('Please provide payment status');
            }
            const updatedOrder = await this.orderService.updatePaymentStatus(id, paymentStatus, paymentId, actorName(req.user));
            res.status(200).json({
                success: true,
                data: updatedOrder
            });
        });
        this.updateNotes = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { notes } = req.body;
            const updatedOrder = await this.orderService.updateNotes(id, notes ?? '');
            res.status(200).json({
                success: true,
                data: updatedOrder
            });
        });
        this.refundOrder = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { reason } = req.body;
            const updatedOrder = await this.orderService.refundOrder(id, reason, actorName(req.user));
            res.status(200).json({
                success: true,
                data: updatedOrder
            });
        });
        this.sendEmail = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { type } = req.body;
            if (!['confirmation', 'shipping', 'delivered'].includes(type)) {
                throw new exceptions_1.ValidationError('Invalid email type');
            }
            const updatedOrder = await this.orderService.sendOrderEmail(id, type);
            res.status(200).json({
                success: true,
                data: updatedOrder
            });
        });
        this.cancelOrder = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const order = await this.orderService.getOrderById(id);
            const isAdmin = isAdminUser(req.user);
            if (!isAdmin && String(order.userId) !== String(req.user?.id ?? req.user?._id)) {
                throw new exceptions_1.BadRequestException('Not authorized to cancel this order');
            }
            const updated = await this.orderService.cancelOrder(id, req.body?.reason, actorName(req.user));
            res.status(200).json({
                success: true,
                data: updated
            });
        });
        this.getOrderForTracking = (0, async_1.asyncHandler)(async (req, res) => {
            const { orderNumber } = req.params;
            const order = await this.orderService.getOrderForTracking(orderNumber);
            res.status(200).json({
                success: true,
                data: order
            });
        });
        this.addTrackingInfo = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { trackingNumber, trackingUrl } = req.body;
            if (!trackingNumber) {
                throw new exceptions_1.ValidationError('Please provide tracking number');
            }
            const order = await this.orderService.addTrackingInfo(id, trackingNumber, trackingUrl, actorName(req.user));
            res.status(200).json({
                success: true,
                data: order
            });
        });
        this.getOrderStats = (0, async_1.asyncHandler)(async (req, res) => {
            const stats = await this.orderService.getOrderStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        });
        this.getSalesStats = (0, async_1.asyncHandler)(async (req, res) => {
            const { startDate, endDate, days } = req.query;
            const summary = await this.orderService.getSalesStats(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            const daily = await this.orderService.getDailySales(Number.parseInt(days) || 30);
            res.status(200).json({
                success: true,
                data: {
                    summary: summary[0] ?? null,
                    daily,
                }
            });
        });
    }
}
exports.OrderController = OrderController;
