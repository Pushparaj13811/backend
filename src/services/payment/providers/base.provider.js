export class BasePaymentProvider {
  constructor(config) {
    if (this.constructor === BasePaymentProvider) {
      throw new Error('BasePaymentProvider is an abstract class and cannot be instantiated directly');
    }
    this.config = config;
  }

  async createPayment(order) {
    throw new Error('createPayment method must be implemented');
  }

  async verifyPayment(paymentDetails) {
    throw new Error('verifyPayment method must be implemented');
  }

  async processRefund(paymentId, amount, reason) {
    throw new Error('processRefund method must be implemented');
  }

  async getPaymentDetails(paymentId) {
    throw new Error('getPaymentDetails method must be implemented');
  }
} 