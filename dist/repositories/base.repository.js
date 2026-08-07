"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
function stripUndefined(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined)
            continue;
        cleaned[key] = value;
    }
    return cleaned;
}
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data, session) {
        const doc = new this.model(data);
        return (await doc.save({ session }));
    }
    async findById(id, session) {
        return (await this.model.findById(id).session(session ?? null).exec());
    }
    async findOne(filter, session) {
        return (await this.model.findOne(stripUndefined(filter)).session(session ?? null).exec());
    }
    async findMany(filter = {}, options = {}, session) {
        return (await this.model.find(stripUndefined(filter), {}, { ...options, session }).exec());
    }
    async updateById(id, data, session) {
        return (await this.model.findByIdAndUpdate(id, data, { new: true }).session(session ?? null).exec());
    }
    async findByIdAndUpdate(id, data, options = { new: true }, session) {
        return (await this.model.findByIdAndUpdate(id, data, options).session(session ?? null).exec());
    }
    async updateOne(filter, data, session) {
        return (await this.model.findOneAndUpdate(filter, data, { new: true }).session(session ?? null).exec());
    }
    async updateMany(filter, data, session) {
        return this.model.updateMany(filter, data).session(session ?? null).exec();
    }
    async deleteById(id, session) {
        const result = await this.model.deleteOne({ _id: id }).session(session ?? null);
        return result.deletedCount > 0;
    }
    async deleteOne(filter, session) {
        const result = await this.model.deleteOne(filter).session(session ?? null);
        return result.deletedCount > 0;
    }
    async deleteMany(filter, session) {
        const result = await this.model.deleteMany(filter).session(session ?? null);
        return result.deletedCount > 0;
    }
    async findOneAndUpdate(filter, data, options = { new: true }, session) {
        return (await this.model.findOneAndUpdate(filter, data, options).session(session ?? null).exec());
    }
    async count(filter = {}) {
        return this.model.countDocuments(stripUndefined(filter));
    }
    async paginate(filterRaw = {}, options = {}) {
        const filter = stripUndefined(filterRaw);
        // Clamp page/limit to sane ranges (negative or zero values would produce
        // invalid skip/limit values downstream).
        const page = Math.max(1, Number(options.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
        const skip = (page - 1) * limit;
        const sort = options.sort || { createdAt: -1 };
        let query = this.model.find(filter);
        if (options.populate) {
            if (Array.isArray(options.populate)) {
                for (const path of options.populate) {
                    query = query.populate(path);
                }
            }
            else {
                query = query.populate(options.populate);
            }
        }
        const [data, total] = await Promise.all([
            query.skip(skip).limit(limit).sort(sort).exec(),
            this.model.countDocuments(filter)
        ]);
        const pages = Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            limit,
            pages
        };
    }
    async exists(filter) {
        return Boolean(await this.model.exists(filter));
    }
    async aggregate(pipeline) {
        return this.model.aggregate(pipeline).exec();
    }
}
exports.BaseRepository = BaseRepository;
