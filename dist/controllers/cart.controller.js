"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
class CartController {
    constructor(cartService) {
        this.cartService = cartService;
        this.getCart = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const sessionId = req.headers['x-session-id'];
            let cart;
            if (userId) {
                cart = await this.cartService.getCartByUserId(userId);
            }
            else if (sessionId) {
                cart = await this.cartService.getCartBySessionId(sessionId);
            }
            else {
                // Guest user - return an empty cart (no crash, no temp product lookup)
                cart = {
                    _id: null,
                    items: [],
                    totalItems: 0,
                    subtotal: 0,
                    tax: 0,
                    shipping: 0,
                    discount: 0,
                    total: 0,
                    couponCode: undefined,
                    couponDiscount: 0,
                };
            }
            res.status(200).json({
                success: true,
                data: cart
            });
        });
        this.addToCart = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId, variantId, quantity, selectedOptions } = req.body;
            const userId = req.user?.id;
            const sessionId = req.headers['x-session-id'];
            if (!productId || !quantity) {
                throw new exceptions_1.ValidationError('Please provide productId and quantity');
            }
            try {
                const cartItem = await this.cartService.addToCart({
                    userId,
                    sessionId,
                    productId,
                    variantId,
                    quantity: parseInt(quantity),
                    selectedOptions
                });
                res.status(200).json({
                    success: true,
                    data: cartItem
                });
            }
            catch (error) {
                throw new exceptions_1.BadRequestException(error.message || 'Failed to add item to cart');
            }
        });
        this.updateCartItem = (0, async_1.asyncHandler)(async (req, res) => {
            const { itemId } = req.params;
            const { quantity } = req.body;
            const userId = req.user?.id;
            const sessionId = req.headers['x-session-id'];
            if (!itemId) {
                throw new exceptions_1.ValidationError('Please provide itemId');
            }
            if (quantity === undefined) {
                throw new exceptions_1.ValidationError('Please provide quantity');
            }
            try {
                const updatedItem = await this.cartService.updateCartItemQuantity(itemId, parseInt(quantity), userId, sessionId);
                res.status(200).json({
                    success: true,
                    data: updatedItem
                });
            }
            catch (error) {
                throw new exceptions_1.BadRequestException(error.message || 'Failed to update cart item');
            }
        });
        this.removeFromCart = (0, async_1.asyncHandler)(async (req, res) => {
            const { itemId } = req.params;
            const userId = req.user?.id;
            const sessionId = req.headers['x-session-id'];
            if (!itemId) {
                throw new exceptions_1.ValidationError('Please provide itemId');
            }
            await this.cartService.removeFromCart(itemId, userId, sessionId);
            res.status(200).json({
                success: true,
                message: 'Item removed from cart'
            });
        });
        this.clearCart = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const sessionId = req.headers['x-session-id'];
            await this.cartService.clearCart(userId, sessionId);
            res.status(200).json({
                success: true,
                message: 'Cart cleared successfully'
            });
        });
        this.applyCoupon = (0, async_1.asyncHandler)(async (req, res) => {
            const { couponCode } = req.body;
            const userId = req.user?.id;
            const sessionId = req.headers['x-session-id'];
            if (!couponCode) {
                throw new exceptions_1.ValidationError('Please provide coupon code');
            }
            try {
                const cart = await this.cartService.applyCoupon(couponCode, userId, sessionId);
                res.status(200).json({
                    success: true,
                    data: cart
                });
            }
            catch (error) {
                throw new exceptions_1.BadRequestException(error.message || 'Failed to apply coupon');
            }
        });
    }
}
exports.CartController = CartController;
