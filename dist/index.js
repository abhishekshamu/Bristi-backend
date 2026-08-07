"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const app_1 = __importDefault(require("./app"));
const ensure_default_admin_1 = require("./scripts/ensure-default-admin");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
(0, database_1.default)()
    .then(() => (0, ensure_default_admin_1.ensureDefaultAdmin)())
    .then(() => {
    app_1.default.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
