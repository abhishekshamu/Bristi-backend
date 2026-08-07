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
exports.CollectionModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const CollectionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
    },
    shortDescription: {
        type: String,
    },
    image: {
        type: String, // URL to image
    },
    bannerImage: {
        type: String, // URL to desktop banner image
    },
    bannerTablet: {
        type: String, // URL to tablet banner image
    },
    mobileBanner: {
        type: String, // URL to mobile banner image
    },
    icon: {
        type: String, // URL or icon identifier
    },
    video: {
        type: String, // URL to video
    },
    showOnHomepage: {
        type: Boolean,
        default: true,
    },
    showInNavigation: {
        type: Boolean,
        default: false,
    },
    themeColor: {
        type: String,
    },
    buttonColor: {
        type: String,
    },
    buttonText: {
        type: String,
    },
    products: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product',
        }],
    featured: {
        type: Boolean,
        default: false,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    featuredUntil: {
        type: Date,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    seo: {
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
    },
}, {
    timestamps: true,
});
// Indexes
CollectionSchema.index({ slug: 1 });
CollectionSchema.index({ name: 1 });
CollectionSchema.index({ featured: 1 });
CollectionSchema.index({ sortOrder: 1 });
CollectionSchema.index({ isActive: 1 });
CollectionSchema.index({ showOnHomepage: 1 });
CollectionSchema.index({ showInNavigation: 1 });
CollectionSchema.index({ startDate: 1 });
CollectionSchema.index({ endDate: 1 });
// Virtual for getting products count
CollectionSchema.virtual('productCount').get(function () {
    return this.products ? this.products.length : 0;
});
// Pre-save hook to generate slug
CollectionSchema.pre('save', function (next) {
    if (!this.isModified('name'))
        return next();
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});
exports.CollectionModel = mongoose_1.default.model('Collection', CollectionSchema);
