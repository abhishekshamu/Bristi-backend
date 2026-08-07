"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRepository = void 0;
const Session_1 = require("../models/Session");
const base_repository_1 = require("./base.repository");
const crypto_1 = __importDefault(require("crypto"));
class SessionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Session_1.SessionModel);
    }
    static hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    async createSession(data) {
        return this.create({ ...data, lastActiveAt: new Date() });
    }
    async touchByHash(tokenHash) {
        await this.model.updateOne({ tokenHash, revokedAt: { $exists: false } }, { $set: { lastActiveAt: new Date() } });
    }
    async revokeByHash(tokenHash) {
        await this.model.updateOne({ tokenHash, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    }
    async revokeAllForUser(userId) {
        await this.model.updateMany({ userId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    }
    async countActiveForUser(userId) {
        return this.count({ userId, revokedAt: { $exists: false } });
    }
    async countActive() {
        return this.count({ revokedAt: { $exists: false } });
    }
}
exports.SessionRepository = SessionRepository;
