"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeRepository = void 0;
const Theme_1 = require("../models/Theme");
const base_repository_1 = require("./base.repository");
class ThemeRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Theme_1.ThemeModel);
    }
    async getActiveTheme() {
        return this.findOne({ isActive: true });
    }
    async getThemeById(id) {
        return this.findById(id);
    }
    async getAllThemes(options = {}) {
        return this.findMany({}, options);
    }
    async setActiveTheme(id) {
        // First, deactivate all themes
        await this.updateMany({ isActive: true }, { $set: { isActive: false } });
        // Then activate the selected theme
        return this.updateById(id, { isActive: true });
    }
    async createTheme(data) {
        // If this is being set as active, deactivate all others first
        if (data.isActive) {
            await this.updateMany({ isActive: true }, { $set: { isActive: false } });
        }
        return this.create(data);
    }
    async updateTheme(id, data) {
        // If setting to active, deactivate others first
        if (data.isActive) {
            await this.updateMany({ _id: { $ne: id }, isActive: true }, { $set: { isActive: false } });
        }
        return this.updateById(id, data);
    }
    async deleteTheme(id) {
        const theme = await this.findById(id);
        // If trying to delete the active theme, prevent it unless there are others
        if (theme && theme.isActive) {
            const count = await this.count({});
            if (count <= 1) {
                throw new Error('Cannot delete the last remaining theme');
            }
            // Activate another theme before deleting
            const anotherTheme = await this.findOne({ _id: { $ne: id } });
            if (anotherTheme) {
                await this.setActiveTheme(anotherTheme._id.toString());
            }
        }
        return this.deleteById(id);
    }
    async getThemeCount() {
        return this.count({});
    }
}
exports.ThemeRepository = ThemeRepository;
