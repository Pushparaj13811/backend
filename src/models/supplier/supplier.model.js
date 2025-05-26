import mongoose from 'mongoose';
import { AppError } from '../../utils/errors/AppError.js';

// ===== SUPPLIER SCHEMA =====
const supplierSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true,
        minlength: [2, 'Supplier name must be at least 2 characters long'],
        maxlength: [100, 'Supplier name cannot exceed 100 characters'],
        index: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    legalName: {
        type: String,
        trim: true,
        maxlength: [150, 'Legal name cannot exceed 150 characters']
    },
    type: {
        type: String,
        enum: ['manufacturer', 'distributor', 'wholesaler', 'local-vendor', 'importer', 'drop-shipper'],
        required: true,
        index: true
    },
    
    // Business Registration
    registration: {
        businessNumber: String,
        taxId: String,
        vatNumber: String,
        licenseNumber: String,
        registrationCountry: String,
        registrationDate: Date
    },
    
    // Contact Information  
    contact: {
        primary: {
            name: {
                type: String,
                required: true,
                trim: true
            },
            title: String,
            email: {
                type: String,
                required: true,
                lowercase: true,
                match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
            },
            phone: {
                type: String,
                required: true
            },
            mobile: String,
            extension: String
        },
        accounts: {
            name: String,
            email: {
                type: String,
                lowercase: true,
                match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
            },
            phone: String
        },
        support: {
            name: String,
            email: {
                type: String,
                lowercase: true,
                match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
            },
            phone: String,
            hours: String
        },
        emergency: {
            name: String,
            phone: String,
            available24h: {
                type: Boolean,
                default: false
            }
        }
    },
    
    // Address Information
    addresses: {
        billing: {
            street: {
                type: String,
                required: true,
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
            }
        },
        shipping: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            sameAsBilling: {
                type: Boolean,
                default: true
            }
        },
        warehouse: [{
            name: String,
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            isPrimary: {
                type: Boolean,
                default: false
            },
            operatingHours: {
                monday: String,
                tuesday: String,
                wednesday: String,
                thursday: String,
                friday: String,
                saturday: String,
                sunday: String
            }
        }]
    },
    
    // Financial Information
    financial: {
        currency: {
            type: String,
            default: 'USD',
            uppercase: true,
            minlength: 3,
            maxlength: 3
        },
        paymentTerms: {
            type: String,
            enum: ['NET-30', 'NET-15', 'NET-7', 'COD', 'CIA', '2/10-NET-30'],
            default: 'NET-30'
        },
        creditLimit: {
            type: Number,
            min: 0,
            default: 0
        },
        currentBalance: {
            type: Number,
            default: 0
        },
        bankDetails: {
            bankName: String,
            accountNumber: {
                type: String,
                select: false // Sensitive information
            },
            routingNumber: {
                type: String,
                select: false
            },
            iban: {
                type: String,
                select: false
            },
            swiftCode: String
        },
        taxSettings: {
            isTaxExempt: {
                type: Boolean,
                default: false
            },
            taxExemptNumber: String,
            taxRate: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            }
        }
    },
    
    // Business Relationship
    relationship: {
        category: {
            type: String,
            enum: ['preferred', 'standard', 'trial', 'restricted'],
            default: 'standard',
            index: true
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        contractExpiry: Date,
        exclusiveDeals: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            category: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category'
            },
            startDate: Date,
            endDate: Date,
            terms: String
        }],
        minimumOrderValue: {
            type: Number,
            min: 0,
            default: 0
        },
        leadTime: {
            standard: {
                type: Number,
                default: 7 // days
            },
            express: {
                type: Number,
                default: 3
            }
        }
    },
    
    // Performance Metrics
    performance: {
        rating: {
            overall: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            quality: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            delivery: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            service: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            pricing: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            }
        },
        statistics: {
            totalOrders: {
                type: Number,
                default: 0
            },
            totalValue: {
                type: Number,
                default: 0
            },
            averageOrderValue: {
                type: Number,
                default: 0
            },
            onTimeDeliveryRate: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            qualityRejectRate: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            lastOrderDate: Date,
            firstOrderDate: Date
        }
    },
    
    // Capabilities & Services
    capabilities: {
        deliveryMethods: [{
            type: String,
            enum: ['own-fleet', 'third-party', 'pickup', 'drop-shipping']
        }],
        minimumOrderQuantities: {
            hasMinimum: {
                type: Boolean,
                default: false
            },
            amount: Number,
            unit: String
        },
        packagingOptions: [{
            type: String,
            enum: ['bulk', 'individual', 'custom', 'eco-friendly']
        }],
        certifications: [{
            name: {
                type: String,
                required: true
            },
            number: String,
            issuedBy: String,
            issuedDate: Date,
            expiryDate: Date,
            document: {
                url: String,
                publicId: String
            }
        }],
        qualityStandards: [{
            type: String,
            enum: ['ISO-9001', 'HACCP', 'FDA', 'USDA', 'Organic', 'Fair-Trade', 'Kosher', 'Halal']
        }],
        specialServices: [{
            name: String,
            description: String,
            additionalCost: Number
        }]
    },
    
    // Product Categories Supplied
    productCategories: [{
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        isPrimary: {
            type: Boolean,
            default: false
        },
        competitiveness: {
            type: String,
            enum: ['excellent', 'good', 'average', 'poor'],
            default: 'average'
        }
    }],
    
    // Communication Preferences
    communication: {
        preferredMethod: {
            type: String,
            enum: ['email', 'phone', 'fax', 'portal'],
            default: 'email'
        },
        orderNotifications: {
            type: Boolean,
            default: true
        },
        paymentReminders: {
            type: Boolean,
            default: true
        },
        promotionalUpdates: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    
    // Documents & Contracts
    documents: [{
        type: {
            type: String,
            enum: ['contract', 'insurance', 'license', 'certification', 'tax-document', 'catalog'],
            required: true
        },
        name: {
            type: String,
            required: true
        },
        url: String,
        publicId: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        expiryDate: Date,
        version: {
            type: Number,
            default: 1
        }
    }],
    
    // Risk Assessment
    risk: {
        level: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
            index: true
        },
        factors: [{
            factor: {
                type: String,
                enum: ['financial-stability', 'geographic-location', 'single-source', 'quality-issues', 'delivery-issues']
            },
            impact: {
                type: String,
                enum: ['low', 'medium', 'high']
            },
            notes: String
        }],
        lastAssessment: Date,
        nextReview: Date,
        mitigation: [{
            strategy: String,
            implementation: String,
            status: {
                type: String,
                enum: ['planned', 'in-progress', 'completed']
            }
        }]
    },
    
    // Integration & API
    integration: {
        hasEDI: {
            type: Boolean,
            default: false
        },
        ediDetails: {
            version: String,
            testMode: {
                type: Boolean,
                default: true
            }
        },
        hasAPI: {
            type: Boolean,
            default: false
        },
        apiDetails: {
            endpoint: String,
            version: String,
            authMethod: {
                type: String,
                enum: ['api-key', 'oauth', 'basic-auth']
            },
            lastSync: Date
        },
        catalogSync: {
            enabled: {
                type: Boolean,
                default: false
            },
            frequency: {
                type: String,
                enum: ['realtime', 'hourly', 'daily', 'weekly'],
                default: 'daily'
            },
            lastSync: Date
        }
    },
    
    // Status & Workflow
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending-approval', 'suspended', 'terminated'],
        default: 'pending-approval',
        index: true
    },
    
    // Approval Workflow
    approval: {
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        approvalNotes: String,
        rejectionReason: String
    },
    
    // Audit Trail
    auditLog: [{
        action: {
            type: String,
            enum: ['created', 'updated', 'approved', 'suspended', 'reactivated', 'terminated'],
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        changes: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        notes: String,
        ipAddress: String
    }],
    
    // Additional Notes
    notes: {
        internal: {
            type: String,
            maxlength: [2000, 'Internal notes cannot exceed 2000 characters']
        },
        public: {
            type: String,
            maxlength: [1000, 'Public notes cannot exceed 1000 characters']
        }
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
    timestamps: true,
    indexes: [
        { code: 1 },
        { name: 1, status: 1 },
        { type: 1, status: 1 },
        { 'relationship.category': 1, status: 1 },
        { 'performance.rating.overall': -1, status: 1 },
        { 'risk.level': 1, status: 1 },
        { 'contact.primary.email': 1 },
        { 'financial.paymentTerms': 1, status: 1 },
        { createdAt: -1 }
    ],
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full address
supplierSchema.virtual('fullBillingAddress').get(function() {
    const addr = this.addresses.billing;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
});

// Virtual for credit utilization
supplierSchema.virtual('creditUtilization').get(function() {
    if (this.financial.creditLimit === 0) return 0;
    return (this.financial.currentBalance / this.financial.creditLimit) * 100;
});

// Virtual for overdue status
supplierSchema.virtual('isOverdue').get(function() {
    return this.financial.currentBalance < 0;
});

// Pre-save middleware to generate supplier code
supplierSchema.pre('save', function(next) {
    if (this.isNew && !this.code) {
        const prefix = this.type.toUpperCase().substring(0, 3);
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.random().toString(36).substr(2, 2).toUpperCase();
        this.code = `${prefix}-${timestamp}-${random}`;
    }
    next();
});

// Pre-save middleware to update performance metrics
supplierSchema.pre('save', function(next) {
    if (this.isModified('performance.statistics')) {
        const stats = this.performance.statistics;
        if (stats.totalOrders > 0) {
            stats.averageOrderValue = stats.totalValue / stats.totalOrders;
        }
        
        // Update overall rating based on individual ratings
        const ratings = this.performance.rating;
        const ratingFields = ['quality', 'delivery', 'service', 'pricing'];
        const validRatings = ratingFields.filter(field => ratings[field] > 0);
        
        if (validRatings.length > 0) {
            const sum = validRatings.reduce((acc, field) => acc + ratings[field], 0);
            ratings.overall = Math.round((sum / validRatings.length) * 10) / 10;
        }
    }
    next();
});

// Method to update performance rating
supplierSchema.methods.updateRating = function(ratingType, score, notes) {
    if (!['quality', 'delivery', 'service', 'pricing'].includes(ratingType)) {
        throw new Error('Invalid rating type');
    }
    
    if (score < 1 || score > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    
    this.performance.rating[ratingType] = score;
    
    // Add to audit log
    this.auditLog.push({
        action: 'updated',
        performedBy: null, // Should be set by calling function
        changes: new Map([[`performance.rating.${ratingType}`, score]]),
        notes: notes || `Updated ${ratingType} rating to ${score}`
    });
    
    return this.save();
};

// Method to assess risk level
supplierSchema.methods.assessRisk = function() {
    let riskScore = 0;
    const factors = this.risk.factors;
    
    factors.forEach(factor => {
        switch (factor.impact) {
            case 'high': riskScore += 3; break;
            case 'medium': riskScore += 2; break;
            case 'low': riskScore += 1; break;
        }
    });
    
    if (riskScore <= 3) {
        this.risk.level = 'low';
    } else if (riskScore <= 6) {
        this.risk.level = 'medium';
    } else if (riskScore <= 9) {
        this.risk.level = 'high';
    } else {
        this.risk.level = 'critical';
    }
    
    this.risk.lastAssessment = new Date();
    this.risk.nextReview = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    
    return this.save();
};

// Method to check document expiry
supplierSchema.methods.checkDocumentExpiry = function() {
    const expiringDocs = [];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    this.documents.forEach(doc => {
        if (doc.expiryDate && doc.expiryDate <= thirtyDaysFromNow) {
            expiringDocs.push({
                name: doc.name,
                type: doc.type,
                expiryDate: doc.expiryDate,
                daysUntilExpiry: Math.ceil((doc.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
            });
        }
    });
    
    this.certifications.forEach(cert => {
        if (cert.expiryDate && cert.expiryDate <= thirtyDaysFromNow) {
            expiringDocs.push({
                name: cert.name,
                type: 'certification',
                expiryDate: cert.expiryDate,
                daysUntilExpiry: Math.ceil((cert.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
            });
        }
    });
    
    return expiringDocs;
};

// Static method to find suppliers by category
supplierSchema.statics.findByCategory = function(categoryId) {
    return this.find({
        'productCategories.category': categoryId,
        status: 'active'
    }).populate('productCategories.category');
};

// Static method to find preferred suppliers
supplierSchema.statics.findPreferred = function() {
    return this.find({
        'relationship.category': 'preferred',
        status: 'active'
    });
};

// Static method to find suppliers needing review
supplierSchema.statics.findNeedingReview = function() {
    const today = new Date();
    return this.find({
        $or: [
            { 'risk.nextReview': { $lte: today } },
            { 'relationship.contractExpiry': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
        ],
        status: 'active'
    });
};

// Pre-save middleware to validate email uniqueness
supplierSchema.pre('save', async function(next) {
    if (this.isModified('contact.primary.email')) {
        const existingSupplier = await this.constructor.findOne({ 'contact.primary.email': this.contact.primary.email });
        if (existingSupplier && existingSupplier._id.toString() !== this._id.toString()) {
            throw new AppError('Email already in use', 400);
        }
    }
    next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;