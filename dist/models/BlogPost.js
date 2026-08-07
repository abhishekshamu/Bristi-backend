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
exports.BlogPostModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const BlogPostSchema = new mongoose_1.Schema({
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
        default: function () {
            return this.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        },
    },
    excerpt: {
        type: String,
    },
    content: {
        type: String,
        required: true,
    },
    featuredImage: {
        type: String, // URL to image
    },
    gallery: [{
            type: String, // URL to image
        }],
    author: {
        type: String,
        required: true,
    },
    tags: [{
            type: String,
            trim: true,
        }],
    category: {
        type: String,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
    featured: {
        type: Boolean,
        default: false,
    },
    publishedAt: {
        type: Date,
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
}, {
    timestamps: true,
});
// Indexes
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ title: 'text', content: 'text' });
BlogPostSchema.index({ status: 1 });
BlogPostSchema.index({ featured: 1 });
BlogPostSchema.index({ publishedAt: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ category: 1 });
// Pre-save hook to generate slug if not provided
BlogPostSchema.pre('save', function (next) {
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
// Pre-save hook to set publishedAt when status changes to published
BlogPostSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});
exports.BlogPostModel = mongoose_1.default.model('BlogPost', BlogPostSchema);
