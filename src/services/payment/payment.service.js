import { PaymentRepository } from '../../repositories/payment/payment.repository.js';
import { OrderRepository } from '../../repositories/order/order.repository.js';
import { PaymentProviderFactory } from './providers/provider.factory.js';

export class PaymentService {
  constructor() {
    this.repository = new PaymentRepository();
    this.orderRepository = new OrderRepository();
  }

  async createPayment(orderId, userId, providerName = 'razorpay') {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get payment provider
    const provider = PaymentProviderFactory.getProvider(providerName, {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET
    });

    // Create payment with provider
    const providerResponse = await provider.createPayment(order);

    // Create payment record
    const payment = await this.repository.create({
      order: orderId,
      user: userId,
      amount: providerResponse.amount,
      currency: providerResponse.currency,
      provider: providerName,
      providerOrderId: providerResponse.providerOrderId,
      status: 'created',
      paymentMethod: 'card', // Default, will be updated when payment is completed
      metadata: {
        providerData: providerResponse.providerData
      },
      createdBy: userId
    });

    return {
      payment,
      providerData: providerResponse.providerData
    };
  }

  async verifyPayment(paymentId, paymentDetails) {
    const payment = await this.repository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Get payment provider
    const provider = PaymentProviderFactory.getProvider(payment.provider, {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET
    });

    // Verify payment with provider
    const verificationResult = await provider.verifyPayment(paymentDetails);

    // Update payment details
    const updatedPayment = await this.repository.updatePaymentDetails(paymentId, {
      providerPaymentId: verificationResult.providerPaymentId,
      providerSignature: verificationResult.providerSignature,
      status: verificationResult.status
    });

    // Update order status
    await this.orderRepository.updateStatus(payment.order, 'paid');

    return updatedPayment;
  }

  async getPaymentDetails(paymentId) {
    const payment = await this.repository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.providerPaymentId) {
      const provider = PaymentProviderFactory.getProvider(payment.provider, {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET
      });

      const providerDetails = await provider.getPaymentDetails(payment.providerPaymentId);
      return {
        payment,
        providerDetails
      };
    }

    return { payment };
  }

  async processRefund(paymentId, amount, reason) {
    const payment = await this.repository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    if (amount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    // Get payment provider
    const provider = PaymentProviderFactory.getProvider(payment.provider, {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET
    });

    // Process refund with provider
    const refundResult = await provider.processRefund(payment.providerPaymentId, amount, reason);

    // Update payment record
    const updatedPayment = await this.repository.processRefund(paymentId, amount, reason);

    // Update order status if full refund
    if (amount === payment.amount) {
      await this.orderRepository.updateStatus(payment.order, 'refunded');
    }

    return {
      payment: updatedPayment,
      refund: refundResult
    };
  }

  async getPaymentHistory(userId) {
    return this.repository.findByUser(userId);
  }

  async getPaymentByOrder(orderId) {
    return this.repository.findByOrder(orderId);
  }
} 