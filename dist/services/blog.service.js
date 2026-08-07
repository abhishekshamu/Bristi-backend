"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const exceptions_1 = require("../utils/exceptions");
const utils_1 = require("shared/utils");
const seo_1 = require("../utils/seo");
const sanitize_1 = require("../utils/sanitize");
class BlogService {
    constructor(blogRepo) {
        this.blogRepo = blogRepo;
    }
    async createBlogPost(data) {
        data = (0, seo_1.normalizeSeo)((0, seo_1.normalizeTags)(data));
        if (data.content && typeof data.content === 'string')
            data.content = (0, sanitize_1.sanitizeRichText)(data.content);
        if (!data.title) {
            throw new exceptions_1.BadRequestException('Title is required');
        }
        if (!data.slug) {
            data.slug = (0, utils_1.slugify)(data.title);
        }
        const existing = await this.blogRepo.findBySlug(data.slug);
        if (existing) {
            throw new exceptions_1.BadRequestException('Blog post with this slug already exists');
        }
        if (data.status === 'published' && !data.publishedAt) {
            data.publishedAt = new Date();
        }
        return this.blogRepo.create(data);
    }
    async getBlogPostById(id, includeNonPublished = false) {
        const post = await this.blogRepo.findById(id);
        if (!post) {
            throw new exceptions_1.NotFoundError('Blog post not found');
        }
        if (!includeNonPublished && post.status !== 'published') {
            throw new exceptions_1.NotFoundError('Blog post not found');
        }
        return post;
    }
    async getBlogPostBySlug(slug, includeNonPublished = false) {
        const post = await this.blogRepo.findBySlug(slug);
        if (!post) {
            throw new exceptions_1.NotFoundError('Blog post not found');
        }
        if (!includeNonPublished && post.status !== 'published') {
            throw new exceptions_1.NotFoundError('Blog post not found');
        }
        await this.blogRepo.incrementViewCount(post._id.toString());
        return post;
    }
    async updateBlogPost(id, updateData) {
        updateData = (0, seo_1.normalizeSeo)((0, seo_1.normalizeTags)(updateData));
        if (updateData.content && typeof updateData.content === 'string')
            updateData.content = (0, sanitize_1.sanitizeRichText)(updateData.content);
        if (updateData.title && !updateData.slug) {
            updateData.slug = (0, utils_1.slugify)(updateData.title);
        }
        if (updateData.status === 'published' && !updateData.publishedAt) {
            updateData.publishedAt = new Date();
        }
        const updated = await this.blogRepo.updateById(id, updateData);
        if (!updated) {
            throw new exceptions_1.NotFoundError('Blog post not found');
        }
        return updated;
    }
    async deleteBlogPost(id) {
        const post = await this.blogRepo.findById(id);
        if (!post) {
            throw new exceptions_1.NotFoundError('Blog post not found');
        }
        return this.blogRepo.deleteById(id);
    }
    async getAllBlogPosts(filter = {}, options = {}) {
        return this.blogRepo.paginate(filter, options);
    }
    async getPublishedBlogPosts(filter = {}, options = {}) {
        const now = new Date();
        return this.blogRepo.paginate({ status: 'published', publishedAt: { $lte: now }, ...filter }, options);
    }
    async getFeaturedPosts(limit = 5) {
        return this.blogRepo.findFeatured(limit);
    }
    async getRecentPosts(limit = 5) {
        return this.blogRepo.getRecentPosts(limit);
    }
    async searchPosts(query, options = {}) {
        return this.blogRepo.search(query, options);
    }
    async getPostsByTag(tag, options = {}) {
        return this.blogRepo.findByTag(tag, options);
    }
    async getRelatedPosts(postId, limit = 3) {
        return this.blogRepo.getRelatedPosts(postId, limit);
    }
    async getBlogStats() {
        return this.blogRepo.getBlogStats();
    }
}
exports.BlogService = BlogService;
