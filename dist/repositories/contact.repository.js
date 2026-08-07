"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRepository = void 0;
const ContactMessage_1 = require("../models/ContactMessage");
const base_repository_1 = require("./base.repository");
class ContactRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(ContactMessage_1.ContactMessageModel);
    }
    async getStatusStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).exec();
    }
}
exports.ContactRepository = ContactRepository;
