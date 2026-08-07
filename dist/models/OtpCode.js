"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpCodeModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const OtpCodeSchema = new mongoose_1.Schema({
    phone: {
        type: String,
        required: true,
        index: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        enum: ['login', 'phone_verification'],
        default: 'login',
    },
    attempts: {
        type: Number,
        default: 0,
    },
    lastSentAt: {
        type: Date,
        required: true,
    },
    consumedAt: {
        type: Date,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});
// One active code per phone + purpose (verify/send rotates the record).
OtpCodeSchema.index({ phone: 1, purpose: 1 }, { unique: true });
// Auto-expire codes after their 5-minute lifetime.
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.OtpCodeModel = mongoose_1.default.model('OtpCode', OtpCodeSchema);
