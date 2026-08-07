"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPostRepository = void 0;
const BlogPost_1 = require("../models/BlogPost");
const base_repository_1 = require("./base.repository");
class BlogPostRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(BlogPost_1.BlogPostModel);
    }
    async findBySlug(slug) {
        return this.findOne({ slug });
    }
    async findPublished(options = {}) {
        return this.findMany({ status: 'published' }, options);
    }
    async findFeatured(limit = 5) {
        return this.findMany({ featured: true, status: 'published' }, { sort: { publishedAt: -1 }, limit });
    }
    async findRecent(limit = 10) {
        return this.findMany({ status: 'published' }, { sort: { publishedAt: -1 }, limit });
    }
    async findByTag(tag, options = {}) {
        return this.findMany({ tags: tag, status: 'published' }, options);
    }
    async findByCategory(category, options = {}) {
        return this.findMany({ category, status: 'published' }, options);
    }
    async search(query, options = {}) {
        const searchRegex = new RegExp(query, 'i');
        return this.findMany({
            $or: [
                { title: { $regex: searchRegex } },
                { content: { $regex: searchRegex } },
                { excerpt: { $regex: searchRegex } }
            ],
            status: 'published'
        }, options);
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
                    _id: null,
                    totalPosts: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    avgViews: { $avg: '$views' }
                }
            }
        ]).exec();
    }
    getPostsByTag(tag, options = {}) {
        return this.findMany({ tags: tag, status: 'published' }, options);
    }
    getPostsByCategory(category, options = {}) {
        return this.findMany({ category, status: 'published' }, options);
    }
    getRecentPosts(limit = 10) {
        return this.findMany({ status: 'published' }, { sort: { publishedAt: -1 }, limit });
    }
    getFeaturedPosts(limit = 5) {
        return this.findMany({ featured: true, status: 'published' }, { sort: { publishedAt: -1 }, limit });
    }
    getRelatedPosts(postId, limit = 3) {
        // This is a simplified version - in reality, you'd want to use tags or categories
        return this.findMany({ _id: { $ne: postId }, status: 'published' }, { sort: { publishedAt: -1 }, limit });
    }
}
exports.BlogPostRepository = BlogPostRepository;
