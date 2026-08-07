"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const async_1 = require("../middleware/async");
class CategoryController {
    constructor(categoryService) {
        this.categoryService = categoryService;
        this.getCategories = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, parentId, includeInactive } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { sortOrder: 1, name: 1 }
            };
            // Public default: active only. The admin CMS passes includeInactive=true
            // so draft/hidden categories remain manageable.
            const filter = includeInactive === 'true' ? {} : { isActive: true };
            if (parentId !== undefined) {
                if (parentId === 'null') {
                    filter.parentId = null;
                }
                else {
                    filter.parentId = parentId;
                }
            }
            const result = await this.categoryService.getCategories(filter, options);
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
        this.getCategoryById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const category = await this.categoryService.getCategoryById(id);
            res.status(200).json({
                success: true,
                data: category
            });
        });
        this.getCategoryBySlug = (0, async_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const category = await this.categoryService.getCategoryBySlug(slug);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            res.status(200).json({
                success: true,
                data: category
            });
        });
        this.getCategoryTree = (0, async_1.asyncHandler)(async (req, res) => {
            const tree = await this.categoryService.getCategoryTree();
            res.status(200).json({
                success: true,
                data: tree
            });
        });
        this.getCategoryProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { categoryId } = req.params;
            const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 }
            };
            const products = await this.categoryService.getCategoryProducts(categoryId, options);
            res.status(200).json({
                success: true,
                data: products.data,
                pagination: {
                    page: products.page,
                    limit: products.limit,
                    total: products.total,
                    pages: products.pages
                }
            });
        });
        this.createCategory = (0, async_1.asyncHandler)(async (req, res) => {
            const category = await this.categoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                data: category
            });
        });
        this.updateCategory = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const category = await this.categoryService.updateCategory(id, req.body);
            res.status(200).json({
                success: true,
                data: category
            });
        });
        this.deleteCategory = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.categoryService.deleteCategory(id);
            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        });
    }
}
exports.CategoryController = CategoryController;
