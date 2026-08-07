"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const AuthToken_1 = require("../models/AuthToken");
const base_repository_1 = require("./base.repository");
const crypto_1 = __importDefault(require("crypto"));
class AuthRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(AuthToken_1.AuthTokenModel);
    }
    async createRefreshToken(userId, token, expiresAt, ownerType = 'user') {
        return this.create({
            userId,
            ownerType,
            tokenHash: this.hashToken(token),
            type: 'refresh',
            expiresAt
        });
    }
    async findRefreshToken(token) {
        return this.findOne({ tokenHash: this.hashToken(token), type: 'refresh', expiresAt: { $gt: new Date() } });
    }
    async deleteRefreshToken(token) {
        const result = await this.model.deleteOne({ tokenHash: this.hashToken(token), type: 'refresh' });
        return result.deletedCount > 0;
    }
    async deleteUserTokens(userId) {
        await this.model.deleteMany({ userId });
    }
    async deleteOwnerTokens(userId, ownerType = 'user') {
        await this.model.deleteMany({ userId, ownerType });
    }
    async deleteExpiredTokens() {
        await this.model.deleteMany({ expiresAt: { $lt: new Date() } });
    }
    hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
}
exports.AuthRepository = AuthRepository;
