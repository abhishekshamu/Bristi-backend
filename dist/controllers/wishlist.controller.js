"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
class WishlistController {
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
        this.getWishlist = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new exceptions_1.ValidationError('User must be logged in to view wishlist');
            }
            const wishlist = await this.wishlistService.getWishlistByUserId(userId);
            res.status(200).json({
                success: true,
                data: wishlist
            });
        });
        this.addToWishlist = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new exceptions_1.ValidationError('User must be logged in to use wishlist');
            }
            if (!productId) {
                throw new exceptions_1.ValidationError('Please provide productId');
            }
            const wishlist = await this.wishlistService.addToWishlist(userId, productId);
            res.status(200).json({
                success: true,
                data: wishlist
            });
        });
        this.removeFromWishlist = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new exceptions_1.ValidationError('User must be logged in to use wishlist');
            }
            if (!productId) {
                throw new exceptions_1.ValidationError('Please provide productId');
            }
            const wishlist = await this.wishlistService.removeFromWishlist(userId, productId);
            res.status(200).json({
                success: true,
                data: wishlist
            });
        });
        this.checkInWishlist = (0, async_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new exceptions_1.ValidationError('User must be logged in to check wishlist');
            }
            if (!productId) {
                throw new exceptions_1.ValidationError('Please provide productId');
            }
            const isInWishlist = await this.wishlistService.checkInWishlist(userId, productId);
            res.status(200).json({
                success: true,
                data: { inWishlist: isInWishlist }
            });
        });
        this.clearWishlist = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new exceptions_1.ValidationError('User must be logged in to clear wishlist');
            }
            const cleared = await this.wishlistService.clearWishlist(userId);
            res.status(200).json({
                success: true,
                message: cleared ? 'Wishlist cleared' : 'Wishlist already empty',
                data: cleared
            });
        });
    }
}
exports.WishlistController = WishlistController;
