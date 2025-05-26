import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';

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
                validator: function (v) {
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

    // Address Information (Reference to Address model)
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],

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
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        }
    },

    // E-commerce Specific
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        sparse: true
    },

    // Wishlist
    wishlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wishlist',
        sparse: true
    },

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
        },
        lastLogin: {
            type: Date
        },
        loginCount: {
            type: Number,
            default: 0
        },
        sessionDuration: {
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
        lastLoginDevice: {
            userAgent: String,
            deviceId: String
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            select: false
        },
        lastPasswordChange: {
            type: Date
        },
        passwordHistory: [{
            password: {
                type: String,
                select: false
            },
            changedAt: {
                type: Date
            }
        }],
        tokenVersion: {
            type: Number,
            default: 0
        }
    },

    // Relationships
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
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.emailVerification;
            delete ret.passwordReset;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.emailVerification;
            delete ret.passwordReset;
            return ret;
        }
    }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for order count
userSchema.virtual('orderCount', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user',
    count: true
});

// Single Field Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'emailVerification.isVerified': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ updatedAt: -1 });
userSchema.index({ firstName: 1 });
userSchema.index({ lastName: 1 });

// Compound Indexes for Common Queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, 'emailVerification.isVerified': 1 });
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ status: 1, 'emailVerification.isVerified': 1 });

// Indexes for Analytics Queries
userSchema.index({ 'analytics.totalOrders': -1 });
userSchema.index({ 'analytics.totalSpent': -1 });
userSchema.index({ 'analytics.lastLogin': -1 });
userSchema.index({ 'analytics.loginCount': -1 });

// Indexes for Security and Audit
userSchema.index({ 'security.lastLogin': -1 });
userSchema.index({ 'security.loginAttempts': 1 });
userSchema.index({ 'security.lockUntil': 1 });

// Indexes for E-commerce Features
userSchema.index({ cart: 1 }, { sparse: true });
userSchema.index({ wishlist: 1 }, { sparse: true });
userSchema.index({ 'analytics.loyaltyPoints': -1 });

// Indexes for Address Queries
userSchema.index({ 'addresses.coordinates': '2dsphere' });

// Indexes for Preferences
userSchema.index({ 'preferences.language': 1 });
userSchema.index({ 'preferences.currency': 1 });
userSchema.index({ 'preferences.timezone': 1 });

// Indexes for Authentication
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ 'emailVerification.token': 1 }, { sparse: true });
userSchema.index({ 'passwordReset.token': 1 }, { sparse: true });

// Pre-save middleware for password hashing
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

        // Update password history
        if (this.security.passwordHistory.length >= 5) {
            this.security.passwordHistory.shift(); // Remove oldest password
        }
        this.security.passwordHistory.push({
            password: this.password,
            changedAt: new Date()
        });

        this.security.lastPasswordChange = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to update cart totals
userSchema.pre('save', function (next) {
    // Remove cart totals update since it's now handled in Cart model
    next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // Check if password field exists (might not be selected in query)
        if (!this.password) {
            throw new Error('Password field not selected in query');
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        return true;
    } catch (error) {
        throw new Error(`Password comparison failed: ${error.message}`);
    }
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordReset.token = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordReset.expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerification.token = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerification.expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function () {
    return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
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

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: { 'security.loginAttempts': 0 },
        $unset: { 'security.lockUntil': 1 }
    });
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function (req) {
    const now = new Date();
    this.security.lastLogin = now;
    this.security.lastLoginIP = req.ip;
    this.security.lastLoginDevice = {
        userAgent: req.headers['user-agent'] || 'unknown',
        deviceId: req.headers['x-device-id'] || 'unknown'
    };
    this.analytics.lastLogin = now;
    this.analytics.loginCount += 1;
    return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function () {
    return this.find({ status: 'active', 'emailVerification.isVerified': true });
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
    return this.find({ role, status: 'active' });
};

// Static method to find users by status
userSchema.statics.findByStatus = function (status) {
    return this.find({ status });
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function () {
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role
    };

    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN || '1d'
    });
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    const payload = {
        id: this._id,
        tokenVersion: this.security?.tokenVersion || 0
    };

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

const User = mongoose.model('User', userSchema);

export default User;