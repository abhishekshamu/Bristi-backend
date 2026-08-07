"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const exceptions_1 = require("../utils/exceptions");
const OTP_LIFETIME_MS = 5 * 60 * 1000; // 5 minute expiry
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 second resend timer
const MAX_ATTEMPTS = 5; // max verification attempts per code
class OtpService {
    constructor(otpRepo, smsService) {
        this.otpRepo = otpRepo;
        this.smsService = smsService;
    }
    async sendOtp(phone, purpose = 'login') {
        const existing = await this.otpRepo.findActive(phone, purpose);
        if (existing) {
            const elapsed = Date.now() - new Date(existing.lastSentAt).getTime();
            if (elapsed < RESEND_COOLDOWN_MS) {
                throw new exceptions_1.TooManyRequestsError(`Please wait ${Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)} seconds before requesting a new code`);
            }
        }
        const otp = this.generateOtp();
        const now = new Date();
        await this.otpRepo.saveCode({
            phone,
            otpHash: this.hashOtp(otp),
            purpose,
            lastSentAt: now,
            expiresAt: new Date(now.getTime() + OTP_LIFETIME_MS),
        });
        await this.smsService.sendOtp(phone, otp);
        return { sent: true, resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000) };
    }
    /** Verifies a code and returns true when correct; throws on wrong/expired codes. */
    async verifyOtp(phone, otp, purpose = 'login') {
        const record = await this.otpRepo.findActive(phone, purpose);
        if (!record) {
            throw new exceptions_1.BadRequestException('Code expired or not found. Please request a new code.');
        }
        if (record.attempts >= MAX_ATTEMPTS) {
            await this.otpRepo.deleteForPhone(phone, purpose);
            throw new exceptions_1.TooManyRequestsError('Too many incorrect attempts. Please request a new code.');
        }
        if (this.hashOtp(otp) !== record.otpHash) {
            await this.otpRepo.incrementAttempts(record._id);
            throw new exceptions_1.BadRequestException('Incorrect code. Please try again.');
        }
        await this.otpRepo.markConsumed(record._id);
    }
    generateOtp() {
        return String(crypto_1.default.randomInt(0, 1000000)).padStart(6, '0');
    }
    hashOtp(otp) {
        return crypto_1.default.createHash('sha256').update(otp).digest('hex');
    }
}
exports.OtpService = OtpService;
