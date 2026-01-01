from django.http import JsonResponse
import jwt
from django.conf import settings
import os
from .models import User


# Get JWT secret from environment or settings
JWT_SECRET = os.environ.get('JWT_SECRET', settings.SECRET_KEY)


class JWTAuthMiddleware:
    """
    JWT Authentication middleware - extracts user ID from JWT cookie
    and attaches user data to request for all APIs
    Similar to isAuth middleware from Node.js backend
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        print(f"[JWT Middleware START] Path: {request.path}")
        print(f"[JWT Middleware] All cookies: {request.COOKIES}")
        
        # Skip JWT validation for public endpoints
        public_paths = ['/api/auth/login', '/api/auth/register', '/admin/']
        
        if any(request.path.startswith(path) for path in public_paths):
            print(f"[JWT Middleware] Skipping public path: {request.path}")
            return self.get_response(request)
        
        # Get token from cookie
        token = request.COOKIES.get('token')
        
        print(f"[JWT Middleware] Path: {request.path}")
        print(f"[JWT Middleware] Cookie token exists: {token is not None}")
        
        if token:
            print(f"[JWT Middleware] Token value (first 20 chars): {token[:20]}...")
            try:
                # Verify and decode token to get user ID
                decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                user_id = decoded.get('id')
                
                print(f"[JWT Middleware] Decoded user_id: {user_id}")
                
                if user_id:
                    # Find user and include related entities
                    try:
                        user = User.objects.select_related(
                            'student', 'faculty', 'hod', 'admin'
                        ).get(id=user_id)
                        
                        print(f"[JWT Middleware] Found user: {user.email}")
                        
                        # Determine entity ID and type
                        entity_id = None
                        entity_type = None
                        
                        if hasattr(user, 'student') and user.student:
                            entity_id = user.student.id
                            entity_type = 'STUDENT'
                        elif hasattr(user, 'faculty') and user.faculty:
                            entity_id = user.faculty.id
                            entity_type = 'FACULTY'
                        elif hasattr(user, 'hod') and user.hod:
                            entity_id = user.hod.id
                            entity_type = 'HOD'
                        elif hasattr(user, 'admin') and user.admin:
                            entity_id = user.admin.id
                            entity_type = 'ADMIN'
                        
                        # Attach user information to request (available for all views)
                        request.user_data = {
                            'id': user.id,
                            'email': user.email,
                            'role': user.role,
                            'entityId': entity_id,
                            'entityType': entity_type,
                            'profilePicture': user.profilePicture,
                            'accountStatus': user.accountStatus
                        }
                        
                        print(f"[JWT Middleware] Set user_data for: {user.email}, role: {user.role}")
                        
                    except User.DoesNotExist:
                        print(f"[JWT Middleware] User not found for id: {user_id}")
                        pass  # User not found, continue without user_data
                    
            except jwt.ExpiredSignatureError:
                print(f"[JWT Middleware] Token expired")
                pass  # Token expired, continue without user_data
            except jwt.InvalidTokenError as e:
                print(f"[JWT Middleware] Invalid token: {str(e)}")
                pass  # Invalid token, continue without user_data
            except Exception as e:
                print(f"[JWT Middleware] Error: {str(e)}")
                pass  # Any error, continue without user_data
        else:
            print(f"[JWT Middleware] No token found in cookies")
        
        # Continue to view - views can check if request.user_data exists
        response = self.get_response(request)
        return response


class AuthMiddleware:
    """
    Authentication middleware - validates JWT token from cookie
    Similar to isAuth middleware from Node.js backend
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip middleware for auth endpoints
        if request.path in ['/api/auth/login', '/api/auth/logout', '/api/auth/register']:
            return self.get_response(request)
        
        # Get token from cookie
        token = request.COOKIES.get('token')
        
        if not token:
            # If no token and path requires auth, return unauthorized
            if request.path.startswith('/api/') and request.path not in ['/api/auth/login', '/api/auth/logout']:
                return JsonResponse(
                    {'message': 'Unauthorized'},
                    status=401
                )
            return self.get_response(request)
        
        try:
            # Verify and decode token
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = decoded.get('id')
            
            if not user_id:
                return JsonResponse(
                    {'message': 'Unauthorized'},
                    status=401
                )
            
            # Find user and include related entities
            try:
                user = User.objects.select_related(
                    'student', 'faculty', 'hod', 'admin'
                ).get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse(
                    {'message': 'Unauthorized'},
                    status=401
                )
            
            # Determine entity ID and type
            entity_id = None
            entity = None
            entity_type = None
            
            if hasattr(user, 'student') and user.student:
                entity_id = user.student.id
                entity = user.student
                entity_type = 'STUDENT'
            elif hasattr(user, 'faculty') and user.faculty:
                entity_id = user.faculty.id
                entity = user.faculty
                entity_type = 'FACULTY'
            elif hasattr(user, 'hod') and user.hod:
                entity_id = user.hod.id
                entity = user.hod
                entity_type = 'HOD'
            elif hasattr(user, 'admin') and user.admin:
                entity_id = user.admin.id
                entity = user.admin
                entity_type = 'ADMIN'
            else:
                return JsonResponse(
                    {'message': 'User has no associated entity'},
                    status=401
                )
            
            # Attach user information to request
            request.user_data = {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'entityId': entity_id,
                'entityType': entity_type,
                'profilePicture': user.profilePicture,
                'accountStatus': user.accountStatus
            }
            
        except jwt.ExpiredSignatureError:
            return JsonResponse(
                {'message': 'Token has expired'},
                status=401
            )
        except jwt.InvalidTokenError:
            return JsonResponse(
                {'message': 'Invalid token'},
                status=401
            )
        except Exception as e:
            print(f"Auth middleware error: {str(e)}")
            return JsonResponse(
                {'message': 'Unauthorized'},
                status=401
            )
        
        response = self.get_response(request)
        return response


