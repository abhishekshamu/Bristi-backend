"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hero_controller_1 = require("../controllers/hero.controller");
const hero_service_1 = require("../services/hero.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const audit_middleware_1 = require("../middleware/audit.middleware");
const index_1 = require("../validators/index");
const hero_validators_1 = require("../validators/hero.validators");
const router = (0, express_1.Router)();
const heroController = new hero_controller_1.HeroController(new hero_service_1.HeroService());
// Public: active published blocks for the storefront hero
router.get('/', heroController.getActiveBlocks);
// Public: SSE stream — pushes a change event whenever a hero set is written
router.get('/events', heroController.streamEvents);
// Admin routes
router.get('/all', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), heroController.getAllBlocks);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('hero', 'create'), hero_validators_1.createHeroValidation, index_1.validate, heroController.createBlock);
router.post('/reorder', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('hero', 'reorder'), heroController.reorderBlocks);
router.get('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), hero_validators_1.heroIdValidation, index_1.validate, heroController.getBlockById);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('hero', 'update'), hero_validators_1.updateHeroValidation, index_1.validate, heroController.updateBlock);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('hero', 'delete'), hero_validators_1.heroIdValidation, index_1.validate, heroController.deleteBlock);
router.post('/:id/duplicate', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('hero', 'duplicate'), hero_validators_1.heroIdValidation, index_1.validate, heroController.duplicateBlock);
exports.default = router;
