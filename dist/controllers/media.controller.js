"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
        this.upload = (0, async_1.asyncHandler)(async (req, res) => {
            const files = req.files;
            if (files && files.length > 1) {
                const results = await this.mediaService.uploadMany(files, req.user.id, req.body);
                res.status(201).json({ success: true, data: results });
                return;
            }
            const file = files?.[0] ?? req.file;
            const media = await this.mediaService.upload(file, req.user.id, req.body);
            res.status(201).json({ success: true, data: media });
        });
        this.list = (0, async_1.asyncHandler)(async (req, res) => {
            const { folder, page = 1, limit = 50, search, tag, type, sort, favorite, unused, usage } = req.query;
            const { result, usageMap } = await this.mediaService.list(String(folder || ''), {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50,
                search: search,
                tag: tag,
                type: type,
                sort: sort,
                favorite: favorite,
                unused: unused,
                usage: usage,
            });
            res.status(200).json({ success: true, data: result.data, pagination: result, usage: usageMap });
        });
        this.listFolders = (0, async_1.asyncHandler)(async (_req, res) => {
            const folders = await this.mediaService.listFolders();
            res.json({ success: true, data: folders });
        });
        this.verifyUrl = (0, async_1.asyncHandler)(async (req, res) => {
            const url = req.body?.url;
            if (!url)
                throw new exceptions_1.BadRequestError('url is required');
            const result = await this.mediaService.verifyUrl(url);
            res.json({ success: true, data: result });
        });
        this.get = (0, async_1.asyncHandler)(async (req, res) => {
            const media = await this.mediaService.get(req.params.id, req.user?.id);
            res.json({ success: true, data: media });
        });
        this.usage = (0, async_1.asyncHandler)(async (req, res) => {
            const media = await this.mediaService.get(req.params.id, req.user?.id);
            const usage = await this.mediaService.computeUsage(this.mediaService.urlsOf(media));
            res.json({ success: true, data: usage });
        });
        this.update = (0, async_1.asyncHandler)(async (req, res) => {
            const media = await this.mediaService.update(req.params.id, req.user.id, req.body);
            res.json({ success: true, data: media });
        });
        this.fit = (0, async_1.asyncHandler)(async (req, res) => {
            const result = await this.mediaService.fit(req.params.id, req.body.ratio || {}, req.user.id);
            res.json({ success: true, data: result });
        });
        this.crop = (0, async_1.asyncHandler)(async (req, res) => {
            const result = await this.mediaService.crop(req.params.id, req.body, req.user.id);
            res.json({ success: true, data: result });
        });
        this.replace = (0, async_1.asyncHandler)(async (req, res) => {
            const files = req.files;
            const file = files?.[0] ?? req.file;
            const media = await this.mediaService.replace(req.params.id, file, req.user.id, req.body);
            res.json({ success: true, data: media });
        });
        this.restoreVersion = (0, async_1.asyncHandler)(async (req, res) => {
            const media = await this.mediaService.restoreVersion(req.params.id, req.body.versionId, req.user.id);
            res.json({ success: true, data: media });
        });
        this.replaceEverywhere = (0, async_1.asyncHandler)(async (req, res) => {
            const result = await this.mediaService.replaceEverywhere(req.params.id, req.body.newUrl, req.user.id);
            res.json({ success: true, data: result });
        });
        this.bulkDelete = (0, async_1.asyncHandler)(async (req, res) => {
            const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
            if (ids.length === 0)
                throw new exceptions_1.BadRequestError('ids array is required');
            const result = await this.mediaService.bulkDelete(ids, req.user.id, req.user.role === 'admin', Boolean(req.body?.force));
            res.json({ success: true, data: result });
        });
        this.bulkMove = (0, async_1.asyncHandler)(async (req, res) => {
            const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
            if (ids.length === 0)
                throw new exceptions_1.BadRequestError('ids array is required');
            if (!req.body?.folder)
                throw new exceptions_1.BadRequestError('folder is required');
            const result = await this.mediaService.bulkMove(ids, String(req.body.folder), req.user.id, req.user.role === 'admin');
            res.json({ success: true, data: result });
        });
        this.remove = (0, async_1.asyncHandler)(async (req, res) => {
            await this.mediaService.remove(req.params.id, req.user.id, req.user.role === 'admin', req.query.force === 'true');
            res.status(204).send();
        });
    }
}
exports.MediaController = MediaController;
