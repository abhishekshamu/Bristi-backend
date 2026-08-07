"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageService = void 0;
const exceptions_1 = require("../utils/exceptions");
const utils_1 = require("shared/utils");
const seo_1 = require("../utils/seo");
const sanitize_1 = require("../utils/sanitize");
class PageService {
    constructor(pageRepo) {
        this.pageRepo = pageRepo;
    }
    async createPage(data) {
        data = (0, seo_1.normalizeSeo)(data);
        if (data.content && typeof data.content === 'string')
            data.content = (0, sanitize_1.sanitizeRichText)(data.content);
        if (!data.title) {
            throw new exceptions_1.BadRequestException('Title is required');
        }
        if (!data.slug) {
            data.slug = (0, utils_1.slugify)(data.title);
        }
        const existing = await this.pageRepo.findBySlug(data.slug);
        if (existing) {
            throw new exceptions_1.BadRequestException('Page with this slug already exists');
        }
        return this.pageRepo.create(data);
    }
    async getPageById(id) {
        const page = await this.pageRepo.findById(id);
        if (!page) {
            throw new exceptions_1.NotFoundError('Page not found');
        }
        return page;
    }
    async getPageBySlug(slug) {
        const page = await this.pageRepo.findBySlug(slug);
        if (!page) {
            throw new exceptions_1.NotFoundError('Page not found');
        }
        return page;
    }
    async getPageBySlugAndStatus(slug, status) {
        const page = await this.pageRepo.findBySlugAndStatus(slug, status);
        if (!page) {
            throw new exceptions_1.NotFoundError('Page not found');
        }
        return page;
    }
    async updatePage(id, updateData) {
        updateData = (0, seo_1.normalizeSeo)(updateData);
        if (updateData.content && typeof updateData.content === 'string')
            updateData.content = (0, sanitize_1.sanitizeRichText)(updateData.content);
        if (updateData.title && !updateData.slug) {
            updateData.slug = (0, utils_1.slugify)(updateData.title);
        }
        const updated = await this.pageRepo.updateById(id, updateData);
        if (!updated) {
            throw new exceptions_1.NotFoundError('Page not found');
        }
        return updated;
    }
    async deletePage(id) {
        const page = await this.pageRepo.findById(id);
        if (!page) {
            throw new exceptions_1.NotFoundError('Page not found');
        }
        return this.pageRepo.deleteById(id);
    }
    async getAllPages(filter = {}, options = {}) {
        return this.pageRepo.paginate(filter, options);
    }
    async getPublishedPages(options = {}) {
        return this.pageRepo.findPublished(options);
    }
    async getMenuPages() {
        return this.pageRepo.findForMenu();
    }
    async getPagesByStatus(status, options = {}) {
        return this.pageRepo.getPagesByStatus(status, options);
    }
    async updateBuilder(id, sections) {
        const updated = await this.pageRepo.updateById(id, { builderSections: sections });
        if (!updated) {
            throw new exceptions_1.NotFoundError('Page not found');
        }
        return updated;
    }
}
exports.PageService = PageService;
