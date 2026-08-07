"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRepository = void 0;
const OtpCode_1 = require("../models/OtpCode");
const base_repository_1 = require("./base.repository");
class OtpRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(OtpCode_1.OtpCodeModel);
    }
    async findActive(phone, purpose) {
        return this.findOne({ phone, purpose, consumedAt: { $exists: false }, expiresAt: { $gt: new Date() } });
    }
    async saveCode(data) {
        // Upsert so there is exactly one live code per phone + purpose.
        return this.model.findOneAndUpdate({ phone: data.phone, purpose: data.purpose }, { $set: { ...data, attempts: 0 }, $unset: { consumedAt: '' } }, { upsert: true, new: true });
    }
    async incrementAttempts(id) {
        return this.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { new: true });
    }
    async markConsumed(id) {
        await this.model.updateOne({ _id: id }, { $set: { consumedAt: new Date() } });
    }
    async deleteForPhone(phone, purpose) {
        await this.model.deleteMany({ phone, purpose });
    }
}
exports.OtpRepository = OtpRepository;
