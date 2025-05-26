// =============================================
// PRODUCT SCHEMA - /models/product/product.model.js
// =============================================

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

const pricingSchema = new Schema({
    basePrice: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative']
    },
    costPrice: {
        type: Number,
        required: true,
        min: [0, 'Cost price cannot be negative'],
        select: false
    },
    pricePerUnit: {
        value: Number,
        unit: {
            type: String,
            enum: ['per_lb', 'per_kg', 'per_oz', 'per_piece', 'per_gallon', 'per_liter']
        }
    },
    bulkPricing: [{
        minQuantity: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true },
        discountPercentage: { type: Number }
    }],
    memberPrice: { type: Number },
    priceHistory: [{
        price: Number,
        effectiveDate: Date,
        reason: String
    }]
});

const productSchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters'],
        index: 'text'
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
        index: 'text'
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    
    // Classification
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true,
        index: true
    },
    
    // Product Details
    productType: {
        type: String,
        enum: ['grocery', 'produce', 'meat', 'dairy', 'frozen', 'bakery', 'deli', 'pharmacy', 'household'],
        required: true,
        index: true
    },
    perishable: {
        type: Boolean,
        default: false,
        index: true
    },
    organic: {
        type: Boolean,
        default: false,
        index: true
    },
    glutenFree: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Inventory Management
    inventory: inventorySchema,
    
    // Pricing
    pricing: pricingSchema,
    
    // Physical Properties
    package: {
        weight: {
            value: { type: Number, required: true },
            unit: { type: String, enum: ['oz', 'lb', 'g', 'kg'], required: true }
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: { type: String, enum: ['in', 'cm'], default: 'in' }
        },
        volume: {
            value: Number,
            unit: { type: String, enum: ['ml', 'l', 'fl_oz', 'gal'] }
        },
        packSize: {
            type: String,
            description: 'e.g., 6-pack, family size, etc.'
        }
    },
    
    // Nutritional Information
    nutrition: nutritionSchema,
    
    // Ingredients and Allergens
    ingredients: [{
        name: { type: String, required: true },
        percentage: Number,
        order: { type: Number, required: true }
    }],
    allergens: [{
        type: String,
        enum: ['milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soybeans', 'sesame']
    }],
    
    // Expiration and Storage
    storage: {
        temperature: {
            type: String,
            enum: ['frozen', 'refrigerated', 'room_temperature'],
            default: 'room_temperature'
        },
        shelfLife: {
            value: Number,
            unit: { type: String, enum: ['days', 'weeks', 'months', 'years'] }
        },
        storageInstructions: String
    },
    
    // Media
    images: [{
        url: { type: String, required: true },
        alt: String,
        publicId: String,
        isPrimary: { type: Boolean, default: false },
        type: { type: String, enum: ['product', 'nutrition', 'ingredients'], default: 'product' }
    }],
    
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued', 'seasonal', 'out_of_stock'],
        default: 'active',
        index: true
    },
    availability: {
        inStore: { type: Boolean, default: true },
        online: { type: Boolean, default: true },
        delivery: { type: Boolean, default: true },
        pickup: { type: Boolean, default: true }
    },
    
    // Supplier Information
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
        index: true
    },
    supplierProductCode: String,
    
    // Analytics
    analytics: {
        views: { type: Number, default: 0 },
        searches: { type: Number, default: 0 },
        addedToCart: { type: Number, default: 0 },
        purchased: { type: Number, default: 0 },
        rating: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 }
        }
    },
    
    // Seasonal and Promotional
    seasonal: {
        isseasonal: { type: Boolean, default: false },
        season: {
            type: String,
            enum: ['spring', 'summer', 'fall', 'winter', 'holiday']
        },
        availableMonths: [Number] // 1-12 for Jan-Dec
    },
    
    // Related Products
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    alternatives: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    
    // Compliance
    certifications: [{
        type: String,
        enum: ['usda_organic', 'non_gmo', 'fair_trade', 'kosher', 'halal', 'rainforest_alliance']
    }],
    
    // Store Specific
    storeSpecific: [{
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        localPrice: Number,
        localAvailability: Boolean,
        localPromotions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Promotion'
        }]
    }]
    
}, { 
    timestamps: true,
    versionKey: true,
    indexes: [
        { name: 'text', description: 'text' },
        { category: 1, status: 1 },
        { brand: 1, status: 1 },
        { productType: 1, status: 1 },
        { 'pricing.basePrice': 1 },
        { perishable: 1, organic: 1 },
        { 'inventory.sku': 1 },
        { supplier: 1 },
        { status: 1, availability: 1 },
        { 'analytics.rating.average': -1 }
    ]
});

const Product = mongoose.model('Product', productSchema);
