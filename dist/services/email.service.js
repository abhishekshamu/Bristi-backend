"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.from = process.env.EMAIL_FROM || 'BRISTI <no-reply@bristi.com>';
        this.transporter = process.env.SMTP_HOST
            ? nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT || 587),
                secure: process.env.SMTP_SECURE === 'true',
                auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
            })
            : null;
    }
    async sendPasswordResetEmail(email, resetToken) {
        await this.send(email, 'Reset your BRISTI password', `${this.frontendUrl}/reset-password/${resetToken}`);
    }
    async sendEmailVerificationEmail(email, verificationToken) {
        await this.send(email, 'Verify your BRISTI email', `${this.frontendUrl}/verify-email/${verificationToken}`);
    }
    async sendOrderConfirmation(email, order) {
        if (!order)
            return;
        const lines = Array.isArray(order.items)
            ? order.items.map((item) => `• ${item.quantity} × ${item.productName || item.name || 'Item'}`).join('\n')
            : '';
        const subject = `Order confirmed — ${order.orderNumber || ''}`.trim();
        const content = `Thank you for your BRISTI order.\n\nOrder number: ${order.orderNumber}\nTotal: $${order.total ?? 0}\n\n${lines}\n\nWe'll notify you as soon as your pieces ship.`;
        await this.send(email, subject, content);
    }
    async sendWelcomeEmail(email, name) {
        await this.send(email, 'Welcome to BRISTI', `Welcome${name ? `, ${name}` : ''}! Thank you for joining the BRISTI maison.`);
    }
    async sendNotificationEmail(email, subject, message) {
        await this.send(email, subject, message);
    }
    get frontendUrl() { return process.env.FRONTEND_URL || 'http://localhost:3000'; }
    async send(to, subject, content) {
        if (!this.transporter) {
            if (process.env.NODE_ENV === 'production')
                throw new Error('SMTP_HOST must be configured to send email');
            console.info(`Email delivery disabled in development: ${subject} -> ${to}`);
            return;
        }
        await this.transporter.sendMail({ from: this.from, to, subject, text: content, html: `<p>${content}</p>` });
    }
}
exports.EmailService = EmailService;
