import mongoose, { Schema } from 'mongoose';
import { AppError } from '../../utils/errors/AppError.js';

const warehouseSchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Warehouse name is required'],
        trim: true,
        minlength: [2, 'Warehouse name must be at least 2 characters long'],
        maxlength: [100, 'Warehouse name cannot exceed 100 characters']
    },
    code: {
        type: String,
        required: [true, 'Warehouse code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [2, 'Warehouse code must be at least 2 characters long'],
        maxlength: [10, 'Warehouse code cannot exceed 10 characters']
    },
    type: {
        type: String,
        enum: ['main', 'regional', 'distribution', 'retail', 'other'],
        default: 'main'
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
                required: [true, 'Street address is required'],
                trim: true
            },
            city: {
                type: String,
                required: [true, 'City is required'],
                trim: true
            },
            state: {
                type: String,
                required: [true, 'State is required'],
                trim: true
            },
            country: {
                type: String,
                required: [true, 'Country is required'],
                trim: true
            },
            postalCode: {
                type: String,
                required: [true, 'Postal code is required'],
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
        }
    },
    
    // Contact Information
    contact: {
        name: {
            type: String,
            required: [true, 'Contact person name is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            validate: {
                validator: function(v) {
                    return /^\+?[\d\s-]{10,}$/.test(v);
                },
                message: 'Please provide a valid phone number'
            }
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: 'Please provide a valid email address'
            }
        }
    },
    
    // Warehouse Details
    details: {
        type: {
            type: String,
            enum: ['distribution', 'fulfillment', 'cold-storage', 'hazmat', 'general'],
            required: true
        },
        size: {
            totalArea: {
                value: Number,
                unit: {
                    type: String,
                    enum: ['sq-ft', 'sq-m'],
                    default: 'sq-ft'
                }
            },
            storageArea: {
                value: Number,
                unit: {
                    type: String,
                    enum: ['sq-ft', 'sq-m'],
                    default: 'sq-ft'
                }
            }
        },
        capacity: {
            total: {
                type: Number,
                required: [true, 'Total capacity is required'],
                min: [0, 'Total capacity cannot be negative']
            },
            unit: {
                type: String,
                enum: ['sqft', 'sqm', 'pallets', 'units'],
                default: 'sqft'
            }
        },
        features: [{
            type: String,
            enum: [
                'temperature-controlled',
                'hazardous-materials',
                'cross-docking',
                'loading-docks',
                'security-system',
                'cctv',
                'fire-protection',
                'other'
            ]
        }]
    },
    
    // Storage Zones
    zones: [{
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            uppercase: true
        },
        type: {
            type: String,
            enum: ['bulk', 'rack', 'shelf', 'cold', 'hazmat', 'special'],
            required: true
        },
        capacity: {
            total: Number,
            used: Number
        },
        temperature: {
            min: Number,
            max: Number,
            unit: {
                type: String,
                enum: ['celsius', 'fahrenheit'],
                default: 'celsius'
            }
        },
        restrictions: [{
            type: String,
            enum: ['flammable', 'hazmat', 'temperature-sensitive', 'high-value']
        }]
    }],
    
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
    
    // Inventory Management
    inventory: {
        products: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 0
            },
            location: {
                zone: String,
                aisle: String,
                rack: String,
                shelf: String,
                bin: String
            },
            lastCounted: Date,
            nextCount: Date
        }],
        lastFullInventory: Date,
        nextFullInventory: Date
    },
    
    // Shipping & Receiving
    shipping: {
        dockDoors: [{
            number: String,
            type: {
                type: String,
                enum: ['receiving', 'shipping', 'both']
            },
            status: {
                type: String,
                enum: ['available', 'in-use', 'maintenance']
            }
        }],
        carriers: [{
            name: String,
            account: String,
            contact: {
                name: String,
                phone: String,
                email: String
            }
        }]
    },
    
    // Equipment
    equipment: [{
        type: {
            type: String,
            enum: ['forklift', 'pallet-jack', 'conveyor', 'sorter', 'scanner'],
            required: true
        },
        identifier: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['available', 'in-use', 'maintenance'],
            default: 'available'
        },
        lastMaintenance: Date,
        nextMaintenance: Date
    }],
    
    // Staff
    staff: {
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        supervisors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        workers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    
    // Status & Analytics
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'closed'],
        default: 'active',
        index: true
    },
    analytics: {
        throughput: {
            daily: Number,
            weekly: Number,
            monthly: Number
        },
        accuracy: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        },
        efficiency: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    
    // Additional Fields
    notes: {
        type: String,
        trim: true
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
        { 'location.coordinates': '2dsphere' },
        { status: 1 },
        { 'details.type': 1, status: 1 },
        { 'analytics.throughput.monthly': -1 }
    ],
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Method to check if warehouse is open
warehouseSchema.methods.isOpen = function() {
    const now = new Date();
    const day = now.toLocaleLowerCase();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    
    const hours = this.operatingHours[day];
    if (!hours || !hours.open || !hours.close) return false;
    
    return time >= hours.open && time <= hours.close;
};

// Method to get available capacity
warehouseSchema.methods.getAvailableCapacity = function() {
    return {
        value: this.details.capacity.total.value - this.details.capacity.used.value,
        unit: this.details.capacity.total.unit
    };
};

// Method to get capacity utilization percentage
warehouseSchema.methods.getCapacityUtilization = function() {
    return (this.details.capacity.used.value / this.details.capacity.total.value) * 100;
};

// Method to find available storage location
warehouseSchema.methods.findAvailableLocation = function(product) {
    // Find suitable zone based on product requirements
    const suitableZone = this.zones.find(zone => {
        // Check temperature requirements
        if (product.storage.temperature) {
            const temp = product.storage.temperature;
            if (temp < zone.temperature.min || temp > zone.temperature.max) {
                return false;
            }
        }
        
        // Check restrictions
        if (product.restrictions) {
            return product.restrictions.every(r => zone.restrictions.includes(r));
        }
        
        return true;
    });
    
    if (!suitableZone) return null;
    
    // Find available space in the zone
    if (suitableZone.capacity.used >= suitableZone.capacity.total) {
        return null;
    }
    
    return {
        zone: suitableZone.code,
        aisle: 'A' + Math.floor(Math.random() * 10),
        rack: 'R' + Math.floor(Math.random() * 10),
        shelf: 'S' + Math.floor(Math.random() * 10),
        bin: 'B' + Math.floor(Math.random() * 10)
    };
};

// Virtual for full address
warehouseSchema.virtual('fullAddress').get(function() {
    return `${this.location.address.street}, ${this.location.address.city}, ${this.location.address.state} ${this.location.address.postalCode}, ${this.location.address.country}`;
});

// Pre-save middleware to validate code uniqueness
warehouseSchema.pre('save', async function(next) {
    if (this.isModified('code')) {
        const existingWarehouse = await this.constructor.findOne({ code: this.code });
        if (existingWarehouse && existingWarehouse._id.toString() !== this._id.toString()) {
            throw new AppError('Warehouse code already in use', 400);
        }
    }
    next();
});

export const Warehouse = mongoose.model('Warehouse', warehouseSchema); 