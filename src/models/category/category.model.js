// ===== CATEGORY SCHEMA =====
import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';

const categorySchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters']
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
        default: 0,
        min: 0
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
    banner: {
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
        required: {
            type: Boolean,
            default: false
        },
        options: [String], // For select/multiselect types
        validation: {
            min: Number,
            max: Number,
            pattern: String
        }
    }],
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active',
        index: true
    },
    analytics: {
        productCount: {
            type: Number,
            default: 0
        },
        viewCount: {
            type: Number,
            default: 0
        },
        lastUpdated: Date
    }
    
}, {
    timestamps: true,
    indexes: [
        { slug: 1 },
        { parent: 1 },
        { ancestors: 1 },
        { status: 1 },
        { 'analytics.productCount': -1 }
    ]
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Method to get full path
categorySchema.methods.getFullPath = function() {
    return this.ancestors.map(ancestor => ancestor.name).concat(this.name).join(' > ');
};

// Method to check if category is leaf
categorySchema.methods.isLeaf = async function() {
    const childCount = await this.model('Category').countDocuments({ parent: this._id });
    return childCount === 0;
};

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
    const count = await this.model('Product').countDocuments({ category: this._id });
    this.analytics.productCount = count;
    this.analytics.lastUpdated = new Date();
    return this.save();
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function() {
    const categories = await this.find().sort('level name');
    const tree = [];
    const map = {};

    categories.forEach(category => {
        map[category._id] = category;
        category.children = [];
    });

    categories.forEach(category => {
        if (category.parent) {
            map[category.parent].children.push(category);
        } else {
            tree.push(category);
        }
    });

    return tree;
};

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
