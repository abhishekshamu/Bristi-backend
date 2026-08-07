"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const async_1 = require("../middleware/async");
const exceptions_1 = require("../utils/exceptions");
class UserController {
    constructor(userService) {
        this.userService = userService;
        this.getProfile = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const user = await this.userService.getUserById(userId);
            res.status(200).json({ success: true, data: user });
        });
        this.updateProfile = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const { firstName, lastName, phone, dateOfBirth, gender } = req.body;
            const user = await this.userService.updateUser(userId, { firstName, lastName, phone, dateOfBirth, gender });
            res.status(200).json({ success: true, data: user });
        });
        this.changePassword = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new exceptions_1.ValidationError('Please provide current password and new password');
            }
            await this.userService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({ success: true, message: 'Password changed successfully' });
        });
        this.deleteAccount = (0, async_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            await this.userService.deleteUser(userId);
            res.status(200).json({ success: true, message: 'Account deleted successfully' });
        });
        this.listAddresses = (0, async_1.asyncHandler)(async (req, res) => {
            res.json({ success: true, data: await this.userService.listAddresses(req.user.id) });
        });
        this.addAddress = (0, async_1.asyncHandler)(async (req, res) => {
            res.status(201).json({ success: true, data: await this.userService.addAddress(req.user.id, req.body) });
        });
        this.updateAddress = (0, async_1.asyncHandler)(async (req, res) => {
            res.json({ success: true, data: await this.userService.updateAddress(req.user.id, req.params.addressId, req.body) });
        });
        this.deleteAddress = (0, async_1.asyncHandler)(async (req, res) => {
            res.json({ success: true, data: await this.userService.removeAddress(req.user.id, req.params.addressId) });
        });
        this.setDefaultAddress = (0, async_1.asyncHandler)(async (req, res) => {
            res.json({ success: true, data: await this.userService.setDefaultAddress(req.user.id, req.params.addressId) });
        });
        this.updatePreferences = (0, async_1.asyncHandler)(async (req, res) => {
            res.json({ success: true, data: await this.userService.updatePreferences(req.user.id, req.body) });
        });
        this.listCustomers = (0, async_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, search, status } = req.query;
            const result = await this.userService.listCustomers({
                page: parseInt(page),
                limit: parseInt(limit),
                search: search,
                status: status,
            });
            res.status(200).json({ success: true, data: result });
        });
        this.getCustomerById = (0, async_1.asyncHandler)(async (req, res) => {
            res.status(200).json({ success: true, data: await this.userService.getCustomerById(req.params.id) });
        });
        this.updateCustomerStatus = (0, async_1.asyncHandler)(async (req, res) => {
            const { status } = req.body;
            if (!status) {
                throw new exceptions_1.ValidationError('Please provide a status');
            }
            res.status(200).json({ success: true, data: await this.userService.updateCustomerStatus(req.params.id, status) });
        });
    }
}
exports.UserController = UserController;