class AdminMiddleware:
    """
    Admin authorization middleware - checks if user has ADMIN role
    Similar to isAdmin middleware from Node.js backend
    Must be used after AuthMiddleware
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Check if user data is attached (from AuthMiddleware)
        if not hasattr(request, 'user_data'):
            return JsonResponse(
                {'message': 'Unauthorized'},
                status=401
            )
        
        # Check if user is admin
        if request.user_data.get('role') != 'ADMIN':
            return JsonResponse(
                {'message': 'Unauthorized - Admin access required'},
                status=403
            )
        
        response = self.get_response(request)
        return response


def require_auth(view_func):
    """
    Decorator to require authentication for a view
    Uses request.user_data set by JWTAuthMiddleware
    Usage: @require_auth
    """
    def wrapped_view(request, *args, **kwargs):
        print(f"[require_auth] Checking auth for {request.path}")
        print(f"[require_auth] Has user_data attr: {hasattr(request, 'user_data')}")
        if hasattr(request, 'user_data'):
            print(f"[require_auth] user_data value: {request.user_data}")
        
        # Check if user data was set by middleware
        if not hasattr(request, 'user_data') or not request.user_data:
            print(f"[require_auth] No user_data, returning 401")
            return JsonResponse(
                {'message': 'Login is required'},
                status=401
            )
        
        print(f"[require_auth] Auth passed, calling view")
        # User is authenticated, proceed with the view
        return view_func(request, *args, **kwargs)
    
    return wrapped_view


def require_admin(view_func):
    """
    Decorator to require admin role for a view
    Usage: @require_auth @require_admin
    """
    def wrapped_view(request, *args, **kwargs):
        if not hasattr(request, 'user_data'):
            return JsonResponse(
                {'message': 'Unauthorized'},
                status=401
            )
        
        if request.user_data.get('role') != 'ADMIN':
            return JsonResponse(
                {'message': 'Unauthorized - Admin access required'},
                status=403
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapped_view


def require_role(*roles):
    """
    Decorator to require specific role(s) for a view
    Usage: @require_role('HOD') or @require_role('FACULTY', 'HOD', 'ADMIN') or @require_role(['HOD', 'ADMIN'])
    """
    def decorator(view_func):
        def wrapped_view(request, *args, **kwargs):
            if not hasattr(request, 'user_data') or not request.user_data:
                return JsonResponse(
                    {'message': 'Login is required'},
                    status=401
                )
            
            user_role = request.user_data.get('role')
            
            # Support both single role, multiple roles passed as args, and list as first arg
            allowed_roles = []
            for role in roles:
                if isinstance(role, (list, tuple)):
                    allowed_roles.extend(role)
                else:
                    allowed_roles.append(role)
            
            if user_role not in allowed_roles:
                return JsonResponse(
                    {'message': f'Unauthorized - {allowed_roles} access required'},
                    status=403
                )
            
            # Attach user_id for convenience in views
            request.user_id = request.user_data.get('id')
            
            return view_func(request, *args, **kwargs)
        
        return wrapped_view
    return decorator
