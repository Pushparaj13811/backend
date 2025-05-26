// ===== ORDER SCHEMA =====
const orderItemSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Only if product has variants
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    weight: {
        value: Number,
        unit: String
    },
    notes: String
});

const orderSchema = new Schema({
    // Order Identification
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },
    
    // Customer Information
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Order Items
    items: [orderItemSchema],
    
    // Pricing Breakdown
    pricing: {
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            amount: {
                type: Number,
                default: 0,
                min: 0
            },
            code: String,
            reason: String
        },
        tax: {
            amount: {
                type: Number,
                default: 0,
                min: 0
            },
            rate: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        shipping: {
            amount: {
                type: Number,
                default: 0,
                min: 0
            },
            method: String
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    
    // Shipping Information
    shipping: {
        address: {
            firstName: String,
            lastName: String,
            company: String,
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            phone: String
        },
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight', 'pickup'],
            default: 'standard'
        },
        carrier: String,
        trackingNumber: String,
        estimatedDelivery: Date,
        actualDelivery: Date,
        instructions: String
    },
    
    // Billing Information
    billing: {
        address: {
            firstName: String,
            lastName: String,
            company: String,
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            phone: String
        },
        sameAsShipping: {
            type: Boolean,
            default: true
        }
    },
    
    // Payment Information
    payment: {
        method: {
            type: String,
            enum: ['card', 'paypal', 'bank-transfer', 'cash-on-delivery', 'wallet'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially-refunded'],
            default: 'pending',
            index: true
        },
        transactionId: String,
        paidAt: Date,
        refundedAt: Date,
        refundAmount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    
    // Order Status
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'out-for-delivery',
            'delivered',
            'cancelled',
            'refunded',
            'returned'
        ],
        default: 'pending',
        index: true
    },
    
    // Fulfillment
    fulfillment: {
        type: {
            type: String,
            enum: ['delivery', 'pickup'],
            default: 'delivery'
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Delivery partner
        },
        pickedUpAt: Date,
        deliveredAt: Date,
        attemptedDeliveries: [{
            attemptedAt: Date,
            reason: String,
            nextAttempt: Date
        }]
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
    
    // Additional Information
    notes: String,
    internalNotes: String,
    source: {
        type: String,
        enum: ['web', 'mobile-app', 'phone', 'in-store'],
        default: 'web'
    },
    
    // Coupon/Discount Applied
    coupon: {
        code: String,
        discount: Number,
        type: {
            type: String,
            enum: ['percentage', 'fixed']
        }
    },
    
    // Returns & Exchanges
    returns: [{
        items: [{
            orderItem: mongoose.Schema.Types.ObjectId,
            quantity: Number,
            reason: String
        }],
        status: {
            type: String,
            enum: ['requested', 'approved', 'rejected', 'completed']
        },
        requestedAt: Date,
        processedAt: Date,
        refundAmount: Number
    }]
    
}, { 
    timestamps: true,
    indexes: [
        { customer: 1, createdAt: -1 },
        { orderNumber: 1 },
        { status: 1, createdAt: -1 },
        { 'payment.status': 1, createdAt: -1 },
        { 'fulfillment.assignedTo': 1, status: 1 },
        { createdAt: -1 }
    ]
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 3).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);
