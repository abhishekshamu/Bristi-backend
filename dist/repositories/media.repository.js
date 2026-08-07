"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRepository = void 0;
const MediaFile_1 = require("../models/MediaFile");
const base_repository_1 = require("./base.repository");
class MediaRepository extends base_repository_1.BaseRepository {
    constructor() { super(MediaFile_1.MediaFileModel); }
    async findAccessible(id, userId) {
        return this.model.findOne({ _id: id, $or: [{ isPublic: true }, ...(userId ? [{ uploadedBy: userId }] : [])] }).exec();
    }
}
exports.MediaRepository = MediaRepository;
