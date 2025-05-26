# API Development Guidelines

This document provides comprehensive guidelines for developing APIs in our Node.js/Express application.

## Table of Contents
1. [Project Structure](#project-structure)
2. [API Development Workflow](#api-development-workflow)
3. [Code Organization](#code-organization)
4. [Best Practices](#best-practices)
5. [Security Guidelines](#security-guidelines)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation Guidelines](#documentation-guidelines)

## Project Structure

```
src/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middlewares/        # Custom middleware
├── models/            # Database models
├── repositories/      # Data access layer
├── routes/            # Route definitions
├── services/          # Business logic
├── utils/             # Utility functions
└── validations/       # Request validation schemas
```

## API Development Workflow

### 1. Define the Route
Create a new route file in `src/routes/`:

```javascript
import { Router } from 'express';
import { YourController } from '../controllers/YourController.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { yourValidationSchema } from '../validations/your.validation.js';
import { authenticate } from '../middlewares/authenticate.js';
import { generalLimiter } from '../utils/rate-limiter.js';

const router = Router();
const controller = new YourController();

// Public routes
router.get('/public-endpoint', generalLimiter, controller.publicMethod);

// Protected routes
router.post(
  '/protected-endpoint',
  authenticate,
  generalLimiter,
  validateRequest(yourValidationSchema),
  controller.protectedMethod
);

export default router;
```

### 2. Create Validation Schema
Create a validation file in `src/validations/`:

```javascript
import Joi from 'joi';

export const yourValidationSchema = Joi.object({
  field1: Joi.string().required(),
  field2: Joi.number().min(0).required(),
  // Add more validations
});
```

### 3. Implement Controller
Create a controller in `src/controllers/`:

```javascript
import { YourService } from '../services/YourService.js';

export class YourController {
  constructor() {
    this.service = new YourService();
  }

  async yourMethod(req, res, next) {
    try {
      const result = await this.service.yourMethod(req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### 4. Implement Service
Create a service in `src/services/`:

```javascript
import { YourRepository } from '../repositories/YourRepository.js';

export class YourService {
  constructor() {
    this.repository = new YourRepository();
  }

  async yourMethod(data) {
    // Implement business logic
    return await this.repository.yourMethod(data);
  }
}
```

### 5. Implement Repository
Create a repository in `src/repositories/`:

```javascript
import { YourModel } from '../models/your.model.js';

export class YourRepository {
  async yourMethod(data) {
    // Implement data access logic
    return await YourModel.create(data);
  }
}
```

## Code Organization

### 1. Route Organization
- Group related routes together
- Use appropriate HTTP methods
- Apply middleware in the correct order
- Use route parameters for resource identification

### 2. Controller Organization
- One controller per resource
- Methods should be focused and single-purpose
- Use async/await for asynchronous operations
- Implement proper error handling

### 3. Service Organization
- Implement business logic
- Handle data validation
- Manage transactions
- Coordinate between repositories

### 4. Repository Organization
- Handle data access
- Implement CRUD operations
- Manage database queries
- Handle data mapping

## Best Practices

### 1. Error Handling
```javascript
// In middleware/error-handler.js
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
```

### 2. Response Format
```javascript
// Success Response
{
  "success": true,
  "data": {
    // Your data here
  }
}

// Error Response
{
  "success": false,
  "message": "Error message",
  "error": "Error details (development only)"
}
```

### 3. Rate Limiting
```javascript
// Apply rate limiting to routes
router.use('/api', generalLimiter);
router.use('/api/auth', authLimiter);
```

### 4. Validation
```javascript
// Use Joi for request validation
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});
```

## Security Guidelines

### 1. Authentication
- Use JWT for authentication
- Implement refresh token mechanism
- Store tokens securely
- Implement token blacklisting

### 2. Authorization
- Implement role-based access control
- Use middleware for route protection
- Validate user permissions
- Implement resource ownership checks

### 3. Data Protection
- Sanitize user input
- Use parameterized queries
- Implement request size limits
- Use HTTPS only

### 4. Rate Limiting
- Implement IP-based rate limiting
- Use Redis for distributed rate limiting
- Configure appropriate limits
- Handle rate limit errors

## Testing Guidelines

### 1. Unit Tests
- Test individual components
- Mock dependencies
- Test edge cases
- Maintain high coverage

### 2. Integration Tests
- Test component interactions
- Test database operations
- Test API endpoints
- Test error scenarios

### 3. API Tests
- Test request/response cycle
- Test authentication
- Test validation
- Test error handling

## Documentation Guidelines

### 1. API Documentation
- Document all endpoints
- Include request/response examples
- Document error scenarios
- Include authentication requirements

### 2. Code Documentation
- Use JSDoc comments
- Document complex logic
- Include usage examples
- Document dependencies

### 3. README
- Include setup instructions
- Document environment variables
- Include API usage examples
- Document deployment process

## Example API Implementation

Here's a complete example of implementing a user registration API:

1. Route (`src/routes/user.routes.js`):
```javascript
router.post(
  '/register',
  registerLimiter,
  validateRequest(registerSchema),
  userController.register
);
```

2. Validation (`src/validations/user.validation.js`):
```javascript
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});
```

3. Controller (`src/controllers/UserController.js`):
```javascript
async register(req, res, next) {
  try {
    const user = await this.userService.register(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}
```

4. Service (`src/services/UserService.js`):
```javascript
async register(userData) {
  const existingUser = await this.userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }
  return await this.userRepository.create(userData);
}
```

5. Repository (`src/repositories/UserRepository.js`):
```javascript
async create(userData) {
  return await User.create(userData);
}
```

Remember to:
- Follow the project structure
- Implement proper error handling
- Use appropriate middleware
- Follow security guidelines
- Write tests
- Document your code 