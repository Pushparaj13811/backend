# Supermarket Application Models Documentation

This document provides a comprehensive overview of all models used in the supermarket application. Each model is designed following SOLID principles and includes comprehensive features for scalability and maintainability.

## Table of Contents
1. [User Model](#user-model)
2. [Product Model](#product-model)
3. [Order Model](#order-model)
4. [Cart Model](#cart-model)
5. [Wishlist Model](#wishlist-model)
6. [Address Model](#address-model)
7. [Payment Model](#payment-model)
8. [Shipping Model](#shipping-model)
9. [Store Model](#store-model)
10. [Warehouse Model](#warehouse-model)
11. [Supplier Model](#supplier-model)
12. [Promotion Model](#promotion-model)
13. [Notification Model](#notification-model)
14. [Review Model](#review-model)

## User Model
Location: `src/models/user.model.js`

The User model manages all user-related information and authentication.

### Key Features
- Basic Information (name, email, phone)
- Authentication & Security
- Role-based Access Control
- Profile Information
- Address Management
- Preferences
- Analytics

### Methods
- Authentication methods
- Profile management
- Address management
- Preference management

## Product Model
Location: `src/models/product/product.model.js`

The Product model handles all product-related information and inventory management.

### Key Features
- Basic Information (name, description, SKU)
- Classification (categories, brands)
- Pricing (base price, sale price, bulk pricing)
- Inventory Management
- Physical Properties
- Nutritional Information
- Media Management
- Supplier Information
- Analytics

### Sub-schemas
- Nutrition Schema
- Inventory Schema
- Pricing Schema

### Methods
- Inventory management
- Price calculation
- Availability checking
- Analytics tracking

## Order Model
Location: `src/models/order/order.model.js`

The Order model manages all order-related information and processing.

### Key Features
- Order Identification
- Customer Information
- Order Items
- Pricing Breakdown
- Shipping Information
- Billing Information
- Payment Information
- Order Status
- Fulfillment
- Timeline
- Returns & Exchanges

### Methods
- Order status management
- Payment processing
- Shipping management
- Returns processing

## Cart Model
Location: `src/models/cart/cart.model.js`

The Cart model manages shopping cart functionality.

### Key Features
- User Reference
- Cart Items
- Store Reference
- Pricing
- Applied Promotions
- Delivery Options
- Status
- Analytics

### Methods
- Add/remove items
- Update quantities
- Calculate totals
- Apply promotions
- Convert to order

## Wishlist Model
Location: `src/models/wishlist/wishlist.model.js`

The Wishlist model manages user wishlists and price alerts.

### Key Features
- User Reference
- Wishlist Items
- Sharing Options
- Price Alerts
- Analytics

### Methods
- Add/remove items
- Share/unshare
- Price alert management
- Move to cart

## Address Model
Location: `src/models/address/address.model.js`

The Address model manages user addresses for shipping and billing.

### Key Features
- User Reference
- Address Type
- Address Details
- Contact Information
- Location Coordinates
- Status
- Analytics

### Methods
- Set as default
- Verify address
- Archive address
- Get user addresses

## Payment Model
Location: `src/models/payment/payment.model.js`

The Payment model handles all payment-related transactions.

### Key Features
- Order Reference
- Payment Details
- Transaction Information
- Refund Management
- Security & Verification
- Timeline
- Analytics

### Methods
- Process payment
- Handle refunds
- Update status
- Security checks

## Shipping Model
Location: `src/models/shipping/shipping.model.js`

The Shipping model manages delivery and shipping operations.

### Key Features
- Order Reference
- Shipping Details
- Address Information
- Package Information
- Tracking Information
- Insurance & Protection
- Customs Information
- Analytics

### Methods
- Calculate shipping cost
- Generate shipping label
- Track delivery
- Update status

## Store Model
Location: `src/models/store/store.model.js`

The Store model manages physical store locations.

### Key Features
- Basic Information
- Location
- Contact Information
- Operating Hours
- Store Features
- Management
- Inventory & Sales
- Analytics

### Methods
- Check operating status
- Manage inventory
- Track sales
- Handle staff

## Warehouse Model
Location: `src/models/warehouse/warehouse.model.js`

The Warehouse model manages inventory storage and distribution.

### Key Features
- Basic Information
- Storage Zones
- Operating Hours
- Inventory Management
- Shipping & Receiving
- Equipment
- Staff
- Analytics

### Methods
- Manage inventory
- Track shipments
- Handle equipment
- Monitor capacity

## Supplier Model
Location: `src/models/supplier/supplier.model.js`

The Supplier model manages supplier information and relationships.

### Key Features
- Basic Information
- Contact Information
- Address Information
- Financial Information
- Performance Metrics
- Communication Preferences
- Documents & Contracts

### Methods
- Track performance
- Manage contracts
- Handle communications
- Monitor metrics

## Promotion Model
Location: `src/models/promotion/promotion.model.js`

The Promotion model manages discounts and special offers.

### Key Features
- Basic Information
- Type & Rules
- Eligibility
- Usage Limits
- Time Period
- Bundle Details
- Stacking Rules
- Analytics

### Methods
- Check validity
- Apply promotions
- Track usage
- Calculate discounts

## Notification Model
Location: `src/models/notification/notification.model.js`

The Notification model manages user notifications.

### Key Features
- User Reference
- Notification Content
- Action & Data
- Priority & Delivery
- Status
- Analytics

### Methods
- Send notifications
- Track delivery
- Mark as read
- Archive notifications

## Review Model
Location: `src/models/review/review.model.js`

The Review model manages product reviews and ratings.

### Key Features
- Product Reference
- User Reference
- Rating
- Content
- Verification
- Helpfulness
- Response
- Status

### Methods
- Submit review
- Update review
- Track helpfulness
- Moderate content

## Database Indexes
Each model includes carefully designed indexes to optimize query performance:

1. **User Model**
   - Email (unique)
   - Phone (sparse)
   - Role

2. **Product Model**
   - SKU (unique)
   - Status
   - Supplier
   - Categories

3. **Order Model**
   - Order Number (unique)
   - Customer
   - Status
   - Payment Status

4. **Cart Model**
   - User
   - Store
   - Status

5. **Wishlist Model**
   - User
   - Default Status
   - Public Status

6. **Address Model**
   - User
   - Type
   - Default Status
   - Coordinates (2dsphere)

7. **Payment Model**
   - Transaction ID (unique)
   - Order
   - Status

8. **Shipping Model**
   - Tracking Number (unique)
   - Order
   - Status
   - Coordinates (2dsphere)

9. **Store Model**
   - Code (unique)
   - Status
   - Coordinates (2dsphere)

10. **Warehouse Model**
    - Code (unique)
    - Status
    - Capacity

11. **Supplier Model**
    - Code (unique)
    - Status
    - Performance

12. **Promotion Model**
    - Code (unique)
    - Status
    - Validity Period

13. **Notification Model**
    - User
    - Status
    - Priority

14. **Review Model**
    - Product
    - User
    - Status

## Best Practices
1. All models follow SOLID principles
2. Comprehensive validation and error handling
3. Proper indexing for performance optimization
4. Timestamps for tracking creation and updates
5. Soft deletion where applicable
6. Proper relationship management
7. Analytics tracking for business intelligence
8. Security measures for sensitive data
9. Proper documentation and comments
10. Consistent naming conventions

## Security Considerations
1. Password hashing and security
2. Sensitive data protection
3. Role-based access control
4. Input validation
5. Data encryption where needed
6. Audit trails
7. Rate limiting
8. Session management
9. API security
10. Regular security audits

## Performance Optimization
1. Proper indexing
2. Query optimization
3. Caching strategies
4. Pagination
5. Data aggregation
6. Efficient relationship handling
7. Regular maintenance
8. Monitoring and logging
9. Load balancing
10. Database optimization

## Maintenance
1. Regular updates
2. Security patches
3. Performance monitoring
4. Data backup
5. Error tracking
6. Logging
7. Documentation updates
8. Code reviews
9. Testing
10. Deployment procedures 