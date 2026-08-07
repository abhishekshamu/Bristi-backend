"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRepository = void 0;
const Collection_1 = require("../models/Collection");
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class CollectionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Collection_1.CollectionModel);
    }
    async findBySlug(slug) {
        return this.findOne({ slug });
    }
    async findActive(options = {}) {
        return this.findMany({ isActive: true }, options);
    }
    async findFeatured(limit = 10) {
        const now = new Date();
        return this.findMany({
            featured: true,
            isActive: true,
            $or: [
                { featuredUntil: { $exists: false } },
                { featuredUntil: { $gt: now } }
            ]
        }, { sort: { featuredUntil: -1 }, limit });
    }
    async findCurrent(options = {}) {
        const now = new Date();
        return this.findMany({
            isActive: true,
            $and: [
                { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }
            ]
        }, options);
    }
    async getCollectionWithProducts(collectionId) {
        return this.model.aggregate([
            { $match: { _id: new mongoose_1.Types.ObjectId(collectionId) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products',
                    foreignField: '_id',
                    as: 'products'
                }
            },
            { $unwind: { path: '$products', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'productcategories', // Assuming we have a junction table or direct reference
                    localField: 'products._id',
                    foreignField: 'category',
                    as: 'productCategories'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    slug: { $first: '$slug' },
                    description: { $first: '$description' },
                    image: { $first: '$image' },
                    bannerImage: { $first: '$bannerImage' },
                    video: { $first: '$video' },
                    products: { $push: '$products' },
                    featured: { $first: '$featured' },
                    featuredUntil: { $first: '$featuredUntil' },
                    startDate: { $first: '$startDate' },
                    endDate: { $first: '$endDate' },
                    isActive: { $first: '$isActive' },
                    seo: { $first: '$seo' }
                }
            }
        ]).exec();
    }
}
exports.CollectionRepository = CollectionRepository;
