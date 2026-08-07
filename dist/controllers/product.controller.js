"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
class ProductController {
    constructor(productService) {
        this.productService = productService;
        this.createProduct = (0, async_1.asyncHandler)(async (req, res) => {
            const product = await this.productService.createProduct(req.body);
            res.status(201).json({
                success: true,
                data: product
            });
        });
        this.getProductById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const product = await this.productService.getProductById(id);
            // Non-active products (draft/archived) are only visible to admins.
            if (product.status !== 'active' && req.authType !== 'admin') {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            res.status(200).json({
                success: true,
                data: product
            });
        });
        this.getProductBySlug = (0, async_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const product = await this.productService.getProductBySlug(slug);
            if (product.status !== 'active' && req.authType !== 'admin') {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            res.status(200).json({
                success: true,
                data: product
            });
        });
        this.updateProduct = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const product = await this.productService.updateProduct(id, req.body);
            res.status(200).json({
                success: true,
                data: product
            });
        });
        this.deleteProduct = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.productService.deleteProduct(id);
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
        });
        this.getProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', ...filters } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 }
            };
            const result = await this.productService.getProducts({
                ...filters,
                ...options
            });
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
        this.getFeaturedProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 10 } = req.query;
            const products = await this.productService.getFeaturedProducts(parseInt(limit));
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getNewArrivals = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 10 } = req.query;
            const products = await this.productService.getNewArrivals(parseInt(limit));
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getOnSaleProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 10 } = req.query;
            const products = await this.productService.getOnSaleProducts(parseInt(limit));
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getBestSellers = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 10 } = req.query;
            const products = await this.productService.getBestSellers(parseInt(limit));
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getTrendingProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 10 } = req.query;
            const products = await this.productService.getTrendingProducts(parseInt(limit));
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.searchProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { q } = req.query;
            if (!q) {
                throw new exceptions_1.ValidationError('Please provide search query');
            }
            const { page = 1, limit = 20 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const products = await this.productService.searchProducts(q, options);
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getProductsByCategory = (0, async_1.asyncHandler)(async (req, res) => {
            const { categoryId } = req.params;
            const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 }
            };
            const products = await this.productService.getProductsByCategory(categoryId, options);
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getProductsByCollection = (0, async_1.asyncHandler)(async (req, res) => {
            const { collectionId } = req.params;
            const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 }
            };
            const products = await this.productService.getProductsByCollection(collectionId, options);
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getProductReviews = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const reviews = await this.productService.getProductReviews(productId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });
            res.status(200).json({
                success: true,
                data: reviews
            });
        });
        this.getRelatedProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const { limit = 4 } = req.query;
            const products = await this.productService.getRelatedProducts(productId, parseInt(limit));
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.getByIds = (0, async_1.asyncHandler)(async (req, res) => {
            const { ids } = req.query;
            const idList = typeof ids === 'string'
                ? ids.split(',').map((id) => id.trim()).filter(Boolean)
                : [];
            const products = await this.productService.getByIds(idList);
            res.status(200).json({
                success: true,
                data: products
            });
        });
        this.addProductReview = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const review = await this.productService.addProductReview(productId, req.user?.id, req.body);
            res.status(201).json({
                success: true,
                data: review
            });
        });
        this.updateProductStock = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const { quantity } = req.body;
            if (quantity === undefined) {
                throw new exceptions_1.ValidationError('Please provide quantity');
            }
            const product = await this.productService.updateProductStock(productId, parseInt(quantity));
            res.status(200).json({
                success: true,
                data: product
            });
        });
    }
}
exports.ProductController = ProductController;
