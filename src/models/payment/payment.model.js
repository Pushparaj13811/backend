import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    provider: {
        type: String,
        required: true,
        enum: ['razorpay', 'stripe', 'paypal'] // Add more providers as needed
    },
    providerOrderId: {
        type: String,
        required: true,
        unique: true
    },
    providerPaymentId: {
        type: String,
        unique: true,
        sparse: true
    },
    providerSignature: {
        type: String,
        sparse: true
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'completed', 'failed', 'refunded'],
        default: 'created'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'netbanking', 'upi', 'wallet'],
        required: true
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundReason: String,
    refundedAt: Date,
    error: {
        code: String,
        description: String
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ providerOrderId: 1 }, { unique: true });
paymentSchema.index({ providerPaymentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);