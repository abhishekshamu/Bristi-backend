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
exports.ThemeModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const ThemeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isDark: {
        type: Boolean,
        default: false,
    },
    colors: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    typography: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    buttons: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    header: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    footer: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    effects: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});
// Indexes
ThemeSchema.index({ name: 1 });
ThemeSchema.index({ isActive: 1 });
// Ensure only one active theme
ThemeSchema.pre('save', async function (next) {
    if (this.isActive) {
        // Deactivate all other themes
        await this.constructor.updateMany({ _id: { $ne: this._id }, isActive: true }, { $set: { isActive: false } });
    }
    next();
});
ThemeSchema.post('save', function () {
    // If this is the first theme being created and it's not active, make it active
    if (!this.isActive) {
        this.constructor.countDocuments().then(count => {
            if (count === 1) {
                this.isActive = true;
                this.save();
            }
        });
    }
});
exports.ThemeModel = mongoose_1.default.model('Theme', ThemeSchema);
