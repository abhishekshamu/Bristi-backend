"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Repair inventory documents created before `location` became an object.
 *
 * The `backfill-inventory-ledger` migration originally wrote inventory items
 * without a `location`, which violates the schema (`location.warehouse` is
 * required) and crashes the admin Inventory page (`item.location.warehouse`).
 *
 * This script is idempotent: items that already have a valid object location
 * are left untouched.
 *
 * Usage: npm run db:repair-inventory --workspace=backend
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_dns_1 = __importDefault(require("node:dns"));
const database_1 = require("../config/database");
const InventoryItem_1 = require("../models/InventoryItem");
dotenv_1.default.config();
const RESOLVER_SETS = [
    ['8.8.8.8', '1.1.1.1'],
    ['1.1.1.1', '8.8.8.8'],
    ['9.9.9.9', '149.112.112.112'],
    ['208.67.222.222', '208.67.220.220'],
];
async function connect() {
    const uri = await (0, database_1.getMongoUri)();
    const seen = new Set();
    const sets = [...RESOLVER_SETS, node_dns_1.default.getServers()]
        .map((set) => set.filter(Boolean))
        .filter((set) => {
        const key = set.join(',');
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
    for (const set of sets) {
        node_dns_1.default.setServers(set);
        try {
            const conn = await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 10000 });
            console.log(`Connected (dns: ${set.join(', ')}) -> ${conn.connection.host}`);
            return;
        }
        catch (error) {
            console.error(`Connection failed (dns: ${set.join(', ')}): ${error.message}`);
            await mongoose_1.default.disconnect().catch(() => undefined);
        }
    }
    throw new Error('All DNS resolver sets failed');
}
async function main() {
    await connect();
    const missing = await InventoryItem_1.InventoryItemModel.find({
        $or: [
            { location: { $exists: false } },
            { location: null },
            { location: { $type: 'string' } },
            { 'location.warehouse': { $exists: false } },
        ],
    });
    console.log(`Found ${missing.length} inventory item(s) missing a warehouse location`);
    let fixed = 0;
    for (const item of missing) {
        const location = item.location;
        const patch = { lastUpdated: new Date() };
        if (!location || typeof location !== 'object') {
            patch.location = { warehouse: 'Main' };
        }
        else {
            patch['location.warehouse'] = 'Main';
        }
        await InventoryItem_1.InventoryItemModel.updateOne({ _id: item._id }, { $set: patch });
        fixed++;
    }
    // Re-validate against the schema: ensure required fields exist for every item.
    const invalid = await InventoryItem_1.InventoryItemModel.countDocuments({
        $or: [
            { sku: { $exists: false } },
            { quantity: { $exists: false } },
            { 'location.warehouse': { $exists: false } },
        ],
    });
    console.log(`Repaired ${fixed} item(s)`);
    console.log(`Remaining invalid documents: ${invalid}`);
    await mongoose_1.default.disconnect();
    console.log('Done');
}
main().catch((error) => {
    console.error('Repair failed:', error);
    process.exit(1);
});
