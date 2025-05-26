import mongoose, { Schema } from 'mongoose';

const cartItemSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    selectedOptions: [{
        name: String,
        value: String
    }],
    addedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    items: [cartItemSchema],
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    
    // Pricing
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    shipping: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Applied Promotions
    appliedPromotions: [{
        promotion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Promotion'
        },
        discount: Number,
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Delivery Options
    delivery: {
        method: {
            type: String,
            enum: ['pickup', 'delivery', 'shipping'],
            default: 'pickup'
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address'
        },
        preferredTime: {
            date: Date,
            timeSlot: String
        },
        instructions: String
    },
    
    // Status
    status: {
        type: String,
        enum: ['active', 'converted', 'abandoned'],
        default: 'active',
        index: true
    },
    
    // Analytics
    analytics: {
        lastActivity: {
            type: Date,
            default: Date.now
        },
        itemCount: {
            type: Number,
            default: 0
        },
        viewCount: {
            type: Number,
            default: 0
        }
    }
    
}, {
    timestamps: true,
    indexes: [
        { user: 1, status: 1 },
        { store: 1, status: 1 },
        { 'analytics.lastActivity': -1 }
    ]
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate tax (example rate of 8%)
    this.tax = this.subtotal * 0.08;
    
    // Calculate shipping based on delivery method
    if (this.delivery.method === 'shipping') {
        this.shipping = this.subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    } else {
        this.shipping = 0;
    }
    
    // Calculate total
    this.total = this.subtotal + this.tax + this.shipping;
    
    // Apply promotion discounts
    if (this.appliedPromotions.length > 0) {
        const totalDiscount = this.appliedPromotions.reduce((sum, promo) => sum + promo.discount, 0);
        this.total -= totalDiscount;
    }
    
    return {
        subtotal: this.subtotal,
        tax: this.tax,
        shipping: this.shipping,
        total: this.total
    };
};

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, options = []) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    
    if (!product) {
        throw new Error('Product not found');
    }
    
    // Check if product is already in cart
    const existingItem = this.items.find(item => 
        item.product.toString() === productId.toString()
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.lastUpdated = new Date();
    } else {
        this.items.push({
            product: productId,
            quantity,
            price: product.pricing.basePrice,
            selectedOptions: options,
            addedAt: new Date(),
            lastUpdated: new Date()
        });
    }
    
    this.calculateTotals();
    this.analytics.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.analytics.lastActivity = new Date();
    
    return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => 
        item.product.toString() !== productId.toString()
    );
    
    this.calculateTotals();
    this.analytics.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.analytics.lastActivity = new Date();
    
    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = function(productId, quantity) {
    const item = this.items.find(item => 
        item.product.toString() === productId.toString()
    );
    
    if (item) {
        item.quantity = quantity;
        item.lastUpdated = new Date();
        this.calculateTotals();
        this.analytics.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.analytics.lastActivity = new Date();
    }
    
    return this.save();
};

// Method to clear cart
cartSchema.methods.clear = function() {
    this.items = [];
    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.total = 0;
    this.appliedPromotions = [];
    this.analytics.itemCount = 0;
    this.analytics.lastActivity = new Date();
    
    return this.save();
};

// Method to convert cart to order
cartSchema.methods.convertToOrder = async function() {
    if (this.items.length === 0) {
        throw new Error('Cannot convert empty cart to order');
    }
    
    const Order = mongoose.model('Order');
    
    const order = new Order({
        user: this.user,
        store: this.store,
        items: this.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price,
            options: item.selectedOptions
        })),
        subtotal: this.subtotal,
        tax: this.tax,
        shipping: this.shipping,
        total: this.total,
        delivery: this.delivery,
        appliedPromotions: this.appliedPromotions
    });
    
    this.status = 'converted';
    await this.save();
    
    return order.save();
};

export const Cart = mongoose.model('Cart', cartSchema); 