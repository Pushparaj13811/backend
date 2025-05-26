import express from 'express';
import { PaymentController } from '../controllers/payment/payment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { paymentValidation } from '../validations/payment.validation.js';

const router = express.Router();
const paymentController = new PaymentController();

// Public routes
router.post('/verify', validateRequest(paymentValidation.verify), paymentController.verifyPayment);

// Protected routes
router.use(authMiddleware);

// Payment creation and management
router.post('/', validateRequest(paymentValidation.create), paymentController.createPayment);
router.get('/:id', paymentController.getPaymentDetails);
router.post('/:id/refund', validateRequest(paymentValidation.refund), paymentController.processRefund);

// Payment history
router.get('/user/history', paymentController.getPaymentHistory);
router.get('/order/:orderId', paymentController.getPaymentByOrder);

export default router; 