"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionBannerService = void 0;
const exceptions_1 = require("../utils/exceptions");
class PromotionBannerService {
    constructor(bannerRepo) {
        this.bannerRepo = bannerRepo;
    }
    async getBanners(filter = {}, options = {}) {
        return this.bannerRepo.paginate(filter, options);
    }
    async getBannerById(id) {
        const banner = await this.bannerRepo.findById(id);
        if (!banner) {
            throw new exceptions_1.NotFoundError('Promotion banner not found');
        }
        return banner;
    }
    async getActiveBanners() {
        const now = new Date();
        const filter = {
            isActive: true,
            $and: [
                {
                    $or: [
                        { startDate: { $exists: false } },
                        { startDate: null },
                        { startDate: { $lte: now } },
                    ],
                },
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: now } },
                    ],
                },
            ],
        };
        return this.bannerRepo.findMany(filter, { sort: { bannerOrder: 1, createdAt: -1 } });
    }
    async createBanner(data) {
        return this.bannerRepo.create(data);
    }
    async updateBanner(id, updateData) {
        const updated = await this.bannerRepo.updateById(id, updateData);
        if (!updated) {
            throw new exceptions_1.NotFoundError('Promotion banner not found');
        }
        return updated;
    }
    async deleteBanner(id) {
        const banner = await this.bannerRepo.findById(id);
        if (!banner) {
            throw new exceptions_1.NotFoundError('Promotion banner not found');
        }
        return this.bannerRepo.deleteById(id);
    }
}
exports.PromotionBannerService = PromotionBannerService;
