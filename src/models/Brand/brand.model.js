// ===== BRAND SCHEMA =====
const brandSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Brand name cannot exceed 100 characters'],
        index: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    logo: {
        url: String,
        publicId: String,
        alt: String
    },
    website: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    },
    
    // Contact Information
    contact: {
        email: {
            type: String,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
        },
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        }
    },
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        index: true
    },
    productCount: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
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
        { isPopular: -1, productCount: -1 }
    ]
});

export const Brand = mongoose.model('Brand', brandSchema);
