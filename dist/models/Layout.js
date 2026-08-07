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
exports.LayoutModel = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const LayoutSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    thumbnail: {
        type: String, // URL to thumbnail image
    },
    sections: [{
            id: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            props: {
                type: mongoose_1.Schema.Types.Mixed, // JSON object for section props
                default: {},
            },
        }],
    isActive: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes
LayoutSchema.index({ slug: 1 });
LayoutSchema.index({ name: 1 });
LayoutSchema.index({ isActive: 1 });
// Pre-save hook to generate slug if not provided
LayoutSchema.pre('save', function (next) {
    if (!this.isModified('name'))
        return next();
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});
// Ensure only one active layout
LayoutSchema.pre('save', async function (next) {
    if (this.isActive) {
        // Deactivate all other layouts
        await this.constructor.updateMany({ _id: { $ne: this._id }, isActive: true }, { $set: { isActive: false } });
    }
    next();
});
LayoutSchema.post('save', function () {
    // If this is the first layout being created and it's not active, make it active
    if (!this.isActive) {
        this.constructor.countDocuments().then(count => {
            if (count === 1) {
                this.isActive = true;
                this.save();
            }
        });
    }
});
exports.LayoutModel = mongoose_1.default.model('Layout', LayoutSchema);
