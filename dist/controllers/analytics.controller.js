"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const async_1 = require("../middleware/async");
class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
        this.trackEvent = (0, async_1.asyncHandler)(async (req, res) => {
            const { userId: _ignored, ...safeBody } = req.body;
            const event = await this.analyticsService.createEvent({
                ...safeBody,
                sessionId: req.body.sessionId || req.headers['x-session-id'],
                url: req.body.url || req.originalUrl,
                userAgent: req.headers['user-agent'],
                // Identity comes from the authenticated principal only; a spoofed
                // body userId is never trusted.
                userId: req.user?.id
            });
            res.status(201).json({
                success: true,
                data: event
            });
        });
        this.getEventsByEventName = (0, async_1.asyncHandler)(async (req, res) => {
            const { eventName } = req.params;
            const events = await this.analyticsService.getEventsByEventName(eventName);
            res.status(200).json({
                success: true,
                data: events
            });
        });
        this.getEventsByUser = (0, async_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const events = await this.analyticsService.getEventsByUser(userId);
            res.status(200).json({
                success: true,
                data: events
            });
        });
        this.getEventsBySession = (0, async_1.asyncHandler)(async (req, res) => {
            const { sessionId } = req.params;
            const events = await this.analyticsService.getEventsBySession(sessionId);
            res.status(200).json({
                success: true,
                data: events
            });
        });
        this.getAllEvents = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 50 } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const result = await this.analyticsService.getAllEvents(options);
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
        this.getEventStats = (0, async_1.asyncHandler)(async (req, res) => {
            const { startDate, endDate } = req.query;
            const stats = await this.analyticsService.getEventStats(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            res.status(200).json({
                success: true,
                data: stats
            });
        });
        this.getPageViews = (0, async_1.asyncHandler)(async (req, res) => {
            const { startDate, endDate } = req.query;
            const views = await this.analyticsService.getPageViews(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            res.status(200).json({
                success: true,
                data: views
            });
        });
    }
}
exports.AnalyticsController = AnalyticsController;
