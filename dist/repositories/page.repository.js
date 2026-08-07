"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRepository = void 0;
const Page_1 = require("../models/Page");
const base_repository_1 = require("./base.repository");
class PageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Page_1.PageModel);
    }
    async findBySlug(slug) {
        return this.findOne({ slug });
    }
    async findBySlugAndStatus(slug, status) {
        return this.findOne({ slug, status });
    }
    async findForMenu(options = {}) {
        return this.findMany({ isInMenu: true, status: 'published' }, { sort: { menuOrder: 1, title: 1 }, ...options });
    }
    async findPublished(options = {}) {
        return this.findMany({ status: 'published' }, options);
    }
    async getPageWithContent(pageId) {
        return this.findById(pageId);
    }
    async getPageBySlugWithContent(slug) {
        return this.findOne({ slug });
    }
    async updatePageContent(pageId, content) {
        return this.updateById(pageId, { content });
    }
    async toggleMenuStatus(pageId) {
        const page = await this.findById(pageId);
        if (!page)
            return null;
        return this.updateById(pageId, {
            isInMenu: !page.isInMenu
        });
    }
    async updateMenuOrder(pageId, order) {
        return this.updateById(pageId, { menuOrder: order });
    }
    async getPagesByStatus(status, options = {}) {
        return this.findMany({ status }, options);
    }
    async getPageCountByStatus() {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).exec();
    }
}
exports.PageRepository = PageRepository;
