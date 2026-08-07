"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = require("../models/User");
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(User_1.UserModel);
    }
    async findByEmail(email) {
        return this.findOne({ email: new RegExp(`^${email}$`, 'i') });
    }
    async findByPhone(phone) {
        return this.findOne({ phone });
    }
    async findByGoogleId(googleId) {
        return this.findOne({ googleId });
    }
    async findByCredentials(email) {
        return this.model.findOne({ email: new RegExp(`^${email}$`, 'i') }).select('+password').exec();
    }
    async findByIdWithPassword(id) {
        return this.model.findById(id).select('+password').exec();
    }
    async findByIdAndPopulate(id, populateOptions = '') {
        return this.model.findById(id).populate(populateOptions).exec();
    }
    async findActive(options = {}) {
        return this.findMany({ status: 'active' }, options);
    }
    async listCustomers(options = {}) {
        const filter = { role: 'customer' };
        // Admin customer list can filter by account status (active/banned).
        if (options.status) {
            filter.status = options.status;
        }
        if (options.search) {
            const regex = new RegExp(options.search, 'i');
            filter.$or = [
                { firstName: { $regex: regex } },
                { lastName: { $regex: regex } },
                { email: { $regex: regex } },
            ];
        }
        return this.paginate(filter, {
            page: options.page,
            limit: options.limit,
            sort: options.sort ?? { createdAt: -1 },
        });
    }
    async findByRole(role, options = {}) {
        return this.findMany({ role }, options);
    }
    async incrementLoginCount(userId) {
        return this.findByIdAndUpdate(userId, {
            $inc: { loginCount: 1 },
            $set: { lastLoginAt: new Date() }
        }, { new: true });
    }
    async updateLastLogin(userId) {
        return this.findByIdAndUpdate(userId, { $set: { lastLoginAt: new Date() }, $inc: { loginCount: 1 } }, { new: true });
    }
    async registerFailedLogin(userId) {
        return this.findByIdAndUpdate(userId, { $inc: { failedLoginAttempts: 1 } }, { new: true });
    }
    async lockAccount(userId, until) {
        return this.findByIdAndUpdate(userId, { $set: { lockedUntil: until } }, { new: true });
    }
    async clearFailedLogins(userId) {
        return this.findByIdAndUpdate(userId, { $set: { failedLoginAttempts: 0 }, $unset: { lockedUntil: '' } }, { new: true });
    }
    async isAccountLocked(user) {
        return Boolean(user?.lockedUntil && new Date(user.lockedUntil) > new Date());
    }
    async updatePassword(userId, password) {
        const user = await this.model.findById(userId).select('+password');
        if (!user)
            return null;
        user.password = password;
        await user.save();
        return user;
    }
    async verifyEmail(userId) {
        return this.findByIdAndUpdate(userId, {
            $set: {
                emailVerified: true,
                emailVerificationToken: undefined,
                emailVerificationExpires: undefined
            }
        }, { new: true });
    }
    async setPasswordResetToken(userId, token, expires) {
        return this.findByIdAndUpdate(userId, {
            $set: {
                passwordResetToken: token,
                passwordResetExpires: expires
            }
        }, { new: true });
    }
    async setEmailVerificationToken(userId, token, expires) {
        return this.findByIdAndUpdate(userId, {
            $set: { emailVerificationToken: token, emailVerificationExpires: expires }
        }, { new: true });
    }
    async clearPasswordResetToken(userId) {
        return this.findByIdAndUpdate(userId, {
            $set: {
                passwordResetToken: undefined,
                passwordResetExpires: undefined
            }
        }, { new: true });
    }
    async findByResetToken(token) {
        return this.model.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } }).select('+passwordResetToken').exec();
    }
    async findByEmailVerificationToken(token) {
        return this.model.findOne({ emailVerificationToken: token, emailVerificationExpires: { $gt: new Date() } }).select('+emailVerificationToken').exec();
    }
    async getUserStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]).exec();
    }
    async getRegistrationStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return this.model.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
            }
        ]).exec();
    }
    async addAddress(userId, address) {
        return this.findByIdAndUpdate(userId, { $push: { addresses: address } }, { new: true, runValidators: true });
    }
    async updateAddress(userId, addressId, address) {
        return this.findOneAndUpdate({ _id: userId, 'addresses.id': addressId }, { $set: Object.fromEntries(Object.entries(address).map(([key, value]) => [`addresses.$.${key}`, value])) }, { new: true, runValidators: true });
    }
    async removeAddress(userId, addressId) {
        return this.findByIdAndUpdate(userId, { $pull: { addresses: { id: addressId } } }, { new: true });
    }
    async setDefaultAddress(userId, addressId) {
        const user = await this.model.findOne({ _id: userId, 'addresses.id': addressId });
        if (!user)
            return null;
        user.addresses.forEach((address) => { address.isDefault = address.id === addressId; });
        await user.save();
        return user;
    }
    async updatePreferences(userId, preferences) {
        return this.findByIdAndUpdate(userId, { $set: { preferences } }, { new: true, runValidators: true });
    }
}
exports.UserRepository = UserRepository;
