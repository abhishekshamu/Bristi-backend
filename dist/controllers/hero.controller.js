"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
const mongoose_1 = require("mongoose");
const heroBus_1 = require("../events/heroBus");
class HeroController {
    constructor(heroService) {
        this.heroService = heroService;
        this.getActiveBlocks = (0, async_1.asyncHandler)(async (_req, res) => {
            const blocks = await this.heroService.getActiveBlocks();
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.status(200).json({ success: true, data: blocks });
        });
        this.streamEvents = (0, async_1.asyncHandler)(async (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no',
            });
            res.write(`retry: 30000\n\n`);
            const onChanged = () => {
                res.write(`data: ${JSON.stringify({ type: 'changed', ts: Date.now() })}\n\n`);
            };
            const heartbeat = setInterval(() => {
                res.write(`: hb ${Date.now()}\n\n`);
            }, 25000);
            heroBus_1.heroBus.on(heroBus_1.HERO_CHANGED, onChanged);
            req.on('close', () => {
                clearInterval(heartbeat);
                heroBus_1.heroBus.off(heroBus_1.HERO_CHANGED, onChanged);
            });
        });
        this.getAllBlocks = (0, async_1.asyncHandler)(async (req, res) => {
            const { status, isActive, search } = req.query;
            const filter = {};
            if (status === 'draft' || status === 'published')
                filter.status = status;
            if (isActive === 'true' || isActive === 'false')
                filter.isActive = isActive === 'true';
            if (search && typeof search === 'string') {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { subtitle: { $regex: search, $options: 'i' } },
                    { seoLabel: { $regex: search, $options: 'i' } },
                ];
            }
            const blocks = await this.heroService.getAllBlocks(filter);
            res.status(200).json({ success: true, data: blocks });
        });
        this.getBlockById = (0, async_1.asyncHandler)(async (req, res) => {
            const block = await this.heroService.getBlockById(req.params.id);
            res.status(200).json({ success: true, data: block });
        });
        this.createBlock = (0, async_1.asyncHandler)(async (req, res) => {
            const block = await this.heroService.createBlock(req.body);
            res.status(201).json({ success: true, data: block });
        });
        this.updateBlock = (0, async_1.asyncHandler)(async (req, res) => {
            const block = await this.heroService.updateBlock(req.params.id, req.body);
            res.status(200).json({ success: true, data: block });
        });
        this.deleteBlock = (0, async_1.asyncHandler)(async (req, res) => {
            await this.heroService.deleteBlock(req.params.id);
            res.status(200).json({ success: true, message: 'Hero block deleted' });
        });
        this.duplicateBlock = (0, async_1.asyncHandler)(async (req, res) => {
            const block = await this.heroService.duplicateBlock(req.params.id);
            res.status(201).json({ success: true, data: block });
        });
        this.reorderBlocks = (0, async_1.asyncHandler)(async (req, res) => {
            const { orderedIds } = req.body ?? {};
            if (!Array.isArray(orderedIds) || orderedIds.some((id) => !mongoose_1.Types.ObjectId.isValid(id))) {
                throw new exceptions_1.ValidationError('orderedIds must be an array of valid IDs');
            }
            await this.heroService.reorderBlocks(orderedIds);
            res.status(200).json({ success: true, message: 'Order updated' });
        });
    }
}
exports.HeroController = HeroController;
