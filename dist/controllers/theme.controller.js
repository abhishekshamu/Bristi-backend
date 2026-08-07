"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeController = void 0;
const async_1 = require("../middleware/async");
class ThemeController {
    constructor(themeService) {
        this.themeService = themeService;
        this.getActiveTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const theme = await this.themeService.getActiveTheme();
            res.status(200).json({
                success: true,
                data: theme
            });
        });
        this.getAllThemes = (0, async_1.asyncHandler)(async (req, res) => {
            const themes = await this.themeService.getAllThemes();
            res.status(200).json({
                success: true,
                data: themes
            });
        });
        this.getThemeById = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const theme = await this.themeService.getThemeById(id);
            res.status(200).json({
                success: true,
                data: theme
            });
        });
        this.createTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const theme = await this.themeService.createTheme(req.body);
            res.status(201).json({
                success: true,
                data: theme
            });
        });
        this.updateTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const theme = await this.themeService.updateTheme(id, req.body);
            res.status(200).json({
                success: true,
                data: theme
            });
        });
        this.updateActiveTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const theme = await this.themeService.updateActiveTheme(req.body);
            res.status(200).json({
                success: true,
                data: theme
            });
        });
        this.resetActiveTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const theme = await this.themeService.resetActiveTheme();
            res.status(200).json({
                success: true,
                data: theme
            });
        });
        this.applyPreset = (0, async_1.asyncHandler)(async (req, res) => {
            const { name } = req.body;
            if (!name || !['default', 'dark', 'light'].includes(name)) {
                return res.status(400).json({ success: false, error: 'Invalid preset name' });
            }
            const theme = await this.themeService.applyPreset(name);
            res.status(200).json({
                success: true,
                data: theme
            });
        });
        this.duplicateTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const theme = await this.themeService.duplicateTheme();
            res.status(201).json({
                success: true,
                data: theme
            });
        });
        this.deleteTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.themeService.deleteTheme(id);
            res.status(200).json({
                success: true,
                message: 'Theme deleted successfully'
            });
        });
        this.setActiveTheme = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const theme = await this.themeService.setActiveTheme(id);
            res.status(200).json({
                success: true,
                data: theme
            });
        });
    }
}
exports.ThemeController = ThemeController;
