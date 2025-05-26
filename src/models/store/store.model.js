import mongoose, { Schema } from 'mongoose';

const storeSchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Store name is required'],
        trim: true,
        maxlength: [100, 'Store name cannot exceed 100 characters']
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Location
    location: {
        address: {
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
        timezone: {
            type: String,
            required: true
        }
    },
    
    // Contact Information
    contact: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
        },
        emergency: {
            phone: String,
            email: String
        }
    },
    
    // Operating Hours
    operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
        holidays: [{
            date: Date,
            name: String,
            open: String,
            close: String
        }]
    },
    
    // Store Features
    features: {
        parking: {
            available: {
                type: Boolean,
                default: false
            },
            type: [{
                type: String,
                enum: ['street', 'lot', 'garage', 'valet']
            }],
            capacity: Number
        },
        services: [{
            type: String,
            enum: [
                'pharmacy',
                'bakery',
                'deli',
                'florist',
                'photo-center',
                'money-services',
                'customer-service',
                'returns',
                'pickup',
                'delivery'
            ]
        }],
        facilities: [{
            type: String,
            enum: [
                'restroom',
                'atm',
                'coffee-shop',
                'seating-area',
                'wheelchair-accessible',
                'baby-changing',
                'pharmacy',
                'optical'
            ]
        }]
    },
    
    // Store Management
    management: {
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        assistantManagers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        departments: [{
            name: {
                type: String,
                required: true
            },
            manager: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            staff: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }]
        }]
    },
    
    // Inventory & Sales
    inventory: {
        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse'
        },
        lastInventoryCheck: Date,
        nextInventoryCheck: Date
    },
    sales: {
        target: {
            daily: Number,
            weekly: Number,
            monthly: Number,
            yearly: Number
        },
        performance: {
            daily: Number,
            weekly: Number,
            monthly: Number,
            yearly: Number
        }
    },
    
    // Store Size & Layout
    size: {
        totalArea: {
            value: Number,
            unit: {
                type: String,
                enum: ['sq-ft', 'sq-m'],
                default: 'sq-ft'
            }
        },
        salesFloor: {
            value: Number,
            unit: {
                type: String,
                enum: ['sq-ft', 'sq-m'],
                default: 'sq-ft'
            }
        },
        storage: {
            value: Number,
            unit: {
                type: String,
                enum: ['sq-ft', 'sq-m'],
                default: 'sq-ft'
            }
        }
    },
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['active', 'inactive', 'temporary-closed', 'permanent-closed'],
        default: 'active',
        index: true
    },
    analytics: {
        customerCount: {
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
        }
    }
    
}, {
    timestamps: true,
    indexes: [
        { code: 1 },
        { 'location.coordinates': '2dsphere' },
        { status: 1 },
        { 'management.manager': 1 },
        { 'analytics.customerCount': -1 }
    ]
});

// Method to check if store is open
storeSchema.methods.isOpen = function() {
    const now = new Date();
    const day = now.toLocaleLowerCase();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    
    const hours = this.operatingHours[day];
    if (!hours || !hours.open || !hours.close) return false;
    
    return time >= hours.open && time <= hours.close;
};

// Method to get store's current operating status
storeSchema.methods.getOperatingStatus = function() {
    if (this.status !== 'active') return this.status;
    return this.isOpen() ? 'open' : 'closed';
};

// Method to get store's next opening time
storeSchema.methods.getNextOpeningTime = function() {
    const now = new Date();
    const day = now.getDay();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    
    // Check remaining hours today
    const todayHours = this.operatingHours[Object.keys(this.operatingHours)[day]];
    if (todayHours && todayHours.open && time < todayHours.open) {
        return {
            date: now,
            time: todayHours.open
        };
    }
    
    // Check next days
    for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        const nextDayHours = this.operatingHours[Object.keys(this.operatingHours)[nextDay]];
        if (nextDayHours && nextDayHours.open) {
            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + i);
            return {
                date: nextDate,
                time: nextDayHours.open
            };
        }
    }
    
    return null;
};

export const Store = mongoose.model('Store', storeSchema); 