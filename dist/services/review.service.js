"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const order_repository_1 = require("../repositories/order.repository");
const notification_service_1 = require("./notification.service");
const notification_repository_1 = require("../repositories/notification.repository");
const admin_notifier_1 = require("./admin-notifier");
const exceptions_1 = require("../utils/exceptions");
const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];
// Fields a customer may set on their own review (moderator-only fields like
// `status`, `verifiedPurchase` and `helpfulVotes` are excluded).
const CUSTOMER_UPDATABLE = ['rating', 'title', 'comment', 'images'];
// Order statuses that count as a verified purchase.
const PURCHASED_STATUSES = ['delivered', 'completed'];
class ReviewService {
    constructor(reviewRepo, productRepo, userRepo, orderRepo = new order_repository_1.OrderRepository(), notificationService = new notification_service_1.NotificationService(new notification_repository_1.NotificationRepository())) {
        this.reviewRepo = reviewRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.notificationService = notificationService;
    }
    async hasPurchasedProduct(userId, productId) {
        try {
            return await this.orderRepo.exists({
                userId,
                'items.productId': productId,
                status: { $in: PURCHASED_STATUSES }
            });
        }
        catch {
            return false;
        }
    }
    async createReview(reviewData) {
        const { productId, userId, rating, comment } = reviewData;
        if (!productId || !userId || !rating || !comment) {
            throw new exceptions_1.BadRequestException('Please provide productId, userId, rating, and comment');
        }
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        const existingReview = await this.reviewRepo.findByProductAndUser(productId, userId);
        if (existingReview) {
            throw new exceptions_1.BadRequestException('You have already reviewed this product');
        }
        const review = await this.reviewRepo.create({
            ...reviewData,
            userName: `${user.firstName} ${user.lastName}`,
            // Only a delivered/completed order for this product proves a purchase.
            verifiedPurchase: await this.hasPurchasedProduct(userId, productId),
            status: 'pending'
        });
        // Notify admins of a pending review requiring moderation
        await (0, admin_notifier_1.notifyAdmins)(this.notificationService, {
            title: 'New Product Review',
            message: `${user.firstName} ${user.lastName} left a ${rating}-star review on "${product.name}" (pending moderation).`,
            type: 'info',
            relatedId: review._id,
            relatedType: 'Review',
        });
        return review;
    }
    async getProductReviews(productId, options = {}) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        return this.reviewRepo.findByProductId(productId, options);
    }
    async getFeaturedReviews(limit = 6) {
        return this.reviewRepo.findMany({ status: 'approved', rating: { $gte: 4 } }, { sort: { helpfulVotes: -1, createdAt: -1 }, limit });
    }
    /** Customer-facing update: ownership enforced, fields whitelisted. */
    async updateReview(reviewId, updateData, actor = {}) {
        const review = await this.reviewRepo.findById(reviewId);
        if (!review) {
            throw new exceptions_1.NotFoundException('Review not found');
        }
        const isAdmin = actor.authType === 'admin';
        if (!isAdmin) {
            if (String(review.userId) !== String(actor.userId)) {
                throw new exceptions_1.ForbiddenError('You can only edit your own review');
            }
        }
        const allowed = isAdmin ? [...CUSTOMER_UPDATABLE, 'status'] : CUSTOMER_UPDATABLE;
        const update = {};
        for (const key of allowed) {
            if (updateData[key] !== undefined)
                update[key] = updateData[key];
        }
        if (isAdmin && update.status !== undefined) {
            if (!REVIEW_STATUSES.includes(String(update.status))) {
                throw new exceptions_1.BadRequestException('Invalid review status');
            }
        }
        const updated = await this.reviewRepo.updateById(reviewId, update);
        if (!updated) {
            throw new exceptions_1.NotFoundException('Review not found');
        }
        // Rating counters go stale when a rating/status changes.
        await this.recomputeProductRating(String(review.productId));
        return updated;
    }
    async deleteReview(reviewId, actor = {}) {
        const review = await this.reviewRepo.findById(reviewId);
        if (!review) {
            throw new exceptions_1.NotFoundException('Review not found');
        }
        const isAdmin = actor.authType === 'admin';
        if (!isAdmin && String(review.userId) !== String(actor.userId)) {
            throw new exceptions_1.ForbiddenError('You can only delete your own review');
        }
        const productId = String(review.productId);
        const deleted = await this.reviewRepo.deleteById(reviewId);
        if (deleted) {
            await this.recomputeProductRating(productId);
        }
        return deleted;
    }
    /** Admin moderation list with optional status filter + pagination. */
    async listReviews(options = {}) {
        const { status, ...paginateOptions } = options;
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        return this.reviewRepo.paginate(filter, paginateOptions);
    }
    /** Admin moderation: approve / reject / restore a review. */
    async updateReviewStatus(reviewId, status) {
        if (!REVIEW_STATUSES.includes(status)) {
            throw new exceptions_1.BadRequestException('Invalid review status');
        }
        const review = await this.reviewRepo.findById(reviewId);
        if (!review) {
            throw new exceptions_1.NotFoundException('Review not found');
        }
        const updated = await this.reviewRepo.updateById(reviewId, { status });
        if (updated) {
            await this.recomputeProductRating(String(review.productId));
        }
        return updated;
    }
    async recomputeProductRating(productId) {
        try {
            const stats = await this.reviewRepo.getApprovedRatingStats(productId);
            await this.productRepo.updateById(productId, { rating: stats });
        }
        catch {
            // rating refresh is best-effort; never fail the review operation on it
        }
    }
}
exports.ReviewService = ReviewService;
