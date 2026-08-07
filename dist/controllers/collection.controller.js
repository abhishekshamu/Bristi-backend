"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionController = void 0;
const async_1 = require("../middleware/async");
class CollectionController {
    constructor(collectionService) {
        this.collectionService = collectionService;
        this.getCollections = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, featured, includeInactive } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };
            // Public default: active only. The admin CMS passes includeInactive=true
            // so draft/hidden collections remain manageable.
            const filter = includeInactive === 'true' ? {} : { isActive: true };
            if (featured !== undefined) {
                filter.featured = featured === 'true';
            }
            const result = await this.collectionService.getCollections(filter, options);
            const data = await this.collectionService.attachProductCounts(result.data);
            res.status(200).json({
                success: true,
                data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        });
        this.getCollectionById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const collection = await this.collectionService.getCollectionById(id);
            res.status(200).json({
                success: true,
                data: collection
            });
        });
        this.getCollectionBySlug = (0, async_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const collection = await this.collectionService.getCollectionBySlug(slug);
            if (!collection) {
                return res.status(404).json({ success: false, message: 'Collection not found' });
            }
            res.status(200).json({
                success: true,
                data: collection
            });
        });
        this.getCollectionProducts = (0, async_1.asyncHandler)(async (req, res) => {
            const { collectionId } = req.params;
            const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 }
            };
            // Accepts either a Mongo id or a collection slug; products are matched
            // through the collections array (OR semantics).
            const products = await this.collectionService.getCollectionProducts(collectionId, options);
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
        this.getCollectionProductsBySlug = (0, async_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 }
            };
            const products = await this.collectionService.getCollectionProducts(slug, options);
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
        this.getFeaturedCollections = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 10 } = req.query;
            const collections = await this.collectionService.getFeaturedCollections(parseInt(limit));
            res.status(200).json({
                success: true,
                data: collections
            });
        });
        this.getCurrentCollections = (0, async_1.asyncHandler)(async (req, res) => {
            const collections = await this.collectionService.getCurrentCollections();
            res.status(200).json({
                success: true,
                data: collections
            });
        });
        this.createCollection = (0, async_1.asyncHandler)(async (req, res) => {
            const collection = await this.collectionService.createCollection(req.body);
            res.status(201).json({
                success: true,
                data: collection
            });
        });
        this.updateCollection = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const collection = await this.collectionService.updateCollection(id, req.body);
            res.status(200).json({
                success: true,
                data: collection
            });
        });
        this.deleteCollection = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const deleted = await this.collectionService.deleteCollection(id);
            res.status(200).json({
                success: true,
                data: deleted
            });
        });
    }
}
exports.CollectionController = CollectionController;
