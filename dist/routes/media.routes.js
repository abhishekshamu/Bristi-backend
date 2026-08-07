"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const audit_middleware_1 = require("../middleware/audit.middleware");
const media_repository_1 = require("../repositories/media.repository");
const media_service_1 = require("../services/media.service");
const media_controller_1 = require("../controllers/media.controller");
const ALLOWED_UPLOAD_MIMES = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
    'image/gif', 'image/avif', 'video/mp4', 'video/webm',
]);
// Boundary-level filtering: multer rejects non-allowed MIME types before the
// controller runs; the media service still re-validates content/extension.
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024, files: 20 },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_UPLOAD_MIMES.has(file.mimetype)) {
            cb(null, true);
        }
        else {
            const err = new Error(`Unsupported file type: ${file.mimetype}`);
            err.statusCode = 400;
            cb(err);
        }
    },
});
const mediaRepo = new media_repository_1.MediaRepository();
const mediaService = new media_service_1.MediaService(mediaRepo);
const controller = new media_controller_1.MediaController(mediaService);
const router = (0, express_1.Router)();
// Order matters: static/bulk paths must be registered before '/:id'.
router.post('/verify-url', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), controller.verifyUrl);
router.get('/folders', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), controller.listFolders);
router.post('/bulk-delete', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'delete'), controller.bulkDelete);
router.post('/bulk-move', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'update'), controller.bulkMove);
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), controller.list);
router.get('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), controller.get);
router.get('/:id/usage', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), controller.usage);
router.patch('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'update'), controller.update);
router.post('/:id/fit', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'update'), controller.fit);
router.post('/:id/crop', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'update'), controller.crop);
router.post('/:id/replace', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'update'), upload.any(), controller.replace);
router.post('/:id/restore-version', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'update'), controller.restoreVersion);
router.post('/:id/replace-everywhere', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'update'), controller.replaceEverywhere);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'create'), upload.any(), controller.upload);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), (0, audit_middleware_1.auditLog)('media', 'delete'), controller.remove);
exports.default = router;
