"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionBannerRepository = void 0;
const PromotionBanner_1 = require("../models/PromotionBanner");
const base_repository_1 = require("./base.repository");
class PromotionBannerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(PromotionBanner_1.PromotionBannerModel);
    }
}
exports.PromotionBannerRepository = PromotionBannerRepository;
