import { Payment } from '../../models/payment/payment.model.js';
import { BaseRepository } from '../BaseRepository.js';

export class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async findByOrder(orderId) {
    return this.model.find({ order: orderId })
      .populate('user', 'name email')
      .populate('order', 'orderNumber total');
  }

  async findByUser(userId) {
    return this.model.find({ user: userId })
      .populate('order', 'orderNumber total')
      .sort({ createdAt: -1 });
  }

  async findByStatus(status) {
    return this.model.find({ status })
      .populate('user', 'name email')
      .populate('order', 'orderNumber total');
  }

  async findByRazorpayOrderId(razorpayOrderId) {
    return this.model.findOne({ razorpayOrderId })
      .populate('user', 'name email')
      .populate('order', 'orderNumber total');
  }

  async updateStatus(id, status) {
    return this.model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async updatePaymentDetails(id, paymentDetails) {
    return this.model.findByIdAndUpdate(
      id,
      {
        razorpayPaymentId: paymentDetails.paymentId,
        razorpaySignature: paymentDetails.signature,
        status: 'completed'
      },
      { new: true }
    );
  }

  async processRefund(id, refundAmount, reason) {
    return this.model.findByIdAndUpdate(
      id,
      {
        refundAmount,
        refundReason: reason,
        refundedAt: new Date(),
        status: 'refunded'
      },
      { new: true }
    );
  }
} 