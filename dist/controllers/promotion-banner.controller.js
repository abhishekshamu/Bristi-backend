"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionBannerController = void 0;
const async_1 = require("../middleware/async");
class PromotionBannerController {
    constructor(bannerService) {
        this.bannerService = bannerService;
        this.getBanners = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { bannerOrder: 1, createdAt: -1 }
            };
            const result = await this.bannerService.getBanners({}, options);
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
        this.getBannerById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const banner = await this.bannerService.getBannerById(id);
            res.status(200).json({
                success: true,
                data: banner
            });
        });
        this.getActiveBanners = (0, async_1.asyncHandler)(async (_req, res) => {
            const banners = await this.bannerService.getActiveBanners();
            res.status(200).json({
                success: true,
                data: banners
            });
        });
        this.createBanner = (0, async_1.asyncHandler)(async (req, res) => {
            const banner = await this.bannerService.createBanner(req.body);
            res.status(201).json({
                success: true,
                data: banner
            });
        });
        this.updateBanner = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const banner = await this.bannerService.updateBanner(id, req.body);
            res.status(200).json({
                success: true,
                data: banner
            });
        });
        this.deleteBanner = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.bannerService.deleteBanner(id);
            res.status(200).json({
                success: true,
                message: 'Promotion banner deleted successfully'
            });
        });
    }
}
exports.PromotionBannerController = PromotionBannerController;
