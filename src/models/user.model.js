import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const addressSchema = new Schema({
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    street: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'State name cannot exceed 50 characters']
    },
    country: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Country name cannot exceed 50 characters']
    },
    postalCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: [20, 'Postal code cannot exceed 20 characters']
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    }
}, { timestamps: true });

const userSchema = new Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [30, 'First name must be less than 30 characters long'],
        index: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [30, 'Last name must be less than 30 characters long'],
        index: true
    },
    
    // Authentication & Security
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please use a valid email address',
        ],
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in queries by default
    },
    
    // Phone with validation
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s\-\(\)]{10,15}$/, 'Please provide a valid phone number'],
        sparse: true, // Allow multiple null values but unique non-null values
        index: true
    },
    
    // Role and Status
    role: {
        type: String,
        enum: {
            values: ['customer', 'admin', 'vendor', 'delivery-partner', 'super-admin'],
            message: 'Role must be one of: customer, admin, vendor, delivery-partner, super-admin'
        },
        default: 'customer',
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'suspended', 'pending-verification'],
            message: 'Status must be one of: active, inactive, suspended, pending-verification'
        },
        default: 'pending-verification',
        index: true
    },
    
    // Email Verification
    emailVerification: {
        isVerified: {
            type: Boolean,
            default: false,
            index: true
        },
        token: {
            type: String,
            select: false
        },
        expires: {
            type: Date,
            select: false
        },
        verifiedAt: {
            type: Date
        }
    },
    
    // Password Reset
    passwordReset: {
        token: {
            type: String,
            select: false
        },
        expires: {
            type: Date,
            select: false
        },
        lastResetAt: {
            type: Date
        }
    },
    
    // Authentication Tokens
    refreshTokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
        },
        deviceInfo: {
            userAgent: String,
            ip: String,
            deviceId: String
        }
    }],
    
    // Profile Information
    profile: {
        avatar: {
            url: String,
            publicId: String // For cloud storage reference
        },
        dateOfBirth: {
            type: Date,
            validate: {
                validator: function(v) {
                    return v < new Date();
                },
                message: 'Date of birth cannot be in the future'
            }
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say']
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        }
    },
    
    // Address Information (Embedded for better performance)
    addresses: [addressSchema],
    
    // Preferences
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true,
            minlength: 3,
            maxlength: 3
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    
    // E-commerce Specific
    cart: {
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }],
        totalItems: {
            type: Number,
            default: 0
        },
        estimatedTotal: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    
    // Wishlist
    wishlist: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Analytics and Tracking
    analytics: {
        totalOrders: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        averageOrderValue: {
            type: Number,
            default: 0
        },
        lastOrderDate: {
            type: Date
        },
        firstOrderDate: {
            type: Date
        },
        loyaltyPoints: {
            type: Number,
            default: 0
        }
    },
    
    // Security and Audit
    security: {
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date
        },
        lastLogin: {
            type: Date
        },
        lastLoginIP: {
            type: String
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            select: false
        }
    },
    
    // Relationships (Reference only essential ones)
    assignedDeliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner',
        sparse: true
    }
    
}, {
    timestamps: true,
    versionKey: '__v',
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.emailVerification;
            delete ret.passwordReset;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.emailVerification;
            delete ret.passwordReset;
            return ret;
        }
    },
    // Create indexes for better performance
    indexes: [
        { email: 1 },
        { phone: 1 },
        { role: 1, status: 1 },
        { 'emailVerification.isVerified': 1 },
        { 'cart.lastUpdated': 1 },
        { 'analytics.totalOrders': -1 },
        { 'analytics.totalSpent': -1 },
        { createdAt: -1 },
        { firstName: 1, lastName: 1 }
    ]
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for order count (if you want to keep orders separate)
userSchema.virtual('orderCount', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user',
    count: true
});

// Indexes for geospatial queries on addresses
userSchema.index({ 'addresses.coordinates': '2dsphere' });

// Compound indexes for common queries
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, 'emailVerification.isVerified': 1 });
userSchema.index({ 'analytics.totalSpent': -1, 'analytics.totalOrders': -1 });

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to update cart totals
userSchema.pre('save', function(next) {
    if (this.isModified('cart.items')) {
        this.cart.totalItems = this.cart.items.reduce((total, item) => total + item.quantity, 0);
        this.cart.lastUpdated = new Date();
    }
    next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordReset.token = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordReset.expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    this.emailVerification.token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    this.emailVerification.expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
    return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { 'security.lockUntil': 1 },
            $set: { 'security.loginAttempts': 1 }
        });
    }
    
    const updates = { $inc: { 'security.loginAttempts': 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.security.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
    return this.find({ status: 'active', 'emailVerification.isVerified': true });
};

const User = mongoose.model('User', userSchema);

export default User;