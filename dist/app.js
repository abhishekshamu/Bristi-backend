"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_middleware_1 = require("./middleware/error.middleware");
const csrf_middleware_1 = require("./middleware/csrf.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const collection_routes_1 = __importDefault(require("./routes/collection.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const page_routes_1 = __importDefault(require("./routes/page.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const theme_routes_1 = __importDefault(require("./routes/theme.routes"));
const hero_routes_1 = __importDefault(require("./routes/hero.routes"));
const newsletter_routes_1 = __importDefault(require("./routes/newsletter.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const faq_routes_1 = __importDefault(require("./routes/faq.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const seo_routes_1 = __importDefault(require("./routes/seo.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const promotion_banner_routes_1 = __importDefault(require("./routes/promotion-banner.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Trust the first hop only when explicitly enabled (behind a reverse proxy).
// Keeps rate limiting and req.ip correct in proxied deployments.
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
// Middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Support a comma-separated allow-list of origins (e.g. storefront + admin on different ports)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true
}));
app.use((0, helmet_1.default)({
    // The storefront and admin run on different origins/ports and embed
    // images served from this API (/uploads). Helmet's default
    // Cross-Origin-Resource-Policy: same-origin blocks every cross-origin
    // no-cors image load (blank product images / broken thumbnails).
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Endpoints excluded from rate limiting while developing, so localhost coding is never blocked
const DEV_RATE_LIMIT_SKIP_PREFIXES = ['/health', '/api/admin/dashboard', '/api/theme'];
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    // Production: strict (default 300 requests / 15 min). Development: greatly relaxed.
    limit: IS_PRODUCTION
        ? Number(process.env.API_RATE_LIMIT || 300)
        : Number(process.env.API_RATE_LIMIT_DEV || 10000),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    skip: (req) => {
        if (IS_PRODUCTION)
            return false;
        return DEV_RATE_LIMIT_SKIP_PREFIXES.some((prefix) => req.path === prefix || req.path.startsWith(prefix));
    },
}));
// Auth-specific limiter (login/register/password flows). Configurable via AUTH_RATE_LIMIT.
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: IS_PRODUCTION
        ? Number(process.env.AUTH_RATE_LIMIT || 20)
        : Number(process.env.AUTH_RATE_LIMIT_DEV || 10000),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again later.' },
    skip: (req) => {
        if (IS_PRODUCTION)
            return false;
        return DEV_RATE_LIMIT_SKIP_PREFIXES.some((prefix) => req.path === prefix || req.path.startsWith(prefix));
    },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api/auth/otp/request', authLimiter);
app.use('/api/auth/otp/verify', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/admin/login', authLimiter);
app.use((0, morgan_1.default)(IS_PRODUCTION ? 'combined' : 'dev'));
app.use((0, cookie_parser_1.default)());
// CSRF defense-in-depth: validates X-XSRF-TOKEN on state-changing authed requests.
app.use('/api', csrf_middleware_1.csrfProtection);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/collections', collection_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/wishlist', wishlist_routes_1.default);
app.use('/api/coupons', coupon_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/blogs', blog_routes_1.default);
app.use('/api/pages', page_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/theme', theme_routes_1.default);
app.use('/api/hero', hero_routes_1.default);
app.use('/api/newsletter', newsletter_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/payment', payment_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/media', media_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/faqs', faq_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
app.use('/api/roles', role_routes_1.default);
app.use('/api/search', search_routes_1.default);
app.use('/api/contact', contact_routes_1.default);
app.use('/api/promotion-banners', promotion_banner_routes_1.default);
app.use(seo_routes_1.default);
// Local uploads (fallback when Cloudinary is not configured)
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express_1.default.static(uploadsDir));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'BRISTI API'
    });
});
// 404 handler
app.use(error_middleware_1.notFound);
// Error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
