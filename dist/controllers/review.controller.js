"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
        this.createReview = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId, rating, title, comment, images } = req.body;
            const userId = req.user?.id;
            if (!userId || !productId || !rating || !comment) {
                throw new exceptions_1.ValidationError('Please provide productId, rating, title, and comment');
            }
            const review = await this.reviewService.createReview({
                productId,
                userId,
                rating,
                title,
                comment,
                images
            });
            res.status(201).json({
                success: true,
                data: review
            });
        });
        this.getProductReviews = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const reviews = await this.reviewService.getProductReviews(productId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });
            res.status(200).json({
                success: true,
                data: reviews
            });
        });
        this.getFeaturedReviews = (0, async_1.asyncHandler)(async (req, res) => {
            const { limit = 6 } = req.query;
            const reviews = await this.reviewService.getFeaturedReviews(parseInt(limit));
            res.status(200).json({
                success: true,
                data: reviews
            });
        });
        this.updateReview = (0, async_1.asyncHandler)(async (req, res) => {
            const { reviewId } = req.params;
            const reviewData = req.body;
            const updatedReview = await this.reviewService.updateReview(reviewId, reviewData, {
                userId: req.user?.id,
                authType: req.authType,
                role: req.user?.role
            });
            res.status(200).json({
                success: true,
                data: updatedReview
            });
        });
        this.deleteReview = (0, async_1.asyncHandler)(async (req, res) => {
            const { reviewId } = req.params;
            const deleted = await this.reviewService.deleteReview(reviewId, {
                userId: req.user?.id,
                authType: req.authType,
                role: req.user?.role
            });
            res.status(200).json({
                success: true,
                data: deleted
            });
        });
        this.listReviews = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, status } = req.query;
            const result = await this.reviewService.listReviews({
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                status
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
        this.updateReviewStatus = (0, async_1.asyncHandler)(async (req, res) => {
            const { reviewId } = req.params;
            const { status } = req.body;
            if (!status) {
                throw new exceptions_1.ValidationError('Please provide a status');
            }
            const review = await this.reviewService.updateReviewStatus(reviewId, status);
            res.status(200).json({
                success: true,
                data: review
            });
        });
    }
}
exports.ReviewController = ReviewController;
