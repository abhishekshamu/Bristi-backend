"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroService = void 0;
const HeroBlock_1 = require("../models/HeroBlock");
const heroBus_1 = require("../events/heroBus");
const exceptions_1 = require("../utils/exceptions");
function slideIsLive(slide, now) {
    if (!slide)
        return false;
    if (slide.status !== 'published' || slide.isActive === false)
        return false;
    if (slide.scheduledStart && new Date(slide.scheduledStart) > now)
        return false;
    if (slide.scheduledEnd && new Date(slide.scheduledEnd) < now)
        return false;
    return true;
}
function normalizeBlock(doc) {
    const now = new Date();
    if (Array.isArray(doc.slides) && doc.slides.length > 0) {
        const slides = doc.slides.filter((s) => slideIsLive(s, now));
        return { ...doc, slides };
    }
    if (Array.isArray(doc.panels) && doc.panels.length > 0) {
        const slides = doc.panels
            .filter((p) => p.status === 'published' && p.isActive !== false)
            .flatMap((p) => (p.slides ?? []))
            .filter((s) => slideIsLive(s, now));
        return { ...doc, slides };
    }
    const legacy = doc;
    const slide = {
        image: legacy.image,
        imageMobile: legacy.imageMobile,
        video: legacy.video,
        videoMobile: legacy.videoMobile,
        eyebrow: legacy.badge,
        heading: legacy.title,
        headingColor: legacy.textColor ?? '#FFFFFF',
        showEyebrow: false,
        showCta: false,
        ctaText: legacy.primaryButton?.label,
        ctaLinkType: legacy.primaryButton?.linkType ?? 'custom',
        ctaLink: legacy.primaryButton?.link,
        description: legacy.description,
        secondaryButtonText: legacy.secondaryButton?.label,
        secondaryButtonLink: legacy.secondaryButton?.link,
        status: legacy.status ?? 'published',
        isActive: legacy.isActive ?? true,
        altText: legacy.altText,
    };
    return {
        ...doc,
        slides: slideIsLive(slide, now) ? [slide] : [],
    };
}
class HeroService {
    async getActiveBlocks() {
        const now = new Date();
        const docs = await HeroBlock_1.HeroBlockModel.find({
            status: 'published',
            isActive: true,
            $or: [{ scheduledStart: { $exists: false } }, { scheduledStart: { $lte: now } }],
            $and: [
                {
                    $or: [{ scheduledEnd: { $exists: false } }, { scheduledEnd: { $gte: now } }],
                },
            ],
        })
            .sort({ priority: 1, createdAt: 1 })
            .lean();
        return docs
            .map(normalizeBlock)
            .filter((block) => block.slides.length > 0);
    }
    async getAllBlocks(filter = {}) {
        return HeroBlock_1.HeroBlockModel.find(filter).sort({ priority: 1, createdAt: -1 }).exec();
    }
    async getBlockById(id) {
        const block = await HeroBlock_1.HeroBlockModel.findById(id).exec();
        if (!block)
            throw new exceptions_1.NotFoundError('Hero block not found');
        return block;
    }
    async createBlock(data) {
        const maxPriority = await HeroBlock_1.HeroBlockModel.findOne().sort({ priority: -1 }).select('priority').lean().exec();
        const block = await HeroBlock_1.HeroBlockModel.create({ ...data, priority: data.priority ?? (maxPriority ? maxPriority.priority + 1 : 0) });
        heroBus_1.heroBus.emit(heroBus_1.HERO_CHANGED);
        return block;
    }
    async updateBlock(id, data) {
        const updated = await HeroBlock_1.HeroBlockModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!updated)
            throw new exceptions_1.NotFoundError('Hero block not found');
        heroBus_1.heroBus.emit(heroBus_1.HERO_CHANGED);
        return updated;
    }
    async deleteBlock(id) {
        const deleted = await HeroBlock_1.HeroBlockModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new exceptions_1.NotFoundError('Hero block not found');
        heroBus_1.heroBus.emit(heroBus_1.HERO_CHANGED);
    }
    async duplicateBlock(id) {
        const source = await this.getBlockById(id);
        const maxPriority = await HeroBlock_1.HeroBlockModel.findOne().sort({ priority: -1 }).select('priority').lean().exec();
        const doc = source.toObject();
        delete doc._id;
        delete doc.__v;
        doc.name = `${doc.name ?? doc.title ?? 'Hero set'} (Copy)`;
        doc.priority = maxPriority ? maxPriority.priority + 1 : 0;
        doc.status = 'draft';
        const block = await HeroBlock_1.HeroBlockModel.create(doc);
        heroBus_1.heroBus.emit(heroBus_1.HERO_CHANGED);
        return block;
    }
    async reorderBlocks(orderedIds) {
        for (let index = 0; index < orderedIds.length; index += 1) {
            await HeroBlock_1.HeroBlockModel.findByIdAndUpdate(orderedIds[index], { priority: index }).exec();
        }
        heroBus_1.heroBus.emit(heroBus_1.HERO_CHANGED);
    }
}
exports.HeroService = HeroService;
