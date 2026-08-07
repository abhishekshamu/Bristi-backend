"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionBannerModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const PromotionBannerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    scope: {
        type: String,
        enum: ['all', 'selected'],
        default: 'all',
    },
    categorySlugs: {
        type: [String],
        default: [],
    },
    desktopImage: {
        type: String, // URL to desktop image
    },
    tabletImage: {
        type: String, // URL to tablet image
    },
    mobileImage: {
        type: String, // URL to mobile image
    },
    redirectUrl: {
        type: String, // URL the banner links to
    },
    openInNewTab: {
        type: Boolean,
        default: true,
    },
    startDate: {
        type: Date, // Optional scheduling window start
    },
    endDate: {
        type: Date, // Optional scheduling window end
    },
    backgroundColor: {
        type: String, // CSS color, fallback behind the image
    },
    borderColor: {
        type: String, // CSS color
    },
    borderWidth: {
        type: Number,
        default: 1,
        min: 0,
    },
    borderRadius: {
        type: Number,
        default: 16,
        min: 0,
    },
    padding: {
        type: Number,
        default: 0,
        min: 0,
    },
    marginTop: {
        type: Number,
        default: 0,
        min: 0,
    },
    marginBottom: {
        type: Number,
        default: 0,
        min: 0,
    },
    overlayColor: {
        type: String, // CSS color for the overlay
    },
    overlayOpacity: {
        type: Number,
        default: 30,
        min: 0,
        max: 100,
    },
    bannerOrder: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});
// Indexes
PromotionBannerSchema.index({ isActive: 1 });
PromotionBannerSchema.index({ bannerOrder: 1 });
exports.PromotionBannerModel = mongoose_1.default.model('PromotionBanner', PromotionBannerSchema);
