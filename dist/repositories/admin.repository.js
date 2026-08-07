"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const Admin_1 = require("../models/Admin");
const base_repository_1 = require("./base.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AdminRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Admin_1.AdminModel);
    }
    async findByEmail(email) {
        if (typeof email !== 'string' || !email.trim())
            return null;
        return this.findOne({ email: email.toLowerCase().trim() });
    }
    async findByCredentials(email) {
        if (typeof email !== 'string' || !email.trim())
            return null;
        return this.model.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
    }
    async findByIdWithPassword(id) {
        return this.model.findById(id).select('+password').exec();
    }
    async updateLastLogin(id) {
        return this.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true });
    }
    async updatePassword(id, newPassword) {
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        return this.updateById(id, { password: hashedPassword });
    }
    async findByRole(role, options = {}) {
        return this.findMany({ role, isActive: true }, options);
    }
    async getAdminStats() {
        return this.model.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
    }
}
exports.AdminRepository = AdminRepository;
