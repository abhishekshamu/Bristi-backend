"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
class CouponController {
    constructor(couponService) {
        this.couponService = couponService;
        this.createCoupon = (0, async_1.asyncHandler)(async (req, res) => {
            const coupon = await this.couponService.createCoupon(req.body);
            res.status(201).json({ success: true, data: coupon });
        });
        this.getCouponByCode = (0, async_1.asyncHandler)(async (req, res) => {
            const { code } = req.params;
            const coupon = await this.couponService.getCouponByCode(code);
            res.status(200).json({ success: true, data: coupon });
        });
        this.getAllCoupons = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, isActive } = req.query;
            const result = await this.couponService.getAllCoupons({
                page: parseInt(page),
                limit: parseInt(limit),
                ...(isActive !== undefined ? { isActive: isActive === 'true' } : {})
            });
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
        this.updateCoupon = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const coupon = await this.couponService.updateCoupon(id, req.body);
            res.status(200).json({ success: true, data: coupon });
        });
        this.deleteCoupon = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.couponService.deleteCoupon(id);
            res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
        });
        this.validateCoupon = (0, async_1.asyncHandler)(async (req, res) => {
            const { code, subtotal, items, shipping } = req.body;
            if (!code) {
                throw new exceptions_1.ValidationError('Please provide coupon code');
            }
            const userId = req.user?.id;
            const result = await this.couponService.validateCoupon(code, subtotal || 0, {
                items,
                userId,
                shipping,
            });
            res.status(200).json({ success: true, data: result });
        });
    }
}
exports.CouponController = CouponController;
