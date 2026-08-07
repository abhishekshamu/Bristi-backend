"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const exceptions_1 = require("../utils/exceptions");
const utils_1 = require("shared/utils");
class NewsletterService {
    constructor(newsletterRepo, emailService) {
        this.newsletterRepo = newsletterRepo;
        this.emailService = emailService;
    }
    async subscribe(data) {
        if (!data.email) {
            throw new exceptions_1.BadRequestException('Email is required');
        }
        if (!(0, utils_1.isValidEmail)(data.email)) {
            throw new exceptions_1.BadRequestException('Invalid email address');
        }
        const subscriber = await this.newsletterRepo.subscribe({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            source: data.source || 'homepage',
            isActive: true,
            subscribedAt: new Date()
        });
        if (subscriber.doubleOptIn && !subscriber.confirmationToken) {
            const confirmationToken = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            await this.newsletterRepo.updateById(subscriber._id.toString(), {
                confirmationToken,
                confirmationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            await this.emailService.sendNotificationEmail(subscriber.email, 'Confirm your subscription', `Please confirm your subscription by clicking here: /newsletter/confirm/${confirmationToken}`);
        }
        return subscriber;
    }
    async unsubscribe(email) {
        if (!email) {
            throw new exceptions_1.BadRequestException('Email is required');
        }
        const subscriber = await this.newsletterRepo.unsubscribe(email);
        if (!subscriber) {
            throw new exceptions_1.NotFoundError('Subscriber not found');
        }
        return subscriber;
    }
    async confirmSubscription(token) {
        const subscriber = await this.newsletterRepo.findOne({ confirmationToken: token });
        if (!subscriber) {
            throw new exceptions_1.BadRequestException('Invalid or expired confirmation token');
        }
        if (subscriber.confirmationExpires && subscriber.confirmationExpires < new Date()) {
            throw new exceptions_1.BadRequestException('Confirmation token has expired');
        }
        await this.newsletterRepo.updateById(subscriber._id.toString(), {
            confirmationToken: undefined,
            confirmationExpires: undefined
        });
        return { message: 'Subscription confirmed successfully' };
    }
    async getAllSubscribers(options = {}) {
        return this.newsletterRepo.paginate({}, options);
    }
    async getActiveSubscribers(options = {}) {
        return this.newsletterRepo.findActive(options);
    }
    async getSubscriptionStats() {
        return this.newsletterRepo.getSubscriptionStats();
    }
    async getGrowthStats(days = 30) {
        return this.newsletterRepo.getGrowthStats(days);
    }
}
exports.NewsletterService = NewsletterService;
