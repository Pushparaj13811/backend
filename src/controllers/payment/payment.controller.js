import { PaymentService } from '../../services/payment/payment.service.js';

export class PaymentController {
  constructor() {
    this.service = new PaymentService();
  }

  async createPayment(req, res) {
    try {
      const { orderId } = req.body;
      const result = await this.service.createPayment(orderId, req.user._id);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyPayment(req, res) {
    try {
      const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;
      const payment = await this.service.verifyPayment(
        paymentId,
        razorpayPaymentId,
        razorpaySignature
      );
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPaymentDetails(req, res) {
    try {
      const result = await this.service.getPaymentDetails(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async processRefund(req, res) {
    try {
      const { amount, reason } = req.body;
      const result = await this.service.processRefund(
        req.params.id,
        amount,
        reason
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const payments = await this.service.getPaymentHistory(req.user._id);
      res.json(payments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPaymentByOrder(req, res) {
    try {
      const payments = await this.service.getPaymentByOrder(req.params.orderId);
      res.json(payments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
} 