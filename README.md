# Bare Minimum E-Commerce

A feature-rich, minimalist e-commerce application backend and frontend.

## Features
- Complete checkout flow with cart and payment integration (Razorpay).
- Secure Authentication with JWT (Access + Refresh tokens).
- Robust Input Validation using Zod.
- XSS Protection via DOMPurify on the frontend.
- Modularized architecture separating Routes, Services, and Middleware.
- Logistics tracking and automated ETA estimation.
- Admin dashboard.

## Project Structure
- `src/server.js`: Application entry point.
- `src/app.js`: Express app configuration.
- `src/routes/`: API endpoint definitions (auth, products, orders, admin, payments).
- `src/services/`: External integrations (Email via Ethereal, Logistics).
- `src/middleware/`: Security and validation middleware (JWT Auth, Zod Validation, Error Handling).
- `public/`: Frontend static assets (HTML, CSS, JS).
- `prisma/`: Database schema and migrations.
- `tests/`: Jest integration tests.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your secrets.
   ```bash
   cp .env.example .env
   ```
   *Required variables:* `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

3. **Database Setup**
   ```bash
   npx prisma db push
   npm run seed
   ```

4. **Start the Server**
   ```bash
   npm run dev   # For development
   npm start     # For production
   ```

## Security Improvements
This project has recently been refactored for better security and maintainability:
- **XSS Prevention**: Integrated DOMPurify across all frontend files.
- **Secure Password Resets**: Uses cryptographically secure tokens emailed via Ethereal, instead of returning passwords directly.
- **Architectural Modularity**: Split monolithic files for better testability and maintainability.
- **Fail-Fast Configuration**: The server will not start if required security keys are missing.
