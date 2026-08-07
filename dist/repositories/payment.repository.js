"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const Payment_1 = require("../models/Payment");
const base_repository_1 = require("./base.repository");
class PaymentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Payment_1.PaymentModel);
    }
    async findByOrderId(orderId) {
        return this.findOne({ orderId });
    }
    async findByTransactionId(transactionId) {
        return this.findOne({ transactionId });
    }
}
exports.PaymentRepository = PaymentRepository;
