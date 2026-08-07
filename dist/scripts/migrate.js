"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_dns_1 = __importDefault(require("node:dns"));
const database_1 = require("../config/database");
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const Collection_1 = require("../models/Collection");
const InventoryItem_1 = require("../models/InventoryItem");
const Notification_1 = require("../models/Notification");
const constants_1 = require("shared/constants");
dotenv_1.default.config();
const DEFAULT_SUBTITLES = {
    'oversized-t-shirts': 'Relaxed silhouettes crafted for everyday luxury.',
    'japanese-trouser': 'Architectural tailoring with modern proportions.',
    'gurkha-pant': 'Classic military heritage reimagined for modern wardrobes.',
    shackets: 'Versatile layers designed for every season.',
};
// Legacy marketing slugs → the independent product flags that replaced them.
const MARKETING_SLUG_TO_FLAG = {
    'new-arrival': 'isNewArrival',
    'best-seller': 'isBestSeller',
    trending: 'isTrending',
    sale: 'isOnSale',
    featured: 'isFeatured',
    recommended: 'isRecommended',
    exclusive: 'isExclusive',
    'limited-edition': 'isLimitedEdition',
    'editor-choice': 'isEditorsPick',
    'luxury-collection': 'isPremiumCollection',
};
const migrations = [
    {
        name: 'backfill-category-product-counts',
        description: 'Compute and persist productCount for every category',
        up: async () => {
            const categories = await Category_1.CategoryModel.find({});
            for (const category of categories) {
                const count = await Product_1.ProductModel.countDocuments({ category: category._id, status: 'active' });
                await Category_1.CategoryModel.updateOne({ _id: category._id }, { $set: { productCount: count } });
            }
        },
    },
    {
        name: 'backfill-category-subtitles-and-counts',
        description: 'Add premium subtitles and persist up-to-date productCount for every category',
        up: async () => {
            const categories = await Category_1.CategoryModel.find({});
            for (const category of categories) {
                const subtitle = category.subtitle || DEFAULT_SUBTITLES[category.slug];
                const count = await Product_1.ProductModel.countDocuments({ category: category._id, status: 'active' });
                const update = { productCount: count };
                if (subtitle)
                    update.subtitle = subtitle;
                await Category_1.CategoryModel.updateOne({ _id: category._id }, { $set: update });
            }
        },
    },
    {
        name: 'backfill-inventory-ledger',
        description: 'Create inventory items for existing products with base stock',
        up: async () => {
            const products = await Product_1.ProductModel.find({});
            for (const product of products) {
                const totalStock = product.variants && product.variants.length > 0
                    ? product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
                    : product.stock;
                await InventoryItem_1.InventoryItemModel.updateOne({ productId: product._id }, {
                    $set: {
                        productId: product._id,
                        name: product.name,
                        sku: product.sku,
                        quantity: totalStock,
                        lowStockThreshold: product.lowStockThreshold ?? 5,
                        trackQuantity: product.trackQuantity ?? true,
                        location: { warehouse: 'Main' },
                        lastUpdated: new Date(),
                    },
                }, { upsert: true });
            }
        },
    },
    {
        name: 'backfill-collection-products',
        description: 'Populate Collection.products arrays from product collection references',
        up: async () => {
            const products = await Product_1.ProductModel.find({ collection: { $exists: true, $ne: null } });
            const byCollection = {};
            for (const product of products) {
                const key = String(product.collection);
                byCollection[key] = byCollection[key] || [];
                byCollection[key].push(String(product._id));
            }
            for (const [collectionId, productIds] of Object.entries(byCollection)) {
                await Collection_1.CollectionModel.updateOne({ _id: collectionId }, { $addToSet: { products: { $each: productIds } } });
            }
        },
    },
    {
        name: 'seed-marketing-collections',
        description: 'Backfill marketing flags from legacy collection assignments + heuristics (collections are never created for marketing sections)',
        up: async () => {
            const now = new Date();
            const products = await Product_1.ProductModel.find({ status: 'active' });
            let updated = 0;
            for (const product of products) {
                const flags = {
                    isNewArrival: false,
                    isBestSeller: false,
                    isTrending: false,
                    isOnSale: false,
                    isFeatured: false,
                    isRecommended: false,
                    isExclusive: false,
                    isLimitedEdition: false,
                    isEditorsPick: false,
                    isPremiumCollection: false,
                };
                const slugs = new Set((product.collections ?? []).map((s) => s.trim()).filter(Boolean));
                for (const [slug, field] of Object.entries(MARKETING_SLUG_TO_FLAG)) {
                    if (slugs.has(slug))
                        flags[field] = true;
                }
                // Heuristic backfill so an existing catalog fills the sections once
                if (product.createdAt && (now.getTime() - new Date(product.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 45)
                    flags.isNewArrival = true;
                if (product.compareAtPrice && product.compareAtPrice > product.price)
                    flags.isOnSale = true;
                if (product.rating && product.rating.count > 0)
                    flags.isBestSeller = true;
                if (product.rating && product.rating.average >= 4.5)
                    flags.isTrending = true;
                if (product.featured)
                    flags.isFeatured = true;
                await Product_1.ProductModel.updateOne({ _id: product._id }, { $set: flags });
                updated++;
            }
            console.log(`  Backfilled marketing flags on ${updated} product(s).`);
        },
    },
    {
        name: 'flags-from-marketing-collections',
        description: 'Backfill independent marketing flags (isNewArrival, isBestSeller, ...) from existing collection assignments + heuristics',
        up: async () => {
            const now = new Date();
            const products = await Product_1.ProductModel.find({ status: 'active' });
            let updated = 0;
            for (const product of products) {
                const flags = {
                    isNewArrival: false,
                    isBestSeller: false,
                    isTrending: false,
                    isOnSale: false,
                    isFeatured: false,
                    isRecommended: false,
                    isExclusive: false,
                    isLimitedEdition: false,
                    isEditorsPick: false,
                    isPremiumCollection: false,
                };
                // 1. Existing marketing collection memberships map straight to flags.
                const slugs = new Set((product.collections ?? []).map((s) => s.trim()).filter(Boolean));
                if (slugs.has('new-arrival'))
                    flags.isNewArrival = true;
                if (slugs.has('best-seller'))
                    flags.isBestSeller = true;
                if (slugs.has('trending'))
                    flags.isTrending = true;
                if (slugs.has('sale'))
                    flags.isOnSale = true;
                if (slugs.has('featured'))
                    flags.isFeatured = true;
                if (slugs.has('recommended'))
                    flags.isRecommended = true;
                if (slugs.has('exclusive'))
                    flags.isExclusive = true;
                if (slugs.has('limited-edition'))
                    flags.isLimitedEdition = true;
                if (slugs.has('editor-choice'))
                    flags.isEditorsPick = true;
                if (slugs.has('luxury-collection'))
                    flags.isPremiumCollection = true;
                // 2. Heuristics for anything the collections did not already cover.
                if (!flags.isNewArrival && product.createdAt && (now.getTime() - new Date(product.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 45)
                    flags.isNewArrival = true;
                if (!flags.isOnSale && product.compareAtPrice && product.compareAtPrice > product.price)
                    flags.isOnSale = true;
                if (!flags.isBestSeller && product.rating && product.rating.count > 0)
                    flags.isBestSeller = true;
                if (!flags.isTrending && product.rating && product.rating.average >= 4.5)
                    flags.isTrending = true;
                if (!flags.isFeatured && product.featured)
                    flags.isFeatured = true;
                await Product_1.ProductModel.updateOne({ _id: product._id }, { $set: flags });
                updated++;
            }
            console.log(`  Backfilled marketing flags on ${updated} product(s).`);
        },
    },
    {
        name: 'remove-marketing-collections',
        description: 'Remove the duplicate marketing-collection system — preserve flags, delete fake collection docs, strip fake slugs from products',
        up: async () => {
            // 1. Defensive: any product still carrying a fake marketing slug gets the
            //    corresponding flag set before the slug is removed. Flags never lose data.
            const flagged = await Product_1.ProductModel.find({ collections: { $in: constants_1.MARKETING_COLLECTION_SLUGS } });
            let preserved = 0;
            for (const product of flagged) {
                const flags = {};
                for (const slug of product.collections ?? []) {
                    const field = MARKETING_SLUG_TO_FLAG[slug];
                    if (field)
                        flags[field] = true;
                }
                if (Object.keys(flags).length > 0) {
                    await Product_1.ProductModel.updateOne({ _id: product._id }, { $set: flags });
                    preserved++;
                }
            }
            // 2. Strip the fake slugs from every product's collections array.
            const pull = await Product_1.ProductModel.updateMany({ collections: { $in: constants_1.MARKETING_COLLECTION_SLUGS } }, { $pullAll: { collections: constants_1.MARKETING_COLLECTION_SLUGS } });
            // 3. Delete the fake Collection documents entirely.
            const removed = await Collection_1.CollectionModel.deleteMany({ slug: { $in: constants_1.MARKETING_COLLECTION_SLUGS } });
            console.log(`  Flags preserved on ${preserved} product(s); stripped fake slugs from ${pull.modifiedCount} product(s); deleted ${removed.deletedCount} marketing collection doc(s).`);
        },
    },
    {
        name: 'sync-collection-membership-to-products',
        description: 'Sync Collection.products (ObjectId arrays) into product.collections slug arrays for real merchandising collections',
        up: async () => {
            const collections = await Collection_1.CollectionModel.find({ slug: { $nin: constants_1.MARKETING_COLLECTION_SLUGS } });
            let updated = 0;
            for (const collection of collections) {
                const ids = collection.products ?? [];
                if (!ids.length)
                    continue;
                const result = await Product_1.ProductModel.updateMany({ _id: { $in: ids } }, { $addToSet: { collections: collection.slug } });
                updated += result.modifiedCount;
                console.log(`  Synced ${result.modifiedCount} product(s) into collection: ${collection.slug}`);
            }
            console.log(`  Synced ${updated} product/collection assignment(s) total.`);
        },
    },
    {
        name: 'purge-expired-notifications',
        description: 'Remove expired notifications',
        up: async () => {
            const result = await Notification_1.NotificationModel.deleteMany({ expiresAt: { $lt: new Date() } });
            console.log(`  Purged ${result.deletedCount} expired notification(s).`);
        },
    },
];
async function run() {
    const configured = process.env.MONGODB_URI?.trim();
    if (configured) {
        // Connect with the same DNS resolver fallback chain as the app server.
        const resolverSets = [
            ['8.8.8.8', '1.1.1.1'],
            ['1.1.1.1', '8.8.8.8'],
            ['9.9.9.9', '149.112.112.112'],
            ['208.67.222.222', '208.67.220.220'],
            node_dns_1.default.getServers(),
        ];
        let connected = false;
        for (const set of resolverSets) {
            if (!set.length)
                continue;
            node_dns_1.default.setServers(set);
            try {
                await mongoose_1.default.connect(configured, { serverSelectionTimeoutMS: 10000 });
                console.log(`Connected to database. (dns: ${set.join(', ')})`);
                connected = true;
                break;
            }
            catch (error) {
                console.error(`Connection (dns: ${set.join(', ')}) failed: ${error.message}`);
                await mongoose_1.default.disconnect().catch(() => undefined);
            }
        }
        if (!connected)
            throw new Error('Could not connect to MongoDB with any DNS resolver set');
    }
    else {
        await mongoose_1.default.connect(await (0, database_1.getMongoUri)());
        console.log('Connected to database (in-memory fallback).');
    }
    console.log('Connected to database.');
    const applied = new Set((await mongoose_1.default.connection.db.collection('_migrations').find({}).toArray()).map((r) => r.name));
    for (const migration of migrations) {
        if (applied.has(migration.name)) {
            console.log(`  SKIP ${migration.name} (already applied)`);
            continue;
        }
        console.log(`  RUN  ${migration.name} — ${migration.description}`);
        try {
            await migration.up();
            await mongoose_1.default.connection.db.collection('_migrations').insertOne({
                name: migration.name,
                appliedAt: new Date(),
            });
            console.log(`  DONE ${migration.name}`);
        }
        catch (err) {
            console.error(`  FAIL ${migration.name}:`, err);
            process.exitCode = 1;
            break;
        }
    }
    console.log('Migrations complete.');
    await mongoose_1.default.disconnect();
}
run()
    .catch((err) => {
    console.error(err);
    process.exitCode = 1;
})
    .finally(async () => {
    if (global.__MEMORY_MONGO__) {
        await (0, database_1.stopMemoryMongo)();
    }
});
