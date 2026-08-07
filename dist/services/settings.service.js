"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
class SettingsService {
    constructor(settingsRepo) {
        this.settingsRepo = settingsRepo;
    }
    // Public settings: strip any secrets so the storefront never receives credentials
    async getPublicSettings() {
        const settings = await this.settingsRepo.getSettings();
        const sanitized = settings && typeof settings.toObject === 'function'
            ? settings.toObject()
            : { ...settings };
        if (sanitized.emailSettings) {
            sanitized.emailSettings = {
                fromName: sanitized.emailSettings.fromName,
                fromEmail: sanitized.emailSettings.fromEmail,
                replyTo: sanitized.emailSettings.replyTo,
            };
        }
        if (sanitized.securitySettings) {
            sanitized.securitySettings = undefined;
        }
        return sanitized;
    }
    async getSettings() {
        return this.settingsRepo.getSettings();
    }
    async updateSettings(data) {
        return this.settingsRepo.updateSettings(data);
    }
    async updateBranding(data) {
        return this.settingsRepo.updateBranding(data);
    }
    async updateColors(data) {
        return this.settingsRepo.updateColors(data);
    }
    async updateTypography(data) {
        return this.settingsRepo.updateTypography(data);
    }
    async updateLayout(data) {
        return this.settingsRepo.updateLayout(data);
    }
    async updateContactInfo(data) {
        return this.settingsRepo.updateContactInfo(data);
    }
    async updateSocialLinks(data) {
        return this.settingsRepo.updateSocialLinks(data);
    }
    async updateSEO(data) {
        return this.settingsRepo.updateSEO(data);
    }
    async updateStoreSettings(data) {
        return this.settingsRepo.updateStoreSettings(data);
    }
    async updateContact(data) {
        return this.updateSettings({ contactInfo: { ...(await this.getSettings()).contactInfo, ...data } });
    }
}
exports.SettingsService = SettingsService;
