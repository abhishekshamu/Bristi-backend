"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSeo = normalizeSeo;
exports.normalizeTags = normalizeTags;
// Maps flat `seoTitle` / `seoDescription` / `seoKeywords` form fields onto the
// `seo: { title, description, keywords }` shape stored by the models.
function normalizeSeo(data) {
    const seo = { ...(data.seo ?? {}) };
    if (data.seoTitle !== undefined)
        seo.title = data.seoTitle;
    if (data.seoDescription !== undefined)
        seo.description = data.seoDescription;
    if (data.seoKeywords !== undefined) {
        seo.keywords = String(data.seoKeywords)
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
    }
    return { ...data, seo };
}
// The admin blog form collects tags as a comma-separated string, but the
// model stores `tags: [String]`.
function normalizeTags(data) {
    if (typeof data.tags === 'string') {
        data.tags = data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }
    return data;
}
