# Authentication Module - Implementation Guide

## Overview

This document describes the complete authentication module implementation for the Schedula API. The authentication system supports:
- **Email + Password** authentication with bcrypt hashing
- **Google OAuth 2.0** authentication
- **JWT-based** authorization with role-based access control

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `@nestjs/jwt` - JWT token generation and validation
- `@nestjs/passport` - Passport.js integration
- `passport-jwt` - JWT strategy for Passport
- `passport-google-oauth20` - Google OAuth strategy
- `bcrypt` - Password hashing
- `zod` - Schema validation
- `@prisma/client` - ORM for database access

### 2. Configure Environment Variables

Create a `.env` file in the `apps/backend-ts` directory:

```bash
cp .env.example .env
```

Update the values:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/schedula"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

### 3. Setup Prisma

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if creating fresh database)
npx prisma migrate dev --name init
```

### 4. Start the Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### POST /auth/signup

Create a new user account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Cases:**
- `400 Bad Request` - Email already in use
- `400 Bad Request` - Invalid email format
- `400 Bad Request` - Password less than 8 characters

### POST /auth/signin

Authenticate with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Cases:**
- `401 Unauthorized` - Invalid credentials

### GET /auth/google

Initiate Google OAuth flow.

**Response:**
Redirects to Google OAuth consent screen.

### GET /auth/google/callback

Google OAuth callback endpoint.

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

When successful, the user is automatically created or linked to their existing account.

### GET /auth/me

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "userId": "uuid-string",
  "role": "USER"
}
```

**Error Cases:**
- `401 Unauthorized` - Missing or invalid token

## JWT Token Structure

The JWT token contains the following claims:

```json
{
  "sub": "user-uuid",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Lifespan:** 24 hours

## Usage Examples

### Using AuthGuard to Protect Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/guards/auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get('data')
  @UseGuards(AuthGuard)
  getProtectedData() {
    return { data: 'sensitive' };
  }
}
```

### Using RolesGuard for Role-Based Access

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/guards/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('ADMIN')
  getUsers() {
    return { users: [] };
  }
}
```

### Accessing User Info in Controllers

```typescript
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from './auth/guards/auth.guard';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  @Get()
  getProfile(@Req() req: any) {
    const userId = req.user.userId;
    const role = req.user.role;
    return { userId, role };
  }
}
```

## Architecture

### Directory Structure

```
src/
├── modules/auth/
│   ├── strategies/
│   │   ├── jwt.strategy.ts       # JWT validation strategy
│   │   └── google.strategy.ts    # Google OAuth strategy
│   ├── guards/
│   │   ├── auth.guard.ts         # JWT auth guard
│   │   ├── roles.guard.ts        # Role-based access guard
│   │   └── roles.decorator.ts    # @Roles() decorator
│   ├── dto/
│   │   ├── signup.dto.ts         # Signup validation schema
│   │   ├── signin.dto.ts         # Signin validation schema
│   │   └── auth-response.dto.ts  # Auth response types
│   ├── auth.controller.ts        # API endpoints
│   ├── auth.service.ts           # Business logic
│   ├── auth.module.ts            # Module configuration
│   └── index.ts                  # Barrel export
├── prisma.service.ts             # Prisma ORM service
└── app.module.ts                 # Root module
```

### Key Components

**AuthService:**
- `signup(data)` - Create new user with bcrypt-hashed password
- `signin(data)` - Authenticate user and return JWT token
- `handleGoogleCallback(profile)` - Create/link Google OAuth user

**AuthController:**
- Validates input using Zod schemas
- Handles all four auth endpoints
- Returns formatted auth responses

**JwtStrategy:**
- Validates JWT tokens from Authorization header
- Extracts userId and role from token payload

**GoogleStrategy:**
- Configures Passport Google OAuth integration
- Extracts user data from Google profile

**AuthGuard:**
- Thin wrapper around passport JWT guard
- Use with `@UseGuards(AuthGuard)`

**RolesGuard:**
- Checks user role metadata
- Works with `@Roles('ADMIN')` decorator
- Throws `ForbiddenException` if role doesn't match

## Database Schema

The User model includes:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String?              # null for Google-only users
  googleId  String?  @unique     # Google OAuth ID
  provider  String   @default("LOCAL")  # LOCAL or GOOGLE
  role      String   @default("USER")   # USER or ADMIN
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Notes:**
- `password` is nullable for Google OAuth users
- `googleId` is unique for proper Google account linking
- Users can have both password and googleId (linked accounts)

## Security Considerations

1. **Password Security:**
   - Passwords are hashed with bcrypt (10 salt rounds)
   - Never stored in plaintext
   - Compared during signin

2. **JWT Security:**
   - Tokens are short-lived (24 hours)
   - Signed with a secret key
   - No refresh tokens (clients must re-authenticate after 24 hours)

3. **Google OAuth:**
   - Uses official Passport.js strategy
   - Tokens are server-side validated
   - Automatic account linking by email

4. **Input Validation:**
   - All inputs validated with Zod schemas
   - Email format and password strength enforced
   - SQL injection protection via Prisma

## Testing

Example test for signup endpoint:

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Example test for signin endpoint:

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Example test for protected route:

```bash
# Use the accessToken from signin response
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## Future Enhancements

When expanding beyond auth, consider:
- Implementing a user profile module
- Adding email verification
- Implementing password reset flow
- Adding refresh tokens (if needed)
- Rate limiting on auth endpoints
- Two-factor authentication

## Troubleshooting

**Issue:** JWT_SECRET not found
- **Solution:** Add JWT_SECRET to .env file

**Issue:** Database connection failed
- **Solution:** Verify DATABASE_URL in .env, ensure PostgreSQL is running

**Issue:** Google OAuth not working
- **Solution:** Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct

**Issue:** Token validation fails
- **Solution:** Ensure Authorization header uses format: `Bearer <token>`
