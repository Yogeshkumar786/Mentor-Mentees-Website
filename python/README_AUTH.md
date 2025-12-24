# Python Django Authentication API

This directory contains the Python/Django backend with authentication APIs that mirror the Node.js backend functionality.

## Features

- **Login API** - Authenticates users with email/password using bcrypt
- **Logout API** - Clears JWT token cookie
- **Change Password API** - Allows authenticated users to change their password
- **Register API** - Admin-only endpoint to create new users

## Authentication Flow

The authentication system uses:
- **bcrypt** for password hashing (same as Node.js backend)
- **JWT tokens** stored in httpOnly cookies (same as Node.js backend)
- **Cookie-based authentication** with 15-day expiry

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure your `.env` file in backend folder has `JWT_SECRET` and `DATABASE_URL`

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

## API Endpoints

All endpoints are prefixed with `/api/auth/`

### POST /api/auth/login
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout
Logout (clears cookie)
No body required

### POST /api/auth/change-password
Change password (requires authentication)
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

### POST /api/auth/register
Register new user (requires authentication and admin role)
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

## Middleware

### Authentication Middleware (AuthMiddleware)
- Validates JWT token from cookie
- Attaches user data to request object
- Similar to `isAuth` middleware in Node.js

### Admin Middleware (AdminMiddleware)
- Checks if authenticated user has ADMIN role
- Similar to `isAdmin` middleware in Node.js

### Decorators
You can also use decorators for route-level authentication:
```python
from core.middleware import require_auth, require_admin

@require_auth
def my_protected_view(request):
    # request.user_data will be available
    pass

@require_auth
@require_admin
def my_admin_view(request):
    # Only admins can access
    pass
```

## Environment Variables

The API reads from these environment variables:
- `JWT_SECRET` - Secret key for JWT token signing
- `DATABASE_URL` - PostgreSQL connection string (reads from backend/.env if not set)

## Differences from Node.js Backend

The Python implementation maintains the same functionality as the Node.js backend:
- Same bcrypt password hashing
- Same JWT token structure
- Same cookie settings (httpOnly, sameSite: Strict, 15-day expiry)
- Same response structures
- Same error handling patterns

## Testing

You can test the APIs using curl or Postman:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  --cookie "token=YOUR_TOKEN_HERE"
```
