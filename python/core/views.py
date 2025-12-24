from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import bcrypt
import jwt
from datetime import datetime, timedelta
from .models import User
from django.conf import settings
import os
from .middleware import require_auth


# Get JWT secret from environment or settings
JWT_SECRET = os.environ.get('JWT_SECRET', settings.SECRET_KEY)
JWT_EXPIRY_DAYS = 15


def generate_token(user_id, response):
    """
    Generate JWT token and set it as httpOnly cookie
    Similar to GenerateToken from Node.js backend
    """
    try:
        token = jwt.encode(
            {
                'id': user_id,
                'exp': datetime.utcnow() + timedelta(days=JWT_EXPIRY_DAYS)
            },
            JWT_SECRET,
            algorithm='HS256'
        )
        
        # Set cookie with token
        max_age = JWT_EXPIRY_DAYS * 24 * 60 * 60  # 15 days in seconds
        response.set_cookie(
            'token',
            token,
            max_age=max_age,
            httponly=True,
            samesite='Lax',  # Changed from Strict to Lax for better Postman compatibility
            secure=False  # Set to True in production with HTTPS
        )
        
    except Exception as e:
        print(f"Error generating token: {str(e)}")
        raise


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Login endpoint - validates credentials and returns JWT token in cookie
    Similar to login from Node.js AuthController
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email:
            return JsonResponse(
                {'message': 'Email is required'},
                status=400
            )
        
        if not password:
            return JsonResponse(
                {'message': 'Password is required'},
                status=400
            )
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse(
                {'message': 'Invalid email or password'},
                status=401
            )
        
        # Verify password using bcrypt
        password_bytes = password.encode('utf-8')
        hashed_password = user.password.encode('utf-8')
        
        is_password_valid = bcrypt.checkpw(password_bytes, hashed_password)
        
        if not is_password_valid:
            return JsonResponse(
                {'message': 'Invalid email or password'},
                status=401
            )
        
        # Create response and generate token
        response = JsonResponse({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'profilePicture': user.profilePicture,
                'accountStatus': user.accountStatus
            }
        }, status=200)
        
        # Generate and set token cookie
        generate_token(user.id, response)
        
        return response
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'message': 'Invalid JSON'},
            status=400
        )
    except Exception as e:
        print(f"Login error: {str(e)}")
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def logout(request):
    """
    Logout endpoint - clears the JWT token cookie
    Requires authentication - checks if user is logged in via cookie
    Similar to logout from Node.js AuthController
    """
    try:
        response = JsonResponse({
            'message': 'Logout successful'
        }, status=200)
        
        # Clear the token cookie
        response.delete_cookie(
            'token',
            samesite='Lax'
        )
        
        return response
        
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def change_password(request):
    """
    Change password endpoint - requires authentication
    Similar to changePassword from Node.js AuthController
    """
    try:
        # Get user from request (set by auth middleware)
        user_id = request.user_data['id']
        
        data = json.loads(request.body)
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        
        if not old_password or not new_password:
            return JsonResponse(
                {'message': 'Old password and new password are required'},
                status=400
            )
        
        # Get user from database
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {'message': 'User not found'},
                status=401
            )
        
        # Verify old password
        old_password_bytes = old_password.encode('utf-8')
        hashed_password = user.password.encode('utf-8')
        
        is_old_password_valid = bcrypt.checkpw(old_password_bytes, hashed_password)
        
        if not is_old_password_valid:
            return JsonResponse(
                {'message': 'Old password is incorrect'},
                status=400
            )
        
        # Hash new password
        new_password_bytes = new_password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_new_password = bcrypt.hashpw(new_password_bytes, salt)
        
        # Update password
        user.password = hashed_new_password.decode('utf-8')
        user.save()
        
        return JsonResponse({
            'message': 'Password changed successfully'
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'message': 'Invalid JSON'},
            status=400
        )
    except Exception as e:
        print(f"Change password error: {str(e)}")
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """
    Register endpoint - creates new user with hashed password
    Requires authentication and admin role
    Similar to register from Node.js AuthController
    """
    try:
        # Check if user is authenticated and is admin (middleware should set this)
        if not hasattr(request, 'user_data'):
            return JsonResponse(
                {'message': 'User not authenticated'},
                status=401
            )
        
        if request.user_data.get('role') != 'ADMIN':
            return JsonResponse(
                {'message': 'Unauthorized - Admin access required'},
                status=403
            )
        
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        
        if not email or not password or not role:
            return JsonResponse(
                {'message': 'Email, password, and role are required'},
                status=400
            )
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return JsonResponse(
                {'message': 'Email already in use'},
                status=400
            )
        
        # Hash password using bcrypt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        
        # Generate unique ID (you might want to use UUID here)
        import uuid
        user_id = str(uuid.uuid4())
        
        # Create user
        new_user = User.objects.create(
            id=user_id,
            email=email,
            password=hashed_password.decode('utf-8'),
            role=role
        )
        
        return JsonResponse({
            'message': 'User registered successfully',
            'userId': new_user.id,
            'email': new_user.email,
            'role': new_user.role
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'message': 'Invalid JSON'},
            status=400
        )
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def get_user_role(request):
    """
    Get current authenticated user's complete details
    Returns user info, role, and associated entity details (Student, Faculty, HOD, or Admin)
    """
    try:
        user_id = request.user_data.get('id')
        
        # Get user with related entities
        try:
            user = User.objects.select_related(
                'student', 'faculty', 'hod', 'admin'
            ).get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {'message': 'User not found'},
                status=404
            )
        
        # Base user data
        response_data = {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'profilePicture': user.profilePicture,
            'accountStatus': user.accountStatus,
            'createdAt': user.createdAt.isoformat() if user.createdAt else None,
            'updatedAt': user.updatedAt.isoformat() if user.updatedAt else None,
            'isAdmin': user.role == 'ADMIN',
            'isHOD': user.role == 'HOD',
            'isFaculty': user.role == 'FACULTY',
            'isStudent': user.role == 'STUDENT'
        }
        
        # Add entity-specific details based on role
        if user.role == 'STUDENT' and hasattr(user, 'student') and user.student:
            student = user.student
            response_data['student'] = {
                'id': student.id,
                'name': student.name,
                'enrollmentNo': student.enrollmentNo,
                'email': student.email,
                'phone1': student.phone1,
                'phone2': student.phone2,
                'department': student.department,
                'semester': student.semester,
                'batch': student.batch,
                'section': student.section,
                'studentStatus': student.studentStatus
            }
        
        elif user.role == 'FACULTY' and hasattr(user, 'faculty') and user.faculty:
            faculty = user.faculty
            response_data['faculty'] = {
                'id': faculty.id,
                'employeeId': faculty.employeeId,
                'name': faculty.name,
                'phone1': faculty.phone1,
                'phone2': faculty.phone2,
                'personalEmail': faculty.personalEmail,
                'collegeEmail': faculty.collegeEmail,
                'department': faculty.department,
                'btech': faculty.btech,
                'mtech': faculty.mtech,
                'phd': faculty.phd,
                'office': faculty.office,
                'officeHours': faculty.officeHours
            }
        
        elif user.role == 'HOD' and hasattr(user, 'hod') and user.hod:
            hod = user.hod
            response_data['hod'] = {
                'id': hod.id,
                'department': hod.department,
                'startDate': hod.startDate.isoformat() if hod.startDate else None,
                'endDate': hod.endDate.isoformat() if hod.endDate else None
            }
            # Also include faculty details if available
            if hod.faculty:
                response_data['faculty'] = {
                    'id': hod.faculty.id,
                    'name': hod.faculty.name,
                    'employeeId': hod.faculty.employeeId,
                    'department': hod.faculty.department
                }
        
        elif user.role == 'ADMIN' and hasattr(user, 'admin') and user.admin:
            admin = user.admin
            response_data['admin'] = {
                'id': admin.id,
                'name': admin.name,
                'employeeId': admin.employeeId,
                'department': admin.department
            }
        
        return JsonResponse(response_data, status=200)
        
    except Exception as e:
        print(f"Get user details error: {str(e)}")
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )
