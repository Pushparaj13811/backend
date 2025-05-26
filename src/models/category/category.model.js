// ===== CATEGORY SCHEMA =====
import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema({
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
        trim: true,
        index: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        url: String,
        publicId: String,
        alt: String
    },
    icon: String,
    
    // Hierarchical structure
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
        index: true
    },
    level: {
        type: Number,
        default: 0,
        min: 0,
        max: 5 // Limit nesting depth
    },
    path: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    
    // SEO & Display
    seo: {
        metaTitle: {
            type: String,
            maxlength: [60, 'Meta title cannot exceed 60 characters']
        },
        metaDescription: {
            type: String,
            maxlength: [160, 'Meta description cannot exceed 160 characters']
        },
        keywords: [String]
    },
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active',
        index: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    productCount: {
        type: Number,
        default: 0
    },
    isPopular: {
        type: Boolean,
        default: false,
        index: true
    }
}, { 
    timestamps: true,
    indexes: [
        { name: 1, status: 1 },
        { parent: 1, sortOrder: 1 },
        { slug: 1 },
        { isPopular: -1, productCount: -1 }
    ]
});

// Virtual for full path names
categorySchema.virtual('fullPath', {
    ref: 'Category',
    localField: 'path',
    foreignField: '_id'
});

// Virtual for children count
categorySchema.virtual('childrenCount', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent',
    count: true
});

export const Category = mongoose.model('Category', categorySchema);
