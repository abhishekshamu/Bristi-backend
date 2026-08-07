"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRichText = sanitizeRichText;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
// Server-side sanitization for CMS rich-text fields that the storefront
// renders with dangerouslySetInnerHTML (Page.content, BlogPost.content).
// Scripts, event handlers, javascript: URLs and iframes are stripped;
// a pragmatic prose/table tag set is preserved so existing content keeps
// its formatting.
function sanitizeRichText(html) {
    if (!html || typeof html !== 'string')
        return '';
    return (0, sanitize_html_1.default)(html, {
        allowedTags: [
            'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'b', 'em', 'i', 'u', 's',
            'blockquote', 'ul', 'ol', 'li',
            'a', 'img', 'figure', 'figcaption',
            'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'hr', 'span', 'div',
        ],
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height'],
            th: ['colspan', 'rowspan'],
            td: ['colspan', 'rowspan'],
            code: ['class'],
            pre: ['class'],
            '*': ['class'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowedSchemesByTag: {
            img: ['http', 'https'],
            a: ['http', 'https', 'mailto'],
        },
        allowProtocolRelative: false,
    });
}
