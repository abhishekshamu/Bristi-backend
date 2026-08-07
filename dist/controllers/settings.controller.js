"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const async_1 = require("../middleware/async");
class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
        this.getSettings = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.getPublicSettings();
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateSettings = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateSettings(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateBranding = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateBranding(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateColors = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateColors(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateTypography = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateTypography(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateLayout = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateLayout(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateContactInfo = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateContactInfo(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateSocialLinks = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateSocialLinks(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateSEO = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateSEO(req.body);
            res.status(200).json({
                success: true,
                data: settings
            });
        });
        this.updateStoreSettings = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateStoreSettings(req.body);
            res.status(200).json({ success: true, data: settings });
        });
        this.updateNavbar = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateSettings({ navbar: req.body });
            res.status(200).json({ success: true, data: settings });
        });
        this.updateFooter = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateSettings({ footer: req.body });
            res.status(200).json({ success: true, data: settings });
        });
        this.updateHomepage = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateSettings({ homepageSections: req.body });
            res.status(200).json({ success: true, data: settings });
        });
        this.getHomepage = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.getSettings();
            res.status(200).json({ success: true, data: settings.homepageSections || [] });
        });
        this.updateAnnouncement = (0, async_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.updateSettings({ announcement: req.body });
            res.status(200).json({ success: true, data: settings.announcement });
        });
    }
}
exports.SettingsController = SettingsController;
