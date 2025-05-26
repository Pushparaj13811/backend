// =============================================
// PRODUCT SCHEMA - /models/product/product.model.js
// =============================================

import mongoose, { Schema } from 'mongoose';

// Nutrition Information Schema
const nutritionSchema = new Schema({
    servingSize: { type: String, required: true },
    servingsPerContainer: { type: Number },
    calories: { type: Number, required: true },
    caloriesFromFat: { type: Number },
    totalFat: { grams: Number, dailyValue: Number },
    saturatedFat: { grams: Number, dailyValue: Number },
    transFat: { grams: Number },
    cholesterol: { mg: Number, dailyValue: Number },
    sodium: { mg: Number, dailyValue: Number },
    totalCarbohydrates: { grams: Number, dailyValue: Number },
    dietaryFiber: { grams: Number, dailyValue: Number },
    sugars: { grams: Number },
    protein: { grams: Number, dailyValue: Number },
    vitaminA: { dailyValue: Number },
    vitaminC: { dailyValue: Number },
    calcium: { dailyValue: Number },
    iron: { dailyValue: Number },
    additionalNutrients: [{
        name: String,
        amount: String,
        dailyValue: Number
    }]
});

// Inventory Schema
const inventorySchema = new Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },
    barcode: {
        upc: String,
        ean: String,
        isbn: String
    },
    quantity: {
        available: { type: Number, required: true, min: 0, default: 0 },
        reserved: { type: Number, default: 0 },
        damaged: { type: Number, default: 0 },
        expired: { type: Number, default: 0 }
    },
    reorderLevel: { type: Number, required: true, default: 10 },
    maxStockLevel: { type: Number, required: true, default: 1000 },
    location: {
        aisle: String,
        shelf: String,
        bin: String,
        warehouse: String
    },
    lastRestocked: { type: Date },
    nextDeliveryExpected: { type: Date }
}, { timestamps: true });

// Product Schema
const productSchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    
    // Categorization
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    subcategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    
    // Pricing
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        salePrice: {
            type: Number,
            min: 0
        },
        costPrice: {
            type: Number,
            min: 0
        },
        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true
        }
    },
    
    // Inventory
    inventory: inventorySchema,
    
    // Media
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    videos: [{
        url: String,
        type: {
            type: String,
            enum: ['youtube', 'vimeo', 'direct']
        },
        thumbnail: String
    }],
    
    // Specifications
    specifications: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        unit: String,
        group: String
    }],
    
    // Variants
    variants: [{
        name: String,
        sku: String,
        attributes: [{
            name: String,
            value: String
        }],
        pricing: {
            basePrice: Number,
            salePrice: Number
        },
        inventory: {
            quantity: Number,
            reserved: Number
        },
        images: [{
            url: String,
            publicId: String
        }]
    }],
    
    // Nutrition Information
    nutrition: nutritionSchema,
    
    // Shipping
    shipping: {
        weight: {
            value: Number,
            unit: {
                type: String,
                enum: ['kg', 'g', 'lb', 'oz'],
                default: 'kg'
            }
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
                type: String,
                enum: ['cm', 'm', 'in', 'ft'],
                default: 'cm'
            }
        },
        freeShipping: {
            type: Boolean,
            default: false
        },
        restrictions: [{
            type: String,
            enum: ['hazmat', 'fragile', 'temperature-controlled', 'oversized']
        }]
    },
    
    // SEO
    seo: {
        title: String,
        description: String,
        keywords: [String],
        canonicalUrl: String
    },
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'discontinued'],
        default: 'draft',
        index: true
    },
    analytics: {
        viewCount: {
            type: Number,
            default: 0
        },
        purchaseCount: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            default: 0
        },
        lastUpdated: Date
    }
    
}, {
    timestamps: true,
    indexes: [
        { slug: 1 },
        { category: 1 },
        { 'inventory.sku': 1 },
        { status: 1 },
        { 'pricing.basePrice': 1 },
        { 'analytics.averageRating': -1 }
    ]
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
    return this.inventory.quantity.available > 0;
};

// Method to update inventory
productSchema.methods.updateInventory = function(quantity, type = 'available') {
    if (!['available', 'reserved', 'damaged', 'expired'].includes(type)) {
        throw new Error('Invalid inventory type');
    }
    
    this.inventory.quantity[type] = Math.max(0, this.inventory.quantity[type] + quantity);
    this.inventory.lastRestocked = new Date();
    
    return this.save();
};

// Method to calculate discount percentage
productSchema.methods.getDiscountPercentage = function() {
    if (!this.pricing.salePrice) return 0;
    return Math.round(((this.pricing.basePrice - this.pricing.salePrice) / this.pricing.basePrice) * 100);
};

// Method to update analytics
productSchema.methods.updateAnalytics = async function(type) {
    switch (type) {
        case 'view':
            this.analytics.viewCount += 1;
            break;
        case 'purchase':
            this.analytics.purchaseCount += 1;
            break;
        case 'review':
            const reviews = await this.model('Review').find({ product: this._id });
            this.analytics.reviewCount = reviews.length;
            this.analytics.averageRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0) / reviews.length;
            break;
    }
    
    this.analytics.lastUpdated = new Date();
    return this.save();
};

export const Product = mongoose.model('Product', productSchema);
