"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_repository_1 = require("../repositories/product.repository");
const category_repository_1 = require("../repositories/category.repository");
const collection_repository_1 = require("../repositories/collection.repository");
const blog_repository_1 = require("../repositories/blog.repository");
const page_repository_1 = require("../repositories/page.repository");
const async_1 = require("../middleware/async");
const productRepo = new product_repository_1.ProductRepository();
const categoryRepo = new category_repository_1.CategoryRepository();
const collectionRepo = new collection_repository_1.CollectionRepository();
const blogRepo = new blog_repository_1.BlogRepository();
const pageRepo = new page_repository_1.PageRepository();
const BASE_URL = process.env.BASE_URL || 'https://bristi.example.com';
// Pages are served at their own top-level route (e.g. /privacy), not /page/:slug.
const PAGE_ROUTE_MAP = {
    privacy: '/privacy',
    terms: '/terms',
    shipping: '/shipping',
    refund: '/refund',
    faq: '/faq',
};
const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const router = (0, express_1.Router)();
router.get('/sitemap.xml', (0, async_1.asyncHandler)(async (_req, res) => {
    const now = new Date().toISOString();
    const staticUrls = [
        '', '/shop', '/about', '/contact', '/wishlist', '/account', '/cart', '/checkout',
    ].map((p) => `  <url><loc>${BASE_URL}${p}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    const [products, categories, collections, blogs, pages] = await Promise.all([
        productRepo.findMany({ status: 'active' }, { select: 'slug updatedAt' }),
        categoryRepo.findMany({ isActive: true }, { select: 'slug updatedAt' }),
        collectionRepo.findMany({ isActive: true }, { select: 'slug updatedAt' }),
        blogRepo.findMany({ status: 'published' }, { select: 'slug updatedAt' }),
        pageRepo.findMany({ status: 'published' }, { select: 'slug updatedAt' }),
    ]);
    const productUrls = products.map((p) => `  <url><loc>${BASE_URL}/product/${xmlEscape(p.slug)}</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`);
    const categoryUrls = categories.map((c) => `  <url><loc>${BASE_URL}/category/${xmlEscape(c.slug)}</loc><lastmod>${new Date(c.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    const collectionUrls = collections.map((c) => `  <url><loc>${BASE_URL}/collection/${xmlEscape(c.slug)}</loc><lastmod>${new Date(c.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    const blogUrls = blogs.map((b) => `  <url><loc>${BASE_URL}/journal/${xmlEscape(b.slug)}</loc><lastmod>${new Date(b.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`);
    const pageUrls = pages
        .filter((p) => PAGE_ROUTE_MAP[p.slug])
        .map((p) => `  <url><loc>${BASE_URL}${PAGE_ROUTE_MAP[p.slug]}</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...productUrls, ...categoryUrls, ...collectionUrls, ...blogUrls, ...pageUrls].join('\n')}
</urlset>`;
    res.set('Content-Type', 'application/xml');
    res.send(xml);
}));
router.get('/robots.txt', (0, async_1.asyncHandler)(async (_req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /account

Sitemap: ${BASE_URL}/sitemap.xml
`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
}));
exports.default = router;
