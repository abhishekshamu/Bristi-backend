"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const mongoose_1 = require("mongoose");
const exceptions_1 = require("../utils/exceptions");
class CouponService {
    constructor(couponRepo) {
        this.couponRepo = couponRepo;
    }
    async createCoupon(couponData) {
        if (!couponData.code) {
            throw new exceptions_1.ValidationError('Coupon code is required');
        }
        const existingCoupon = await this.couponRepo.findByCode(couponData.code);
        if (existingCoupon) {
            throw new exceptions_1.BadRequestError('Coupon with this code already exists');
        }
        return this.couponRepo.create(couponData);
    }
    async getCouponByCode(code) {
        // Accept either a Mongo _id (used by the admin edit screen) or a coupon code.
        const byId = mongoose_1.Types.ObjectId.isValid(code) ? await this.couponRepo.findById(code) : null;
        const coupon = byId ?? await this.couponRepo.findByCode(code);
        if (!coupon) {
            throw new exceptions_1.NotFoundError('Coupon not found');
        }
        return coupon.toObject();
    }
    async getAllCoupons(options = {}) {
        const { isActive, ...paginateOptions } = options;
        const filter = {};
        if (isActive !== undefined)
            filter.isActive = Boolean(isActive);
        return this.couponRepo.paginate(filter, paginateOptions);
    }
    async updateCoupon(couponId, updateData) {
        const coupon = await this.couponRepo.findById(couponId);
        if (!coupon) {
            throw new exceptions_1.NotFoundError('Coupon not found');
        }
        return this.couponRepo.updateById(couponId, updateData);
    }
    async deleteCoupon(couponId) {
        const coupon = await this.couponRepo.findById(couponId);
        if (!coupon) {
            throw new exceptions_1.NotFoundError('Coupon not found');
        }
        return this.couponRepo.deleteById(couponId);
    }
    async validateCoupon(code, subtotal, options = {}) {
        const coupon = await this.couponRepo.findByCode(code);
        if (!coupon) {
            return { valid: false, discount: 0, message: 'Invalid coupon code' };
        }
        if (!coupon.isActive) {
            return { valid: false, discount: 0, message: 'This coupon is no longer active' };
        }
        if (coupon.startsAt && coupon.startsAt > new Date()) {
            return { valid: false, discount: 0, message: 'This coupon is not active yet' };
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return { valid: false, discount: 0, message: 'This coupon has expired' };
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { valid: false, discount: 0, message: 'This coupon has reached its usage limit' };
        }
        if (coupon.perCustomerLimit && options.userId) {
            const customerUses = (coupon.customersUsed ?? []).filter((id) => String(id) === String(options.userId)).length;
            if (customerUses >= coupon.perCustomerLimit) {
                return { valid: false, discount: 0, message: 'You have already used this coupon' };
            }
        }
        if (coupon.minimumPurchase && subtotal < coupon.minimumPurchase) {
            return { valid: false, discount: 0, message: `Minimum purchase of $${coupon.minimumPurchase} required` };
        }
        if (options.items && options.items.length > 0) {
            const scoped = await this.couponRepo.validateScopes(coupon, options.items);
            if (!scoped.valid) {
                return { valid: false, discount: 0, message: scoped.message };
            }
        }
        const discount = coupon.calculateDiscount(subtotal, options.shipping ?? 0);
        return { valid: true, discount, coupon: this.sanitizeCoupon(coupon) };
    }
    /** Public-safe projection: never expose usage counters, customer lists or
     * internal settings through the storefront validation endpoint. */
    sanitizeCoupon(coupon) {
        const doc = typeof coupon.toObject === 'function' ? coupon.toObject() : coupon;
        return {
            _id: doc._id,
            code: doc.code,
            description: doc.description ?? undefined,
            discountType: doc.discountType,
            discountValue: doc.discountValue,
            minimumPurchase: doc.minimumPurchase ?? undefined,
            startsAt: doc.startsAt ?? undefined,
            expiresAt: doc.expiresAt ?? undefined
        };
    }
}
exports.CouponService = CouponService;
