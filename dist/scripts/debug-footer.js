"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
const Settings_1 = require("../models/Settings");
dotenv_1.default.config();
async function main() {
    await mongoose_1.default.connect(await (0, database_1.getMongoUri)(), { serverSelectionTimeoutMS: 20000 });
    const existing = await Settings_1.SettingsModel.findOne({});
    console.log('found:', existing?._id?.toString());
    try {
        const result = await Settings_1.SettingsModel.findByIdAndUpdate(existing._id, {
            footer: {
                sections: [
                    { type: 'links', title: 'Shop', links: [{ label: 'A', url: '/shop' }], sortOrder: 1, isActive: true },
                ],
            },
        }, { new: true });
        console.log('MODEL UPDATE OK:', result ? 'sections=' + result.footer?.sections?.length : 'NULL');
    }
    catch (err) {
        console.error('ERROR NAME:', err.name);
        console.error('ERROR PATH:', err.path);
        console.error('ERROR MESSAGE:', err.message);
    }
    await mongoose_1.default.disconnect();
}
main().catch((err) => {
    console.error('FATAL', err.name, err.message);
    process.exitCode = 1;
});
