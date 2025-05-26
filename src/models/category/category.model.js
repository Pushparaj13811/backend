// ===== CATEGORY SCHEMA =====
import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';

const categorySchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters'],
        index: true
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
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Hierarchy
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    ancestors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    level: {
        type: Number,
        default: 0
    },
    
    // Classification
    type: {
        type: String,
        enum: ['grocery', 'produce', 'meat', 'dairy', 'frozen', 'bakery', 'deli', 'pharmacy', 'household'],
        required: true,
        index: true
    },
    
    // Display & Navigation
    displayOrder: {
        type: Number,
        default: 0
    },
    isVisible: {
        type: Boolean,
        default: true,
        index: true
    },
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Media
    image: {
        url: String,
        publicId: String,
        alt: String
    },
    icon: {
        url: String,
        publicId: String,
        alt: String
    },
    
    // SEO
    seo: {
        title: String,
        description: String,
        keywords: [String],
        canonicalUrl: String
    },
    
    // Attributes & Filters
    attributes: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'date'],
            required: true
        },
        options: [String], // For select/multiselect types
        required: {
            type: Boolean,
            default: false
        },
        searchable: {
            type: Boolean,
            default: false
        },
        filterable: {
            type: Boolean,
            default: false
        },
        displayOrder: {
            type: Number,
            default: 0
        }
    }],
    
    // Analytics
    analytics: {
        productCount: {
            type: Number,
            default: 0
        },
        viewCount: {
            type: Number,
            default: 0
        },
        lastViewed: Date
    },
    
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active',
        index: true
    }
    
}, {
    timestamps: true,
    indexes: [
        { name: 1, status: 1 },
        { parent: 1, status: 1 },
        { type: 1, status: 1 },
        { featured: 1, status: 1 },
        { 'analytics.productCount': -1 },
        { displayOrder: 1 }
    ]
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
    return this.ancestors.map(ancestor => ancestor.name).concat(this.name).join(' > ');
});

// Method to get all children categories
categorySchema.methods.getChildren = async function() {
    return await this.model('Category').find({ parent: this._id });
};

// Method to get all products in category and subcategories
categorySchema.methods.getAllProducts = async function() {
    const categories = await this.model('Category').find({
        $or: [
            { _id: this._id },
            { ancestors: this._id }
        ]
    });
    const categoryIds = categories.map(cat => cat._id);
    return await this.model('Product').find({ category: { $in: categoryIds } });
};

export const Category = mongoose.model('Category', categorySchema);
