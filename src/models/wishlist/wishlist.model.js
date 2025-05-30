import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    notes: String,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    priceAlert: {
        enabled: {
            type: Boolean,
            default: false
        },
        targetPrice: Number,
        lastChecked: Date
    }
});

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    items: [wishlistItemSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Sharing
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        permission: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        },
        sharedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Analytics
    analytics: {
        viewCount: {
            type: Number,
            default: 0
        },
        lastViewed: Date,
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Add indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ user: 1, isDefault: 1 });
wishlistSchema.index({ isPublic: 1 });
wishlistSchema.index({ 'analytics.lastUpdated': -1 });
wishlistSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to ensure only one default wishlist per user
wishlistSchema.pre('save', async function(next) {
    if (this.isDefault) {
        const Wishlist = mongoose.model('Wishlist');
        await Wishlist.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = async function(productId, options = {}) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    
    if (!product) {
        throw new Error('Product not found');
    }
    
    // Check if product is already in wishlist
    const existingItem = this.items.find(item => 
        item.product.toString() === productId.toString()
    );
    
    if (existingItem) {
        throw new Error('Product already in wishlist');
    }
    
    this.items.push({
        product: productId,
        store: product.store,
        ...options,
        addedAt: new Date()
    });
    
    this.analytics.lastUpdated = new Date();
    
    return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => 
        item.product.toString() !== productId.toString()
    );
    
    this.analytics.lastUpdated = new Date();
    
    return this.save();
};

// Method to update item
wishlistSchema.methods.updateItem = function(productId, updates) {
    const item = this.items.find(item => 
        item.product.toString() === productId.toString()
    );
    
    if (item) {
        Object.assign(item, updates);
        this.analytics.lastUpdated = new Date();
    }
    
    return this.save();
};

// Method to move item to cart
wishlistSchema.methods.moveToCart = async function(productId, quantity = 1) {
    const Cart = mongoose.model('Cart');
    const item = this.items.find(item => 
        item.product.toString() === productId.toString()
    );
    
    if (!item) {
        throw new Error('Item not found in wishlist');
    }
    
    // Get or create user's cart
    let cart = await Cart.findOne({
        user: this.user,
        status: 'active'
    });
    
    if (!cart) {
        cart = new Cart({
            user: this.user,
            store: item.store
        });
    }
    
    // Add item to cart
    await cart.addItem(item.product, quantity);
    
    // Remove from wishlist
    await this.removeItem(productId);
    
    return cart;
};

// Method to share wishlist
wishlistSchema.methods.shareWith = function(userId, permission = 'view') {
    const existingShare = this.sharedWith.find(share => 
        share.user.toString() === userId.toString()
    );
    
    if (existingShare) {
        existingShare.permission = permission;
        existingShare.sharedAt = new Date();
    } else {
        this.sharedWith.push({
            user: userId,
            permission,
            sharedAt: new Date()
        });
    }
    
    return this.save();
};

// Method to unshare wishlist
wishlistSchema.methods.unshareWith = function(userId) {
    this.sharedWith = this.sharedWith.filter(share => 
        share.user.toString() !== userId.toString()
    );
    
    return this.save();
};

// Method to check price alerts
wishlistSchema.methods.checkPriceAlerts = async function() {
    const Product = mongoose.model('Product');
    const alerts = [];
    
    for (const item of this.items) {
        if (item.priceAlert.enabled) {
            const product = await Product.findById(item.product);
            
            if (product && product.pricing.basePrice <= item.priceAlert.targetPrice) {
                alerts.push({
                    product: product._id,
                    currentPrice: product.pricing.basePrice,
                    targetPrice: item.priceAlert.targetPrice
                });
            }
            
            item.priceAlert.lastChecked = new Date();
        }
    }
    
    await this.save();
    return alerts;
};

export const Wishlist = mongoose.model('Wishlist', wishlistSchema); 