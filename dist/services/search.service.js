"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
class SearchService {
    constructor(productRepo, categoryRepo, collectionRepo, blogRepo, pageRepo, orderRepo, userRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.collectionRepo = collectionRepo;
        this.blogRepo = blogRepo;
        this.pageRepo = pageRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
    }
    async globalSearch(query, options = {}) {
        const q = query.trim();
        if (!q) {
            return { products: [], categories: [], collections: [], blogPosts: [], pages: [], orders: [], users: [] };
        }
        const limit = options.limit ?? 5;
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const [products, categories, collections, blogPosts, pages, orders, users] = await Promise.all([
            this.productRepo.search(q, { limit }),
            this.categoryRepo.findMany({ $or: [{ name: regex }, { description: regex }], isActive: true }, { limit }),
            this.collectionRepo.findMany({ $or: [{ name: regex }, { description: regex }], isActive: true }, { limit }),
            this.blogRepo.search(q, { limit }),
            this.pageRepo.findMany({ $or: [{ title: regex }, { content: regex }] }, { limit }),
            options.includeAdmin
                ? this.orderRepo.findMany({ $or: [{ orderNumber: regex }, { 'shippingAddress.name': regex }] }, { limit })
                : Promise.resolve([]),
            options.includeAdmin
                ? this.userRepo.findMany({ $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] }, { limit })
                : Promise.resolve([]),
        ]);
        return { products, categories, collections, blogPosts, pages, orders, users };
    }
}
exports.SearchService = SearchService;
