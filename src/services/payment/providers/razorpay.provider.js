import Razorpay from 'razorpay';
import crypto from 'crypto';
import { BasePaymentProvider } from './base.provider.js';

export class RazorpayProvider extends BasePaymentProvider {
  constructor(config) {
    super(config);
    this.razorpay = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret
    });
  }

  async createPayment(order) {
    const razorpayOrder = await this.razorpay.orders.create({
      amount: order.total * 100, // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString()
      }
    });

    return {
      providerOrderId: razorpayOrder.id,
      providerData: razorpayOrder,
      amount: order.total,
      currency: 'INR'
    };
  }

  async verifyPayment(paymentDetails) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentDetails;
    
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new Error('Invalid signature');
    }

    return {
      providerPaymentId: razorpayPaymentId,
      providerSignature: razorpaySignature,
      status: 'completed'
    };
  }

  async processRefund(paymentId, amount, reason) {
    const refund = await this.razorpay.payments.refund(paymentId, {
      amount: amount * 100 // Convert to paise
    });

    return {
      providerRefundId: refund.id,
      status: 'refunded',
      amount: amount
    };
  }

  async getPaymentDetails(paymentId) {
    const payment = await this.razorpay.payments.fetch(paymentId);
    return {
      providerPaymentId: payment.id,
      status: payment.status,
      amount: payment.amount / 100, // Convert from paise
      currency: payment.currency,
      method: payment.method,
      providerData: payment
    };
  }
} 