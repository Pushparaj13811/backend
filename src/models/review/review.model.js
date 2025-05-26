import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
    // Basic Information
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    
    // Review Content
    rating: {
        overall: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        categories: {
            quality: {
                type: Number,
                min: 1,
                max: 5
            },
            value: {
                type: Number,
                min: 1,
                max: 5
            },
            freshness: {
                type: Number,
                min: 1,
                max: 5
            },
            packaging: {
                type: Number,
                min: 1,
                max: 5
            }
        }
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [2000, 'Review content cannot exceed 2000 characters']
    },
    
    // Media
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: String,
        alt: String,
        isVerified: {
            type: Boolean,
            default: false
        }
    }],
    
    // Verification
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Helpfulness
    helpfulness: {
        helpful: {
            type: Number,
            default: 0,
            min: 0
        },
        notHelpful: {
            type: Number,
            default: 0,
            min: 0
        },
        voters: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            vote: {
                type: String,
                enum: ['helpful', 'not-helpful']
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    
    // Response
    response: {
        content: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date,
        isPublic: {
            type: Boolean,
            default: true
        }
    },
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending',
        index: true
    },
    rejectionReason: String,
    
    // Moderation
    moderation: {
        flaggedBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            reason: {
                type: String,
                enum: [
                    'inappropriate',
                    'spam',
                    'fake',
                    'offensive',
                    'irrelevant',
                    'duplicate'
                ]
            },
            flaggedAt: {
                type: Date,
                default: Date.now
            }
        }],
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderatedAt: Date,
        notes: String
    }
    
}, {
    timestamps: true,
    indexes: [
        { product: 1, user: 1 },
        { product: 1, status: 1 },
        { 'rating.overall': -1 },
        { isVerified: 1, status: 1 },
        { createdAt: -1 }
    ]
});

// Method to calculate helpfulness score
reviewSchema.methods.getHelpfulnessScore = function() {
    const total = this.helpfulness.helpful + this.helpfulness.notHelpful;
    if (total === 0) return 0;
    return (this.helpfulness.helpful / total) * 100;
};

// Method to check if user has already voted
reviewSchema.methods.hasUserVoted = function(userId) {
    return this.helpfulness.voters.some(voter => 
        voter.user.toString() === userId.toString()
    );
};

// Method to add a vote
reviewSchema.methods.addVote = function(userId, vote) {
    if (this.hasUserVoted(userId)) {
        throw new Error('User has already voted on this review');
    }
    
    this.helpfulness.voters.push({
        user: userId,
        vote,
        votedAt: new Date()
    });
    
    if (vote === 'helpful') {
        this.helpfulness.helpful += 1;
    } else {
        this.helpfulness.notHelpful += 1;
    }
};

// Method to flag review
reviewSchema.methods.flagReview = function(userId, reason) {
    this.moderation.flaggedBy.push({
        user: userId,
        reason,
        flaggedAt: new Date()
    });
    
    if (this.moderation.flaggedBy.length >= 3) {
        this.status = 'flagged';
    }
};

// Pre-save middleware to update product rating
reviewSchema.pre('save', async function(next) {
    if (this.isModified('rating.overall') || this.isModified('status')) {
        const Product = mongoose.model('Product');
        const product = await Product.findById(this.product);
        
        if (product) {
            const reviews = await this.constructor.find({
                product: this.product,
                status: 'approved'
            });
            
            const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0);
            const averageRating = totalRating / reviews.length;
            
            product.analytics.rating = {
                average: averageRating,
                count: reviews.length
            };
            
            await product.save();
        }
    }
    next();
});

export const Review = mongoose.model('Review', reviewSchema); 