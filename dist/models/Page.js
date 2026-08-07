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
exports.PageModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const PageSchema = new mongoose_1.Schema({
    title: {
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
    content: {
        type: mongoose_1.Schema.Types.Mixed, // Can be HTML string or JSON for dynamic content
        required: true,
    },
    excerpt: {
        type: String,
    },
    featuredImage: {
        type: String, // URL to image
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
    isInMenu: {
        type: Boolean,
        default: false,
    },
    menuOrder: {
        type: Number,
        default: 0,
    },
    seo: {
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        keywords: {
            type: [String],
        },
    },
    layout: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Layout',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    builderSections: [{
            type: mongoose_1.Schema.Types.Mixed,
        }],
}, {
    timestamps: true,
});
// Indexes
PageSchema.index({ slug: 1 });
PageSchema.index({ status: 1 });
PageSchema.index({ isInMenu: 1 });
PageSchema.index({ createdBy: 1 });
PageSchema.index({ updatedAt: -1 });
// Virtual for reading time
PageSchema.virtual('readingTime').get(function () {
    // Assuming content is HTML, we'll strip tags for estimation
    const textContent = typeof this.content === 'string'
        ? this.content.replace(/<[^>]*>/g, ' ')
        : JSON.stringify(this.content);
    const wordsPerMinute = 200;
    const words = textContent.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
});
// Pre-save hook to generate slug
PageSchema.pre('save', function (next) {
    if (!this.isModified('title'))
        return next();
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});
exports.PageModel = mongoose_1.default.model('Page', PageSchema);
