"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const theme_1 = require("shared/theme");
const exceptions_1 = require("../utils/exceptions");
class ThemeService {
    constructor(themeRepo) {
        this.themeRepo = themeRepo;
    }
    toFullTheme(theme) {
        return (0, theme_1.mergeThemeWithDefaults)(theme?.toObject ? theme.toObject() : theme);
    }
    async ensureDefaultTheme() {
        const theme = await this.themeRepo.getActiveTheme();
        if (theme)
            return theme;
        const anyTheme = await this.themeRepo.findOne({});
        if (anyTheme) {
            if (!anyTheme.isActive) {
                await this.themeRepo.setActiveTheme(anyTheme._id.toString());
                return this.themeRepo.getActiveTheme();
            }
            return anyTheme;
        }
        const preset = (0, theme_1.resolvePreset)('default');
        return this.themeRepo.createTheme({
            name: 'Default',
            description: 'BRISTI default black/white/gold theme',
            isActive: true,
            isDark: false,
            colors: preset.colors,
            typography: preset.typography,
            buttons: preset.buttons,
            header: preset.header,
            footer: preset.footer,
            effects: preset.effects,
        });
    }
    async getActiveTheme() {
        const theme = await this.ensureDefaultTheme();
        return this.toFullTheme(theme);
    }
    async getAllThemes(options = {}) {
        const themes = await this.themeRepo.getAllThemes(options);
        return themes.map((t) => this.toFullTheme(t));
    }
    async getThemeById(id) {
        const theme = await this.themeRepo.getThemeById(id);
        if (!theme) {
            throw new exceptions_1.NotFoundError('Theme not found');
        }
        return this.toFullTheme(theme);
    }
    async createTheme(data) {
        const merged = (0, theme_1.mergeThemeWithDefaults)(data);
        const created = await this.themeRepo.createTheme({
            name: merged.name,
            description: merged.description,
            isActive: merged.isActive,
            isDark: merged.isDark,
            colors: merged.colors,
            typography: merged.typography,
            buttons: merged.buttons,
            header: merged.header,
            footer: merged.footer,
            effects: merged.effects,
        });
        return this.toFullTheme(created);
    }
    async updateTheme(id, data) {
        const existing = await this.themeRepo.findById(id);
        if (!existing) {
            throw new exceptions_1.NotFoundError('Theme not found');
        }
        const plain = existing.toObject ? existing.toObject() : existing;
        const merged = (0, theme_1.mergeThemeWithDefaults)({ ...plain, ...data });
        const updated = await this.themeRepo.updateTheme(id, {
            name: merged.name,
            description: merged.description,
            isActive: merged.isActive,
            isDark: merged.isDark,
            colors: merged.colors,
            typography: merged.typography,
            buttons: merged.buttons,
            header: merged.header,
            footer: merged.footer,
            effects: merged.effects,
        });
        return this.toFullTheme(updated);
    }
    async updateActiveTheme(data) {
        const theme = await this.ensureDefaultTheme();
        const plain = theme.toObject ? theme.toObject() : theme;
        const merged = (0, theme_1.mergeThemeWithDefaults)({ ...plain, ...data });
        const updated = await this.themeRepo.updateTheme(theme._id.toString(), {
            name: merged.name,
            description: merged.description,
            isActive: true,
            isDark: merged.isDark,
            colors: merged.colors,
            typography: merged.typography,
            buttons: merged.buttons,
            header: merged.header,
            footer: merged.footer,
            effects: merged.effects,
        });
        return this.toFullTheme(updated);
    }
    async resetActiveTheme() {
        const theme = await this.ensureDefaultTheme();
        const preset = (0, theme_1.resolvePreset)('default');
        const updated = await this.themeRepo.updateTheme(theme._id.toString(), {
            name: 'Default',
            description: 'BRISTI default black/white/gold theme',
            isActive: true,
            isDark: false,
            colors: preset.colors,
            typography: preset.typography,
            buttons: preset.buttons,
            header: preset.header,
            footer: preset.footer,
            effects: preset.effects,
        });
        return this.toFullTheme(updated);
    }
    async applyPreset(name) {
        const theme = await this.ensureDefaultTheme();
        const preset = (0, theme_1.resolvePreset)(name);
        const current = theme.toObject ? theme.toObject() : theme;
        const merged = (0, theme_1.mergeThemeWithDefaults)({
            ...current,
            isDark: preset.isDark ?? current.isDark,
            colors: preset.colors || current.colors,
            typography: preset.typography || current.typography,
            buttons: preset.buttons || current.buttons,
            header: preset.header || current.header,
            footer: preset.footer || current.footer,
            effects: preset.effects || current.effects,
        });
        const updated = await this.themeRepo.updateTheme(theme._id.toString(), {
            isDark: merged.isDark,
            colors: merged.colors,
            typography: merged.typography,
            buttons: merged.buttons,
            header: merged.header,
            footer: merged.footer,
            effects: merged.effects,
        });
        return this.toFullTheme(updated);
    }
    async duplicateTheme() {
        const theme = await this.ensureDefaultTheme();
        const full = this.toFullTheme(theme);
        const created = await this.themeRepo.createTheme({
            name: `${full.name} (Copy)`,
            description: full.description,
            isActive: false,
            isDark: full.isDark,
            colors: full.colors,
            typography: full.typography,
            buttons: full.buttons,
            header: full.header,
            footer: full.footer,
            effects: full.effects,
        });
        return this.toFullTheme(created);
    }
    async deleteTheme(id) {
        const theme = await this.themeRepo.findById(id);
        if (!theme) {
            throw new exceptions_1.NotFoundError('Theme not found');
        }
        return this.themeRepo.deleteTheme(id);
    }
    async setActiveTheme(id) {
        const theme = await this.themeRepo.setActiveTheme(id);
        if (!theme) {
            throw new exceptions_1.NotFoundError('Theme not found');
        }
        return this.toFullTheme(theme);
    }
}
exports.ThemeService = ThemeService;
