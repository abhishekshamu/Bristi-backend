"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promotion_banner_controller_1 = require("../controllers/promotion-banner.controller");
const promotion_banner_service_1 = require("../services/promotion-banner.service");
const promotion_banner_repository_1 = require("../repositories/promotion-banner.repository");
const auth_middleware_1 = require("../middleware/auth.middleware");
const audit_middleware_1 = require("../middleware/audit.middleware");
const index_1 = require("../validators/index");
const promotion_banner_validators_1 = require("../validators/promotion-banner.validators");
const bannerRepo = new promotion_banner_repository_1.PromotionBannerRepository();
const bannerService = new promotion_banner_service_1.PromotionBannerService(bannerRepo);
const bannerController = new promotion_banner_controller_1.PromotionBannerController(bannerService);
const router = (0, express_1.Router)();
// Public: active, in-schedule banners for the storefront
router.get('/active', bannerController.getActiveBanners);
// Admin routes
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), bannerController.getBanners);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('promotion-banner', 'create'), promotion_banner_validators_1.createPromotionBannerValidation, index_1.validate, bannerController.createBanner);
router.get('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), promotion_banner_validators_1.promotionBannerIdValidation, index_1.validate, bannerController.getBannerById);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('promotion-banner', 'update'), promotion_banner_validators_1.updatePromotionBannerValidation, index_1.validate, bannerController.updateBanner);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('promotion-banner', 'delete'), promotion_banner_validators_1.promotionBannerIdValidation, index_1.validate, bannerController.deleteBanner);
exports.default = router;
