"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const Category_1 = require("../models/Category");
const base_repository_1 = require("./base.repository");
class CategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Category_1.CategoryModel);
    }
    async findBySlug(slug) {
        return this.findOne({ slug });
    }
    async findActive(options = {}) {
        return this.findMany({ isActive: true }, options);
    }
    async findByParent(parentId, options = {}) {
        const filter = { isActive: true };
        if (parentId === null) {
            filter.parentId = null;
        }
        else {
            filter.parentId = parentId;
        }
        return this.findMany(filter, options);
    }
    async getCategoryTree() {
        // This would typically be done with an aggregation pipeline
        // For simplicity, we'll return flat list and let the client build the tree
        return this.findMany({ isActive: true }, { sort: { sortOrder: 1, name: 1 } });
    }
    async getDescendants(categoryId) {
        // Find all descendant category IDs
        const descendants = [];
        const findChildren = async (parentId) => {
            const children = await this.findMany({ parentId }, {});
            for (const child of children) {
                descendants.push(child._id.toString());
                await findChildren(child._id.toString());
            }
        };
        await findChildren(categoryId);
        return descendants;
    }
    async incrementProductCount(categoryId) {
        // In a real implementation, this would be handled by transactions or triggers
        // For now, we'll just return the category as-is
        return this.findById(categoryId);
    }
}
exports.CategoryRepository = CategoryRepository;
