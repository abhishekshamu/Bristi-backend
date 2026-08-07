"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopMemoryMongo = exports.getMongoUri = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongodb_memory_server_2 = require("mongodb-memory-server");
const node_dns_1 = __importDefault(require("node:dns"));
dotenv_1.default.config();
const RESOLVER_SETS = [
    ['8.8.8.8', '1.1.1.1'],
    ['1.1.1.1', '8.8.8.8'],
    ['9.9.9.9', '149.112.112.112'],
    ['208.67.222.222', '208.67.220.220'],
];
const SYSTEM_SERVERS = node_dns_1.default.getServers();
let memMongo = null;
// An ephemeral in-memory database is a development-only convenience. In
// production it would silently discard all data on restart, so fail fast.
const refuseInMemoryInProduction = () => {
    if (process.env.NODE_ENV === 'production') {
        console.error('Refusing to start an in-memory MongoDB fallback in production. Set a valid MONGODB_URI.');
        process.exit(1);
    }
};
const startMemoryMongo = async () => {
    refuseInMemoryInProduction();
    console.log('MONGODB_URI not set — starting in-memory MongoDB (development fallback)');
    // MEMORY_REPLSET=1 starts a single-node replica set so transactional code
    // (e.g. order placement) works against the in-memory database.
    if (process.env.MEMORY_REPLSET === '1') {
        return mongodb_memory_server_2.MongoMemoryReplSet.create({ replSet: { count: 1 } });
    }
    return mongodb_memory_server_1.MongoMemoryServer.create();
};
const getMongoUri = async () => {
    const configured = process.env.MONGODB_URI?.trim();
    if (configured)
        return configured;
    // Reuse an existing in-memory instance so scripts can share the same database
    // within one process.
    if (memMongo)
        return memMongo.getUri('bristi');
    memMongo = await startMemoryMongo();
    return memMongo.getUri('bristi');
};
exports.getMongoUri = getMongoUri;
const stopMemoryMongo = async () => {
    if (memMongo) {
        await memMongo.stop();
        memMongo = null;
    }
};
exports.stopMemoryMongo = stopMemoryMongo;
async function tryConnect(resolverSet) {
    const configured = process.env.MONGODB_URI?.trim();
    if (!configured)
        return false;
    node_dns_1.default.setServers(resolverSet);
    try {
        const conn = await mongoose_1.default.connect(configured, { serverSelectionTimeoutMS: 10000 });
        console.log(`MongoDB Connected: ${conn.connection.host} (dns: ${resolverSet.join(', ')})`);
        return true;
    }
    catch (error) {
        console.error(`MongoDB (dns: ${resolverSet.join(', ')}) connection failed: ${error.message}`);
        await mongoose_1.default.disconnect().catch(() => undefined);
        return false;
    }
}
const connectDB = async () => {
    const configured = process.env.MONGODB_URI?.trim();
    if (configured) {
        const seen = new Set();
        const sets = [...RESOLVER_SETS, SYSTEM_SERVERS]
            .map((set) => set.filter(Boolean))
            .filter((set) => {
            const key = set.join(',');
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        for (const set of sets) {
            if (await tryConnect(set))
                return;
        }
        console.error('All DNS resolver sets failed — falling back to in-memory MongoDB (development fallback)...');
    }
    else {
        console.log('MONGODB_URI not set — starting in-memory MongoDB (development fallback)');
    }
    try {
        memMongo = await startMemoryMongo();
        const uri = memMongo.getUri('bristi');
        const conn = await mongoose_1.default.connect(uri);
        console.log(`MongoDB Connected (in-memory fallback): ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`In-memory MongoDB fallback failed: ${error.message}`);
        process.exit(1);
    }
};
exports.default = connectDB;
