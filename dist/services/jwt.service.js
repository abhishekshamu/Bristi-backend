"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const devEphemeralSecret = (label) => {
    const secret = (0, crypto_1.randomBytes)(48).toString('hex');
    console.warn(`[jwt] ${label} not configured: using an ephemeral random secret. Sessions will be invalidated on restart (development only).`);
    return secret;
};
class JwtService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : devEphemeralSecret('JWT_SECRET'));
        this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'production' ? '' : devEphemeralSecret('JWT_REFRESH_SECRET'));
        this.jwtExpiry = process.env.JWT_EXPIRE || '15m';
        this.jwtRefreshExpiry = process.env.JWT_REFRESH_EXPIRE || '30d';
        if (!this.jwtSecret || !this.jwtRefreshSecret) {
            throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured in production');
        }
    }
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, this.jwtSecret, { expiresIn: this.jwtExpiry });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({ id: user._id, jti: (0, crypto_1.randomUUID)() }, this.jwtRefreshSecret, { expiresIn: this.jwtRefreshExpiry });
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (error) {
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtRefreshSecret);
        }
        catch (error) {
            return null;
        }
    }
}
exports.JwtService = JwtService;
exports.default = JwtService;
