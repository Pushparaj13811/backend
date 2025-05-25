# Backend API Service

## Overview
This is a scalable backend service built with Node.js and Express, following SOLID principles and best practices for enterprise applications.

## Architecture
The application follows a clean architecture pattern with the following layers:
- Controllers: Handle HTTP requests and responses
- Services: Contain business logic
- Repositories: Handle data access
- Models: Define data structures
- Middlewares: Handle cross-cutting concerns
- Utils: Common utility functions

## Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Express middlewares
├── models/         # Data models
├── repositories/   # Data access layer
├── routes/         # API routes
├── services/       # Business logic
└── utils/          # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.sample` to `.env` and configure your environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: JWT secret key
- `CORS_ORIGIN`: Allowed CORS origin

## API Documentation
API documentation is available at `/api-docs` when running the server.

## Development
- `npm run dev`: Start development server
- `npm run lint`: Run ESLint
- `npm run test`: Run tests
- `npm run build`: Build for production

## Production
- `npm start`: Start production server
- `npm run build`: Build the application

## Error Handling
The application implements a centralized error handling system with proper error logging and client-friendly error messages.

## Logging
Logging is implemented using Winston with different log levels for development and production environments.

## Security
- CORS enabled
- Rate limiting
- Helmet for security headers
- JWT authentication
- Input validation
- XSS protection

## Testing
- Unit tests with Jest
- Integration tests
- API tests

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License. 