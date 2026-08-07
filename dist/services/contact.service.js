"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const exceptions_1 = require("../utils/exceptions");
const utils_1 = require("shared/utils");
const MESSAGE_STATUSES = ['pending', 'read', 'responded', 'archived'];
class ContactService {
    constructor(contactRepo) {
        this.contactRepo = contactRepo;
    }
    async send(data) {
        if (!data.name || !data.name.trim()) {
            throw new exceptions_1.BadRequestException('Name is required');
        }
        if (!data.email) {
            throw new exceptions_1.BadRequestException('Email is required');
        }
        if (!(0, utils_1.isValidEmail)(data.email)) {
            throw new exceptions_1.BadRequestException('Invalid email address');
        }
        if (!data.subject || !data.subject.trim()) {
            throw new exceptions_1.BadRequestException('Subject is required');
        }
        if (!data.message || !data.message.trim()) {
            throw new exceptions_1.BadRequestException('Message is required');
        }
        return this.contactRepo.create({
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone?.trim(),
            subject: data.subject.trim(),
            message: data.message.trim(),
            status: 'pending',
        });
    }
    async getAllMessages(options = {}) {
        const filter = {};
        if (options.status && options.status !== 'all') {
            if (!MESSAGE_STATUSES.includes(options.status)) {
                throw new exceptions_1.BadRequestException('Invalid status');
            }
            filter.status = options.status;
        }
        return this.contactRepo.paginate(filter, {
            page: options.page ?? 1,
            limit: options.limit ?? 20,
            sort: { createdAt: -1 },
        });
    }
    async updateStatus(id, status) {
        if (!MESSAGE_STATUSES.includes(status)) {
            throw new exceptions_1.BadRequestException('Invalid status');
        }
        const message = await this.contactRepo.updateById(id, { status });
        if (!message) {
            throw new exceptions_1.NotFoundError('Message not found');
        }
        return message;
    }
    async deleteMessage(id) {
        const deleted = await this.contactRepo.deleteById(id);
        if (!deleted) {
            throw new exceptions_1.NotFoundError('Message not found');
        }
    }
    async getStats() {
        const counts = await this.contactRepo.getStatusStats();
        const stats = { total: 0 };
        for (const status of MESSAGE_STATUSES) {
            stats[status] = 0;
        }
        for (const row of counts) {
            stats[row._id] = row.count;
            stats.total += row.count;
        }
        return stats;
    }
}
exports.ContactService = ContactService;
