"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQRepository = void 0;
// @ts-nocheck
const FAQ_1 = require("../models/FAQ");
const base_repository_1 = require("./base.repository");
class FAQRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(FAQ_1.FAQModel);
    }
    async findByCategory(category) {
        return this.findMany({ category, isActive: true }, { sort: { sortOrder: 1 } });
    }
    async findAllActive() {
        return this.findMany({ isActive: true }, { sort: { sortOrder: 1 } });
    }
}
exports.FAQRepository = FAQRepository;
