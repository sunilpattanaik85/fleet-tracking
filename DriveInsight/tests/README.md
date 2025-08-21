# Tests

Run: npm run test

Notes:
- NODE_ENV=test disables CSRF middleware for API testing.
- Supertest uses registerRoutes to bootstrap the app without binding a port.