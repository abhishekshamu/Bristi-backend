"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageController = void 0;
const async_1 = require("../middleware/async");
class PageController {
    constructor(pageService) {
        this.pageService = pageService;
        this.createPage = (0, async_1.asyncHandler)(async (req, res) => {
            const page = await this.pageService.createPage({
                ...req.body,
                createdBy: req.user?._id ?? req.user?.id,
            });
            res.status(201).json({
                success: true,
                data: page
            });
        });
        this.getPages = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, status } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            const filter = {};
            // Public listing only exposes published pages; an explicit `status=all`
            // (admin) opts into every status.
            if (status && status !== 'all')
                filter.status = status;
            else if (!status)
                filter.status = 'published';
            const result = await this.pageService.getAllPages(filter, options);
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
        this.getPageById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const page = await this.pageService.getPageById(id);
            // Unpublished pages are only visible to authenticated admins; everyone
            // else gets a 404 so drafts are never leaked.
            if (page.status !== 'published' && req.authType !== 'admin') {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
            res.status(200).json({
                success: true,
                data: page
            });
        });
        this.getPageBySlug = (0, async_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const page = await this.pageService.getPageBySlug(slug);
            res.status(200).json({
                success: true,
                data: page
            });
        });
        this.getPublishedPageBySlug = (0, async_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const page = await this.pageService.getPageBySlugAndStatus(slug, 'published');
            res.status(200).json({
                success: true,
                data: page
            });
        });
        this.updatePage = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const page = await this.pageService.updatePage(id, {
                ...req.body,
                updatedBy: req.user?._id ?? req.user?.id,
            });
            res.status(200).json({
                success: true,
                data: page
            });
        });
        this.deletePage = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.pageService.deletePage(id);
            res.status(200).json({
                success: true,
                message: 'Page deleted successfully'
            });
        });
        this.getMenuPages = (0, async_1.asyncHandler)(async (req, res) => {
            const pages = await this.pageService.getMenuPages();
            res.status(200).json({
                success: true,
                data: pages
            });
        });
        this.updateBuilder = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const page = await this.pageService.updateBuilder(id, req.body.sections);
            res.status(200).json({
                success: true,
                data: page
            });
        });
    }
}
exports.PageController = PageController;
