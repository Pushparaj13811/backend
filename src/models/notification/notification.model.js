import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Notification Content
    type: {
        type: String,
        enum: [
            'order_status',
            'price_alert',
            'stock_alert',
            'promotion',
            'delivery',
            'review',
            'system',
            'security'
        ],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    
    // Action & Data
    action: {
        type: {
            type: String,
            enum: ['link', 'button', 'none'],
            default: 'none'
        },
        label: String,
        url: String,
        data: Schema.Types.Mixed
    },
    
    // Priority & Delivery
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    channels: [{
        type: {
            type: String,
            enum: ['email', 'sms', 'push', 'in-app'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'delivered', 'read'],
            default: 'pending'
        },
        sentAt: Date,
        deliveredAt: Date,
        readAt: Date,
        error: String
    }],
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read', 'archived'],
        default: 'pending',
        index: true
    },
    readAt: Date,
    archivedAt: Date,
    
    // Expiration
    expiresAt: Date,
    
    // Related Entities
    relatedTo: {
        type: {
            type: String,
            enum: ['order', 'product', 'promotion', 'review', 'user']
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedTo.type'
        }
    },
    
    // Analytics
    analytics: {
        deliveryAttempts: {
            type: Number,
            default: 0
        },
        lastAttempt: Date,
        openCount: {
            type: Number,
            default: 0
        },
        clickCount: {
            type: Number,
            default: 0
        }
    }
    
}, {
    timestamps: true,
    indexes: [
        { user: 1, status: 1 },
        { type: 1, status: 1 },
        { priority: 1, status: 1 },
        { createdAt: -1 },
        { expiresAt: 1 }
    ]
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
    this.status = 'read';
    this.readAt = new Date();
    this.channels = this.channels.map(channel => ({
        ...channel,
        status: channel.status === 'delivered' ? 'read' : channel.status,
        readAt: channel.status === 'delivered' ? new Date() : channel.readAt
    }));
    
    return this.save();
};

// Method to mark notification as archived
notificationSchema.methods.archive = function() {
    this.status = 'archived';
    this.archivedAt = new Date();
    return this.save();
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status, error = null) {
    const channelIndex = this.channels.findIndex(c => c.type === channel);
    
    if (channelIndex !== -1) {
        this.channels[channelIndex].status = status;
        
        switch (status) {
            case 'sent':
                this.channels[channelIndex].sentAt = new Date();
                break;
            case 'delivered':
                this.channels[channelIndex].deliveredAt = new Date();
                break;
            case 'read':
                this.channels[channelIndex].readAt = new Date();
                break;
            case 'failed':
                this.channels[channelIndex].error = error;
                break;
        }
        
        this.analytics.deliveryAttempts += 1;
        this.analytics.lastAttempt = new Date();
        
        // Update overall status
        if (status === 'delivered') {
            this.status = 'delivered';
        } else if (status === 'read') {
            this.status = 'read';
            this.readAt = new Date();
        }
    }
    
    return this.save();
};

// Method to track notification interaction
notificationSchema.methods.trackInteraction = function(interactionType) {
    switch (interactionType) {
        case 'open':
            this.analytics.openCount += 1;
            break;
        case 'click':
            this.analytics.clickCount += 1;
            break;
    }
    
    return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
    const notification = new this(data);
    
    // Set expiration if not provided
    if (!notification.expiresAt) {
        notification.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
    
    return notification.save();
};

// Static method to get user's unread notifications
notificationSchema.statics.getUnreadNotifications = function(userId) {
    return this.find({
        user: userId,
        status: { $in: ['pending', 'sent', 'delivered'] },
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

// Static method to get user's recent notifications
notificationSchema.statics.getRecentNotifications = function(userId, limit = 10) {
    return this.find({
        user: userId,
        status: { $ne: 'archived' },
        expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const Notification = mongoose.model('Notification', notificationSchema); 