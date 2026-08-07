"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const exceptions_1 = require("../utils/exceptions");
const crypto_1 = require("crypto");
class UserService {
    constructor(userRepo, authRepo) {
        this.userRepo = userRepo;
        this.authRepo = authRepo;
    }
    async getUserById(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundError('User not found');
        }
        return user.toObject();
    }
    async getUserByEmail(email) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new exceptions_1.NotFoundError('User not found');
        }
        return user.toObject();
    }
    async updateUser(userId, updateData) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundError('User not found');
        }
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.userRepo.findByEmail(updateData.email);
            if (existingUser) {
                throw new exceptions_1.BadRequestError('Email is already in use');
            }
        }
        const updatedUser = await this.userRepo.updateById(userId, updateData);
        return updatedUser.toObject();
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundError('User not found');
        }
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            throw new exceptions_1.ValidationError('Current password is incorrect');
        }
        await this.userRepo.updatePassword(userId, newPassword);
        // Revoke all refresh tokens after a password change (all devices).
        if (this.authRepo) {
            await this.authRepo.deleteUserTokens(userId);
        }
    }
    async deleteUser(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new exceptions_1.NotFoundError('User not found');
        }
        await this.userRepo.updateById(userId, { status: 'deleted' });
        return true;
    }
    async listAddresses(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user)
            throw new exceptions_1.NotFoundError('User not found');
        return user.addresses || [];
    }
    async addAddress(userId, address) {
        const user = await this.userRepo.findById(userId);
        if (!user)
            throw new exceptions_1.NotFoundError('User not found');
        const addresses = user.addresses || [];
        const created = await this.userRepo.addAddress(userId, { ...address, id: (0, crypto_1.randomUUID)(), isDefault: addresses.length === 0 || Boolean(address.isDefault) });
        if (address.isDefault && created)
            return this.setDefaultAddress(userId, created.addresses[created.addresses.length - 1].id);
        return created.addresses;
    }
    async updateAddress(userId, addressId, address) {
        const updated = await this.userRepo.updateAddress(userId, addressId, address);
        if (!updated)
            throw new exceptions_1.NotFoundError('Address not found');
        if (address.isDefault)
            return this.setDefaultAddress(userId, addressId);
        return updated.addresses;
    }
    async removeAddress(userId, addressId) {
        const updated = await this.userRepo.removeAddress(userId, addressId);
        if (!updated)
            throw new exceptions_1.NotFoundError('User not found');
        return updated.addresses;
    }
    async setDefaultAddress(userId, addressId) {
        const updated = await this.userRepo.setDefaultAddress(userId, addressId);
        if (!updated)
            throw new exceptions_1.NotFoundError('Address not found');
        return updated.addresses;
    }
    async updatePreferences(userId, preferences) {
        const user = await this.userRepo.findById(userId);
        if (!user)
            throw new exceptions_1.NotFoundError('User not found');
        const updated = await this.userRepo.updatePreferences(userId, { ...user.preferences?.toObject?.(), ...user.preferences, ...preferences });
        return updated.preferences;
    }
    async listCustomers(options = {}) {
        return this.userRepo.listCustomers(options);
    }
    async getCustomerById(customerId) {
        const customer = await this.userRepo.findById(customerId);
        if (!customer || customer.role !== 'customer') {
            throw new exceptions_1.NotFoundError('Customer not found');
        }
        return customer.toObject();
    }
    async updateCustomerStatus(customerId, status) {
        if (!['active', 'suspended', 'deleted'].includes(status)) {
            throw new exceptions_1.ValidationError('Invalid customer status');
        }
        const customer = await this.userRepo.findById(customerId);
        if (!customer || customer.role !== 'customer') {
            throw new exceptions_1.NotFoundError('Customer not found');
        }
        const updated = await this.userRepo.updateById(customerId, { status });
        return updated.toObject();
    }
}
exports.UserService = UserService;
