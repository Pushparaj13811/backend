import mongoose from 'mongoose';
import { AppError } from '../../utils/errors/AppError.js';

// ===== INVENTORY SCHEMA =====
const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required']
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: [true, 'Warehouse reference is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack'],
        default: 'pcs'
    },
    location: {
        aisle: {
            type: String,
            trim: true
        },
        rack: {
            type: String,
            trim: true
        },
        shelf: {
            type: String,
            trim: true
        },
        bin: {
            type: String,
            trim: true
        }
    },
    batchNumber: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'damaged', 'quarantine'],
        default: 'available'
    },
    minimumStock: {
        type: Number,
        min: [0, 'Minimum stock cannot be negative'],
        default: 0
    },
    maximumStock: {
        type: Number,
        min: [0, 'Maximum stock cannot be negative']
    },
    reorderPoint: {
        type: Number,
        min: [0, 'Reorder point cannot be negative']
    },
    lastStockCount: {
        date: Date,
        quantity: Number,
        discrepancy: Number
    },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ status: 1 });
inventorySchema.index({ 'location.aisle': 1, 'location.rack': 1, 'location.shelf': 1, 'location.bin': 1 });
inventorySchema.index({ expiryDate: 1 });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
    if (this.quantity <= 0) return 'out-of-stock';
    if (this.quantity <= this.reorderPoint) return 'low-stock';
    if (this.quantity >= this.maximumStock) return 'overstocked';
    return 'normal';
});

// Pre-save middleware to validate stock levels
inventorySchema.pre('save', function(next) {
    if (this.maximumStock && this.quantity > this.maximumStock) {
        throw new AppError('Quantity cannot exceed maximum stock level', 400);
    }
    if (this.reorderPoint && this.reorderPoint > this.maximumStock) {
        throw new AppError('Reorder point cannot be greater than maximum stock', 400);
    }
    next();
});

// Static method to find low stock items
inventorySchema.statics.findLowStock = function() {
    return this.find({
        $expr: {
            $and: [
                { $gt: ['$reorderPoint', 0] },
                { $lte: ['$quantity', '$reorderPoint'] }
            ]
        }
    });
};

// Static method to find expired items
inventorySchema.statics.findExpired = function() {
    return this.find({
        expiryDate: { $lt: new Date() }
    });
};

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
