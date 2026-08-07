"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQService = void 0;
class FAQService {
    constructor(faqRepo) {
        this.faqRepo = faqRepo;
    }
    async getAllFaqs(filter = {}, options = {}) {
        return this.faqRepo.paginate(filter, options);
    }
    async getFaqById(id, activeOnly = true) {
        const faq = await this.faqRepo.findById(id);
        if (!faq)
            return null;
        if (activeOnly && faq.isActive === false)
            return null;
        return faq;
    }
    async getFaqsByCategory(category) {
        // Storefront-facing: only serve active FAQs.
        return this.faqRepo.findMany({ category, isActive: true }, { sort: { sortOrder: 1 } });
    }
    async createFaq(data) {
        return this.faqRepo.create(data);
    }
    async updateFaq(id, data) {
        return this.faqRepo.updateById(id, data);
    }
    async deleteFaq(id) {
        return this.faqRepo.deleteById(id);
    }
}
exports.FAQService = FAQService;
