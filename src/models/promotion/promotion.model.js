import mongoose, { Schema } from 'mongoose';

const promotionSchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Promotion name is required'],
        trim: true,
        maxlength: [100, 'Promotion name cannot exceed 100 characters']
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Type & Rules
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'free-shipping', 'buy-one-get-one', 'bundle'],
        required: true,
        index: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    minimumPurchase: {
        type: Number,
        default: 0,
        min: 0
    },
    maximumDiscount: {
        type: Number,
        min: 0
    },
    
    // Eligibility
    eligibility: {
        customerGroups: [{
            type: String,
            enum: ['all', 'new', 'returning', 'vip', 'wholesale']
        }],
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }],
        brands: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand'
        }],
        paymentMethods: [{
            type: String,
            enum: ['card', 'paypal', 'bank-transfer', 'cash-on-delivery', 'wallet']
        }]
    },
    
    // Usage Limits
    usage: {
        perCustomer: {
            type: Number,
            default: 1,
            min: 1
        },
        totalUses: {
            type: Number,
            min: 0
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    
    // Time Period
    validity: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        activeDays: [{
            type: Number,
            min: 0,
            max: 6
        }],
        activeHours: {
            start: {
                type: String,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            },
            end: {
                type: String,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            }
        }
    },
    
    // Bundle Details (for bundle type promotions)
    bundle: {
        products: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }],
        discount: {
            type: Number,
            min: 0
        }
    },
    
    // Stacking Rules
    stacking: {
        allowWithOtherPromotions: {
            type: Boolean,
            default: false
        },
        excludedPromotions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Promotion'
        }]
    },
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired', 'scheduled'],
        default: 'scheduled',
        index: true
    },
    analytics: {
        totalOrders: {
            type: Number,
            default: 0
        },
        totalDiscount: {
            type: Number,
            default: 0
        },
        averageDiscount: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number,
            default: 0
        }
    }
    
}, {
    timestamps: true,
    indexes: [
        { code: 1 },
        { status: 1, 'validity.startDate': 1, 'validity.endDate': 1 },
        { type: 1, status: 1 },
        { 'eligibility.customerGroups': 1, status: 1 },
        { 'analytics.totalOrders': -1 }
    ]
});

// Method to check if promotion is valid
promotionSchema.methods.isValid = function() {
    const now = new Date();
    return (
        this.status === 'active' &&
        now >= this.validity.startDate &&
        now <= this.validity.endDate &&
        (!this.usage.totalUses || this.usage.usedCount < this.usage.totalUses)
    );
};

// Method to check if promotion is applicable to an order
promotionSchema.methods.isApplicable = async function(order) {
    if (!this.isValid()) return false;
    
    // Check minimum purchase
    if (order.subtotal < this.minimumPurchase) return false;
    
    // Check customer group eligibility
    if (this.eligibility.customerGroups.length > 0) {
        if (!this.eligibility.customerGroups.includes(order.customer.group)) {
            return false;
        }
    }
    
    // Check product eligibility
    if (this.eligibility.products.length > 0) {
        const orderProductIds = order.items.map(item => item.product.toString());
        if (!orderProductIds.some(id => this.eligibility.products.includes(id))) {
            return false;
        }
    }
    
    return true;
};

// Method to calculate discount
promotionSchema.methods.calculateDiscount = function(order) {
    if (!this.isApplicable(order)) return 0;
    
    let discount = 0;
    
    switch (this.type) {
        case 'percentage':
            discount = order.subtotal * (this.value / 100);
            break;
        case 'fixed':
            discount = this.value;
            break;
        case 'free-shipping':
            discount = order.shipping;
            break;
        // Add more cases for other promotion types
    }
    
    // Apply maximum discount if set
    if (this.maximumDiscount && discount > this.maximumDiscount) {
        discount = this.maximumDiscount;
    }
    
    return discount;
};

export const Promotion = mongoose.model('Promotion', promotionSchema); 