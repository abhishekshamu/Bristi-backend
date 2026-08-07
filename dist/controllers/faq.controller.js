"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQController = void 0;
const async_1 = require("../middleware/async");
class FAQController {
    constructor(faqService) {
        this.faqService = faqService;
        this.getFaqs = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, category } = req.query;
            const isAdmin = req.authType === 'admin';
            let result;
            if (category) {
                const data = await this.faqService.getFaqsByCategory(category);
                result = { data, total: data.length, page: 1, limit: data.length, pages: 1 };
            }
            else {
                // The public only sees active FAQs; admins get everything.
                const filter = isAdmin ? {} : { isActive: true };
                result = await this.faqService.getAllFaqs(filter, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    sort: { sortOrder: 1 }
                });
            }
            res.status(200).json({ success: true, data: result.data, pagination: { page: result.page, limit: result.limit, total: result.total, pages: result.pages } });
        });
        this.getFaqById = (0, async_1.asyncHandler)(async (req, res) => {
            const faq = await this.faqService.getFaqById(req.params.id, req.authType !== 'admin');
            if (!faq) {
                return res.status(404).json({ success: false, message: 'FAQ not found' });
            }
            res.status(200).json({ success: true, data: faq });
        });
        this.createFaq = (0, async_1.asyncHandler)(async (req, res) => {
            const faq = await this.faqService.createFaq(req.body);
            res.status(201).json({ success: true, data: faq });
        });
        this.updateFaq = (0, async_1.asyncHandler)(async (req, res) => {
            const faq = await this.faqService.updateFaq(req.params.id, req.body);
            res.status(200).json({ success: true, data: faq });
        });
        this.deleteFaq = (0, async_1.asyncHandler)(async (req, res) => {
            await this.faqService.deleteFaq(req.params.id);
            res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
        });
    }
}
exports.FAQController = FAQController;
