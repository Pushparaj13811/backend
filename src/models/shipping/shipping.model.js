import mongoose, { Schema } from 'mongoose';

const shippingSchema = new Schema({
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
    
    // Shipping Details
    method: {
        type: {
            type: String,
            enum: ['standard', 'express', 'overnight', 'pickup', 'same-day'],
            required: true
        },
        carrier: {
            type: String,
            required: true,
            enum: ['ups', 'fedex', 'dhl', 'usps', 'local', 'custom']
        },
        service: {
            type: String,
            required: true
        },
        cost: {
            type: Number,
            required: true,
            min: 0
        },
        estimatedDays: {
            type: Number,
            required: true,
            min: 0
        }
    },
    
    // Address Information
    address: {
        type: {
            type: String,
            enum: ['residential', 'commercial', 'pickup'],
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        instructions: String
    },
    
    // Package Information
    package: {
        weight: {
            value: Number,
            unit: {
                type: String,
                enum: ['kg', 'lb'],
                default: 'kg'
            }
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
                type: String,
                enum: ['cm', 'in'],
                default: 'cm'
            }
        },
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            weight: Number,
            dimensions: {
                length: Number,
                width: Number,
                height: Number
            }
        }]
    },
    
    // Tracking Information
    tracking: {
        number: {
            type: String,
            unique: true,
            sparse: true
        },
        status: {
            type: String,
            enum: [
                'pending',
                'label_created',
                'picked_up',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'failed',
                'returned'
            ],
            default: 'pending',
            index: true
        },
        history: [{
            status: String,
            location: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            description: String
        }],
        estimatedDelivery: Date,
        actualDelivery: Date,
        carrierTrackingUrl: String
    },
    
    // Insurance & Protection
    insurance: {
        value: Number,
        provider: String,
        policyNumber: String,
        coverage: {
            type: String,
            enum: ['basic', 'standard', 'premium']
        }
    },
    
    // Customs Information
    customs: {
        required: {
            type: Boolean,
            default: false
        },
        declaration: {
            type: String,
            enum: ['gift', 'commercial', 'sample', 'return']
        },
        value: Number,
        currency: String,
        items: [{
            description: String,
            quantity: Number,
            value: Number,
            countryOfOrigin: String,
            hsCode: String
        }]
    },
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'failed', 'returned'],
        default: 'pending',
        index: true
    },
    analytics: {
        processingTime: Number,
        deliveryTime: Number,
        attempts: {
            type: Number,
            default: 0
        },
        lastAttempt: Date
    }
    
}, {
    timestamps: true,
    indexes: [
        { order: 1, status: 1 },
        { user: 1, status: 1 },
        { 'tracking.number': 1 },
        { 'tracking.status': 1 },
        { 'address.coordinates': '2dsphere' },
        { createdAt: -1 }
    ]
});

// Method to update shipping status
shippingSchema.methods.updateStatus = function(status, location = '', description = '') {
    this.status = status;
    this.tracking.status = status;
    this.tracking.history.push({
        status,
        location,
        description,
        timestamp: new Date()
    });
    
    if (status === 'delivered') {
        this.tracking.actualDelivery = new Date();
    }
    
    return this.save();
};

// Method to calculate shipping cost
shippingSchema.methods.calculateShippingCost = async function() {
    // Implementation would depend on carrier API integration
    // This is a placeholder for the actual implementation
    const baseRate = 10;
    const weightRate = this.package.weight.value * 2;
    const distanceRate = 0; // Would be calculated based on distance
    
    this.method.cost = baseRate + weightRate + distanceRate;
    return this.save();
};

// Method to generate shipping label
shippingSchema.methods.generateShippingLabel = async function() {
    // Implementation would depend on carrier API integration
    // This is a placeholder for the actual implementation
    if (this.tracking.number) {
        throw new Error('Shipping label already exists');
    }
    
    // Generate tracking number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.tracking.number = `${this.method.carrier.toUpperCase()}-${timestamp}-${random}`;
    
    this.tracking.status = 'label_created';
    this.status = 'processing';
    
    return this.save();
};

// Static method to create shipping
shippingSchema.statics.createShipping = async function(data) {
    const shipping = new this(data);
    
    // Calculate initial shipping cost
    await shipping.calculateShippingCost();
    
    return shipping.save();
};

// Static method to get shipping by tracking number
shippingSchema.statics.getByTrackingNumber = function(trackingNumber) {
    return this.findOne({ 'tracking.number': trackingNumber });
};

// Static method to get active shipments
shippingSchema.statics.getActiveShipments = function() {
    return this.find({
        status: { $in: ['pending', 'processing', 'shipped'] }
    }).sort({ createdAt: -1 });
};

export const Shipping = mongoose.model('Shipping', shippingSchema); 