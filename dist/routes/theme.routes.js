"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const theme_controller_1 = require("../controllers/theme.controller");
const theme_service_1 = require("../services/theme.service");
const theme_repository_1 = require("../repositories/theme.repository");
const auth_middleware_1 = require("../middleware/auth.middleware");
const themeRepo = new theme_repository_1.ThemeRepository();
const themeService = new theme_service_1.ThemeService(themeRepo);
const themeController = new theme_controller_1.ThemeController(themeService);
const router = (0, express_1.Router)();
// Public
router.get('/', themeController.getActiveTheme);
// Admin: active theme operations (must be declared before /:id routes)
router.put('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.updateActiveTheme);
router.post('/reset', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.resetActiveTheme);
router.post('/preset', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.applyPreset);
router.post('/duplicate', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.duplicateTheme);
// Admin: theme library
router.get('/all', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.getAllThemes);
router.get('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.getThemeById);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.createTheme);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.updateTheme);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.deleteTheme);
router.put('/:id/activate', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), themeController.setActiveTheme);
exports.default = router;
