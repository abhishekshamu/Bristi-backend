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
exports.CategoryModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const CategorySchema = new mongoose_1.Schema({
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
    subtitle: {
        type: String,
    },
    image: {
        type: String, // URL to image
    },
    bannerImage: {
        type: String, // URL to banner image
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
    },
    level: {
        type: Number,
        default: 0,
        min: 0,
    },
    sortOrder: {
        type: Number,
        default: 0,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    productCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    seo: {
        title: {
            type: String,
        },
        description: {
            type: String,
        },
    },
}, {
    timestamps: true,
});
// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ sortOrder: 1 });
// Virtual for getting children
CategorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId',
});
// Virtual for getting parent
CategorySchema.virtual('parent', {
    ref: 'Category',
    localField: 'parentId',
    foreignField: '_id',
    justOne: true,
});
// Pre-save hook to generate slug
CategorySchema.pre('save', function (next) {
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
// Auto-set level based on parent
CategorySchema.pre('save', function (next) {
    if (this.parentId) {
        // In a real app, we'd look up the parent to get its level
        // For simplicity, we'll set it to parent level + 1
        // This would need to be handled in a pre-populate middleware or service
        this.level = 1; // Simplified
    }
    else {
        this.level = 0;
    }
    next();
});
exports.CategoryModel = mongoose_1.default.model('Category', CategorySchema);
