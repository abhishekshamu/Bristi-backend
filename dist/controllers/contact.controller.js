"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const async_1 = require("../middleware/async");
class ContactController {
    constructor(contactService) {
        this.contactService = contactService;
        this.send = (0, async_1.asyncHandler)(async (req, res) => {
            const message = await this.contactService.send(req.body);
            res.status(201).json({
                success: true,
                data: message
            });
        });
        this.getAllMessages = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, status } = req.query;
            const result = await this.contactService.getAllMessages({
                page: parseInt(page),
                limit: parseInt(limit),
                status: status
            });
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        });
        this.updateStatus = (0, async_1.asyncHandler)(async (req, res) => {
            const message = await this.contactService.updateStatus(req.params.id, req.body.status);
            res.status(200).json({
                success: true,
                data: message
            });
        });
        this.deleteMessage = (0, async_1.asyncHandler)(async (req, res) => {
            await this.contactService.deleteMessage(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Message deleted successfully'
            });
        });
        this.getStats = (0, async_1.asyncHandler)(async (req, res) => {
            const stats = await this.contactService.getStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        });
    }
}
exports.ContactController = ContactController;
