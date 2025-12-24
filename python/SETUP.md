# Python Django Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd python
pip install -r requirements.txt
```

Required packages:
- `Django>=6.0` - Web framework
- `bcrypt>=4.0.0` - Password hashing (same as Node.js backend)
- `PyJWT>=2.8.0` - JWT token generation and verification
- `psycopg2-binary>=2.9.0` - PostgreSQL adapter
- `dj-database-url>=2.0.0` - Database URL parser

### 2. Environment Variables

The Django app will automatically read from `backend/.env` if available. Make sure it has:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key-here
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Create Test Users

```bash
python manage.py shell
>>> exec(open('create_test_user.py').read())
```

This will create:
- Regular user: `test@example.com` / `password123`
- Admin user: `admin@example.com` / `admin123`

### 5. Start the Server

```bash
python manage.py runserver
```

The server will start at `http://localhost:8000`

### 6. Test the APIs

```bash
python test_auth_apis.py
```

Or use curl:

```bash
# Login
curl -c cookies.txt -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Change Password (with cookie)
curl -b cookies.txt -X POST http://localhost:8000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"password123","newPassword":"newpass456"}'

# Logout
curl -b cookies.txt -X POST http://localhost:8000/api/auth/logout
```

## API Endpoints

### Authentication Routes (prefix: `/api/auth/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/login` | No | Login with email/password |
| POST | `/logout` | No | Logout and clear cookie |
| POST | `/change-password` | Yes | Change user password |
| POST | `/register` | Yes (Admin) | Register new user |

## Implementation Details

### Password Hashing

Uses `bcrypt` with salt rounds (same as Node.js):

```python
import bcrypt

# Hashing
password_bytes = password.encode('utf-8')
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password_bytes, salt)

# Verification
is_valid = bcrypt.checkpw(password_bytes, hashed)
```

### JWT Token

Tokens are generated and stored in httpOnly cookies:

```python
import jwt
from datetime import datetime, timedelta

token = jwt.encode(
    {
        'id': user_id,
        'exp': datetime.utcnow() + timedelta(days=15)
    },
    JWT_SECRET,
    algorithm='HS256'
)

# Set as httpOnly cookie
response.set_cookie(
    'token',
    token,
    max_age=15 * 24 * 60 * 60,  # 15 days
    httponly=True,
    samesite='Strict'
)
```

### Authentication Middleware

The `AuthMiddleware` validates JWT tokens from cookies:

```python
# In views.py, decorated functions
from core.middleware import require_auth, require_admin

@require_auth
def protected_view(request):
    user_id = request.user_data['id']
    email = request.user_data['email']
    role = request.user_data['role']
    # ... your logic
```

## File Structure

```
python/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── create_test_user.py      # Script to create test users
├── test_auth_apis.py        # API test suite
├── test_bcrypt.py           # bcrypt test script
├── README_AUTH.md           # Authentication documentation
├── SETUP.md                 # This file
│
├── core/                    # Main app
│   ├── models.py           # Database models (User, Faculty, Student, etc.)
│   ├── views.py            # Authentication views (login, logout, etc.)
│   ├── middleware.py       # Auth middleware and decorators
│   ├── urls.py             # URL routes for /api/auth/
│   └── migrations/         # Database migrations
│
└── mentormentee/           # Project settings
    ├── settings.py         # Django settings
    ├── urls.py             # Main URL configuration
    └── wsgi.py            # WSGI configuration
```

## Comparison with Node.js Backend

| Feature | Node.js | Python Django |
|---------|---------|---------------|
| Password Hashing | bcrypt | bcrypt (same) |
| JWT Library | jsonwebtoken | PyJWT |
| Cookie Settings | httpOnly, sameSite: Strict | httpOnly, samesite: Strict |
| Token Expiry | 15 days | 15 days |
| Database | Prisma ORM | Django ORM |
| Middleware | Express middleware | Django middleware |

## Troubleshooting

### Issue: "No module named 'bcrypt'"
```bash
pip install bcrypt
```

### Issue: "No module named 'jwt'"
```bash
pip install PyJWT
```

### Issue: "relation 'users' does not exist"
```bash
python manage.py migrate
```

### Issue: "Invalid token"
- Make sure JWT_SECRET matches between Node.js and Python if sharing tokens
- Check if token has expired (15 days max)
- Verify cookie is being sent with request

### Issue: Database connection error
- Check DATABASE_URL in backend/.env
- Make sure PostgreSQL is running
- Verify database exists and credentials are correct

## Testing

### Test bcrypt functionality:
```bash
python test_bcrypt.py
```

### Test authentication flow:
```bash
# 1. Start server
python manage.py runserver

# 2. In another terminal
python test_auth_apis.py
```

### Manual testing with curl:
```bash
# Login and save cookies
curl -c cookies.txt -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use saved cookies for authenticated request
curl -b cookies.txt -X POST http://localhost:8000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"password123","newPassword":"newpass456"}'
```

## Next Steps

1. Add more endpoints (Faculty, Student, HOD controllers)
2. Implement file upload for profile pictures
3. Add email verification
4. Implement password reset functionality
5. Add rate limiting for login attempts
6. Add logging and monitoring
7. Set up CORS for frontend integration

## Production Considerations

1. Set `DEBUG = False` in settings.py
2. Use environment variables for secrets
3. Enable HTTPS and set `secure=True` for cookies
4. Add proper CORS configuration
5. Use production-grade database (PostgreSQL)
6. Set up proper logging
7. Add rate limiting
8. Implement proper error handling
9. Use gunicorn or uwsgi for serving
10. Set up nginx as reverse proxy
