"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
/**
 * SmsService — production SMS delivery with a development fallback.
 *
 * Configure via environment:
 *   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER  (preferred)
 *   SMS_API_URL / SMS_API_KEY / SMS_SENDER                     (generic HTTP provider)
 *
 * When no provider is configured:
 *   - development: the OTP is logged to the console (so flows stay testable)
 *   - production:  sending throws so misconfiguration is visible
 */
class SmsService {
    constructor() {
        this.twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
        this.twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
        this.twilioFrom = process.env.TWILIO_FROM_NUMBER || '';
        this.genericUrl = process.env.SMS_API_URL || '';
        this.genericKey = process.env.SMS_API_KEY || '';
        this.genericSender = process.env.SMS_SENDER || 'BRISTI';
    }
    isConfigured() {
        return Boolean((this.twilioSid && this.twilioToken && this.twilioFrom) ||
            (this.genericUrl && this.genericKey));
    }
    async sendOtp(phone, otp) {
        const message = `Your BRISTI verification code is ${otp}. It expires in 5 minutes.`;
        if (this.twilioSid && this.twilioToken && this.twilioFrom) {
            await this.sendViaTwilio(phone, message);
            return;
        }
        if (this.genericUrl && this.genericKey) {
            await this.sendViaGeneric(phone, message);
            return;
        }
        if (process.env.NODE_ENV === 'production') {
            throw new Error('No SMS provider configured. Set TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER or SMS_API_URL/SMS_API_KEY.');
        }
        // Development fallback: the code is logged so the full flow is testable
        // without a provider. Never log the code in production.
        console.info(`[sms] OTP for ${phone}: ${otp}`);
    }
    async sendViaTwilio(phone, message) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}/Messages.json`;
        const auth = Buffer.from(`${this.twilioSid}:${this.twilioToken}`).toString('base64');
        const body = new URLSearchParams({ To: phone, From: this.twilioFrom, Body: message });
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            throw new Error(`SMS delivery failed (${response.status}): ${detail.slice(0, 200)}`);
        }
    }
    async sendViaGeneric(phone, message) {
        const response = await fetch(this.genericUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.genericKey}`,
            },
            body: JSON.stringify({ to: phone, from: this.genericSender, message }),
        });
        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            throw new Error(`SMS delivery failed (${response.status}): ${detail.slice(0, 200)}`);
        }
    }
}
exports.SmsService = SmsService;
