"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEnsureDefaultAdmin = exports.ensureDefaultAdmin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Admin_1 = require("../models/Admin");
const constants_1 = require("shared/constants");
const database_1 = require("../config/database");
// Development-only fallback credentials. In production the admin must be
// provisioned explicitly via ADMIN_EMAIL / ADMIN_PASSWORD env vars — a known
// default account is never created against a production database.
const DEV_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bristi.com';
const DEV_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const isProduction = process.env.NODE_ENV === 'production';
const ensureDefaultAdmin = async () => {
    try {
        const provisionedEmail = process.env.ADMIN_EMAIL;
        const provisionedPassword = process.env.ADMIN_PASSWORD;
        if (isProduction && (!provisionedEmail || !provisionedPassword)) {
            console.warn('[admin] Skipping default admin creation: set ADMIN_EMAIL and ADMIN_PASSWORD env vars to provision a super-admin in production.');
            return;
        }
        // Never create a default-password admin against a REMOTE database unless
        // an explicit ADMIN_PASSWORD was provided. This protects against a
        // misconfigured local `.env` (NODE_ENV=development + remote MongoDB URI)
        // silently provisioning a known-credential super admin on production data.
        if (!provisionedPassword) {
            const host = mongoose_1.default.connection?.host || '';
            const isRemote = host && !['localhost', '127.0.0.1', '::1'].includes(host) && !host.startsWith('mongodb-memory');
            if (isRemote) {
                console.warn(`[admin] Skipping default admin creation: refusing to create a default-password admin on remote host "${host}". Set ADMIN_EMAIL and ADMIN_PASSWORD to provision explicitly.`);
                return;
            }
        }
        const email = provisionedEmail || DEV_ADMIN_EMAIL;
        const password = provisionedPassword || DEV_ADMIN_PASSWORD;
        const existing = await Admin_1.AdminModel.findOne({ email: email.toLowerCase().trim() }).exec();
        if (existing) {
            return;
        }
        await Admin_1.AdminModel.create({
            email: email.toLowerCase().trim(),
            password,
            firstName: 'BRISTI',
            lastName: 'Admin',
            role: 'super_admin',
            permissions: constants_1.ROLE_PERMISSIONS.SUPER_ADMIN,
            isActive: true,
        });
        console.log(`Default admin created: ${email}${isProduction ? '' : ' (development default password)'}`);
    }
    catch (error) {
        console.error(`Failed to ensure default admin: ${error.message}`);
    }
};
exports.ensureDefaultAdmin = ensureDefaultAdmin;
const runEnsureDefaultAdmin = async () => {
    const uri = await (0, database_1.getMongoUri)();
    await mongoose_1.default.connect(uri);
    await (0, exports.ensureDefaultAdmin)();
    await mongoose_1.default.disconnect();
    await (0, database_1.stopMemoryMongo)();
};
exports.runEnsureDefaultAdmin = runEnsureDefaultAdmin;
if (require.main === module) {
    (0, exports.runEnsureDefaultAdmin)().then(() => process.exit(0)).catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
