// ===== INVENTORY SCHEMA =====
const inventorySchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Only if product has variants
    },
    sku: {
        type: String,
        required: true,
        uppercase: true,
        index: true
    },
    
    // Stock Information
    stock: {
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        reserved: {
            type: Number,
            default: 0,
            min: 0
        },
        committed: {
            type: Number,
            default: 0,
            min: 0
        },
        available: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    
    // Thresholds
    thresholds: {
        low: {
            type: Number,
            default: 10,
            min: 0
        },
        critical: {
            type: Number,
            default: 5,
            min: 0
        },
        reorder: {
            type: Number,
            default: 20,
            min: 0
        }
    },
    
    // Location Information
    location: {
        warehouse: String,
        zone: String,
        aisle: String,
        shelf: String,
        bin: String
    },
    
    // Cost Information
    cost: {
        average: {
            type: Number,
            min: 0
        },
        last: {
            type: Number,
            min: 0
        },
        standard: {
            type: Number,
            min: 0
        }
    },
    
    // Supplier Information
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        index: true
    },
    
    // Movement History
    movements: [{
        type: {
            type: String,
            enum: ['in', 'out', 'adjustment', 'transfer', 'return'],
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        reason: String,
        reference: String, // Order ID, Transfer ID, etc.
        timestamp: {
            type: Date,
            default: Date.now
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Batch/Lot Information
    batches: [{
        batchNumber: String,
        quantity: Number,
        expiryDate: Date,
        manufacturedDate: Date,
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier'
        }
    }],
    
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active',
        index: true
    },
    
    // Alerts
    alerts: [{
        type: {
            type: String,
            enum: ['low-stock', 'critical-stock', 'expired', 'expiring-soon']
        },
        message: String,
        acknowledged: {
            type: Boolean,
            default: false
        },
        acknowledgedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acknowledgedAt: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
    
}, { 
    timestamps: true,
    indexes: [
        { product: 1, variant: 1 },
        { sku: 1 },
        { 'stock.quantity': 1, status: 1 },
        { supplier: 1, status: 1 },
        { 'movements.timestamp': -1 }
    ]
});

// Virtual for available stock
inventorySchema.virtual('availableStock').get(function() {
    return this.stock.quantity - this.stock.reserved - this.stock.committed;
});

// Method to update stock levels
inventorySchema.methods.updateStock = function(quantity, type, reason, user) {
    this.movements.push({
        type,
        quantity,
        reason,
        user,
        timestamp: new Date()
    });
    
    if (type === 'in') {
        this.stock.quantity += quantity;
    } else if (type === 'out') {
        this.stock.quantity = Math.max(0, this.stock.quantity - quantity);
    } else if (type === 'adjustment') {
        this.stock.quantity = Math.max(0, quantity);
    }
    
    this.stock.available = this.availableStock;
    
    // Check for alerts
    this.checkStockAlerts();
    
    return this.save();
};

// Method to check and create stock alerts
inventorySchema.methods.checkStockAlerts = function() {
    const availableStock = this.availableStock;
    
    // Remove existing stock alerts
    this.alerts = this.alerts.filter(alert => 
        !['low-stock', 'critical-stock'].includes(alert.type)
    );
    
    if (availableStock <= this.thresholds.critical) {
        this.alerts.push({
            type: 'critical-stock',
            message: `Critical stock level: ${availableStock} units remaining`
        });
    } else if (availableStock <= this.thresholds.low) {
        this.alerts.push({
            type: 'low-stock',
            message: `Low stock level: ${availableStock} units remaining`
        });
    }
};

export const Inventory = mongoose.model('Inventory', inventorySchema);
