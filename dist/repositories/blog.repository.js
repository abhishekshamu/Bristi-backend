"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogRepository = void 0;
const BlogPost_1 = require("../models/BlogPost");
const base_repository_1 = require("./base.repository");
class BlogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(BlogPost_1.BlogPostModel);
    }
    async findBySlug(slug) {
        return this.findOne({ slug });
    }
    async findPublished(options = {}) {
        const now = new Date();
        return this.findMany({
            status: 'published',
            publishedAt: { $lte: now }
        }, options);
    }
    async findFeatured(limit = 5) {
        const now = new Date();
        return this.findMany({
            featured: true,
            status: 'published',
            publishedAt: { $lte: now }
        }, { sort: { publishedAt: -1 }, limit });
    }
    async findByTag(tag, options = {}) {
        return this.findMany({
            tags: tag,
            status: 'published'
        }, options);
    }
    async findByCategory(category, options = {}) {
        return this.findMany({ category, status: 'published' }, options);
    }
    async search(query, options = {}) {
        // Use the title/content text index instead of a collection scan regex.
        const escaped = String(query)
            .replace(/"/g, ' ')
            .trim()
            .slice(0, 100);
        if (!escaped)
            return [];
        return this.findMany({
            $text: { $search: escaped },
            status: 'published'
        }, { score: { $meta: 'textScore' }, ...options });
    }
    async getRecentPosts(limit = 5) {
        const now = new Date();
        return this.findMany({
            status: 'published',
            publishedAt: { $lte: now }
        }, { sort: { publishedAt: -1 }, limit });
    }
    async getRelatedPosts(postId, limit = 3) {
        const post = await this.findById(postId);
        if (!post)
            return [];
        const tags = post.tags || [];
        if (tags.length === 0)
            return [];
        return this.findMany({
            _id: { $ne: postId },
            tags: { $in: tags },
            status: 'published'
        }, { limit });
    }
    async incrementViewCount(postId) {
        return this.updateById(postId, {
            $inc: { views: 1 }
        });
    }
    async getBlogStats() {
        return this.model.aggregate([
            {
                $match: { status: 'published' }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$views' }
                }
            }
        ]).exec();
    }
}
exports.BlogRepository = BlogRepository;
