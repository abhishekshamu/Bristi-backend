"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const async_1 = require("../middleware/async");
class BlogController {
    constructor(blogService) {
        this.blogService = blogService;
        this.createBlogPost = (0, async_1.asyncHandler)(async (req, res) => {
            const post = await this.blogService.createBlogPost(req.body);
            res.status(201).json({
                success: true,
                data: post
            });
        });
        this.getBlogPosts = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, status, featured } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const filter = {};
            if (status)
                filter.status = status;
            if (featured === 'true')
                filter.featured = true;
            const result = await this.blogService.getAllBlogPosts(filter, options);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        });
        this.getPublishedBlogPosts = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, featured } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { publishedAt: -1 }
            };
            const filter = { status: 'published' };
            if (featured === 'true')
                filter.featured = true;
            const result = await this.blogService.getPublishedBlogPosts(filter, options);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        });
        this.getBlogPostById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const post = await this.blogService.getBlogPostById(id, req.authType === 'admin');
            res.status(200).json({
                success: true,
                data: post
            });
        });
        this.getBlogPostBySlug = (0, async_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const post = await this.blogService.getBlogPostBySlug(slug, req.authType === 'admin');
            res.status(200).json({
                success: true,
                data: post
            });
        });
        this.getFeaturedPosts = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 5 } = req.query;
            const posts = await this.blogService.getFeaturedPosts(parseInt(limit));
            res.status(200).json({
                success: true,
                data: posts
            });
        });
        this.getRecentPosts = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 5 } = req.query;
            const posts = await this.blogService.getRecentPosts(parseInt(limit));
            res.status(200).json({
                success: true,
                data: posts
            });
        });
        this.searchPosts = (0, async_1.asyncHandler)(async (req, res) => {
            const { q: query, page = 1, limit = 10 } = req.query;
            if (!query) {
                return res.status(400).json({ success: false, message: 'Search query is required' });
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const posts = await this.blogService.searchPosts(query, options);
            res.status(200).json({
                success: true,
                data: posts
            });
        });
        this.getPostsByTag = (0, async_1.asyncHandler)(async (req, res) => {
            const { tag } = req.params;
            const posts = await this.blogService.getPostsByTag(tag);
            res.status(200).json({
                success: true,
                data: posts
            });
        });
        this.getRelatedPosts = (0, async_1.asyncHandler)(async (req, res) => {
            const { postId } = req.params;
            const { limit = 3 } = req.query;
            const posts = await this.blogService.getRelatedPosts(postId, parseInt(limit));
            res.status(200).json({
                success: true,
                data: posts
            });
        });
        this.updateBlogPost = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const post = await this.blogService.updateBlogPost(id, req.body);
            res.status(200).json({
                success: true,
                data: post
            });
        });
        this.deleteBlogPost = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.blogService.deleteBlogPost(id);
            res.status(200).json({
                success: true,
                message: 'Blog post deleted successfully'
            });
        });
        this.getBlogStats = (0, async_1.asyncHandler)(async (req, res) => {
            const stats = await this.blogService.getBlogStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        });
    }
}
exports.BlogController = BlogController;
