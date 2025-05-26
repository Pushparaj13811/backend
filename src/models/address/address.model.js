import mongoose, { Schema } from 'mongoose';

const addressSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Address Type
    type: {
        type: String,
        enum: ['billing', 'shipping', 'both'],
        required: true
    },
    
    // Address Details
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    apartment: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        required: true,
        trim: true
    },
    
    // Contact Information
    phone: {
        type: String,
        required: true,
        match: [/^\+?[\d\s\-\(\)]{10,15}$/, 'Please provide a valid phone number']
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    
    // Location
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            index: '2dsphere'
        }
    },
    
    // Additional Information
    instructions: {
        type: String,
        maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active',
        index: true
    },
    
    // Analytics
    analytics: {
        usageCount: {
            type: Number,
            default: 0
        },
        lastUsed: Date
    }
    
}, {
    timestamps: true,
    indexes: [
        { user: 1, type: 1 },
        { user: 1, isDefault: 1 },
        { 'coordinates.coordinates': '2dsphere' },
        { status: 1 }
    ]
});

// Method to set as default address
addressSchema.methods.setAsDefault = async function() {
    // Remove default status from other addresses
    await this.constructor.updateMany(
        { user: this.user, type: this.type },
        { $set: { isDefault: false } }
    );
    
    this.isDefault = true;
    return this.save();
};

// Method to verify address
addressSchema.methods.verify = function() {
    this.isVerified = true;
    return this.save();
};

// Method to archive address
addressSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

// Static method to get user's default address
addressSchema.statics.getDefaultAddress = function(userId, type) {
    return this.findOne({
        user: userId,
        type,
        isDefault: true,
        status: 'active'
    });
};

// Static method to get user's active addresses
addressSchema.statics.getUserAddresses = function(userId, type = null) {
    const query = {
        user: userId,
        status: 'active'
    };
    
    if (type) {
        query.type = type;
    }
    
    return this.find(query).sort({ isDefault: -1, createdAt: -1 });
};

export const Address = mongoose.model('Address', addressSchema); 