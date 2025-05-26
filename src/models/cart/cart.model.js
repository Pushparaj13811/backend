import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
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
    selectedOptions: {
        type: Map,
        of: String
    },
    notes: String
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    status: {
        type: String,
        enum: ['active', 'abandoned', 'converted'],
        default: 'active'
    },
    currency: {
        type: String,
        default: 'USD'
    },
    subtotal: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
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
cartSchema.index({ user: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ expiresAt: 1 });

// Add method to calculate totals
cartSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.tax = this.subtotal * 0.1; // 10% tax rate, adjust as needed
    this.total = this.subtotal + this.tax + this.shipping - this.discount;
    return this;
};

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
    this.calculateTotals();
    this.lastUpdated = new Date();
    next();
});

export const Cart = mongoose.model('Cart', cartSchema); 