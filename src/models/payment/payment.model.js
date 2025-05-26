import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema({
    // Basic Information
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Payment Details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
        default: 'USD'
    },
    method: {
        type: {
            type: String,
            enum: ['card', 'paypal', 'bank-transfer', 'cash-on-delivery', 'wallet'],
            required: true
        },
        details: {
            // Card details
            cardType: String,
            last4: String,
            expiryMonth: Number,
            expiryYear: Number,
            cardholderName: String,
            
            // PayPal details
            paypalEmail: String,
            paypalTransactionId: String,
            
            // Bank transfer details
            bankName: String,
            accountNumber: String,
            routingNumber: String,
            
            // Wallet details
            walletType: String,
            walletId: String
        }
    },
    
    // Transaction Information
    transaction: {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        status: {
            type: String,
            enum: [
                'pending',
                'processing',
                'authorized',
                'captured',
                'failed',
                'refunded',
                'partially_refunded',
                'voided'
            ],
            default: 'pending',
            index: true
        },
        gateway: {
            type: String,
            required: true,
            enum: ['stripe', 'paypal', 'square', 'adyen', 'custom']
        },
        gatewayTransactionId: String,
        gatewayResponse: Schema.Types.Mixed,
        error: {
            code: String,
            message: String,
            details: Schema.Types.Mixed
        }
    },
    
    // Refund Information
    refund: {
        amount: Number,
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed']
        },
        processedAt: Date,
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        gatewayRefundId: String,
        gatewayResponse: Schema.Types.Mixed
    },
    
    // Security & Verification
    security: {
        ipAddress: String,
        deviceInfo: Schema.Types.Mixed,
        riskScore: Number,
        fraudCheck: {
            status: {
                type: String,
                enum: ['pending', 'passed', 'failed', 'review']
            },
            score: Number,
            details: Schema.Types.Mixed
        }
    },
    
    // Timeline
    timeline: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['active', 'completed', 'failed', 'refunded', 'voided'],
        default: 'active',
        index: true
    },
    analytics: {
        processingTime: Number,
        retryCount: {
            type: Number,
            default: 0
        },
        lastRetry: Date
    }
    
}, {
    timestamps: true,
    indexes: [
        { order: 1, status: 1 },
        { user: 1, status: 1 },
        { 'transaction.id': 1 },
        { 'transaction.status': 1 },
        { createdAt: -1 }
    ]
});

// Method to update payment status
paymentSchema.methods.updateStatus = function(status, note = '', updatedBy = null) {
    this.status = status;
    this.timeline.push({
        status,
        note,
        updatedBy,
        timestamp: new Date()
    });
    
    return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason, processedBy) {
    if (this.status !== 'completed') {
        throw new Error('Can only refund completed payments');
    }
    
    if (amount > this.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
    }
    
    this.refund = {
        amount,
        reason,
        status: 'processing',
        processedAt: new Date(),
        processedBy
    };
    
    this.status = amount === this.amount ? 'refunded' : 'partially_refunded';
    
    this.timeline.push({
        status: 'refund_initiated',
        note: `Refund initiated for amount ${amount}`,
        updatedBy: processedBy,
        timestamp: new Date()
    });
    
    return this.save();
};

// Method to void payment
paymentSchema.methods.void = async function(reason, updatedBy) {
    if (this.status !== 'pending' && this.status !== 'authorized') {
        throw new Error('Can only void pending or authorized payments');
    }
    
    this.status = 'voided';
    this.timeline.push({
        status: 'voided',
        note: reason,
        updatedBy,
        timestamp: new Date()
    });
    
    return this.save();
};

// Static method to create payment
paymentSchema.statics.createPayment = async function(data) {
    const payment = new this(data);
    
    // Generate transaction ID
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    payment.transaction.id = `PAY-${timestamp}-${random}`;
    
    // Add initial timeline entry
    payment.timeline.push({
        status: 'created',
        note: 'Payment created',
        timestamp: new Date()
    });
    
    return payment.save();
};

// Static method to get payment by transaction ID
paymentSchema.statics.getByTransactionId = function(transactionId) {
    return this.findOne({ 'transaction.id': transactionId });
};

// Static method to get user's recent payments
paymentSchema.statics.getUserPayments = function(userId, limit = 10) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

export const Payment = mongoose.model('Payment', paymentSchema); 