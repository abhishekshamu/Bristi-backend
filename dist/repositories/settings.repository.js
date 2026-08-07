"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const Settings_1 = require("../models/Settings");
const base_repository_1 = require("./base.repository");
class SettingsRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Settings_1.SettingsModel);
    }
    async getSettings() {
        // Since we ensure only one settings document exists, we can just find one
        let settings = await this.findOne({});
        // If no settings exist, create default ones
        if (!settings) {
            settings = await this.create({});
        }
        return settings;
    }
    async updateSettings(data) {
        const settings = await this.getSettings();
        if (!settings) {
            // Create if doesn't exist
            return this.create(data);
        }
        return this.updateById(settings._id.toString(), data);
    }
    async updateBranding(branding) {
        return this.updateSettings(branding);
    }
    async updateColors(colors) {
        return this.updateSettings({ colors: { ...(await this.getSettings()).colors, ...colors } });
    }
    async updateTypography(typography) {
        const settings = await this.getSettings();
        return this.updateSettings({
            typography: { ...settings.typography, ...typography }
        });
    }
    async updateLayout(layout) {
        return this.updateSettings({
            layout: { ...(await this.getSettings()).layout, ...layout }
        });
    }
    async updateContactInfo(contactInfo) {
        return this.updateSettings({
            contactInfo: { ...(await this.getSettings()).contactInfo, ...contactInfo }
        });
    }
    async updateSocialLinks(socialLinks) {
        return this.updateSettings({ socialLinks });
    }
    async updateSEO(seo) {
        return this.updateSettings({
            seo: { ...(await this.getSettings()).seo, ...seo }
        });
    }
    async updateStoreSettings(storeSettings) {
        // currency / taxRate / freeShippingThreshold are top-level Settings
        // fields; merge with current values and persist only those three.
        return this.updateSettings({ ...storeSettings });
    }
    async incrementSetting(section, field, increment = 1) {
        const update = {};
        update[`${section}.${field}`] = increment;
        return this.updateSettings(update);
    }
}
exports.SettingsRepository = SettingsRepository;
