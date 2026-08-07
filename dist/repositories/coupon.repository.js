"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRepository = void 0;
const Coupon_1 = require("../models/Coupon");
const base_repository_1 = require("./base.repository");
class CouponRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Coupon_1.CouponModel);
    }
    async findByCode(code, session) {
        return this.findOne({ code: code.toUpperCase() }, session);
    }
    async incrementUsage(code, userId, session) {
        const update = { $inc: { usageCount: 1 } };
        if (userId) {
            update.$addToSet = { customersUsed: userId };
        }
        return this.findOneAndUpdate({ code: code.toUpperCase() }, update, { new: true }, session);
    }
    async validateScopes(coupon, orderItems, session) {
        if (coupon.appliesTo === 'all') {
            return { valid: true };
        }
        const productIds = orderItems.map((i) => i.productId);
        if (coupon.appliesTo === 'specific_products') {
            const scoped = productIds.some((pid) => (coupon.productIds ?? []).some((cp) => String(cp) === String(pid)));
            return scoped ? { valid: true } : { valid: false, message: 'Coupon only applies to selected products' };
        }
        const products = await this.model.find({ _id: { $in: productIds } }).select('category collection').session(session ?? null).exec();
        if (coupon.appliesTo === 'specific_categories') {
            const scoped = products.some((p) => (coupon.categoryIds ?? []).some((c) => String(c) === String(p.category)));
            return scoped ? { valid: true } : { valid: false, message: 'Coupon only applies to selected categories' };
        }
        if (coupon.appliesTo === 'specific_collections') {
            const scoped = products.some((p) => (coupon.collectionIds ?? []).some((c) => String(c) === String(p.collection)));
            return scoped ? { valid: true } : { valid: false, message: 'Coupon only applies to selected collections' };
        }
        return { valid: true };
    }
    async findValidCoupons(options = {}) {
        const now = new Date();
        return this.findMany({
            isActive: true,
            $or: [
                { startsAt: { $exists: false } },
                { startsAt: { $lte: now } }
            ],
            $and: [
                {
                    $or: [
                        { expiresAt: { $exists: false } },
                        { expiresAt: { $gte: now } }
                    ]
                }
            ]
        }, options);
    }
    async isValidCode(code) {
        const coupon = await this.findByCode(code);
        return coupon ? coupon.isValid : false;
    }
    async calculateDiscount(code, cartTotal) {
        const coupon = await this.findByCode(code);
        if (!coupon || !coupon.isValid)
            return 0;
        return coupon.calculateDiscount(cartTotal);
    }
    async getExpiringSoon(days = 7) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);
        return this.findMany({
            isActive: true,
            expiresAt: { $gte: now, $lte: futureDate }
        });
    }
    async getUsageStats() {
        return this.model.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: '$type',
                    totalUsage: { $sum: '$usageCount' },
                    count: { $sum: 1 }
                }
            }
        ]).exec();
    }
}
exports.CouponRepository = CouponRepository;
