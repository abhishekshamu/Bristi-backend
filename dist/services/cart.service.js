"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const exceptions_1 = require("../utils/exceptions");
class CartService {
    constructor(cartRepo, productRepo, couponRepo) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
        this.couponRepo = couponRepo;
    }
    async getCart(userId, sessionId) {
        let cart;
        if (userId) {
            cart = await this.cartRepo.getCartByUserId(userId);
        }
        else if (sessionId) {
            cart = await this.cartRepo.getCartBySessionId(sessionId);
        }
        else {
            return this.cartRepo.create({ items: [], totalItems: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, couponCode: undefined, couponDiscount: 0 });
        }
        return this.healCart(cart);
    }
    async getCartByUserId(userId) {
        return this.healCart(await this.cartRepo.getCartByUserId(userId));
    }
    async getCartBySessionId(sessionId) {
        return this.healCart(await this.cartRepo.getCartBySessionId(sessionId));
    }
    // Recompute totals from items so stale/legacy carts always report correct math
    async healCart(cart) {
        if (!cart || (!(cart.items ?? []).length && !cart.couponCode)) {
            return cart;
        }
        const before = cart.subtotal;
        await this.recalculateCart(cart);
        if (cart.subtotal !== before) {
            cart = (await this.cartRepo.updateById(cart._id.toString(), cart)) || cart;
        }
        return cart;
    }
    async addToCart(data) {
        const { userId, sessionId, productId, variantId, quantity, selectedOptions } = data;
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new exceptions_1.NotFoundException('Product not found');
        }
        if (product.status !== 'active') {
            throw new exceptions_1.BadRequestException(`${product.name} is not available for purchase`);
        }
        // Variant-aware stock check
        let unitPrice = product.price;
        if (variantId) {
            const variant = product.variants?.find((v) => String(v.id) === String(variantId));
            if (!variant) {
                throw new exceptions_1.BadRequestException('Variant not found');
            }
            unitPrice = product.price + (variant.priceAdjustment ?? 0);
            if (product.trackQuantity && (variant.stock ?? 0) < quantity) {
                throw new exceptions_1.BadRequestException('Insufficient stock for this variant');
            }
        }
        else if (product.trackQuantity && product.stock < quantity) {
            throw new exceptions_1.BadRequestException('Insufficient stock');
        }
        let cart;
        if (userId) {
            cart = await this.cartRepo.getCartByUserId(userId);
        }
        else if (sessionId) {
            cart = await this.cartRepo.getCartBySessionId(sessionId);
        }
        else {
            cart = await this.cartRepo.create({ items: [], totalItems: 0, subtotal: 0, total: 0, couponDiscount: 0 });
        }
        const existingItem = cart.items.find(item => item.productId.toString() === productId &&
            (!variantId || (item.variantId && item.variantId.toString() === variantId)));
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.trackQuantity) {
                const available = variantId
                    ? (product.variants?.find((v) => String(v.id) === String(variantId))?.stock ?? 0)
                    : product.stock;
                if (available < newQuantity) {
                    throw new exceptions_1.BadRequestException(`Only ${available} available in stock`);
                }
            }
            existingItem.quantity = newQuantity;
            existingItem.price = unitPrice;
        }
        else {
            const newItem = {
                productId: product._id,
                quantity,
                price: unitPrice,
                name: product.name,
                image: product.images?.[0]?.url || '',
                selectedOptions: selectedOptions || {}
            };
            if (variantId) {
                newItem.variantId = variantId;
            }
            cart.items.push(newItem);
        }
        await this.recalculateCart(cart);
        cart = await this.cartRepo.updateById(cart._id.toString(), cart);
        return cart;
    }
    // Recompute cart totals from items and re-validate any applied coupon
    async recalculateCart(cart) {
        const items = cart.items ?? [];
        const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0), 0);
        const totalItems = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
        let discount = 0;
        let couponCode = undefined;
        if (cart.couponCode && subtotal > 0) {
            const coupon = await this.couponRepo.findByCode(cart.couponCode);
            if (coupon && coupon.isValid) {
                const cartItems = items.map((i) => ({ productId: i.productId, variantId: i.variantId }));
                const scoped = cartItems.length === 0 || (await this.couponRepo.validateScopes(coupon, cartItems)).valid;
                if (scoped) {
                    discount = coupon.calculateDiscount(subtotal, cart.shipping || 0);
                    couponCode = coupon.code;
                }
            }
        }
        cart.subtotal = subtotal;
        cart.totalItems = totalItems;
        cart.couponCode = couponCode;
        cart.couponDiscount = discount;
        cart.discount = discount;
        cart.total = Math.max(0, subtotal - discount) + (cart.tax || 0) + (cart.shipping || 0);
    }
    async updateCartItemQuantity(itemId, quantity, userId, sessionId) {
        const cart = await this.resolveCart(userId, sessionId);
        const updated = await this.cartRepo.updateItemQuantity(cart._id.toString(), itemId, quantity);
        if (!updated) {
            throw new exceptions_1.NotFoundException('Cart item not found');
        }
        await this.recalculateCart(updated);
        return this.cartRepo.updateById(updated._id.toString(), updated);
    }
    async removeFromCart(itemId, userId, sessionId) {
        const cart = await this.resolveCart(userId, sessionId);
        const updated = await this.cartRepo.removeItem(cart._id.toString(), itemId);
        if (!updated) {
            throw new exceptions_1.NotFoundException('Cart item not found');
        }
        await this.recalculateCart(updated);
        return this.cartRepo.updateById(updated._id.toString(), updated);
    }
    async resolveCart(userId, sessionId) {
        if (userId) {
            return this.cartRepo.getCartByUserId(userId);
        }
        if (sessionId) {
            return this.cartRepo.getCartBySessionId(sessionId);
        }
        throw new exceptions_1.BadRequestException('User or session required');
    }
    async clearCart(userId, sessionId) {
        if (userId) {
            return this.cartRepo.clearByUserId(userId);
        }
        if (sessionId) {
            return this.cartRepo.clearBySessionId(sessionId);
        }
        return false;
    }
    async applyCoupon(couponCode, userId, sessionId) {
        const coupon = await this.couponRepo.findByCode(couponCode);
        if (!coupon || !coupon.isValid) {
            throw new exceptions_1.BadRequestException('Invalid or expired coupon code');
        }
        let cart;
        if (userId) {
            cart = await this.cartRepo.getCartByUserId(userId);
        }
        else if (sessionId) {
            cart = await this.cartRepo.getCartBySessionId(sessionId);
        }
        else {
            throw new exceptions_1.BadRequestException('User or session required');
        }
        if (coupon.perCustomerLimit && userId) {
            const customerUses = (coupon.customersUsed ?? []).filter((id) => String(id) === String(userId)).length;
            if (customerUses >= coupon.perCustomerLimit) {
                throw new exceptions_1.BadRequestException('You have already used this coupon');
            }
        }
        // Enforce coupon scope against cart contents
        const cartItems = (cart.items ?? []).map((i) => ({ productId: i.productId, variantId: i.variantId }));
        if (cartItems.length > 0) {
            const scoped = await this.couponRepo.validateScopes(coupon, cartItems);
            if (!scoped.valid) {
                throw new exceptions_1.BadRequestException(scoped.message || 'Coupon does not apply to items in your cart');
            }
        }
        const discount = coupon.calculateDiscount(cart.subtotal || 0, cart.shipping || 0);
        cart.couponCode = coupon.code;
        cart.couponDiscount = discount;
        cart.discount = discount;
        cart.total = Math.max(0, (cart.subtotal || 0) - discount) + (cart.tax || 0) + (cart.shipping || 0);
        cart = await this.cartRepo.updateById(cart._id.toString(), cart);
        return cart;
    }
}
exports.CartService = CartService;
