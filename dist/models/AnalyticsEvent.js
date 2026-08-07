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
exports.AnalyticsEventModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const AnalyticsEventSchema = new mongoose_1.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    sessionId: {
        type: String,
        required: true,
    },
    properties: {
        type: mongoose_1.Schema.Types.Mixed, // Flexible storage for event properties
        default: {},
    },
    url: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
    },
    referrer: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    deviceType: {
        type: String,
        enum: ['desktop', 'tablet', 'mobile'],
    },
    browser: {
        type: String,
    },
    os: {
        type: String,
    },
    screenResolution: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Indexes
AnalyticsEventSchema.index({ eventName: 1 });
AnalyticsEventSchema.index({ userId: 1 });
AnalyticsEventSchema.index({ sessionId: 1 });
AnalyticsEventSchema.index({ createdAt: -1 });
AnalyticsEventSchema.index({ timestamp: -1 });
AnalyticsEventSchema.index({ url: 1 });
AnalyticsEventSchema.index({ eventName: 1, createdAt: -1 }); // For time-series queries
AnalyticsEventSchema.index({ ipAddress: 1 });
AnalyticsEventSchema.index({ country: 1 });
// Index for TTL to automatically delete old analytics data (optional)
// AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 days
exports.AnalyticsEventModel = mongoose_1.default.model('AnalyticsEvent', AnalyticsEventSchema);
