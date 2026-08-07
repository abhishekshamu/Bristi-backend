"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterController = void 0;
const async_1 = require("../middleware/async");
class NewsletterController {
    constructor(newsletterService) {
        this.newsletterService = newsletterService;
        this.subscribe = (0, async_1.asyncHandler)(async (req, res) => {
            const subscriber = await this.newsletterService.subscribe(req.body);
            res.status(201).json({
                success: true,
                data: subscriber
            });
        });
        this.unsubscribe = (0, async_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }
            const result = await this.newsletterService.unsubscribe(email);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        this.confirmSubscription = (0, async_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            const result = await this.newsletterService.confirmSubscription(token);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        this.getAllSubscribers = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const result = await this.newsletterService.getAllSubscribers(options);
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
        this.getSubscriptionStats = (0, async_1.asyncHandler)(async (req, res) => {
            const stats = await this.newsletterService.getSubscriptionStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        });
        this.getGrowthStats = (0, async_1.asyncHandler)(async (req, res) => {
            const { days = 30 } = req.query;
            const stats = await this.newsletterService.getGrowthStats(parseInt(days));
            res.status(200).json({
                success: true,
                data: stats
            });
        });
    }
}
exports.NewsletterController = NewsletterController;
