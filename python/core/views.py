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
from .middleware import require_auth, require_role


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
                'id': str(user_id),  # Convert UUID to string
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
                'id': str(user.id),  # Convert UUID to string
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
            'id': str(user.id),
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
                'id': str(student.id),
                'name': student.name,
                'registrationNumber': student.registrationNumber,
                'rollNumber': student.rollNumber,
                'personalEmail': student.personalEmail,
                'collegeEmail': student.collegeEmail,
                'phoneNumber': student.phoneNumber,
                'program': student.program,
                'branch': student.branch,
                'status': student.status
            }
        
        elif user.role == 'FACULTY' and hasattr(user, 'faculty') and user.faculty:
            faculty = user.faculty
            response_data['faculty'] = {
                'id': str(faculty.id),
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
                'id': str(hod.id),
                'department': hod.department,
                'startDate': hod.startDate.isoformat() if hod.startDate else None,
                'endDate': hod.endDate.isoformat() if hod.endDate else None
            }
            # Also include faculty details if available
            if hod.faculty:
                response_data['faculty'] = {
                    'id': str(hod.faculty.id),
                    'name': hod.faculty.name,
                    'employeeId': hod.faculty.employeeId,
                    'department': hod.faculty.department
                }
        
        elif user.role == 'ADMIN' and hasattr(user, 'admin') and user.admin:
            admin = user.admin
            response_data['admin'] = {
                'id': str(admin.id),
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


@csrf_exempt
@require_http_methods(["POST"])
@require_role('HOD')
def assign_mentor(request):
    """
    HOD assigns a faculty member as mentor to one or multiple students
    Required fields: studentRollNumbers (array), facultyEmployeeId, year, semester
    Optional fields: comments (array of strings)
    """
    try:
        data = json.loads(request.body)
        student_roll_numbers = data.get('studentRollNumbers')
        faculty_employee_id = data.get('facultyEmployeeId')
        year = data.get('year')
        semester = data.get('semester')
        comments = data.get('comments', [])
        
        # Support single student as well (convert to list)
        if isinstance(student_roll_numbers, (int, str)):
            student_roll_numbers = [student_roll_numbers]
        
        # Validate required fields
        if not student_roll_numbers or not isinstance(student_roll_numbers, list) or len(student_roll_numbers) == 0:
            return JsonResponse(
                {'message': 'studentRollNumbers must be a non-empty array'},
                status=400
            )
        
        if not faculty_employee_id or not year or not semester:
            return JsonResponse(
                {'message': 'Missing required fields: facultyEmployeeId, year, semester'},
                status=400
            )
        
        # Get HOD user ID from request (set by middleware)
        hod_user_id = request.user_id
        
        from .models import Student, Faculty, HOD, Mentorship
        
        # Find the faculty by employee ID
        try:
            faculty = Faculty.objects.select_related('user').get(employeeId=faculty_employee_id)
        except Faculty.DoesNotExist:
            return JsonResponse(
                {'message': 'Faculty not found with the provided employee ID'},
                status=404
            )
        
        # Verify that the HOD is authorized for this department
        try:
            hod = HOD.objects.select_related('faculty').get(
                user_id=hod_user_id,
                department=faculty.department,
                endDate__isnull=True  # Only active HODs
            )
        except HOD.DoesNotExist:
            return JsonResponse(
                {'message': f'You are not authorized to assign mentors in the {faculty.department} department'},
                status=403
            )
        
        # Process each student
        results = {
            'successful': [],
            'failed': []
        }
        
        for roll_number in student_roll_numbers:
            try:
                # Find the student by roll number
                try:
                    student = Student.objects.select_related('user').get(rollNumber=int(roll_number))
                except Student.DoesNotExist:
                    results['failed'].append({
                        'rollNumber': roll_number,
                        'reason': 'Student not found'
                    })
                    continue
                
                # Check if student is in the same department as faculty
                if student.branch != faculty.department:
                    results['failed'].append({
                        'rollNumber': roll_number,
                        'reason': f'Student branch ({student.branch}) does not match faculty department ({faculty.department})'
                    })
                    continue
                
                # Check if mentorship already exists for same faculty, student, year, semester
                existing_mentorship = Mentorship.objects.filter(
                    faculty=faculty,
                    student=student,
                    year=int(year),
                    semester=int(semester)
                ).first()
                
                if existing_mentorship:
                    # Reactivate if inactive
                    if not existing_mentorship.is_active:
                        existing_mentorship.is_active = True
                        existing_mentorship.end_date = None
                        existing_mentorship.save()
                        results['successful'].append({
                            'student': {
                                'name': student.name,
                                'rollNumber': student.rollNumber,
                                'branch': student.branch
                            },
                            'mentorshipId': str(existing_mentorship.id),
                            'reactivated': True
                        })
                    else:
                        results['failed'].append({
                            'rollNumber': roll_number,
                            'reason': 'Active mentorship already exists for this faculty, student, year, and semester'
                        })
                    continue
                
                # Deactivate any existing active mentorships for this student (previous mentor becomes past mentor)
                previous_mentor_info = None
                active_mentorship = Mentorship.objects.filter(
                    student=student,
                    is_active=True
                ).select_related('faculty').first()
                
                if active_mentorship:
                    active_mentorship.is_active = False
                    active_mentorship.end_date = datetime.now()
                    active_mentorship.save()
                    previous_mentor_info = {
                        'id': str(active_mentorship.faculty.id),
                        'name': active_mentorship.faculty.name,
                        'employeeId': active_mentorship.faculty.employeeId,
                        'mentorshipId': str(active_mentorship.id)
                    }
                
                # Create new mentorship
                mentorship = Mentorship.objects.create(
                    faculty=faculty,
                    student=student,
                    department=faculty.department,
                    year=int(year),
                    semester=int(semester),
                    start_date=datetime.now(),
                    is_active=True,
                    comments=comments if isinstance(comments, list) else []
                )
                
                results['successful'].append({
                    'student': {
                        'name': student.name,
                        'rollNumber': student.rollNumber,
                        'branch': student.branch
                    },
                    'mentorshipId': str(mentorship.id),
                    'previousMentor': previous_mentor_info,
                    'reactivated': False
                })
                
            except Exception as e:
                results['failed'].append({
                    'rollNumber': roll_number,
                    'reason': str(e)
                })
        
        # If no students were successfully assigned, return error
        if len(results['successful']) == 0:
            # Check if all failures are due to "Student not found"
            not_found_count = sum(1 for f in results['failed'] if f.get('reason') == 'Student not found')
            if not_found_count == len(results['failed']):
                return JsonResponse({
                    'message': 'No students found with the provided roll numbers',
                    'rollNumbers': student_roll_numbers
                }, status=404)
            else:
                return JsonResponse({
                    'message': 'Failed to assign mentor to any student',
                    'failed': results['failed']
                }, status=400)
        
        return JsonResponse({
            'message': f"Assigned {len(results['successful'])} student(s) to {faculty.name}",
            'mentor': {
                'id': str(faculty.id),
                'name': faculty.name,
                'employeeId': faculty.employeeId,
                'department': faculty.department
            },
            'year': int(year),
            'semester': int(semester),
            'assignedBy': hod.faculty.name if hod.faculty else 'HOD',
            'results': {
                'successful': results['successful'],
                'failed': results['failed'],
                'totalProcessed': len(student_roll_numbers),
                'successCount': len(results['successful']),
                'failedCount': len(results['failed'])
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'message': 'Invalid JSON in request body'},
            status=400
        )
    except ValueError as e:
        return JsonResponse(
            {'message': f'Invalid data format: {str(e)}'},
            status=400
        )
    except Exception as e:
        print(f"Assign mentor error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_department_students(request):
    """
    Get students of a department with optional filters
    Query params:
        - department: Optional (CSE, ECE, EEE, MECH, CIVIL, BIO-TECH, MME, CHEM). If not provided, returns all students.
        - year: Optional (1, 2, 3, 4). If 0 or not provided, returns all years
        - programme: Optional (B.Tech, M.Tech, PhD). If not provided, returns all programmes
    Accessible by: FACULTY, HOD, ADMIN (not STUDENT)
    """
    try:
        from .models import Student, Department, Programme
        
        # Get query parameters
        department = request.GET.get('department')
        year = request.GET.get('year', '0')
        programme = request.GET.get('programme')
        
        # Validate department if provided
        if department:
            valid_departments = [d.value for d in Department]
            if department not in valid_departments:
                return JsonResponse(
                    {'message': f'Invalid department. Valid values: {valid_departments}'},
                    status=400
                )
        
        # Validate programme if provided
        if programme:
            valid_programmes = [p.value for p in Programme]
            if programme not in valid_programmes:
                return JsonResponse(
                    {'message': f'Invalid programme. Valid values: {valid_programmes}'},
                    status=400
                )
        
        # Validate year
        try:
            year = int(year)
            if year < 0 or year > 4:
                return JsonResponse(
                    {'message': 'year must be between 0 and 4 (0 for all years)'},
                    status=400
                )
        except ValueError:
            return JsonResponse(
                {'message': 'year must be an integer'},
                status=400
            )
        
        # Build query - start with all students
        students_query = Student.objects.all()
        
        # Apply department filter only if provided
        if department:
            students_query = students_query.filter(branch=department)
        
        # Apply year filter using the year field
        if year != 0:
            students_query = students_query.filter(year=year)
        
        # Apply programme filter
        if programme:
            students_query = students_query.filter(program=programme)
        
        # Execute query and format response
        students = students_query.select_related('user').order_by('rollNumber')
        
        students_list = []
        for student in students:
            students_list.append({
                'id': str(student.id),
                'name': student.name,
                'rollNumber': student.rollNumber,
                'registrationNumber': student.registrationNumber,
                'email': student.user.email,
                'collegeEmail': student.collegeEmail,
                'program': student.program,
                'branch': student.branch,
                'year': student.year,
                'phoneNumber': student.phoneNumber,
                'gender': student.gender,
                'status': student.status
            })
        
        return JsonResponse({
            'message': f'Found {len(students_list)} student(s)',
            'department': department if department else 'all',
            'filters': {
                'year': year if year != 0 else 'all',
                'programme': programme if programme else 'all'
            },
            'count': len(students_list),
            'students': students_list
        }, status=200)
        
    except Exception as e:
        print(f"Get department students error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_student_by_rollno(request, rollno):
    """
    Get complete student details by roll number
    Accessible by: FACULTY, HOD, ADMIN (not STUDENT)
    """
    try:
        from .models import Student, Mentorship
        
        try:
            student = Student.objects.select_related('user').get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student not found'},
                status=404
            )
        
        # Get active mentorship info
        active_mentorship = Mentorship.objects.filter(student=student, is_active=True).first()
        mentor_info = None
        if active_mentorship:
            mentor_info = {
                'id': str(active_mentorship.faculty.id),
                'name': active_mentorship.faculty.name,
                'employeeId': active_mentorship.faculty.employeeId,
                'department': active_mentorship.faculty.department,
                'email': active_mentorship.faculty.collegeEmail
            }
        
        return JsonResponse({
            'id': str(student.id),
            'userId': str(student.user.id),
            'name': student.name,
            'email': student.user.email,
            'aadhar': student.aadhar,
            'phoneNumber': student.phoneNumber,
            'phoneCode': student.phoneCode,
            'registrationNumber': student.registrationNumber,
            'rollNumber': student.rollNumber,
            'passPort': student.passPort,
            'emergencyContact': student.emergencyContact,
            'personalEmail': student.personalEmail,
            'collegeEmail': student.collegeEmail,
            'dob': student.dob.isoformat() if student.dob else None,
            'address': student.address,
            'program': student.program,
            'branch': student.branch,
            'year': student.year,
            'bloodGroup': student.bloodGroup,
            'dayScholar': student.dayScholar,
            'gender': student.gender,
            'community': student.community,
            'status': student.status,
            'profilePicture': student.user.profilePicture,
            'accountStatus': student.user.accountStatus,
            'father': {
                'name': student.fatherName,
                'occupation': student.fatherOccupation,
                'aadhar': student.fatherAadhar,
                'phone': student.fatherNumber
            },
            'mother': {
                'name': student.motherName,
                'occupation': student.motherOccupation,
                'aadhar': student.motherAadhar,
                'phone': student.motherNumber
            },
            'academicBackground': {
                'xMarks': student.xMarks,
                'xiiMarks': student.xiiMarks,
                'jeeMains': student.jeeMains,
                'jeeAdvanced': student.jeeAdvanced
            },
            'mentor': mentor_info,
            'createdAt': student.createdAt.isoformat() if student.createdAt else None,
            'updatedAt': student.updatedAt.isoformat() if student.updatedAt else None
        }, status=200)
        
    except Exception as e:
        print(f"Get student by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["PUT"])
@require_role(['ADMIN'])
def update_student_by_rollno(request, rollno):
    """
    Update student details by roll number
    Only ADMIN can update student details
    Updatable fields: name, phoneNumber, emergencyContact, address, year, dayScholar, status,
                      fatherName, fatherOccupation, fatherNumber, motherName, motherOccupation, motherNumber
    """
    try:
        from .models import Student, StudentStatus
        
        data = json.loads(request.body)
        
        try:
            student = Student.objects.select_related('user').get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student not found'},
                status=404
            )
        
        # Fields that admin can update
        updatable_fields = [
            'name', 'phoneNumber', 'emergencyContact', 'address', 'year',
            'dayScholar', 'fatherName', 'fatherOccupation', 'fatherNumber',
            'motherName', 'motherOccupation', 'motherNumber'
        ]
        
        updated_fields = []
        
        for field in updatable_fields:
            if field in data:
                setattr(student, field, data[field])
                updated_fields.append(field)
        
        # Handle status separately (needs validation)
        if 'status' in data:
            status_value = data['status']
            if status_value in [s.value for s in StudentStatus]:
                student.status = status_value
                updated_fields.append('status')
            else:
                return JsonResponse(
                    {'message': f'Invalid status. Valid values: {[s.value for s in StudentStatus]}'},
                    status=400
                )
        
        # Handle account status update (on User model)
        if 'accountStatus' in data:
            from .models import AccountStatus
            account_status = data['accountStatus']
            if account_status in [s.value for s in AccountStatus]:
                student.user.accountStatus = account_status
                student.user.save()
                updated_fields.append('accountStatus')
            else:
                return JsonResponse(
                    {'message': f'Invalid account status. Valid values: {[s.value for s in AccountStatus]}'},
                    status=400
                )
        
        if updated_fields:
            student.save()
        
        return JsonResponse({
            'message': 'Student updated successfully',
            'updatedFields': updated_fields,
            'student': {
                'id': str(student.id),
                'name': student.name,
                'rollNumber': student.rollNumber,
                'status': student.status,
                'accountStatus': student.user.accountStatus
            }
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'message': 'Invalid JSON data'},
            status=400
        )
    except Exception as e:
        print(f"Update student by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['STUDENT', 'FACULTY', 'HOD', 'ADMIN'])
def get_student_cocurricular_by_rollno(request, rollno):
    """
    Get student's co-curricular activities by roll number
    Accessible by: STUDENT (own data only), FACULTY, HOD, ADMIN
    """
    try:
        from .models import Student, CoCurricular
        
        # If student, verify they can only access their own data
        if request.user_role == 'STUDENT':
            if not hasattr(request, 'user_student') or request.user_student.rollNumber != rollno:
                return JsonResponse({'message': 'You can only view your own co-curricular activities'}, status=403)
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        activities = CoCurricular.objects.filter(student=student).order_by('-sem', '-date')
        
        activities_list = []
        for activity in activities:
            activities_list.append({
                'id': str(activity.id),
                'semester': activity.sem,
                'date': activity.date.isoformat() if activity.date else None,
                'eventDetails': activity.eventDetails,
                'participationDetails': activity.participationDetails,
                'awards': activity.awards
            })
        
        return JsonResponse({
            'studentId': str(student.id),
            'studentName': student.name,
            'rollNumber': student.rollNumber,
            'activities': activities_list,
            'total': len(activities_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get student co-curricular by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_student_projects_by_rollno(request, rollno):
    """
    Get student's projects by roll number
    Accessible by: FACULTY, HOD, ADMIN
    """
    try:
        from .models import Student, Project
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        projects = Project.objects.filter(student=student).order_by('-semester')
        
        projects_list = []
        for project in projects:
            projects_list.append({
                'id': str(project.id),
                'semester': project.semester,
                'title': project.title,
                'description': project.description,
                'technologies': project.technologies or [],
                'mentor': {
                    'name': project.mentor.name if project.mentor else None,
                    'employeeId': project.mentor.employeeId if project.mentor else None,
                    'department': project.mentor.department if project.mentor else None
                } if project.mentor else None
            })
        
        return JsonResponse({
            'studentId': str(student.id),
            'studentName': student.name,
            'rollNumber': student.rollNumber,
            'projects': projects_list,
            'total': len(projects_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get student projects by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_student_internships_by_rollno(request, rollno):
    """
    Get student's internships by roll number
    Accessible by: FACULTY, HOD, ADMIN
    """
    try:
        from .models import Student, Internship
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        internships = Internship.objects.filter(student=student).order_by('-semester')
        
        internships_list = []
        for internship in internships:
            internships_list.append({
                'id': str(internship.id),
                'semester': internship.semester,
                'type': internship.type,
                'organisation': internship.organisation,
                'stipend': internship.stipend,
                'duration': internship.duration,
                'location': internship.location
            })
        
        return JsonResponse({
            'studentId': str(student.id),
            'studentName': student.name,
            'rollNumber': student.rollNumber,
            'internships': internships_list,
            'total': len(internships_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get student internships by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_student_career_by_rollno(request, rollno):
    """
    Get student's career details by roll number
    Accessible by: FACULTY, HOD, ADMIN
    """
    try:
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        try:
            career = CareerDetails.objects.get(student=student)
            return JsonResponse({
                'id': str(career.id),
                'studentId': str(student.id),
                'studentName': student.name,
                'rollNumber': student.rollNumber,
                'hobbies': career.hobbies or [],
                'strengths': career.strengths or [],
                'areasToImprove': career.areasToImprove or [],
                'careerInterests': {
                    'core': career.core or [],
                    'it': career.it or [],
                    'higherEducation': career.higherEducation or [],
                    'startup': career.startup or [],
                    'familyBusiness': career.familyBusiness or [],
                    'otherInterests': career.otherInterests or []
                },
                'careerRankings': {
                    'govt_sector_rank': career.govt_sector_rank,
                    'core_rank': career.core_rank,
                    'it_rank': career.it_rank,
                    'higher_education_rank': career.higher_education_rank,
                    'startup_rank': career.startup_rank,
                    'family_business_rank': career.family_business_rank
                }
            }, status=200)
        except CareerDetails.DoesNotExist:
            return JsonResponse({
                'id': None,
                'studentId': str(student.id),
                'studentName': student.name,
                'rollNumber': student.rollNumber,
                'hobbies': [],
                'strengths': [],
                'areasToImprove': [],
                'careerInterests': {
                    'core': [],
                    'it': [],
                    'higherEducation': [],
                    'startup': [],
                    'familyBusiness': [],
                    'otherInterests': []
                },
                'careerRankings': {
                    'govt_sector_rank': 1,
                    'core_rank': 2,
                    'it_rank': 3,
                    'higher_education_rank': 4,
                    'startup_rank': 5,
                    'family_business_rank': 6
                },
                'message': 'No career details found for this student'
            }, status=200)
        
    except Exception as e:
        print(f"Get student career by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_student_problems_by_rollno(request, rollno):
    """
    Get student's personal problems by roll number
    Accessible by: FACULTY, HOD, ADMIN
    """
    try:
        from .models import Student, PersonalProblem
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        try:
            problem = PersonalProblem.objects.get(student=student)
            return JsonResponse({
                'id': str(problem.id),
                'studentId': str(student.id),
                'studentName': student.name,
                'rollNumber': student.rollNumber,
                # Column 1
                'stress': problem.stress,
                'anger': problem.anger,
                'emotional_problem': problem.emotional_problem,
                'low_self_esteem': problem.low_self_esteem,
                'examination_anxiety': problem.examination_anxiety,
                'negative_thoughts': problem.negative_thoughts,
                'exam_phobia': problem.exam_phobia,
                'stammering': problem.stammering,
                'financial_problems': problem.financial_problems,
                'disturbed_relationship_with_teachers': problem.disturbed_relationship_with_teachers,
                'disturbed_relationship_with_parents': problem.disturbed_relationship_with_parents,
                # Column 2
                'mood_swings': problem.mood_swings,
                'stage_phobia': problem.stage_phobia,
                'poor_concentration': problem.poor_concentration,
                'poor_memory_problem': problem.poor_memory_problem,
                'adjustment_problem': problem.adjustment_problem,
                'frustration': problem.frustration,
                'migraine_headache': problem.migraine_headache,
                'relationship_problems': problem.relationship_problems,
                'fear_of_public_speaking': problem.fear_of_public_speaking,
                'disciplinary_problems_in_college': problem.disciplinary_problems_in_college,
                'disturbed_peer_relationship_with_friends': problem.disturbed_peer_relationship_with_friends,
                # Column 3
                'worries_about_future': problem.worries_about_future,
                'disappointment_with_course': problem.disappointment_with_course,
                'time_management_problem': problem.time_management_problem,
                'lack_of_expression': problem.lack_of_expression,
                'poor_decisive_power': problem.poor_decisive_power,
                'conflicts': problem.conflicts,
                'low_self_motivation': problem.low_self_motivation,
                'procrastination': problem.procrastination,
                'suicidal_attempt_or_thought': problem.suicidal_attempt_or_thought,
                'tobacco_or_alcohol_use': problem.tobacco_or_alcohol_use,
                'poor_command_of_english': problem.poor_command_of_english,
                # Special Issues
                'economic_issues': problem.economic_issues,
                'economic_issues_suggestion': problem.economic_issues_suggestion,
                'economic_issues_outcome': problem.economic_issues_outcome,
                'teenage_issues': problem.teenage_issues,
                'teenage_issues_suggestion': problem.teenage_issues_suggestion,
                'teenage_issues_outcome': problem.teenage_issues_outcome,
                'health_issues': problem.health_issues,
                'health_issues_suggestion': problem.health_issues_suggestion,
                'health_issues_outcome': problem.health_issues_outcome,
                'emotional_issues': problem.emotional_issues,
                'emotional_issues_suggestion': problem.emotional_issues_suggestion,
                'emotional_issues_outcome': problem.emotional_issues_outcome,
                'psychological_issues': problem.psychological_issues,
                'psychological_issues_suggestion': problem.psychological_issues_suggestion,
                'psychological_issues_outcome': problem.psychological_issues_outcome,
                'additional_comments': problem.additional_comments
            }, status=200)
        except PersonalProblem.DoesNotExist:
            return JsonResponse({
                'id': None,
                'studentId': str(student.id),
                'studentName': student.name,
                'rollNumber': student.rollNumber,
                'stress': None, 'anger': None, 'emotional_problem': None,
                'low_self_esteem': None, 'examination_anxiety': None,
                'negative_thoughts': None, 'exam_phobia': None,
                'stammering': None, 'financial_problems': None,
                'disturbed_relationship_with_teachers': None,
                'disturbed_relationship_with_parents': None,
                'mood_swings': None, 'stage_phobia': None,
                'poor_concentration': None, 'poor_memory_problem': None,
                'adjustment_problem': None, 'frustration': None,
                'migraine_headache': None, 'relationship_problems': None,
                'fear_of_public_speaking': None,
                'disciplinary_problems_in_college': None,
                'disturbed_peer_relationship_with_friends': None,
                'worries_about_future': None, 'disappointment_with_course': None,
                'time_management_problem': None, 'lack_of_expression': None,
                'poor_decisive_power': None, 'conflicts': None,
                'low_self_motivation': None, 'procrastination': None,
                'suicidal_attempt_or_thought': None, 'tobacco_or_alcohol_use': None,
                'poor_command_of_english': None,
                # Special Issues
                'economic_issues': None, 'economic_issues_suggestion': None, 'economic_issues_outcome': None,
                'teenage_issues': None, 'teenage_issues_suggestion': None, 'teenage_issues_outcome': None,
                'health_issues': None, 'health_issues_suggestion': None, 'health_issues_outcome': None,
                'emotional_issues': None, 'emotional_issues_suggestion': None, 'emotional_issues_outcome': None,
                'psychological_issues': None, 'psychological_issues_suggestion': None, 'psychological_issues_outcome': None,
                'additional_comments': None,
                'message': 'No personal problems data found for this student'
            }, status=200)
        
    except Exception as e:
        print(f"Get student problems by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_student_mentoring_by_rollno(request, rollno):
    """
    Get student's mentoring details by roll number
    Accessible by: FACULTY, HOD, ADMIN
    """
    try:
        from .models import Student, Mentorship, Meeting
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        # Get all mentorships for this student
        mentorships = Mentorship.objects.filter(student=student).select_related('faculty', 'faculty__user').order_by('-is_active', '-start_date')
        
        mentorships_list = []
        for mentorship in mentorships:
            # Get meetings for this mentorship
            meetings = Meeting.objects.filter(mentorship=mentorship).order_by('-date', '-time')
            meetings_list = []
            for meeting in meetings:
                meetings_list.append({
                    'id': str(meeting.id),
                    'date': meeting.date.isoformat() if meeting.date else None,
                    'time': meeting.time.strftime('%H:%M') if meeting.time else None,
                    'description': meeting.description,
                    'status': meeting.status,
                    'feedback': meeting.facultyReview,
                    'remarks': None
                })
            
            mentorships_list.append({
                'id': str(mentorship.id),
                'faculty': {
                    'id': str(mentorship.faculty.id),
                    'name': mentorship.faculty.name,
                    'employeeId': mentorship.faculty.employeeId,
                    'department': mentorship.faculty.department,
                    'email': mentorship.faculty.collegeEmail,
                    'phone': mentorship.faculty.phone1
                },
                'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
                'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None,
                'isActive': mentorship.is_active,
                'meetings': meetings_list,
                'totalMeetings': len(meetings_list)
            })
        
        # Get active mentorship
        active_mentorship = next((m for m in mentorships_list if m['isActive']), None)
        
        return JsonResponse({
            'studentId': str(student.id),
            'studentName': student.name,
            'rollNumber': student.rollNumber,
            'activeMentorship': active_mentorship,
            'mentorships': mentorships_list,
            'totalMentorships': len(mentorships_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get student mentoring by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def get_student_academic_by_rollno(request, rollno):
    """
    Get student's academic details by roll number
    Accessible by: FACULTY, HOD, ADMIN
    """
    try:
        from .models import Student, Semester, StudentSubject
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        # Get all semesters for this student
        semesters = Semester.objects.filter(student=student).order_by('semester')
        
        semesters_list = []
        latest_cgpa = None
        
        for sem in semesters:
            # Get subjects for this semester via StudentSubject
            student_subjects = StudentSubject.objects.filter(
                student=student, 
                semester=sem
            ).select_related('subject')
            
            subjects_list = []
            for ss in student_subjects:
                subjects_list.append({
                    'subjectCode': ss.subject.subjectCode,
                    'subjectName': ss.subject.subjectName,
                    'credits': ss.subject.credits,
                    'grade': ss.grade
                })
            
            semesters_list.append({
                'semester': sem.semester,
                'sgpa': float(sem.sgpa) if sem.sgpa else None,
                'cgpa': float(sem.cgpa) if sem.cgpa else None,
                'subjects': subjects_list,
                'totalCredits': sum(s['credits'] for s in subjects_list)
            })
            
            if sem.cgpa:
                latest_cgpa = float(sem.cgpa)
        
        return JsonResponse({
            'studentId': str(student.id),
            'studentName': student.name,
            'rollNumber': student.rollNumber,
            'program': student.program,
            'branch': student.branch,
            'currentYear': student.year,
            'latestCGPA': latest_cgpa,
            'semesters': semesters_list,
            'totalSemesters': len(semesters_list),
            'preAdmission': {
                'xMarks': student.xMarks,
                'xiiMarks': student.xiiMarks,
                'jeeMains': student.jeeMains,
                'jeeAdvanced': student.jeeAdvanced
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get student academic by rollno error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role(['HOD', 'ADMIN'])
def get_faculty(request):
    """
    Get all faculty or filter by department
    Query params:
        - department: Optional (CSE, ECE, EEE, MECH, CIVIL, BIO-TECH, MME, CHEM)
        - active: Optional (true/false) - filter by active status
    Accessible by: HOD, ADMIN only
    """
    try:
        from .models import Faculty, Department
        
        # Get query parameters
        department = request.GET.get('department')
        active = request.GET.get('active')
        
        # Validate department if provided
        if department:
            valid_departments = [d.value for d in Department]
            if department not in valid_departments:
                return JsonResponse(
                    {'message': f'Invalid department. Valid values: {valid_departments}'},
                    status=400
                )
        
        # Build query
        faculty_query = Faculty.objects.all()
        
        # Apply department filter
        if department:
            faculty_query = faculty_query.filter(department=department)
        
        # Apply active filter
        if active is not None:
            is_active = active.lower() == 'true'
            faculty_query = faculty_query.filter(isActive=is_active)
        
        # Execute query and format response
        faculty_list = faculty_query.select_related('user').order_by('name')
        
        result = []
        for faculty in faculty_list:
            # Get current mentee count
            mentee_count = faculty.mentorships.filter(is_active=True).count()
            
            result.append({
                'id': str(faculty.id),
                'employeeId': faculty.employeeId,
                'name': faculty.name,
                'email': faculty.user.email,
                'collegeEmail': faculty.collegeEmail,
                'personalEmail': faculty.personalEmail,
                'phone1': faculty.phone1,
                'phone2': faculty.phone2,
                'department': faculty.department,
                'isActive': faculty.isActive,
                'startDate': faculty.startDate.isoformat() if faculty.startDate else None,
                'endDate': faculty.endDate.isoformat() if faculty.endDate else None,
                'office': faculty.office,
                'officeHours': faculty.officeHours,
                'btech': faculty.btech,
                'mtech': faculty.mtech,
                'phd': faculty.phd,
                'currentMenteeCount': mentee_count
            })
        
        response_data = {
            'message': f'Found {len(result)} faculty member(s)',
            'count': len(result),
            'faculty': result
        }
        
        # Add filter info if department was specified
        if department:
            response_data['department'] = department
        
        return JsonResponse(response_data, status=200)
        
    except Exception as e:
        print(f"Get faculty error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_role('HOD')
def schedule_meetings(request):
    """
    HOD schedules multiple meetings for a mentorship
    Required fields:
        - mentorshipId: UUID of the mentorship
        - meetings: Array of {date: "YYYY-MM-DD", time: "HH:MM", description: "optional"}
    Each meeting will be created with status 'YET_TO_DONE'
    """
    try:
        data = json.loads(request.body)
        mentorship_id = data.get('mentorshipId')
        meetings_data = data.get('meetings')
        
        # Validate required fields
        if not mentorship_id:
            return JsonResponse(
                {'message': 'mentorshipId is required'},
                status=400
            )
        
        if not meetings_data or not isinstance(meetings_data, list) or len(meetings_data) == 0:
            return JsonResponse(
                {'message': 'meetings must be a non-empty array'},
                status=400
            )
        
        from .models import Mentorship, Meeting, MeetingStatus, HOD
        
        # Get HOD user ID from request
        hod_user_id = request.user_id
        
        # Find the mentorship
        try:
            mentorship = Mentorship.objects.select_related('faculty', 'student').get(id=mentorship_id)
        except Mentorship.DoesNotExist:
            return JsonResponse(
                {'message': 'Mentorship not found'},
                status=404
            )
        
        # Verify HOD is authorized for this department
        try:
            hod = HOD.objects.get(
                user_id=hod_user_id,
                department=mentorship.department,
                endDate__isnull=True
            )
        except HOD.DoesNotExist:
            return JsonResponse(
                {'message': f'You are not authorized to schedule meetings for {mentorship.department} department'},
                status=403
            )
        
        # Process each meeting
        created_meetings = []
        failed_meetings = []
        
        for idx, meeting_data in enumerate(meetings_data):
            try:
                meeting_date = meeting_data.get('date')
                meeting_time = meeting_data.get('time')
                
                if not meeting_date or not meeting_time:
                    failed_meetings.append({
                        'index': idx,
                        'reason': 'date and time are required'
                    })
                    continue
                
                # Parse date and time
                from datetime import datetime
                try:
                    parsed_date = datetime.strptime(meeting_date, '%Y-%m-%d').date()
                    parsed_time = datetime.strptime(meeting_time, '%H:%M').time()
                except ValueError:
                    failed_meetings.append({
                        'index': idx,
                        'reason': 'Invalid date/time format. Use YYYY-MM-DD for date and HH:MM for time'
                    })
                    continue
                
                # Create meeting with YET_TO_DONE status
                meeting = Meeting.objects.create(
                    mentorship=mentorship,
                    date=parsed_date,
                    time=parsed_time,
                    status=MeetingStatus.YET_TO_DONE
                )
                
                created_meetings.append({
                    'id': str(meeting.id),
                    'date': meeting.date.isoformat(),
                    'time': meeting.time.strftime('%H:%M'),
                    'status': meeting.status
                })
                
            except Exception as e:
                failed_meetings.append({
                    'index': idx,
                    'reason': str(e)
                })
        
        # Check if any meetings were created
        if len(created_meetings) == 0:
            return JsonResponse({
                'message': 'Failed to create any meetings',
                'failed': failed_meetings
            }, status=400)
        
        return JsonResponse({
            'message': f'Scheduled {len(created_meetings)} meeting(s) successfully',
            'mentorship': {
                'id': str(mentorship.id),
                'faculty': {
                    'name': mentorship.faculty.name,
                    'employeeId': mentorship.faculty.employeeId
                },
                'student': {
                    'name': mentorship.student.name,
                    'rollNumber': mentorship.student.rollNumber
                },
                'department': mentorship.department
            },
            'results': {
                'created': created_meetings,
                'failed': failed_meetings,
                'totalRequested': len(meetings_data),
                'successCount': len(created_meetings),
                'failedCount': len(failed_meetings)
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'message': 'Invalid JSON in request body'},
            status=400
        )
    except Exception as e:
        print(f"Schedule meetings error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_role('HOD')
def schedule_group_meetings(request):
    """
    HOD schedules meetings for ALL students in a mentorship group at once.
    Required fields:
        - facultyId: UUID of the faculty
        - year: Academic year (1-4)
        - semester: Semester (1-2)
        - meetings: Array of {date: "YYYY-MM-DD", time: "HH:MM", description: "optional"}
    Creates meetings for all students in the specified group.
    """
    try:
        data = json.loads(request.body)
        faculty_id = data.get('facultyId')
        year = data.get('year')
        semester = data.get('semester')
        meetings_data = data.get('meetings')
        
        # Validate required fields
        if not faculty_id or not year or not semester:
            return JsonResponse(
                {'message': 'facultyId, year, and semester are required'},
                status=400
            )
        
        if not meetings_data or not isinstance(meetings_data, list) or len(meetings_data) == 0:
            return JsonResponse(
                {'message': 'meetings must be a non-empty array'},
                status=400
            )
        
        from .models import Faculty, Mentorship, Meeting, MeetingStatus, HOD
        from datetime import datetime
        
        hod_user_id = request.user_id
        
        # Get faculty
        try:
            faculty = Faculty.objects.get(id=faculty_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty not found'}, status=404)
        
        # Verify HOD is authorized for this department
        try:
            hod = HOD.objects.get(
                user_id=hod_user_id,
                department=faculty.department,
                endDate__isnull=True
            )
        except HOD.DoesNotExist:
            return JsonResponse(
                {'message': f'You are not authorized for {faculty.department} department'},
                status=403
            )
        
        # Get all active mentorships in this group
        mentorships = Mentorship.objects.filter(
            faculty=faculty,
            year=year,
            semester=semester,
            is_active=True
        ).select_related('student')
        
        if not mentorships.exists():
            return JsonResponse(
                {'message': 'No active mentorships found in this group'},
                status=404
            )
        
        # Parse meeting dates
        parsed_meetings = []
        for idx, meeting_data in enumerate(meetings_data):
            meeting_date = meeting_data.get('date')
            meeting_time = meeting_data.get('time')
            description = meeting_data.get('description', '')
            
            if not meeting_date or not meeting_time:
                continue
            
            try:
                parsed_date = datetime.strptime(meeting_date, '%Y-%m-%d').date()
                parsed_time = datetime.strptime(meeting_time, '%H:%M').time()
                parsed_meetings.append({
                    'date': parsed_date,
                    'time': parsed_time,
                    'description': description
                })
            except ValueError:
                continue
        
        if not parsed_meetings:
            return JsonResponse(
                {'message': 'No valid meetings to schedule'},
                status=400
            )
        
        # Create meetings for all students
        students_with_meetings = []
        failed_students = []
        total_meetings_created = 0
        
        for mentorship in mentorships:
            try:
                meetings_created = 0
                for meeting_data in parsed_meetings:
                    Meeting.objects.create(
                        mentorship=mentorship,
                        date=meeting_data['date'],
                        time=meeting_data['time'],
                        description=meeting_data['description'],
                        status=MeetingStatus.YET_TO_DONE
                    )
                    meetings_created += 1
                    total_meetings_created += 1
                
                students_with_meetings.append({
                    'studentId': str(mentorship.student.id),
                    'studentName': mentorship.student.name,
                    'meetingsCreated': meetings_created
                })
            except Exception as e:
                failed_students.append({
                    'studentName': mentorship.student.name,
                    'reason': str(e)
                })
        
        return JsonResponse({
            'message': f'Scheduled {total_meetings_created} meeting(s) for {len(students_with_meetings)} student(s)',
            'group': {
                'facultyId': str(faculty.id),
                'facultyName': faculty.name,
                'year': year,
                'semester': semester,
                'studentCount': len(students_with_meetings)
            },
            'results': {
                'totalStudents': len(students_with_meetings),
                'totalMeetingsCreated': total_meetings_created,
                'studentsWithMeetings': students_with_meetings,
                'failed': failed_students
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        print(f"Schedule group meetings error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_mentor_details(request):
    """
    Get current and past mentor details for a student
    Returns current mentor info and list of all past mentors
    """
    try:
        # Get student user ID from request (set by middleware)
        student_user_id = request.user_id
        
        from .models import Student, Mentor
        
        # Find the student
        try:
            student = Student.objects.select_related('user').get(user_id=student_user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Get current mentor details
        current_mentor_info = None
        if student.currentMentorId:
            try:
                current_mentor = Mentor.objects.select_related('faculty').get(
                    id=student.currentMentorId,
                    isActive=True
                )
                current_mentor_info = {
                    'id': current_mentor.id,
                    'faculty': {
                        'name': current_mentor.faculty.name,
                        'employeeId': current_mentor.faculty.employeeId,
                        'department': current_mentor.faculty.department,
                        'collegeEmail': current_mentor.faculty.collegeEmail,
                        'phone1': current_mentor.faculty.phone1,
                        'office': current_mentor.faculty.office,
                        'officeHours': current_mentor.faculty.officeHours
                    },
                    'year': current_mentor.year,
                    'semester': current_mentor.semester,
                    'startDate': current_mentor.startDate.isoformat(),
                    'comments': current_mentor.comments
                }
            except Mentor.DoesNotExist:
                pass
        
        # Get past mentors (all mentors with isActive=False)
        past_mentors = Mentor.objects.filter(
            student=student,
            isActive=False
        ).select_related('faculty').order_by('-endDate')
        
        past_mentors_list = []
        for mentor in past_mentors:
            past_mentors_list.append({
                'id': mentor.id,
                'faculty': {
                    'name': mentor.faculty.name,
                    'employeeId': mentor.faculty.employeeId,
                    'department': mentor.faculty.department,
                    'collegeEmail': mentor.faculty.collegeEmail
                },
                'year': mentor.year,
                'semester': mentor.semester,
                'startDate': mentor.startDate.isoformat() if mentor.startDate else None,
                'endDate': mentor.endDate.isoformat() if mentor.endDate else None,
                'comments': mentor.comments
            })
        
        return JsonResponse({
            'student': {
                'name': student.name,
                'rollNumber': student.rollNumber,
                'branch': student.branch,
                'program': student.program
            },
            'currentMentor': current_mentor_info,
            'pastMentors': past_mentors_list,
            'totalPastMentors': len(past_mentors_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get mentor details error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


# ==================== STUDENT APIs ====================

@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_about(request):
    """
    Get student's complete profile details
    Returns all details from the Student table
    """
    try:
        user_id = request.user_id
        
        from .models import Student
        
        try:
            student = Student.objects.select_related('user').get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        return JsonResponse({
            'id': str(student.id),
            'name': student.name,
            'aadhar': student.aadhar,
            'phoneNumber': student.phoneNumber,
            'phoneCode': student.phoneCode,
            'registrationNumber': student.registrationNumber,
            'rollNumber': student.rollNumber,
            'passPort': student.passPort,
            'emergencyContact': student.emergencyContact,
            'personalEmail': student.personalEmail,
            'collegeEmail': student.collegeEmail,
            'dob': student.dob.isoformat() if student.dob else None,
            'address': student.address,
            'program': student.program,
            'branch': student.branch,
            'year': student.year,
            'bloodGroup': student.bloodGroup,
            'dayScholar': student.dayScholar,
            'gender': student.gender,
            'community': student.community,
            'status': student.status,
            'father': {
                'name': student.fatherName,
                'occupation': student.fatherOccupation,
                'aadhar': student.fatherAadhar,
                'phone': student.fatherNumber
            },
            'mother': {
                'name': student.motherName,
                'occupation': student.motherOccupation,
                'aadhar': student.motherAadhar,
                'phone': student.motherNumber
            },
            'academicBackground': {
                'xMarks': student.xMarks,
                'xiiMarks': student.xiiMarks,
                'jeeMains': student.jeeMains,
                'jeeAdvanced': student.jeeAdvanced
            },
            'profilePicture': student.user.profilePicture,
            'createdAt': student.createdAt.isoformat() if student.createdAt else None,
            'updatedAt': student.updatedAt.isoformat() if student.updatedAt else None
        }, status=200)
        
    except Exception as e:
        print(f"Get student about error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_career_details(request):
    """
    Get student's career details including hobbies, strengths, career interests
    """
    try:
        user_id = request.user_id
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        try:
            career = CareerDetails.objects.get(student=student)
            return JsonResponse({
                'id': str(career.id),
                'studentId': str(student.id),
                'hobbies': career.hobbies,
                'strengths': career.strengths,
                'areasToImprove': career.areasToImprove,
                'careerInterests': {
                    'core': career.core,
                    'it': career.it,
                    'higherEducation': career.higherEducation,
                    'startup': career.startup,
                    'familyBusiness': career.familyBusiness,
                    'otherInterests': career.otherInterests
                },
                'careerRankings': {
                    'govt_sector_rank': career.govt_sector_rank,
                    'core_rank': career.core_rank,
                    'it_rank': career.it_rank,
                    'higher_education_rank': career.higher_education_rank,
                    'startup_rank': career.startup_rank,
                    'family_business_rank': career.family_business_rank
                }
            }, status=200)
        except CareerDetails.DoesNotExist:
            return JsonResponse({
                'id': None,
                'studentId': str(student.id),
                'hobbies': [],
                'strengths': [],
                'areasToImprove': [],
                'careerInterests': {
                    'core': [],
                    'it': [],
                    'higherEducation': [],
                    'startup': [],
                    'familyBusiness': [],
                    'otherInterests': []
                },
                'careerRankings': {
                    'govt_sector_rank': 1,
                    'core_rank': 2,
                    'it_rank': 3,
                    'higher_education_rank': 4,
                    'startup_rank': 5,
                    'family_business_rank': 6
                },
                'message': 'No career details found. Please add your career information.'
            }, status=200)
        
    except Exception as e:
        print(f"Get career details error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_internships(request):
    """
    Get all internships for the student
    """
    try:
        user_id = request.user_id
        
        from .models import Student, Internship
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        internships = Internship.objects.filter(student=student).order_by('-semester')
        
        internships_list = []
        for internship in internships:
            internships_list.append({
                'id': str(internship.id),
                'semester': internship.semester,
                'type': internship.type,
                'organisation': internship.organisation,
                'stipend': internship.stipend,
                'duration': internship.duration,
                'location': internship.location
            })
        
        return JsonResponse({
            'studentId': str(student.id),
            'internships': internships_list,
            'total': len(internships_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get internships error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_personal_problems(request):
    """
    Get student's personal problems/challenges
    """
    try:
        user_id = request.user_id
        
        from .models import Student, PersonalProblem
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        try:
            problems = PersonalProblem.objects.get(student=student)
            return JsonResponse({
                'id': str(problems.id),
                'studentId': str(student.id),
                'stress': problems.stress,
                'anger': problems.anger,
                'emotional_problem': problems.emotional_problem,
                'low_self_esteem': problems.low_self_esteem,
                'examination_anxiety': problems.examination_anxiety,
                'negative_thoughts': problems.negative_thoughts,
                'exam_phobia': problems.exam_phobia,
                'stammering': problems.stammering,
                'financial_problems': problems.financial_problems,
                'disturbed_relationship_with_teachers': problems.disturbed_relationship_with_teachers,
                'disturbed_relationship_with_parents': problems.disturbed_relationship_with_parents,
                'mood_swings': problems.mood_swings,
                'stage_phobia': problems.stage_phobia,
                'poor_concentration': problems.poor_concentration,
                'poor_memory_problem': problems.poor_memory_problem,
                'adjustment_problem': problems.adjustment_problem,
                'frustration': problems.frustration,
                'migraine_headache': problems.migraine_headache,
                'relationship_problems': problems.relationship_problems,
                'fear_of_public_speaking': problems.fear_of_public_speaking,
                'disciplinary_problems_in_college': problems.disciplinary_problems_in_college,
                'disturbed_peer_relationship_with_friends': problems.disturbed_peer_relationship_with_friends,
                'worries_about_future': problems.worries_about_future,
                'disappointment_with_course': problems.disappointment_with_course,
                'time_management_problem': problems.time_management_problem,
                'lack_of_expression': problems.lack_of_expression,
                'poor_decisive_power': problems.poor_decisive_power,
                'conflicts': problems.conflicts,
                'low_self_motivation': problems.low_self_motivation,
                'procrastination': problems.procrastination,
                'suicidal_attempt_or_thought': problems.suicidal_attempt_or_thought,
                'tobacco_or_alcohol_use': problems.tobacco_or_alcohol_use,
                'poor_command_of_english': problems.poor_command_of_english,
                # Special Issues
                'economic_issues': problems.economic_issues,
                'economic_issues_suggestion': problems.economic_issues_suggestion,
                'economic_issues_outcome': problems.economic_issues_outcome,
                'teenage_issues': problems.teenage_issues,
                'teenage_issues_suggestion': problems.teenage_issues_suggestion,
                'teenage_issues_outcome': problems.teenage_issues_outcome,
                'health_issues': problems.health_issues,
                'health_issues_suggestion': problems.health_issues_suggestion,
                'health_issues_outcome': problems.health_issues_outcome,
                'emotional_issues': problems.emotional_issues,
                'emotional_issues_suggestion': problems.emotional_issues_suggestion,
                'emotional_issues_outcome': problems.emotional_issues_outcome,
                'psychological_issues': problems.psychological_issues,
                'psychological_issues_suggestion': problems.psychological_issues_suggestion,
                'psychological_issues_outcome': problems.psychological_issues_outcome,
                'additional_comments': problems.additional_comments
            }, status=200)
        except PersonalProblem.DoesNotExist:
            return JsonResponse({
                'id': None,
                'studentId': str(student.id),
                'stress': None,
                'anger': None,
                'emotional_problem': None,
                'low_self_esteem': None,
                'examination_anxiety': None,
                'negative_thoughts': None,
                'exam_phobia': None,
                'stammering': None,
                'financial_problems': None,
                'disturbed_relationship_with_teachers': None,
                'disturbed_relationship_with_parents': None,
                'mood_swings': None,
                'stage_phobia': None,
                'poor_concentration': None,
                'poor_memory_problem': None,
                'adjustment_problem': None,
                'frustration': None,
                'migraine_headache': None,
                'relationship_problems': None,
                'fear_of_public_speaking': None,
                'disciplinary_problems_in_college': None,
                'disturbed_peer_relationship_with_friends': None,
                'worries_about_future': None,
                'disappointment_with_course': None,
                'time_management_problem': None,
                'lack_of_expression': None,
                'poor_decisive_power': None,
                'conflicts': None,
                'low_self_motivation': None,
                'procrastination': None,
                'suicidal_attempt_or_thought': None,
                'tobacco_or_alcohol_use': None,
                'poor_command_of_english': None,
                # Special Issues
                'economic_issues': None, 'economic_issues_suggestion': None, 'economic_issues_outcome': None,
                'teenage_issues': None, 'teenage_issues_suggestion': None, 'teenage_issues_outcome': None,
                'health_issues': None, 'health_issues_suggestion': None, 'health_issues_outcome': None,
                'emotional_issues': None, 'emotional_issues_suggestion': None, 'emotional_issues_outcome': None,
                'psychological_issues': None, 'psychological_issues_suggestion': None, 'psychological_issues_outcome': None,
                'additional_comments': None,
                'message': 'No personal problems record found.'
            }, status=200)
        
    except Exception as e:
        print(f"Get personal problems error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_projects(request):
    """
    Get all projects for the student
    """
    try:
        user_id = request.user_id
        
        from .models import Student, Project
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        projects = Project.objects.filter(student=student).select_related('mentor').order_by('-semester')
        
        projects_list = []
        for project in projects:
            projects_list.append({
                'id': str(project.id),
                'semester': project.semester,
                'title': project.title,
                'description': project.description,
                'technologies': project.technologies,
                'mentor': {
                    'name': project.mentor.name if project.mentor else None,
                    'employeeId': project.mentor.employeeId if project.mentor else None,
                    'department': project.mentor.department if project.mentor else None
                } if project.mentor else None
            })
        
        return JsonResponse({
            'studentId': str(student.id),
            'projects': projects_list,
            'total': len(projects_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get projects error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_academic(request):
    """
    Get student's academic details including all semesters, subjects, and grades
    """
    try:
        user_id = request.user_id
        
        from .models import Student, Semester, StudentSubject
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Get all semesters with their subjects
        semesters = Semester.objects.filter(student=student).order_by('semester')
        
        semesters_list = []
        for sem in semesters:
            # Get all subjects for this semester
            subject_grades = StudentSubject.objects.filter(
                student=student,
                semester=sem
            ).select_related('subject')
            
            subjects_list = []
            for sg in subject_grades:
                subjects_list.append({
                    'subjectCode': sg.subject.subjectCode,
                    'subjectName': sg.subject.subjectName,
                    'credits': sg.subject.credits,
                    'grade': sg.grade
                })
            
            semesters_list.append({
                'semester': sem.semester,
                'sgpa': sem.sgpa,
                'cgpa': sem.cgpa,
                'subjects': subjects_list,
                'totalCredits': sum(s['credits'] for s in subjects_list)
            })
        
        # Calculate overall CGPA (latest semester's CGPA)
        latest_cgpa = semesters_list[-1]['cgpa'] if semesters_list else None
        
        return JsonResponse({
            'studentId': str(student.id),
            'studentName': student.name,
            'program': student.program,
            'branch': student.branch,
            'currentYear': student.year,
            'latestCGPA': latest_cgpa,
            'semesters': semesters_list,
            'totalSemesters': len(semesters_list),
            'preAdmission': {
                'xMarks': student.xMarks,
                'xiiMarks': student.xiiMarks,
                'jeeMains': student.jeeMains,
                'jeeAdvanced': student.jeeAdvanced
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get academic details error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_requests(request):
    """
    Get all requests made by the student
    """
    try:
        user_id = request.user_id
        
        from .models import Student, Request
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Get all requests by this student
        requests = Request.objects.filter(student=student).select_related('assigned_to').order_by('-createdAt')
        
        requests_list = []
        for req in requests:
            request_item = {
                'id': str(req.id),
                'type': req.type,
                'status': req.status,
                'remarks': req.remarks,
                'feedback': req.feedback,
                'requestData': req.request_data,
                'createdAt': req.createdAt.isoformat(),
                'updatedAt': req.updatedAt.isoformat(),
                'assignedTo': {
                    'id': str(req.assigned_to.id),
                    'name': req.assigned_to.name,
                    'department': req.assigned_to.department
                } if req.assigned_to else None
            }
            requests_list.append(request_item)
        
        # Separate by status
        pending = [r for r in requests_list if r['status'] == 'PENDING']
        approved = [r for r in requests_list if r['status'] == 'APPROVED']
        rejected = [r for r in requests_list if r['status'] == 'REJECTED']
        
        return JsonResponse({
            'studentId': str(student.id),
            'requests': requests_list,
            'summary': {
                'total': len(requests_list),
                'pending': len(pending),
                'approved': len(approved),
                'rejected': len(rejected)
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get student requests error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_role('STUDENT')
def create_internship_request(request):
    """
    Create a request for adding a new internship
    Request will be pending until approved by mentor/HOD
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, Request, RequestType, Mentorship
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Validate required fields
        required_fields = ['semester', 'type', 'organisation', 'duration', 'location']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse(
                    {'message': f'{field} is required'},
                    status=400
                )
        
        # Get current mentor to assign the request
        mentorship = Mentorship.objects.filter(student=student, is_active=True).first()
        assigned_to = mentorship.faculty if mentorship else None
        
        # Store internship data in request
        internship_data = {
            'semester': data.get('semester'),
            'type': data.get('type'),
            'organisation': data.get('organisation'),
            'stipend': data.get('stipend', 0),
            'duration': data.get('duration'),
            'location': data.get('location')
        }
        
        # Create the request
        new_request = Request.objects.create(
            student=student,
            assigned_to=assigned_to,
            type=RequestType.INTERNSHIP,
            request_data=internship_data,
            remarks=data.get('remarks', '')
        )
        
        return JsonResponse({
            'message': 'Internship request submitted successfully',
            'requestId': str(new_request.id),
            'status': new_request.status,
            'assignedTo': assigned_to.name if assigned_to else 'Not assigned'
        }, status=201)
        
    except Exception as e:
        print(f"Create internship request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_role('STUDENT')
def create_project_request(request):
    """
    Create a request for adding a new project
    Request will be pending until approved by mentor/HOD
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, Request, RequestType, Mentorship, Faculty
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Validate required fields
        required_fields = ['semester', 'title', 'description']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse(
                    {'message': f'{field} is required'},
                    status=400
                )
        
        # Get current mentor to assign the request
        mentorship = Mentorship.objects.filter(student=student, is_active=True).first()
        assigned_to = mentorship.faculty if mentorship else None
        
        # Check if project mentor exists (optional field)
        project_mentor_id = data.get('mentorId')
        project_mentor_name = None
        if project_mentor_id:
            try:
                project_mentor = Faculty.objects.get(id=project_mentor_id)
                project_mentor_name = project_mentor.name
            except Faculty.DoesNotExist:
                pass
        
        # Store project data in request
        project_data = {
            'semester': data.get('semester'),
            'title': data.get('title'),
            'description': data.get('description'),
            'technologies': data.get('technologies', []),
            'mentorId': project_mentor_id,
            'mentorName': project_mentor_name
        }
        
        # Create the request
        new_request = Request.objects.create(
            student=student,
            assigned_to=assigned_to,
            type=RequestType.PROJECT,
            request_data=project_data,
            remarks=data.get('remarks', '')
        )
        
        return JsonResponse({
            'message': 'Project request submitted successfully',
            'requestId': str(new_request.id),
            'status': new_request.status,
            'assignedTo': assigned_to.name if assigned_to else 'Not assigned'
        }, status=201)
        
    except Exception as e:
        print(f"Create project request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_role('FACULTY', 'HOD')
def approve_request(request, request_id):
    """
    Approve a pending request (Internship or Project)
    Creates the actual record and links it to the student
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body) if request.body else {}
        
        from .models import Request, RequestStatus, Faculty, Internship, Project
        from django.contrib.contenttypes.models import ContentType
        
        try:
            faculty = Faculty.objects.get(user__id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse(
                {'message': 'Faculty profile not found'},
                status=404
            )
        
        try:
            req = Request.objects.get(id=request_id)
        except Request.DoesNotExist:
            return JsonResponse(
                {'message': 'Request not found'},
                status=404
            )
        
        if req.status != RequestStatus.PENDING:
            return JsonResponse(
                {'message': f'Request already {req.status.lower()}'},
                status=400
            )
        
        # Check if faculty is assigned to this request or is HOD
        user = User.objects.get(id=user_id)
        is_hod = user.role == 'HOD'
        is_assigned = req.assigned_to and req.assigned_to.id == faculty.id
        
        if not is_assigned and not is_hod:
            return JsonResponse(
                {'message': 'You are not authorized to approve this request'},
                status=403
            )
        
        # Create the actual record based on request type
        created_object = None
        
        # Handle None request_data
        request_data = req.request_data or {}
        
        if req.type == 'INTERNSHIP':
            # Create Internship with ForeignKey to student
            internship = Internship.objects.create(
                student=req.student,
                semester=request_data.get('semester', 1),
                type=request_data.get('type', 'SUMMER'),
                organisation=request_data.get('organisation', ''),
                stipend=request_data.get('stipend', 0),
                duration=request_data.get('duration', ''),
                location=request_data.get('location', '')
            )
            created_object = internship
            
            # Update request with reference to created internship
            req.content_type = ContentType.objects.get_for_model(Internship)
            req.object_id = internship.id
            
        elif req.type == 'PROJECT':
            # Get project mentor if specified
            project_mentor = None
            if request_data.get('mentorId'):
                try:
                    project_mentor = Faculty.objects.get(id=request_data['mentorId'])
                except Faculty.DoesNotExist:
                    pass
            
            # Create Project with ForeignKey to student
            project = Project.objects.create(
                student=req.student,
                semester=request_data.get('semester', 1),
                title=request_data.get('title', ''),
                description=request_data.get('description', ''),
                technologies=request_data.get('technologies', []),
                mentor=project_mentor
            )
            created_object = project
            
            # Update request with reference to created project
            req.content_type = ContentType.objects.get_for_model(Project)
            req.object_id = project.id
        
        elif req.type == 'DELETE_INTERNSHIP':
            # Delete the internship (ForeignKey relationship - one student per internship)
            internship_id = request_data.get('internshipId')
            if internship_id:
                try:
                    internship = Internship.objects.get(id=internship_id, student=req.student)
                    internship.delete()
                except Internship.DoesNotExist:
                    pass
        
        elif req.type == 'DELETE_PROJECT':
            # Delete the project (ForeignKey relationship - one student per project)
            project_id = request_data.get('projectId')
            if project_id:
                try:
                    project = Project.objects.get(id=project_id, student=req.student)
                    project.delete()
                except Project.DoesNotExist:
                    pass
        
        elif req.type == 'MEETING_REQUEST':
            # Create a meeting when approved
            from .models import Meeting, MeetingStatus, Mentorship
            
            mentorship_id = request_data.get('mentorshipId')
            if mentorship_id:
                try:
                    mentorship = Mentorship.objects.get(id=mentorship_id)
                    
                    # Parse date and time from request data
                    from datetime import datetime
                    meeting_date_str = request_data.get('date')
                    meeting_time_str = request_data.get('time', '10:00')
                    
                    meeting_date = datetime.strptime(meeting_date_str, '%Y-%m-%d').date() if meeting_date_str else datetime.now().date()
                    meeting_time = datetime.strptime(meeting_time_str, '%H:%M').time() if meeting_time_str else datetime.now().time()
                    
                    # Create the meeting
                    meeting = Meeting.objects.create(
                        mentorship=mentorship,
                        date=meeting_date,
                        time=meeting_time,
                        description=request_data.get('description', ''),
                        status=MeetingStatus.UPCOMING
                    )
                    created_object = meeting
                except Mentorship.DoesNotExist:
                    pass
        
        # Update request status
        req.status = RequestStatus.APPROVED
        req.feedback = data.get('feedback', 'Approved')
        req.save()
        
        return JsonResponse({
            'message': f'{req.type.replace("_", " ").capitalize()} approved successfully',
            'requestId': str(req.id),
            'status': req.status,
            'createdId': str(created_object.id) if created_object else None
        }, status=200)
        
    except Exception as e:
        print(f"Approve request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_role('FACULTY', 'HOD')
def reject_request(request, request_id):
    """
    Reject a pending request
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body) if request.body else {}
        
        from .models import Request, RequestStatus, Faculty
        
        try:
            faculty = Faculty.objects.get(user__id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse(
                {'message': 'Faculty profile not found'},
                status=404
            )
        
        try:
            req = Request.objects.get(id=request_id)
        except Request.DoesNotExist:
            return JsonResponse(
                {'message': 'Request not found'},
                status=404
            )
        
        if req.status != RequestStatus.PENDING:
            return JsonResponse(
                {'message': f'Request already {req.status.lower()}'},
                status=400
            )
        
        # Check if faculty is assigned to this request or is HOD
        user = User.objects.get(id=user_id)
        is_hod = user.role == 'HOD'
        is_assigned = req.assigned_to and req.assigned_to.id == faculty.id
        
        if not is_assigned and not is_hod:
            return JsonResponse(
                {'message': 'You are not authorized to reject this request'},
                status=403
            )
        
        # Update request status
        req.status = RequestStatus.REJECTED
        req.feedback = data.get('feedback', 'Rejected')
        req.save()
        
        return JsonResponse({
            'message': 'Request rejected',
            'requestId': str(req.id),
            'status': req.status
        }, status=200)
        
    except Exception as e:
        print(f"Reject request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('FACULTY', 'HOD')
def get_pending_requests(request):
    """
    Get all pending requests assigned to this faculty/HOD
    """
    try:
        user_id = request.user_id
        
        from .models import Request, RequestStatus, Faculty
        
        try:
            faculty = Faculty.objects.get(user__id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse(
                {'message': 'Faculty profile not found'},
                status=404
            )
        
        user = User.objects.get(id=user_id)
        is_hod = user.role == 'HOD'
        
        # HOD can see all requests in their department
        if is_hod:
            requests = Request.objects.filter(
                status=RequestStatus.PENDING,
                student__branch=faculty.department
            ).select_related('student', 'assigned_to').order_by('-createdAt')
        else:
            # Faculty sees only requests assigned to them
            requests = Request.objects.filter(
                assigned_to=faculty,
                status=RequestStatus.PENDING
            ).select_related('student').order_by('-createdAt')
        
        requests_list = []
        for req in requests:
            requests_list.append({
                'id': str(req.id),
                'type': req.type,
                'status': req.status,
                'remarks': req.remarks,
                'requestData': req.request_data,
                'createdAt': req.createdAt.isoformat(),
                'student': {
                    'id': str(req.student.id),
                    'name': req.student.name,
                    'rollNumber': req.student.rollNumber,
                    'branch': req.student.branch,
                    'year': req.student.year
                },
                'assignedTo': {
                    'id': str(req.assigned_to.id),
                    'name': req.assigned_to.name
                } if req.assigned_to else None
            })
        
        return JsonResponse({
            'requests': requests_list,
            'total': len(requests_list)
        }, status=200)
        
    except Exception as e:
        print(f"Get pending requests error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


# ============ STUDENT MENTOR ENDPOINTS ============

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
@require_role('STUDENT')
def get_student_mentors(request):
    """
    Get all mentors (current and past) for the logged-in student
    """
    try:
        from .models import Student, Mentorship
        
        user_data = request.user_data
        student_id = user_data.get('entityId')
        
        student = Student.objects.filter(id=student_id).first()
        
        if not student:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Get all mentorships
        mentorships = Mentorship.objects.filter(student=student).select_related('faculty').order_by('-start_date')
        
        current_mentor = None
        past_mentors = []
        
        for mentorship in mentorships:
            faculty = mentorship.faculty
            mentor_data = {
                'mentorshipId': str(mentorship.id),
                'facultyId': str(faculty.id),
                'name': faculty.name,
                'email': faculty.user.email if faculty.user else None,
                'phone': faculty.phone1,
                'department': faculty.department,
                'year': mentorship.year,
                'semester': mentorship.semester,
                'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
                'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None,
                'isActive': mentorship.is_active,
                'comments': mentorship.comments or []
            }
            
            if mentorship.is_active:
                current_mentor = mentor_data
            else:
                past_mentors.append(mentor_data)
        
        return JsonResponse({
            'studentId': str(student.id),
            'studentName': student.name,
            'currentMentor': current_mentor,
            'pastMentors': past_mentors,
            'totalMentors': 1 if current_mentor else 0 + len(past_mentors)
        }, status=200)
        
    except Exception as e:
        print(f"Get student mentors error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_auth
@require_role('STUDENT')
def get_mentorship_meetings(request, mentorship_id):
    """
    Get all meetings for a specific mentorship
    """
    try:
        from .models import Student, Mentorship, Meeting
        
        user_data = request.user_data
        student_id = user_data.get('entityId')
        
        student = Student.objects.filter(id=student_id).first()
        
        if not student:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Verify this mentorship belongs to the student
        mentorship = Mentorship.objects.filter(
            id=mentorship_id,
            student=student
        ).select_related('faculty').first()
        
        if not mentorship:
            return JsonResponse(
                {'message': 'Mentorship not found'},
                status=404
            )
        
        # Get all meetings for this mentorship
        meetings = Meeting.objects.filter(mentorship=mentorship).order_by('-date', '-time')
        
        meetings_list = []
        for meeting in meetings:
            meetings_list.append({
                'id': str(meeting.id),
                'date': meeting.date.isoformat(),
                'time': meeting.time.strftime('%H:%M') if meeting.time else None,
                'description': meeting.description,
                'facultyReview': meeting.facultyReview,
                'status': meeting.status,
                'createdAt': meeting.createdAt.isoformat()
            })
        
        # Calculate meeting stats
        total_meetings = len(meetings_list)
        completed_meetings = sum(1 for m in meetings_list if m['status'] == 'COMPLETED')
        upcoming_meetings = sum(1 for m in meetings_list if m['status'] == 'UPCOMING')
        cancelled_meetings = sum(1 for m in meetings_list if m['status'] == 'CANCELLED')
        
        return JsonResponse({
            'mentorshipId': str(mentorship.id),
            'mentor': {
                'id': str(mentorship.faculty.id),
                'name': mentorship.faculty.name,
                'department': mentorship.faculty.department,
                'email': mentorship.faculty.user.email if mentorship.faculty.user else None
            },
            'year': mentorship.year,
            'semester': mentorship.semester,
            'isActive': mentorship.is_active,
            'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
            'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None,
            'meetings': meetings_list,
            'stats': {
                'total': total_meetings,
                'completed': completed_meetings,
                'upcoming': upcoming_meetings,
                'cancelled': cancelled_meetings
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get mentorship meetings error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
@require_role('ADMIN')
def get_hods(request):
    """
    Get all HODs with their details
    Accessible by: ADMIN only
    """
    try:
        from .models import HOD, Department
        
        hods = HOD.objects.all().select_related('user', 'faculty').order_by('department')
        
        result = []
        for hod in hods:
            result.append({
                'id': str(hod.id),
                'userId': str(hod.user.id),
                'facultyId': str(hod.faculty.id),
                'department': hod.department,
                'name': hod.faculty.name,
                'email': hod.user.email,
                'collegeEmail': hod.faculty.collegeEmail,
                'phone': hod.faculty.phone1,
                'startDate': hod.startDate.isoformat() if hod.startDate else None,
                'endDate': hod.endDate.isoformat() if hod.endDate else None,
                'isActive': hod.endDate is None,
            })
        
        return JsonResponse({
            'message': f'Found {len(result)} HOD(s)',
            'count': len(result),
            'hods': result
        }, status=200)
        
    except Exception as e:
        print(f"Get HODs error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
@require_role('ADMIN')
def assign_hod(request):
    """
    Assign a new HOD for a department
    Request body:
        - facultyId: UUID of the faculty member to assign as HOD
        - department: Department code (CSE, ECE, EEE, MECH, CIVIL, BIO-TECH, MME, CHEM)
    
    This will:
    1. End the current HOD's term for the department (set endDate)
    2. Create a new HOD record for the faculty member
    3. Update the faculty member's user role to HOD
    
    Accessible by: ADMIN only
    """
    try:
        from .models import HOD, Faculty, User, Department
        from django.utils import timezone
        
        data = json.loads(request.body)
        faculty_id = data.get('facultyId')
        department = data.get('department')
        
        if not faculty_id:
            return JsonResponse({'message': 'Faculty ID is required'}, status=400)
        
        if not department:
            return JsonResponse({'message': 'Department is required'}, status=400)
        
        # Validate department
        valid_departments = [d.value for d in Department]
        if department not in valid_departments:
            return JsonResponse(
                {'message': f'Invalid department. Valid values: {valid_departments}'},
                status=400
            )
        
        # Find the faculty member
        try:
            faculty = Faculty.objects.select_related('user').get(id=faculty_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty not found'}, status=404)
        
        # Check if faculty is in the same department
        if faculty.department != department:
            return JsonResponse(
                {'message': f'Faculty is in {faculty.department} department, cannot be HOD of {department}'},
                status=400
            )
        
        # Check if faculty is already HOD
        existing_hod_record = HOD.objects.filter(faculty=faculty, endDate__isnull=True).first()
        if existing_hod_record:
            return JsonResponse(
                {'message': f'This faculty is already HOD of {existing_hod_record.department}'},
                status=400
            )
        
        now = timezone.now()
        
        # End current HOD's term for this department
        current_hod = HOD.objects.filter(department=department, endDate__isnull=True).first()
        old_hod_name = None
        if current_hod:
            old_hod_name = current_hod.faculty.name
            current_hod.endDate = now
            current_hod.save()
            
            # Revert old HOD's role to FACULTY
            current_hod.user.role = 'FACULTY'
            current_hod.user.save()
        
        # Create new HOD record
        new_hod = HOD.objects.create(
            user=faculty.user,
            faculty=faculty,
            department=department,
            startDate=now
        )
        
        # Update new HOD's role
        faculty.user.role = 'HOD'
        faculty.user.save()
        
        response_data = {
            'message': f'{faculty.name} is now the HOD of {department}',
            'hod': {
                'id': str(new_hod.id),
                'facultyId': str(faculty.id),
                'name': faculty.name,
                'email': faculty.user.email,
                'department': department,
                'startDate': new_hod.startDate.isoformat()
            }
        }
        
        if old_hod_name:
            response_data['previousHod'] = old_hod_name
        
        return JsonResponse(response_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Assign HOD error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


@csrf_exempt
@require_http_methods(["DELETE"])
@require_role('ADMIN')
def remove_hod(request, hod_id):
    """
    Remove/end a HOD's term
    This will:
    1. Set the endDate for the HOD record
    2. Revert the user's role to FACULTY
    
    Accessible by: ADMIN only
    """
    try:
        from .models import HOD
        from django.utils import timezone
        
        try:
            hod = HOD.objects.select_related('user', 'faculty').get(id=hod_id)
        except HOD.DoesNotExist:
            return JsonResponse({'message': 'HOD not found'}, status=404)
        
        if hod.endDate is not None:
            return JsonResponse({'message': 'This HOD is already removed/inactive'}, status=400)
        
        # End HOD's term
        hod.endDate = timezone.now()
        hod.save()
        
        # Revert role to FACULTY
        hod.user.role = 'FACULTY'
        hod.user.save()
        
        return JsonResponse({
            'message': f'{hod.faculty.name} is no longer HOD of {hod.department}',
            'hod': {
                'id': str(hod.id),
                'name': hod.faculty.name,
                'department': hod.department,
                'endDate': hod.endDate.isoformat()
            }
        }, status=200)
        
    except Exception as e:
        print(f"Remove HOD error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse(
            {'message': 'Server error'},
            status=500
        )


# ===================== HOD MENTORSHIP MANAGEMENT APIs =====================

@csrf_exempt
@require_http_methods(["GET"])
@require_role('HOD')
def get_hod_mentorships(request):
    """
    Get all mentorships in HOD's department with stats and unassigned students
    Returns:
        - stats: Total students, assigned, unassigned, total faculty, active mentors
        - mentorships: List of current/past mentorships grouped by faculty
        - unassignedStudents: Students without an active mentor
    """
    try:
        from .models import HOD, Mentorship, Faculty, Student
        from django.db.models import Count, Q
        
        hod_user_id = request.user_id
        
        # Get HOD and their department
        try:
            hod = HOD.objects.select_related('faculty').get(
                user_id=hod_user_id,
                endDate__isnull=True
            )
        except HOD.DoesNotExist:
            return JsonResponse({'message': 'Active HOD profile not found'}, status=404)
        
        department = hod.department
        
        # Get stats
        total_students = Student.objects.filter(branch=department).count()
        
        # Students with active mentorship
        assigned_student_ids = Mentorship.objects.filter(
            department=department,
            is_active=True
        ).values_list('student_id', flat=True)
        assigned_count = len(set(assigned_student_ids))
        unassigned_count = total_students - assigned_count
        
        # Faculty count
        total_faculty = Faculty.objects.filter(department=department, isActive=True).count()
        
        # Active mentors (faculty with at least one active mentorship)
        active_mentors = Faculty.objects.filter(
            department=department,
            isActive=True,
            mentorships__is_active=True
        ).distinct().count()
        
        # Get all mentorships grouped by faculty
        mentorships_by_faculty = {}
        
        mentorships = Mentorship.objects.filter(
            department=department
        ).select_related('faculty', 'student', 'faculty__user', 'student__user').order_by('-start_date')
        
        for mentorship in mentorships:
            faculty_id = str(mentorship.faculty.id)
            
            if faculty_id not in mentorships_by_faculty:
                mentorships_by_faculty[faculty_id] = {
                    'facultyId': faculty_id,
                    'facultyName': mentorship.faculty.name,
                    'facultyEmail': mentorship.faculty.user.email if mentorship.faculty.user else mentorship.faculty.collegeEmail,
                    'employeeId': mentorship.faculty.employeeId,
                    'activeMenteeCount': 0,
                    'totalMenteeCount': 0,
                    'currentMentees': [],
                    'pastMentees': []
                }
            
            mentee_data = {
                'mentorshipId': str(mentorship.id),
                'studentId': str(mentorship.student.id),
                'name': mentorship.student.name,
                'rollNumber': mentorship.student.rollNumber,
                'registrationNumber': mentorship.student.registrationNumber,
                'email': mentorship.student.user.email if mentorship.student.user else None,
                'program': mentorship.student.program,
                'branch': mentorship.student.branch,
                'year': mentorship.year,
                'semester': mentorship.semester,
                'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
                'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None,
                'isActive': mentorship.is_active
            }
            
            mentorships_by_faculty[faculty_id]['totalMenteeCount'] += 1
            
            if mentorship.is_active:
                mentorships_by_faculty[faculty_id]['activeMenteeCount'] += 1
                mentorships_by_faculty[faculty_id]['currentMentees'].append(mentee_data)
            else:
                mentorships_by_faculty[faculty_id]['pastMentees'].append(mentee_data)
        
        # Get unassigned students
        unassigned_students = Student.objects.filter(
            branch=department
        ).exclude(
            id__in=assigned_student_ids
        ).select_related('user').order_by('rollNumber')
        
        unassigned_list = []
        for student in unassigned_students:
            unassigned_list.append({
                'id': str(student.id),
                'name': student.name,
                'rollNumber': student.rollNumber,
                'registrationNumber': student.registrationNumber,
                'email': student.user.email if student.user else None,
                'program': student.program,
                'branch': student.branch,
                'year': student.year
            })
        
        return JsonResponse({
            'department': department,
            'stats': {
                'totalStudents': total_students,
                'assignedStudents': assigned_count,
                'unassignedStudents': unassigned_count,
                'totalFaculty': total_faculty,
                'activeMentors': active_mentors
            },
            'mentorshipsByFaculty': list(mentorships_by_faculty.values()),
            'unassignedStudents': unassigned_list
        }, status=200)
        
    except Exception as e:
        print(f"Get HOD mentorships error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('HOD')
def create_mentorship_meeting(request):
    """
    HOD creates a single meeting for a specific mentorship
    Required fields:
        - mentorshipId: UUID of the mentorship
        - date: "YYYY-MM-DD" format
        - time: "HH:MM" format
        - description: Optional meeting description/agenda
    """
    try:
        data = json.loads(request.body)
        mentorship_id = data.get('mentorshipId')
        meeting_date = data.get('date')
        meeting_time = data.get('time')
        description = data.get('description', '')
        
        # Validate required fields
        if not mentorship_id:
            return JsonResponse({'message': 'mentorshipId is required'}, status=400)
        if not meeting_date:
            return JsonResponse({'message': 'date is required'}, status=400)
        if not meeting_time:
            return JsonResponse({'message': 'time is required'}, status=400)
        
        from .models import Mentorship, Meeting, MeetingStatus, HOD
        
        hod_user_id = request.user_id
        
        # Find the mentorship
        try:
            mentorship = Mentorship.objects.select_related('faculty', 'student').get(id=mentorship_id)
        except Mentorship.DoesNotExist:
            return JsonResponse({'message': 'Mentorship not found'}, status=404)
        
        # Verify HOD is authorized for this department
        try:
            hod = HOD.objects.get(
                user_id=hod_user_id,
                department=mentorship.department,
                endDate__isnull=True
            )
        except HOD.DoesNotExist:
            return JsonResponse(
                {'message': f'You are not authorized to create meetings for {mentorship.department} department'},
                status=403
            )
        
        # Parse date and time
        try:
            parsed_date = datetime.strptime(meeting_date, '%Y-%m-%d').date()
            parsed_time = datetime.strptime(meeting_time, '%H:%M').time()
        except ValueError:
            return JsonResponse(
                {'message': 'Invalid date/time format. Use YYYY-MM-DD for date and HH:MM for time'},
                status=400
            )
        
        # Determine status based on date
        from django.utils import timezone
        today = timezone.now().date()
        
        if parsed_date > today:
            status = MeetingStatus.UPCOMING
        else:
            status = MeetingStatus.YET_TO_DONE
        
        # Create meeting
        meeting = Meeting.objects.create(
            mentorship=mentorship,
            date=parsed_date,
            time=parsed_time,
            description=description,
            status=status
        )
        
        return JsonResponse({
            'message': 'Meeting scheduled successfully',
            'meeting': {
                'id': str(meeting.id),
                'date': meeting.date.isoformat(),
                'time': meeting.time.strftime('%H:%M'),
                'description': meeting.description,
                'status': meeting.status
            },
            'mentorship': {
                'id': str(mentorship.id),
                'faculty': {
                    'name': mentorship.faculty.name,
                    'employeeId': mentorship.faculty.employeeId
                },
                'student': {
                    'name': mentorship.student.name,
                    'rollNumber': mentorship.student.rollNumber
                }
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Create mentorship meeting error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('HOD')
def get_mentorship_details(request, mentorship_id):
    """
    Get detailed information about a specific mentorship including all meetings
    """
    try:
        from .models import Mentorship, Meeting, HOD
        
        hod_user_id = request.user_id
        
        # Find the mentorship
        try:
            mentorship = Mentorship.objects.select_related('faculty', 'student', 'faculty__user', 'student__user').get(id=mentorship_id)
        except Mentorship.DoesNotExist:
            return JsonResponse({'message': 'Mentorship not found'}, status=404)
        
        # Verify HOD is authorized for this department
        try:
            hod = HOD.objects.get(
                user_id=hod_user_id,
                department=mentorship.department,
                endDate__isnull=True
            )
        except HOD.DoesNotExist:
            return JsonResponse(
                {'message': f'You are not authorized to view mentorships in {mentorship.department} department'},
                status=403
            )
        
        # Get all meetings
        meetings = Meeting.objects.filter(mentorship=mentorship).order_by('-date', '-time')
        
        meetings_list = []
        for meeting in meetings:
            meetings_list.append({
                'id': str(meeting.id),
                'date': meeting.date.isoformat(),
                'time': meeting.time.strftime('%H:%M') if meeting.time else None,
                'description': meeting.description,
                'facultyReview': meeting.facultyReview,
                'status': meeting.status,
                'createdAt': meeting.createdAt.isoformat()
            })
        
        # Calculate meeting stats
        total_meetings = len(meetings_list)
        completed_meetings = sum(1 for m in meetings_list if m['status'] == 'COMPLETED')
        upcoming_meetings = sum(1 for m in meetings_list if m['status'] == 'UPCOMING')
        yet_to_done = sum(1 for m in meetings_list if m['status'] == 'YET_TO_DONE')
        
        return JsonResponse({
            'mentorshipId': str(mentorship.id),
            'isActive': mentorship.is_active,
            'year': mentorship.year,
            'semester': mentorship.semester,
            'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
            'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None,
            'comments': mentorship.comments or [],
            'faculty': {
                'id': str(mentorship.faculty.id),
                'name': mentorship.faculty.name,
                'employeeId': mentorship.faculty.employeeId,
                'email': mentorship.faculty.user.email if mentorship.faculty.user else mentorship.faculty.collegeEmail,
                'phone': mentorship.faculty.phone1,
                'department': mentorship.faculty.department
            },
            'student': {
                'id': str(mentorship.student.id),
                'name': mentorship.student.name,
                'rollNumber': mentorship.student.rollNumber,
                'registrationNumber': mentorship.student.registrationNumber,
                'email': mentorship.student.user.email if mentorship.student.user else None,
                'program': mentorship.student.program,
                'branch': mentorship.student.branch,
                'year': mentorship.student.year
            },
            'meetings': meetings_list,
            'meetingStats': {
                'total': total_meetings,
                'completed': completed_meetings,
                'upcoming': upcoming_meetings,
                'yetToDone': yet_to_done
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get mentorship details error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@require_role('HOD')
def end_mentorship(request, mentorship_id):
    """
    End an active mentorship (mark as inactive)
    """
    try:
        from .models import Mentorship, HOD
        
        hod_user_id = request.user_id
        
        # Find the mentorship
        try:
            mentorship = Mentorship.objects.select_related('faculty', 'student').get(id=mentorship_id)
        except Mentorship.DoesNotExist:
            return JsonResponse({'message': 'Mentorship not found'}, status=404)
        
        # Verify HOD is authorized for this department
        try:
            hod = HOD.objects.get(
                user_id=hod_user_id,
                department=mentorship.department,
                endDate__isnull=True
            )
        except HOD.DoesNotExist:
            return JsonResponse(
                {'message': f'You are not authorized to manage mentorships in {mentorship.department} department'},
                status=403
            )
        
        if not mentorship.is_active:
            return JsonResponse({'message': 'This mentorship is already inactive'}, status=400)
        
        # End the mentorship
        mentorship.is_active = False
        mentorship.end_date = datetime.now()
        mentorship.save()
        
        return JsonResponse({
            'message': 'Mentorship ended successfully',
            'mentorship': {
                'id': str(mentorship.id),
                'faculty': mentorship.faculty.name,
                'student': mentorship.student.name,
                'endDate': mentorship.end_date.isoformat()
            }
        }, status=200)
        
    except Exception as e:
        print(f"End mentorship error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('HOD')
def get_mentorship_group(request):
    """
    Get mentorship group details for a specific faculty, year, and semester
    Query params:
        - faculty: Faculty ID (UUID)
        - year: Academic year (1-4)
        - semester: Semester (1-2)
        - active: Whether to get active or past mentorships (true/false)
    Returns:
        - Faculty info
        - List of mentees with their mentorship details
        - Meetings for all mentorships in the group
    """
    try:
        from .models import Mentorship, Meeting, HOD, Faculty
        
        hod_user_id = request.user_id
        
        # Get query params
        faculty_id = request.GET.get('faculty')
        year = request.GET.get('year')
        semester = request.GET.get('semester')
        is_active_str = request.GET.get('active', 'true')
        is_active = is_active_str.lower() == 'true'
        
        # Validate required params
        if not faculty_id:
            return JsonResponse({'message': 'faculty parameter is required'}, status=400)
        if not year:
            return JsonResponse({'message': 'year parameter is required'}, status=400)
        if not semester:
            return JsonResponse({'message': 'semester parameter is required'}, status=400)
        
        try:
            year = int(year)
            semester = int(semester)
        except ValueError:
            return JsonResponse({'message': 'year and semester must be integers'}, status=400)
        
        # Get the faculty
        try:
            faculty = Faculty.objects.select_related('user').get(id=faculty_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty not found'}, status=404)
        
        # Verify HOD is authorized for this department
        try:
            hod = HOD.objects.get(
                user_id=hod_user_id,
                department=faculty.department,
                endDate__isnull=True
            )
        except HOD.DoesNotExist:
            return JsonResponse(
                {'message': f'You are not authorized to view mentorships in {faculty.department} department'},
                status=403
            )
        
        # Get all mentorships for this faculty/year/semester
        mentorships = Mentorship.objects.filter(
            faculty=faculty,
            year=year,
            semester=semester,
            is_active=is_active
        ).select_related('student', 'student__user').order_by('student__rollNumber')
        
        # Build mentee list
        mentees = []
        all_meeting_ids = []
        
        for mentorship in mentorships:
            mentees.append({
                'mentorshipId': str(mentorship.id),
                'studentId': str(mentorship.student.id),
                'name': mentorship.student.name,
                'rollNumber': mentorship.student.rollNumber,
                'registrationNumber': mentorship.student.registrationNumber,
                'email': mentorship.student.user.email if mentorship.student.user else None,
                'program': mentorship.student.program,
                'branch': mentorship.student.branch,
                'studentYear': mentorship.student.year,
                'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
                'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None,
                'comments': mentorship.comments or []
            })
        
        # Get all meetings for all mentorships in this group
        mentorship_ids = [m.id for m in mentorships]
        meetings = Meeting.objects.filter(
            mentorship_id__in=mentorship_ids
        ).select_related('mentorship', 'mentorship__student').order_by('-date', '-time')
        
        meetings_list = []
        for meeting in meetings:
            meetings_list.append({
                'id': str(meeting.id),
                'mentorshipId': str(meeting.mentorship.id),
                'studentName': meeting.mentorship.student.name,
                'studentRollNumber': meeting.mentorship.student.rollNumber,
                'date': meeting.date.isoformat(),
                'time': meeting.time.strftime('%H:%M') if meeting.time else None,
                'description': meeting.description,
                'facultyReview': meeting.facultyReview,
                'status': meeting.status,
                'createdAt': meeting.createdAt.isoformat()
            })
        
        # Calculate meeting stats
        total_meetings = len(meetings_list)
        completed_meetings = sum(1 for m in meetings_list if m['status'] == 'COMPLETED')
        upcoming_meetings = sum(1 for m in meetings_list if m['status'] == 'UPCOMING')
        yet_to_done = sum(1 for m in meetings_list if m['status'] == 'YET_TO_DONE')
        
        return JsonResponse({
            'faculty': {
                'id': str(faculty.id),
                'name': faculty.name,
                'employeeId': faculty.employeeId,
                'email': faculty.user.email if faculty.user else faculty.collegeEmail,
                'phone': faculty.phone1,
                'department': faculty.department
            },
            'year': year,
            'semester': semester,
            'isActive': is_active,
            'menteesCount': len(mentees),
            'mentees': mentees,
            'meetings': meetings_list,
            'meetingStats': {
                'total': total_meetings,
                'completed': completed_meetings,
                'upcoming': upcoming_meetings,
                'yetToDone': yet_to_done
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get mentorship group error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('FACULTY', 'HOD')
def get_faculty_mentees(request):
    """
    Get all mentees for the logged-in faculty, grouped by year/semester
    Returns:
        - stats: Total mentees, active, past
        - menteeGroups: Mentees organized by year/semester
    """
    try:
        from .models import Faculty, Mentorship, Meeting
        
        user_id = request.user_id
        
        # Get faculty profile
        try:
            faculty = Faculty.objects.select_related('user').get(user_id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty profile not found'}, status=404)
        
        # Get all mentorships for this faculty
        mentorships = Mentorship.objects.filter(
            faculty=faculty
        ).select_related('student', 'student__user').order_by('-year', '-semester', 'student__rollNumber')
        
        # Group by year/semester and active status
        groups = {}
        stats = {
            'totalMentees': 0,
            'activeMentees': 0,
            'pastMentees': 0,
            'totalMeetings': 0,
            'completedMeetings': 0
        }
        
        for mentorship in mentorships:
            key = f"{mentorship.year}-{mentorship.semester}-{'active' if mentorship.is_active else 'past'}"
            
            if key not in groups:
                groups[key] = {
                    'key': key,
                    'year': mentorship.year,
                    'semester': mentorship.semester,
                    'isActive': mentorship.is_active,
                    'mentees': []
                }
            
            groups[key]['mentees'].append({
                'mentorshipId': str(mentorship.id),
                'studentId': str(mentorship.student.id),
                'name': mentorship.student.name,
                'rollNumber': mentorship.student.rollNumber,
                'registrationNumber': mentorship.student.registrationNumber,
                'email': mentorship.student.user.email if mentorship.student.user else None,
                'program': mentorship.student.program,
                'branch': mentorship.student.branch,
                'studentYear': mentorship.student.year,
                'phoneNumber': mentorship.student.phoneNumber,
                'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
                'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None
            })
            
            stats['totalMentees'] += 1
            if mentorship.is_active:
                stats['activeMentees'] += 1
            else:
                stats['pastMentees'] += 1
        
        # Get meeting stats
        mentorship_ids = [m.id for m in mentorships]
        if mentorship_ids:
            meetings = Meeting.objects.filter(mentorship_id__in=mentorship_ids)
            stats['totalMeetings'] = meetings.count()
            stats['completedMeetings'] = meetings.filter(status='COMPLETED').count()
        
        # Convert groups to list and sort
        groups_list = list(groups.values())
        groups_list.sort(key=lambda x: (-x['year'], -x['semester'], not x['isActive']))
        
        return JsonResponse({
            'faculty': {
                'id': str(faculty.id),
                'name': faculty.name,
                'employeeId': faculty.employeeId,
                'email': faculty.user.email if faculty.user else faculty.collegeEmail,
                'department': faculty.department
            },
            'stats': stats,
            'menteeGroups': groups_list
        }, status=200)
        
    except Exception as e:
        print(f"Get faculty mentees error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('FACULTY', 'HOD')
def get_faculty_mentorship_group(request):
    """
    Get mentorship group details for the logged-in faculty filtered by year/semester
    Query params:
        - year: Academic year (1-4)
        - semester: Semester (1-2)
        - active: Whether to get active or past mentorships (true/false)
    """
    try:
        from .models import Faculty, Mentorship, Meeting
        
        user_id = request.user_id
        
        # Get query params
        year = request.GET.get('year')
        semester = request.GET.get('semester')
        is_active_str = request.GET.get('active', 'true')
        is_active = is_active_str.lower() == 'true'
        
        if not year or not semester:
            return JsonResponse({'message': 'year and semester parameters are required'}, status=400)
        
        try:
            year = int(year)
            semester = int(semester)
        except ValueError:
            return JsonResponse({'message': 'year and semester must be integers'}, status=400)
        
        # Get faculty profile
        try:
            faculty = Faculty.objects.select_related('user').get(user_id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty profile not found'}, status=404)
        
        # Get mentorships for this group
        mentorships = Mentorship.objects.filter(
            faculty=faculty,
            year=year,
            semester=semester,
            is_active=is_active
        ).select_related('student', 'student__user').order_by('student__rollNumber')
        
        # Get all meetings for mentorships in this group
        mentorship_ids = [m.id for m in mentorships]
        all_meetings = Meeting.objects.filter(
            mentorship_id__in=mentorship_ids
        ).select_related('mentorship').order_by('-date', '-time')
        
        # Group meetings by mentorship
        meetings_by_mentorship = {}
        for meeting in all_meetings:
            m_id = str(meeting.mentorship_id)
            if m_id not in meetings_by_mentorship:
                meetings_by_mentorship[m_id] = []
            meetings_by_mentorship[m_id].append(meeting)
        
        # Build mentee list with meeting info
        mentees = []
        for mentorship in mentorships:
            m_id = str(mentorship.id)
            mentorship_meetings = meetings_by_mentorship.get(m_id, [])
            meeting_count = len(mentorship_meetings)
            completed_count = sum(1 for m in mentorship_meetings if m.status == 'COMPLETED')
            
            # Build meetings list for this mentee
            mentee_meetings = []
            for meeting in mentorship_meetings:
                mentee_meetings.append({
                    'id': str(meeting.id),
                    'date': meeting.date.isoformat(),
                    'time': meeting.time.strftime('%H:%M') if meeting.time else None,
                    'description': meeting.description,
                    'status': meeting.status,
                    'notes': meeting.facultyReview,
                    'createdAt': meeting.createdAt.isoformat()
                })
            
            mentees.append({
                'id': str(mentorship.student.id),
                'mentorshipId': str(mentorship.id),
                'studentId': str(mentorship.student.id),
                'name': mentorship.student.name,
                'rollNumber': mentorship.student.rollNumber,
                'registrationNumber': mentorship.student.registrationNumber,
                'email': mentorship.student.user.email if mentorship.student.user else None,
                'program': mentorship.student.program,
                'branch': mentorship.student.branch,
                'studentYear': mentorship.student.year,
                'phoneNumber': mentorship.student.phoneNumber,
                'startDate': mentorship.start_date.isoformat() if mentorship.start_date else None,
                'endDate': mentorship.end_date.isoformat() if mentorship.end_date else None,
                'meetingCount': meeting_count,
                'completedMeetings': completed_count,
                'meetings': mentee_meetings
            })
        
        return JsonResponse({
            'faculty': {
                'id': str(faculty.id),
                'name': faculty.name,
                'employeeId': faculty.employeeId,
                'email': faculty.user.email if faculty.user else faculty.collegeEmail,
                'department': faculty.department
            },
            'year': year,
            'semester': semester,
            'isActive': is_active,
            'menteesCount': len(mentees),
            'mentees': mentees
        }, status=200)
        
    except Exception as e:
        print(f"Get faculty mentorship group error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('FACULTY', 'HOD')
def faculty_schedule_meetings(request):
    """
    Faculty schedules multiple meetings for a mentorship
    Required fields:
        - mentorshipId: UUID of the mentorship
        - meetings: Array of {date: "YYYY-MM-DD", time: "HH:MM", description: "optional"}
    """
    try:
        data = json.loads(request.body)
        mentorship_id = data.get('mentorshipId')
        meetings_data = data.get('meetings')
        
        if not mentorship_id:
            return JsonResponse({'message': 'mentorshipId is required'}, status=400)
        
        if not meetings_data or not isinstance(meetings_data, list) or len(meetings_data) == 0:
            return JsonResponse({'message': 'meetings must be a non-empty array'}, status=400)
        
        from .models import Faculty, Mentorship, Meeting, MeetingStatus
        
        user_id = request.user_id
        
        # Get faculty profile
        try:
            faculty = Faculty.objects.get(user_id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty profile not found'}, status=404)
        
        # Find the mentorship and verify ownership
        try:
            mentorship = Mentorship.objects.select_related('student').get(
                id=mentorship_id,
                faculty=faculty
            )
        except Mentorship.DoesNotExist:
            return JsonResponse({'message': 'Mentorship not found or you are not the mentor'}, status=404)
        
        # Process each meeting
        created_meetings = []
        failed_meetings = []
        
        from django.utils import timezone
        today = timezone.now().date()
        
        for idx, meeting_data in enumerate(meetings_data):
            try:
                meeting_date = meeting_data.get('date')
                meeting_time = meeting_data.get('time')
                description = meeting_data.get('description', '')
                
                if not meeting_date or not meeting_time:
                    failed_meetings.append({
                        'index': idx,
                        'reason': 'date and time are required'
                    })
                    continue
                
                try:
                    parsed_date = datetime.strptime(meeting_date, '%Y-%m-%d').date()
                    parsed_time = datetime.strptime(meeting_time, '%H:%M').time()
                except ValueError:
                    failed_meetings.append({
                        'index': idx,
                        'reason': 'Invalid date/time format'
                    })
                    continue
                
                # Determine status based on date
                if parsed_date > today:
                    status = MeetingStatus.UPCOMING
                else:
                    status = MeetingStatus.YET_TO_DONE
                
                meeting = Meeting.objects.create(
                    mentorship=mentorship,
                    date=parsed_date,
                    time=parsed_time,
                    description=description,
                    status=status
                )
                
                created_meetings.append({
                    'id': str(meeting.id),
                    'date': meeting.date.isoformat(),
                    'time': meeting.time.strftime('%H:%M'),
                    'status': meeting.status
                })
                
            except Exception as e:
                failed_meetings.append({
                    'index': idx,
                    'reason': str(e)
                })
        
        if len(created_meetings) == 0:
            return JsonResponse({
                'message': 'Failed to create any meetings',
                'failed': failed_meetings
            }, status=400)
        
        return JsonResponse({
            'message': f'Scheduled {len(created_meetings)} meeting(s) successfully',
            'mentorship': {
                'id': str(mentorship.id),
                'student': {
                    'name': mentorship.student.name,
                    'rollNumber': mentorship.student.rollNumber
                }
            },
            'results': {
                'created': created_meetings,
                'failed': failed_meetings,
                'totalRequested': len(meetings_data),
                'successCount': len(created_meetings),
                'failedCount': len(failed_meetings)
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Faculty schedule meetings error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('FACULTY', 'HOD')
def faculty_schedule_group_meetings(request):
    """
    Faculty schedules meetings for ALL students in their mentorship group at once.
    Required fields:
        - year: Academic year (1-4)
        - semester: Semester (1-2)
        - meetings: Array of {date: "YYYY-MM-DD", time: "HH:MM", description: "optional"}
    Creates meetings for all students in the specified group.
    """
    try:
        data = json.loads(request.body)
        year = data.get('year')
        semester = data.get('semester')
        meetings_data = data.get('meetings')
        
        if not year or not semester:
            return JsonResponse({'message': 'year and semester are required'}, status=400)
        
        if not meetings_data or not isinstance(meetings_data, list) or len(meetings_data) == 0:
            return JsonResponse({'message': 'meetings must be a non-empty array'}, status=400)
        
        from .models import Faculty, Mentorship, Meeting, MeetingStatus
        from django.utils import timezone
        
        user_id = request.user_id
        today = timezone.now().date()
        
        # Get faculty profile
        try:
            faculty = Faculty.objects.get(user_id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty profile not found'}, status=404)
        
        # Get all active mentorships in this group
        mentorships = Mentorship.objects.filter(
            faculty=faculty,
            year=year,
            semester=semester,
            is_active=True
        ).select_related('student')
        
        if not mentorships.exists():
            return JsonResponse(
                {'message': 'No active mentorships found in this group'},
                status=404
            )
        
        # Parse meeting dates
        parsed_meetings = []
        for meeting_data in meetings_data:
            meeting_date = meeting_data.get('date')
            meeting_time = meeting_data.get('time')
            description = meeting_data.get('description', '')
            
            if not meeting_date or not meeting_time:
                continue
            
            try:
                parsed_date = datetime.strptime(meeting_date, '%Y-%m-%d').date()
                parsed_time = datetime.strptime(meeting_time, '%H:%M').time()
                
                # Determine status based on date
                if parsed_date > today:
                    status = MeetingStatus.UPCOMING
                else:
                    status = MeetingStatus.YET_TO_DONE
                
                parsed_meetings.append({
                    'date': parsed_date,
                    'time': parsed_time,
                    'description': description,
                    'status': status
                })
            except ValueError:
                continue
        
        if not parsed_meetings:
            return JsonResponse({'message': 'No valid meetings to schedule'}, status=400)
        
        # Create meetings for all students
        students_with_meetings = []
        failed_students = []
        total_meetings_created = 0
        
        for mentorship in mentorships:
            try:
                meetings_created = 0
                for meeting_data in parsed_meetings:
                    Meeting.objects.create(
                        mentorship=mentorship,
                        date=meeting_data['date'],
                        time=meeting_data['time'],
                        description=meeting_data['description'],
                        status=meeting_data['status']
                    )
                    meetings_created += 1
                    total_meetings_created += 1
                
                students_with_meetings.append({
                    'studentId': str(mentorship.student.id),
                    'studentName': mentorship.student.name,
                    'meetingsCreated': meetings_created
                })
            except Exception as e:
                failed_students.append({
                    'studentName': mentorship.student.name,
                    'reason': str(e)
                })
        
        return JsonResponse({
            'message': f'Scheduled {total_meetings_created} meeting(s) for {len(students_with_meetings)} student(s)',
            'group': {
                'facultyId': str(faculty.id),
                'facultyName': faculty.name,
                'year': year,
                'semester': semester,
                'studentCount': len(students_with_meetings)
            },
            'results': {
                'totalStudents': len(students_with_meetings),
                'totalMeetingsCreated': total_meetings_created,
                'studentsWithMeetings': students_with_meetings,
                'failed': failed_students
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Faculty schedule group meetings error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@require_http_methods(["POST"])
def complete_meeting(request, meeting_id):
    """
    Faculty/HOD marks a meeting as completed with a review.
    Only allowed if the meeting date/time has passed.
    
    POST body:
        - review: string (required) - Faculty review for the meeting
        - description: string (optional) - Updated description/agenda
    """
    try:
        from .models import Meeting, MeetingStatus, User, UserRole
        from datetime import datetime
        
        # Get user from session
        user_id = request.session.get('user_id')
        if not user_id:
            return JsonResponse({'message': 'Not authenticated'}, status=401)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=401)
        
        # Only Faculty and HOD can complete meetings
        if user.role not in [UserRole.FACULTY, UserRole.HOD]:
            return JsonResponse({'message': 'Only faculty can complete meetings'}, status=403)
        
        # Get the meeting
        try:
            meeting = Meeting.objects.select_related('mentorship__faculty', 'mentorship__student').get(id=meeting_id)
        except Meeting.DoesNotExist:
            return JsonResponse({'message': 'Meeting not found'}, status=404)
        
        # Verify the user is the mentor for this meeting
        if user.role == UserRole.FACULTY:
            if not hasattr(user, 'faculty') or meeting.mentorship.faculty.id != user.faculty.id:
                return JsonResponse({'message': 'You can only complete your own meetings'}, status=403)
        elif user.role == UserRole.HOD:
            if not hasattr(user, 'hod'):
                return JsonResponse({'message': 'HOD profile not found'}, status=403)
            # HOD can complete meetings in their department
            if meeting.mentorship.department != user.hod.department:
                return JsonResponse({'message': 'You can only complete meetings in your department'}, status=403)
        
        # Check if meeting is already completed
        if meeting.status == MeetingStatus.COMPLETED:
            return JsonResponse({'message': 'Meeting is already marked as completed'}, status=400)
        
        # Check if meeting time has passed
        now = datetime.now()
        meeting_datetime = datetime.combine(meeting.date, meeting.time)
        
        if now < meeting_datetime:
            return JsonResponse({
                'message': 'Cannot complete a meeting before its scheduled time',
                'meetingTime': meeting_datetime.isoformat(),
                'currentTime': now.isoformat()
            }, status=400)
        
        # Parse request body
        data = json.loads(request.body)
        review = data.get('review', '').strip()
        description = data.get('description')
        
        if not review:
            return JsonResponse({'message': 'Review is required to complete a meeting'}, status=400)
        
        # Update meeting
        meeting.status = MeetingStatus.COMPLETED
        meeting.facultyReview = review
        if description is not None:
            meeting.description = description
        meeting.save()
        
        return JsonResponse({
            'message': 'Meeting marked as completed successfully',
            'meeting': {
                'id': str(meeting.id),
                'date': meeting.date.isoformat(),
                'time': meeting.time.strftime('%H:%M'),
                'description': meeting.description,
                'facultyReview': meeting.facultyReview,
                'status': meeting.status,
                'student': {
                    'name': meeting.mentorship.student.name,
                    'rollNumber': meeting.mentorship.student.rollNumber
                }
            }
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Complete meeting error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@require_http_methods(["POST"])
def complete_group_meetings(request):
    """
    Faculty/HOD marks all meetings for a specific date/time in a group as completed.
    This is useful for group meetings where all students meet at the same time.
    
    POST body:
        - date: string (required) - Meeting date in YYYY-MM-DD format
        - time: string (required) - Meeting time in HH:MM format  
        - review: string (required) - Faculty review for the meeting
        - description: string (optional) - Updated description/agenda
        - year: int (required) - Academic year
        - semester: int (required) - Semester
    """
    try:
        from .models import Meeting, MeetingStatus, User, UserRole, Mentorship
        from datetime import datetime
        
        # Get user from session
        user_id = request.session.get('user_id')
        if not user_id:
            return JsonResponse({'message': 'Not authenticated'}, status=401)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=401)
        
        # Only Faculty and HOD can complete meetings
        if user.role not in [UserRole.FACULTY, UserRole.HOD]:
            return JsonResponse({'message': 'Only faculty can complete meetings'}, status=403)
        
        # Parse request body
        data = json.loads(request.body)
        meeting_date = data.get('date')
        meeting_time = data.get('time')
        review = data.get('review', '').strip()
        description = data.get('description')
        year = data.get('year')
        semester = data.get('semester')
        
        if not all([meeting_date, meeting_time, review, year, semester]):
            return JsonResponse({'message': 'date, time, review, year, and semester are required'}, status=400)
        
        # Parse date and time
        try:
            parsed_date = datetime.strptime(meeting_date, '%Y-%m-%d').date()
            parsed_time = datetime.strptime(meeting_time, '%H:%M').time()
        except ValueError:
            return JsonResponse({'message': 'Invalid date/time format'}, status=400)
        
        # Check if meeting time has passed
        now = datetime.now()
        meeting_datetime = datetime.combine(parsed_date, parsed_time)
        
        if now < meeting_datetime:
            return JsonResponse({
                'message': 'Cannot complete a meeting before its scheduled time',
                'meetingTime': meeting_datetime.isoformat(),
                'currentTime': now.isoformat()
            }, status=400)
        
        # Get faculty
        if user.role == UserRole.FACULTY:
            if not hasattr(user, 'faculty'):
                return JsonResponse({'message': 'Faculty profile not found'}, status=403)
            faculty = user.faculty
        else:  # HOD
            if not hasattr(user, 'hod') or not hasattr(user.hod, 'faculty'):
                return JsonResponse({'message': 'HOD/Faculty profile not found'}, status=403)
            faculty = user.hod.faculty
        
        # Get all mentorships for this faculty in the specified year/semester
        mentorships = Mentorship.objects.filter(
            faculty=faculty,
            year=year,
            semester=semester
        )
        
        if not mentorships.exists():
            return JsonResponse({'message': 'No mentorships found for this group'}, status=404)
        
        # Get all meetings for these mentorships with matching date/time
        meetings = Meeting.objects.filter(
            mentorship__in=mentorships,
            date=parsed_date,
            time=parsed_time
        ).exclude(status=MeetingStatus.COMPLETED)
        
        if not meetings.exists():
            return JsonResponse({'message': 'No pending meetings found for this date/time'}, status=404)
        
        # Update all meetings
        updated_count = meetings.update(
            status=MeetingStatus.COMPLETED,
            facultyReview=review
        )
        
        # Update description if provided
        if description is not None:
            meetings.update(description=description)
        
        return JsonResponse({
            'message': f'Marked {updated_count} meeting(s) as completed',
            'completedCount': updated_count,
            'date': meeting_date,
            'time': meeting_time
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Complete group meetings error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('ADMIN')
def create_faculty(request):
    """
    Create a new faculty member (Admin only)
    Required fields:
        - employeeId: Unique employee ID
        - name: Full name
        - phone1: Primary phone number
        - personalEmail: Personal email address
        - collegeEmail: College email address
        - department: Department (CSE, ECE, EEE, MECH, CIVIL, BIO-TECH, MME, CHEM)
        - office: Office location
        - officeHours: Office hours
        - password: Initial password for the account
    Optional fields:
        - phone2: Secondary phone number
        - btech: B.Tech programs (comma separated or empty string)
        - mtech: M.Tech programs (comma separated or empty string)
        - phd: PhD programs (comma separated or empty string)
    """
    try:
        from .models import User, Faculty, Department, UserRole
        
        data = json.loads(request.body)
        
        # Required fields
        employee_id = data.get('employeeId')
        name = data.get('name')
        phone1 = data.get('phone1')
        personal_email = data.get('personalEmail')
        college_email = data.get('collegeEmail')
        department = data.get('department')
        office = data.get('office')
        office_hours = data.get('officeHours')
        password = data.get('password')
        
        # Optional fields
        phone2 = data.get('phone2')
        btech = data.get('btech')
        mtech = data.get('mtech')
        phd = data.get('phd')
        
        # Validate required fields
        required_fields = {
            'employeeId': employee_id,
            'name': name,
            'phone1': phone1,
            'personalEmail': personal_email,
            'collegeEmail': college_email,
            'department': department,
            'office': office,
            'officeHours': office_hours,
            'password': password
        }
        
        for field_name, value in required_fields.items():
            if not value:
                return JsonResponse({'message': f'{field_name} is required'}, status=400)
        
        # Validate department
        valid_departments = [d.value for d in Department]
        if department not in valid_departments:
            return JsonResponse(
                {'message': f'Invalid department. Valid values: {valid_departments}'},
                status=400
            )
        
        # Check for unique constraints
        if User.objects.filter(email=college_email).exists():
            return JsonResponse({'message': 'A user with this college email already exists'}, status=400)
        
        if Faculty.objects.filter(employeeId=employee_id).exists():
            return JsonResponse({'message': 'A faculty with this employee ID already exists'}, status=400)
        
        if Faculty.objects.filter(personalEmail=personal_email).exists():
            return JsonResponse({'message': 'A faculty with this personal email already exists'}, status=400)
        
        if Faculty.objects.filter(collegeEmail=college_email).exists():
            return JsonResponse({'message': 'A faculty with this college email already exists'}, status=400)
        
        # Hash the password
        from django.contrib.auth.hashers import make_password
        hashed_password = make_password(password)
        
        # Create user
        user = User.objects.create(
            email=college_email,
            password=hashed_password,
            role=UserRole.FACULTY
        )
        
        # Create faculty
        from django.utils import timezone
        faculty = Faculty.objects.create(
            user=user,
            employeeId=employee_id,
            name=name,
            phone1=phone1,
            phone2=phone2,
            personalEmail=personal_email,
            collegeEmail=college_email,
            department=department,
            office=office,
            officeHours=office_hours,
            btech=btech,
            mtech=mtech,
            phd=phd,
            isActive=True,
            startDate=timezone.now()
        )
        
        return JsonResponse({
            'message': 'Faculty created successfully',
            'faculty': {
                'id': str(faculty.id),
                'employeeId': faculty.employeeId,
                'name': faculty.name,
                'email': user.email,
                'collegeEmail': faculty.collegeEmail,
                'department': faculty.department,
                'isActive': faculty.isActive
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Create faculty error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@require_role('ADMIN')
def update_faculty(request, faculty_id):
    """
    Update an existing faculty member (Admin only)
    Path params:
        - faculty_id: UUID of the faculty to update
    Optional fields (any combination):
        - name, phone1, phone2, personalEmail, collegeEmail
        - department, office, officeHours
        - btech, mtech, phd
        - isActive
    """
    try:
        from .models import Faculty, Department
        
        # Get faculty
        try:
            faculty = Faculty.objects.select_related('user').get(id=faculty_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty not found'}, status=404)
        
        data = json.loads(request.body)
        
        # Update allowed fields
        if 'name' in data:
            faculty.name = data['name']
        
        if 'phone1' in data:
            faculty.phone1 = data['phone1']
        
        if 'phone2' in data:
            faculty.phone2 = data['phone2']
        
        if 'personalEmail' in data:
            # Check uniqueness
            if Faculty.objects.filter(personalEmail=data['personalEmail']).exclude(id=faculty_id).exists():
                return JsonResponse({'message': 'A faculty with this personal email already exists'}, status=400)
            faculty.personalEmail = data['personalEmail']
        
        if 'collegeEmail' in data:
            # Check uniqueness for User and Faculty
            if Faculty.objects.filter(collegeEmail=data['collegeEmail']).exclude(id=faculty_id).exists():
                return JsonResponse({'message': 'A faculty with this college email already exists'}, status=400)
            faculty.collegeEmail = data['collegeEmail']
            faculty.user.email = data['collegeEmail']
            faculty.user.save()
        
        if 'department' in data:
            valid_departments = [d.value for d in Department]
            if data['department'] not in valid_departments:
                return JsonResponse(
                    {'message': f'Invalid department. Valid values: {valid_departments}'},
                    status=400
                )
            faculty.department = data['department']
        
        if 'office' in data:
            faculty.office = data['office']
        
        if 'officeHours' in data:
            faculty.officeHours = data['officeHours']
        
        if 'btech' in data:
            faculty.btech = data['btech']
        
        if 'mtech' in data:
            faculty.mtech = data['mtech']
        
        if 'phd' in data:
            faculty.phd = data['phd']
        
        if 'isActive' in data:
            faculty.isActive = data['isActive']
            if not data['isActive']:
                from django.utils import timezone
                faculty.endDate = timezone.now()
        
        faculty.save()
        
        return JsonResponse({
            'message': 'Faculty updated successfully',
            'faculty': {
                'id': str(faculty.id),
                'employeeId': faculty.employeeId,
                'name': faculty.name,
                'email': faculty.user.email,
                'collegeEmail': faculty.collegeEmail,
                'department': faculty.department,
                'isActive': faculty.isActive
            }
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update faculty error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('ADMIN')
def change_hod(request):
    """
    Change HOD for a department (Admin only)
    This will:
    1. Remove current HOD (if any) for the department
    2. Set the new faculty as HOD
    Required fields:
        - facultyId: UUID of the faculty to become HOD
        - department: Department for which to assign HOD
    """
    try:
        from .models import User, Faculty, HOD, Department, UserRole
        from django.utils import timezone
        
        data = json.loads(request.body)
        
        faculty_id = data.get('facultyId')
        department = data.get('department')
        
        # Validate required fields
        if not faculty_id:
            return JsonResponse({'message': 'facultyId is required'}, status=400)
        
        if not department:
            return JsonResponse({'message': 'department is required'}, status=400)
        
        # Validate department
        valid_departments = [d.value for d in Department]
        if department not in valid_departments:
            return JsonResponse(
                {'message': f'Invalid department. Valid values: {valid_departments}'},
                status=400
            )
        
        # Get the faculty
        try:
            faculty = Faculty.objects.select_related('user').get(id=faculty_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty not found'}, status=404)
        
        # Validate faculty is in the same department
        if faculty.department != department:
            return JsonResponse(
                {'message': f'Faculty is in {faculty.department} department, not {department}'},
                status=400
            )
        
        # Check if faculty is active
        if not faculty.isActive:
            return JsonResponse({'message': 'Faculty is not active'}, status=400)
        
        # Check if faculty is already HOD somewhere
        existing_hod_entry = HOD.objects.filter(faculty=faculty, endDate__isnull=True).first()
        if existing_hod_entry:
            if existing_hod_entry.department == department:
                return JsonResponse({'message': 'This faculty is already HOD of this department'}, status=400)
            else:
                return JsonResponse(
                    {'message': f'This faculty is already HOD of {existing_hod_entry.department}'},
                    status=400
                )
        
        # Remove current HOD for the department (if any)
        current_hod = HOD.objects.filter(department=department, endDate__isnull=True).first()
        removed_hod_info = None
        
        if current_hod:
            current_hod.endDate = timezone.now()
            current_hod.save()
            
            # Update old HOD's user role back to FACULTY
            current_hod.user.role = UserRole.FACULTY
            current_hod.user.save()
            
            removed_hod_info = {
                'id': str(current_hod.faculty.id),
                'name': current_hod.faculty.name,
                'employeeId': current_hod.faculty.employeeId
            }
        
        # Create new HOD entry
        new_hod = HOD.objects.create(
            user=faculty.user,
            faculty=faculty,
            department=department,
            startDate=timezone.now()
        )
        
        # Update faculty's user role to HOD
        faculty.user.role = UserRole.HOD
        faculty.user.save()
        
        response_data = {
            'message': f'HOD changed successfully for {department}',
            'newHOD': {
                'hodId': str(new_hod.id),
                'facultyId': str(faculty.id),
                'name': faculty.name,
                'employeeId': faculty.employeeId,
                'department': department
            }
        }
        
        if removed_hod_info:
            response_data['previousHOD'] = removed_hod_info
        
        return JsonResponse(response_data, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Change HOD error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


# ============== STUDENT UPDATE APIs ==============

@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_personal_problems(request):
    """
    Update student's personal problems/challenges
    All fields are optional booleans
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, PersonalProblem
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse(
                {'message': 'Student profile not found'},
                status=404
            )
        
        # Get or create personal problem record
        problems, created = PersonalProblem.objects.get_or_create(student=student)
        
        # Update fields if provided - all 32 boolean fields
        fields = ['stress', 'anger', 'emotional_problem', 'low_self_esteem', 
                  'examination_anxiety', 'negative_thoughts', 'exam_phobia', 'stammering',
                  'financial_problems', 'disturbed_relationship_with_teachers', 
                  'disturbed_relationship_with_parents', 'mood_swings', 'stage_phobia',
                  'poor_concentration', 'poor_memory_problem', 'adjustment_problem',
                  'frustration', 'migraine_headache', 'relationship_problems',
                  'fear_of_public_speaking', 'disciplinary_problems_in_college',
                  'disturbed_peer_relationship_with_friends', 'worries_about_future',
                  'disappointment_with_course', 'time_management_problem', 'lack_of_expression',
                  'poor_decisive_power', 'conflicts', 'low_self_motivation',
                  'procrastination', 'suicidal_attempt_or_thought', 'tobacco_or_alcohol_use',
                  'poor_command_of_english']
        
        for field in fields:
            if field in data:
                setattr(problems, field, data[field])
        
        # Student can only update the issue text fields, not suggestions/outcomes
        student_text_fields = ['economic_issues', 'teenage_issues', 'health_issues', 
                               'emotional_issues', 'psychological_issues', 'additional_comments']
        for field in student_text_fields:
            if field in data:
                setattr(problems, field, data[field])
        
        problems.save()
        
        return JsonResponse({
            'message': 'Personal challenges updated successfully',
            'id': str(problems.id),
            'studentId': str(student.id),
            'stress': problems.stress,
            'anger': problems.anger,
            'emotional_problem': problems.emotional_problem,
            'low_self_esteem': problems.low_self_esteem,
            'examination_anxiety': problems.examination_anxiety,
            'negative_thoughts': problems.negative_thoughts,
            'exam_phobia': problems.exam_phobia,
            'stammering': problems.stammering,
            'financial_problems': problems.financial_problems,
            'disturbed_relationship_with_teachers': problems.disturbed_relationship_with_teachers,
            'disturbed_relationship_with_parents': problems.disturbed_relationship_with_parents,
            'mood_swings': problems.mood_swings,
            'stage_phobia': problems.stage_phobia,
            'poor_concentration': problems.poor_concentration,
            'poor_memory_problem': problems.poor_memory_problem,
            'adjustment_problem': problems.adjustment_problem,
            'frustration': problems.frustration,
            'migraine_headache': problems.migraine_headache,
            'relationship_problems': problems.relationship_problems,
            'fear_of_public_speaking': problems.fear_of_public_speaking,
            'disciplinary_problems_in_college': problems.disciplinary_problems_in_college,
            'disturbed_peer_relationship_with_friends': problems.disturbed_peer_relationship_with_friends,
            'worries_about_future': problems.worries_about_future,
            'disappointment_with_course': problems.disappointment_with_course,
            'time_management_problem': problems.time_management_problem,
            'lack_of_expression': problems.lack_of_expression,
            'poor_decisive_power': problems.poor_decisive_power,
            'conflicts': problems.conflicts,
            'low_self_motivation': problems.low_self_motivation,
            'procrastination': problems.procrastination,
            'suicidal_attempt_or_thought': problems.suicidal_attempt_or_thought,
            'tobacco_or_alcohol_use': problems.tobacco_or_alcohol_use,
            'poor_command_of_english': problems.poor_command_of_english,
            # Special Issues
            'economic_issues': problems.economic_issues,
            'economic_issues_suggestion': problems.economic_issues_suggestion,
            'economic_issues_outcome': problems.economic_issues_outcome,
            'teenage_issues': problems.teenage_issues,
            'teenage_issues_suggestion': problems.teenage_issues_suggestion,
            'teenage_issues_outcome': problems.teenage_issues_outcome,
            'health_issues': problems.health_issues,
            'health_issues_suggestion': problems.health_issues_suggestion,
            'health_issues_outcome': problems.health_issues_outcome,
            'emotional_issues': problems.emotional_issues,
            'emotional_issues_suggestion': problems.emotional_issues_suggestion,
            'emotional_issues_outcome': problems.emotional_issues_outcome,
            'psychological_issues': problems.psychological_issues,
            'psychological_issues_suggestion': problems.psychological_issues_suggestion,
            'psychological_issues_outcome': problems.psychological_issues_outcome,
            'additional_comments': problems.additional_comments
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update personal problems error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role(['FACULTY', 'HOD', 'ADMIN'])
def update_student_special_issues(request, rollno):
    """
    Update student's special issues suggestions and outcomes
    Only FACULTY (mentor), HOD, ADMIN can update suggestions and outcomes
    """
    try:
        data = json.loads(request.body)
        
        from .models import Student, PersonalProblem, Mentorship
        
        try:
            student = Student.objects.get(rollNumber=rollno)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student not found'}, status=404)
        
        # Check if faculty is mentor of this student (for FACULTY role)
        if request.user_role == 'FACULTY':
            is_mentor = Mentorship.objects.filter(
                faculty__user_id=request.user_id,
                student=student,
                is_active=True
            ).exists()
            if not is_mentor:
                return JsonResponse({'message': 'You are not the mentor of this student'}, status=403)
        
        # Get or create personal problem record
        problems, created = PersonalProblem.objects.get_or_create(student=student)
        
        # Mentor/HOD/Admin can update suggestions and outcomes
        suggestion_outcome_fields = [
            'economic_issues_suggestion', 'economic_issues_outcome',
            'teenage_issues_suggestion', 'teenage_issues_outcome',
            'health_issues_suggestion', 'health_issues_outcome',
            'emotional_issues_suggestion', 'emotional_issues_outcome',
            'psychological_issues_suggestion', 'psychological_issues_outcome'
        ]
        
        for field in suggestion_outcome_fields:
            if field in data:
                setattr(problems, field, data[field])
        
        problems.save()
        
        return JsonResponse({
            'message': 'Special issues updated successfully',
            'studentId': str(student.id),
            'economic_issues': problems.economic_issues,
            'economic_issues_suggestion': problems.economic_issues_suggestion,
            'economic_issues_outcome': problems.economic_issues_outcome,
            'teenage_issues': problems.teenage_issues,
            'teenage_issues_suggestion': problems.teenage_issues_suggestion,
            'teenage_issues_outcome': problems.teenage_issues_outcome,
            'health_issues': problems.health_issues,
            'health_issues_suggestion': problems.health_issues_suggestion,
            'health_issues_outcome': problems.health_issues_outcome,
            'emotional_issues': problems.emotional_issues,
            'emotional_issues_suggestion': problems.emotional_issues_suggestion,
            'emotional_issues_outcome': problems.emotional_issues_outcome,
            'psychological_issues': problems.psychological_issues,
            'psychological_issues_suggestion': problems.psychological_issues_suggestion,
            'psychological_issues_outcome': problems.psychological_issues_outcome,
            'additional_comments': problems.additional_comments
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update special issues error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_hobbies(request):
    """
    Update student's hobbies (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        hobbies = data.get('hobbies')
        if hobbies is None:
            return JsonResponse({'message': 'hobbies field is required'}, status=400)
        
        if not isinstance(hobbies, list):
            return JsonResponse({'message': 'hobbies must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.hobbies = hobbies
        career.save()
        
        return JsonResponse({
            'message': 'Hobbies updated successfully',
            'hobbies': career.hobbies
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update hobbies error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_strengths(request):
    """
    Update student's strengths (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        strengths = data.get('strengths')
        if strengths is None:
            return JsonResponse({'message': 'strengths field is required'}, status=400)
        
        if not isinstance(strengths, list):
            return JsonResponse({'message': 'strengths must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.strengths = strengths
        career.save()
        
        return JsonResponse({
            'message': 'Strengths updated successfully',
            'strengths': career.strengths
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update strengths error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_areas_to_improve(request):
    """
    Update student's areas to improve (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        areas = data.get('areasToImprove')
        if areas is None:
            return JsonResponse({'message': 'areasToImprove field is required'}, status=400)
        
        if not isinstance(areas, list):
            return JsonResponse({'message': 'areasToImprove must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.areasToImprove = areas
        career.save()
        
        return JsonResponse({
            'message': 'Areas to improve updated successfully',
            'areasToImprove': career.areasToImprove
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update areas to improve error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_core(request):
    """
    Update student's core career interests (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        core = data.get('core')
        if core is None:
            return JsonResponse({'message': 'core field is required'}, status=400)
        
        if not isinstance(core, list):
            return JsonResponse({'message': 'core must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.core = core
        career.save()
        
        return JsonResponse({
            'message': 'Core interests updated successfully',
            'core': career.core
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update core error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_it(request):
    """
    Update student's IT career interests (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        it = data.get('it')
        if it is None:
            return JsonResponse({'message': 'it field is required'}, status=400)
        
        if not isinstance(it, list):
            return JsonResponse({'message': 'it must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.it = it
        career.save()
        
        return JsonResponse({
            'message': 'IT interests updated successfully',
            'it': career.it
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update IT error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_higher_education(request):
    """
    Update student's higher education interests (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        higher_ed = data.get('higherEducation')
        if higher_ed is None:
            return JsonResponse({'message': 'higherEducation field is required'}, status=400)
        
        if not isinstance(higher_ed, list):
            return JsonResponse({'message': 'higherEducation must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.higherEducation = higher_ed
        career.save()
        
        return JsonResponse({
            'message': 'Higher education interests updated successfully',
            'higherEducation': career.higherEducation
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update higher education error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_startup(request):
    """
    Update student's startup interests (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        startup = data.get('startup')
        if startup is None:
            return JsonResponse({'message': 'startup field is required'}, status=400)
        
        if not isinstance(startup, list):
            return JsonResponse({'message': 'startup must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.startup = startup
        career.save()
        
        return JsonResponse({
            'message': 'Startup interests updated successfully',
            'startup': career.startup
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update startup error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_family_business(request):
    """
    Update student's family business interests (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        family_business = data.get('familyBusiness')
        if family_business is None:
            return JsonResponse({'message': 'familyBusiness field is required'}, status=400)
        
        if not isinstance(family_business, list):
            return JsonResponse({'message': 'familyBusiness must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.familyBusiness = family_business
        career.save()
        
        return JsonResponse({
            'message': 'Family business interests updated successfully',
            'familyBusiness': career.familyBusiness
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update family business error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_other_interests(request):
    """
    Update student's other interests (array of strings)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        other = data.get('otherInterests')
        if other is None:
            return JsonResponse({'message': 'otherInterests field is required'}, status=400)
        
        if not isinstance(other, list):
            return JsonResponse({'message': 'otherInterests must be an array'}, status=400)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        career.otherInterests = other
        career.save()
        
        return JsonResponse({
            'message': 'Other interests updated successfully',
            'otherInterests': career.otherInterests
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update other interests error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_rankings(request):
    """
    Update student's career rankings (1-6 for each career path)
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        
        # Validate and update ranking fields
        ranking_fields = ['govt_sector_rank', 'core_rank', 'it_rank', 
                          'higher_education_rank', 'startup_rank', 'family_business_rank']
        
        for field in ranking_fields:
            if field in data:
                if not isinstance(data[field], int) or not (1 <= data[field] <= 6):
                    return JsonResponse({'message': f'{field} must be an integer between 1 and 6'}, status=400)
                setattr(career, field, data[field])
        
        career.save()
        
        return JsonResponse({
            'message': 'Career rankings updated successfully',
            'careerRankings': {
                'govt_sector_rank': career.govt_sector_rank,
                'core_rank': career.core_rank,
                'it_rank': career.it_rank,
                'higher_education_rank': career.higher_education_rank,
                'startup_rank': career.startup_rank,
                'family_business_rank': career.family_business_rank
            }
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update career rankings error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
@require_role('STUDENT')
def update_career_details_all(request):
    """
    Update all career details at once
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, CareerDetails
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        career, created = CareerDetails.objects.get_or_create(student=student)
        
        # Update fields if provided
        array_fields = ['hobbies', 'strengths', 'areasToImprove', 'core', 'it', 
                        'higherEducation', 'startup', 'familyBusiness', 'otherInterests']
        
        for field in array_fields:
            if field in data:
                if not isinstance(data[field], list):
                    return JsonResponse({'message': f'{field} must be an array'}, status=400)
                setattr(career, field, data[field])
        
        # Update ranking fields if provided
        ranking_fields = ['govt_sector_rank', 'core_rank', 'it_rank', 
                          'higher_education_rank', 'startup_rank', 'family_business_rank']
        
        for field in ranking_fields:
            if field in data:
                if not isinstance(data[field], int) or not (1 <= data[field] <= 6):
                    return JsonResponse({'message': f'{field} must be an integer between 1 and 6'}, status=400)
                setattr(career, field, data[field])
        
        career.save()
        
        return JsonResponse({
            'message': 'Career details updated successfully',
            'id': str(career.id),
            'studentId': str(student.id),
            'hobbies': career.hobbies,
            'strengths': career.strengths,
            'areasToImprove': career.areasToImprove,
            'careerInterests': {
                'core': career.core,
                'it': career.it,
                'higherEducation': career.higherEducation,
                'startup': career.startup,
                'familyBusiness': career.familyBusiness,
                'otherInterests': career.otherInterests
            },
            'careerRankings': {
                'govt_sector_rank': career.govt_sector_rank,
                'core_rank': career.core_rank,
                'it_rank': career.it_rank,
                'higher_education_rank': career.higher_education_rank,
                'startup_rank': career.startup_rank,
                'family_business_rank': career.family_business_rank
            }
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Update career details error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


# ============ REQUEST MANAGEMENT APIs ============

@csrf_exempt
@require_http_methods(["DELETE"])
@require_role('STUDENT')
def cancel_request(request, request_id):
    """
    Cancel a pending request (student can only cancel their own pending requests)
    """
    try:
        user_id = request.user_id
        
        from .models import Student, Request, RequestStatus
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        try:
            req = Request.objects.get(id=request_id, student=student)
        except Request.DoesNotExist:
            return JsonResponse({'message': 'Request not found'}, status=404)
        
        if req.status != RequestStatus.PENDING:
            return JsonResponse({'message': f'Cannot cancel a {req.status.lower()} request'}, status=400)
        
        req.delete()
        
        return JsonResponse({
            'message': 'Request cancelled successfully',
            'requestId': str(request_id)
        }, status=200)
        
    except Exception as e:
        print(f"Cancel request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('STUDENT')
def create_delete_internship_request(request):
    """
    Create a request to delete an existing internship
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, Request, RequestType, Mentorship, Internship
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        internship_id = data.get('internshipId')
        if not internship_id:
            return JsonResponse({'message': 'internshipId is required'}, status=400)
        
        try:
            internship = Internship.objects.get(id=internship_id, students=student)
        except Internship.DoesNotExist:
            return JsonResponse({'message': 'Internship not found or not owned by student'}, status=404)
        
        # Get current mentor to assign the request
        mentorship = Mentorship.objects.filter(student=student, is_active=True).first()
        assigned_to = mentorship.faculty if mentorship else None
        
        # Store internship data in request for reference
        delete_data = {
            'internshipId': str(internship.id),
            'organisation': internship.organisation,
            'type': internship.type,
            'semester': internship.semester,
            'location': internship.location,
            'duration': internship.duration,
            'stipend': internship.stipend,
            'reason': data.get('reason', '')
        }
        
        # Create the delete request
        new_request = Request.objects.create(
            student=student,
            assigned_to=assigned_to,
            type=RequestType.DELETE_INTERNSHIP,
            request_data=delete_data,
            remarks=data.get('reason', 'Deletion requested')
        )
        
        return JsonResponse({
            'message': 'Delete request submitted successfully',
            'requestId': str(new_request.id),
            'status': new_request.status,
            'assignedTo': assigned_to.name if assigned_to else 'Not assigned'
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Create delete internship request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('STUDENT')
def create_delete_project_request(request):
    """
    Create a request to delete an existing project
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, Request, RequestType, Mentorship, Project
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        project_id = data.get('projectId')
        if not project_id:
            return JsonResponse({'message': 'projectId is required'}, status=400)
        
        try:
            project = Project.objects.get(id=project_id, students=student)
        except Project.DoesNotExist:
            return JsonResponse({'message': 'Project not found or not owned by student'}, status=404)
        
        # Get current mentor to assign the request
        mentorship = Mentorship.objects.filter(student=student, is_active=True).first()
        assigned_to = mentorship.faculty if mentorship else None
        
        # Store project data in request for reference
        delete_data = {
            'projectId': str(project.id),
            'title': project.title,
            'description': project.description,
            'semester': project.semester,
            'technologies': project.technologies,
            'reason': data.get('reason', '')
        }
        
        # Create the delete request
        new_request = Request.objects.create(
            student=student,
            assigned_to=assigned_to,
            type=RequestType.DELETE_PROJECT,
            request_data=delete_data,
            remarks=data.get('reason', 'Deletion requested')
        )
        
        return JsonResponse({
            'message': 'Delete request submitted successfully',
            'requestId': str(new_request.id),
            'status': new_request.status,
            'assignedTo': assigned_to.name if assigned_to else 'Not assigned'
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Create delete project request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_role('STUDENT')
def create_meeting_request(request):
    """
    Create a request for a meeting with mentor
    """
    try:
        user_id = request.user_id
        data = json.loads(request.body)
        
        from .models import Student, Request, RequestType, Mentorship
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        mentorship_id = data.get('mentorshipId')
        if not mentorship_id:
            return JsonResponse({'message': 'mentorshipId is required'}, status=400)
        
        try:
            mentorship = Mentorship.objects.get(id=mentorship_id, student=student, is_active=True)
        except Mentorship.DoesNotExist:
            return JsonResponse({'message': 'Active mentorship not found'}, status=404)
        
        # Validate required fields
        meeting_date = data.get('date')
        if not meeting_date:
            return JsonResponse({'message': 'date is required'}, status=400)
        
        # Store meeting request data (only date, time, description)
        meeting_data = {
            'mentorshipId': str(mentorship.id),
            'facultyId': str(mentorship.faculty.id),
            'facultyName': mentorship.faculty.name,
            'studentName': student.name,
            'date': meeting_date,
            'time': data.get('time', '10:00'),
            'description': data.get('description', '')
        }
        
        # Create the meeting request
        new_request = Request.objects.create(
            student=student,
            assigned_to=mentorship.faculty,
            type=RequestType.MEETING_REQUEST,
            request_data=meeting_data,
            remarks=data.get('description', 'Meeting requested')
        )
        
        return JsonResponse({
            'message': 'Meeting request submitted successfully',
            'requestId': str(new_request.id),
            'status': new_request.status,
            'assignedTo': mentorship.faculty.name
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Create meeting request error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('STUDENT')
def get_student_dashboard_stats(request):
    """
    Get dashboard statistics for a student
    """
    try:
        user_id = request.user_id
        
        from .models import Student, Request, RequestStatus, Mentorship, Meeting, MeetingStatus
        from datetime import datetime, date
        
        try:
            student = Student.objects.get(user__id=user_id)
        except Student.DoesNotExist:
            return JsonResponse({'message': 'Student profile not found'}, status=404)
        
        # Get request counts
        requests = Request.objects.filter(student=student)
        pending_requests = requests.filter(status=RequestStatus.PENDING).count()
        approved_requests = requests.filter(status=RequestStatus.APPROVED).count()
        rejected_requests = requests.filter(status=RequestStatus.REJECTED).count()
        
        # Get active mentorship and upcoming meetings
        active_mentorship = Mentorship.objects.filter(student=student, is_active=True).first()
        upcoming_meetings = 0
        next_meeting = None
        
        if active_mentorship:
            upcoming = Meeting.objects.filter(
                mentorship=active_mentorship,
                status=MeetingStatus.UPCOMING,
                date__gte=date.today()
            ).order_by('date', 'time')
            upcoming_meetings = upcoming.count()
            
            if upcoming.exists():
                next_m = upcoming.first()
                next_meeting = {
                    'date': next_m.date.strftime('%b %d'),
                    'time': next_m.time.strftime('%H:%M')
                }
        
        return JsonResponse({
            'stats': {
                'pendingRequests': pending_requests,
                'approvedRequests': approved_requests,
                'rejectedRequests': rejected_requests,
                'upcomingMeetings': upcoming_meetings,
                'nextMeeting': next_meeting,
                'hasMentor': active_mentorship is not None
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get student dashboard stats error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('FACULTY', 'HOD')
def get_faculty_dashboard_stats(request):
    """
    Get dashboard statistics for faculty/HOD
    """
    try:
        user_id = request.user_id
        
        from .models import Faculty, Request, RequestStatus, Mentorship, Meeting, MeetingStatus
        from datetime import date
        
        try:
            faculty = Faculty.objects.get(user__id=user_id)
        except Faculty.DoesNotExist:
            return JsonResponse({'message': 'Faculty profile not found'}, status=404)
        
        # Get active mentees count
        active_mentees = Mentorship.objects.filter(faculty=faculty, is_active=True).count()
        
        # Get pending requests count
        pending_requests = Request.objects.filter(
            assigned_to=faculty,
            status=RequestStatus.PENDING
        ).count()
        
        # Get upcoming meetings this week
        from datetime import timedelta
        today = date.today()
        week_end = today + timedelta(days=7)
        
        upcoming_meetings = Meeting.objects.filter(
            mentorship__faculty=faculty,
            status=MeetingStatus.UPCOMING,
            date__gte=today,
            date__lte=week_end
        ).count()
        
        # Get total meetings completed
        completed_meetings = Meeting.objects.filter(
            mentorship__faculty=faculty,
            status=MeetingStatus.COMPLETED
        ).count()
        
        return JsonResponse({
            'stats': {
                'activeMentees': active_mentees,
                'pendingRequests': pending_requests,
                'upcomingMeetings': upcoming_meetings,
                'completedMeetings': completed_meetings
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get faculty dashboard stats error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('HOD')
def get_hod_dashboard_stats(request):
    """
    Get dashboard statistics for HOD
    """
    try:
        user_id = request.user_id
        
        from .models import HOD, Faculty, Student, Mentorship, Request, RequestStatus
        
        try:
            hod = HOD.objects.get(user__id=user_id)
        except HOD.DoesNotExist:
            return JsonResponse({'message': 'HOD profile not found'}, status=404)
        
        department = hod.department
        
        # Get department stats
        total_faculty = Faculty.objects.filter(department=department).count()
        total_students = Student.objects.filter(branch=department).count()
        
        # Get mentorship stats
        active_mentorships = Mentorship.objects.filter(
            faculty__department=department,
            is_active=True
        ).count()
        
        unassigned_students = Student.objects.filter(branch=department).exclude(
            id__in=Mentorship.objects.filter(is_active=True).values_list('student_id', flat=True)
        ).count()
        
        # Pending requests in department
        pending_requests = Request.objects.filter(
            assigned_to__department=department,
            status=RequestStatus.PENDING
        ).count()
        
        return JsonResponse({
            'stats': {
                'totalFaculty': total_faculty,
                'totalStudents': total_students,
                'activeMentorships': active_mentorships,
                'unassignedStudents': unassigned_students,
                'pendingRequests': pending_requests
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get HOD dashboard stats error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('ADMIN')
def get_admin_dashboard_stats(request):
    """
    Get dashboard statistics for Admin
    """
    try:
        from .models import User, Faculty, Student, HOD, Mentorship, Request, RequestStatus
        
        # Get total counts
        total_users = User.objects.count()
        total_faculty = Faculty.objects.count()
        total_students = Student.objects.count()
        total_hods = HOD.objects.count()
        
        # Get mentorship stats
        total_mentorships = Mentorship.objects.filter(is_active=True).count()
        pending_requests = Request.objects.filter(status=RequestStatus.PENDING).count()
        
        # Unassigned students
        unassigned_students = Student.objects.exclude(
            id__in=Mentorship.objects.filter(is_active=True).values_list('student_id', flat=True)
        ).count()
        
        return JsonResponse({
            'stats': {
                'totalUsers': total_users,
                'totalFaculty': total_faculty,
                'totalStudents': total_students,
                'totalHODs': total_hods,
                'totalMentorships': total_mentorships,
                'pendingRequests': pending_requests,
                'unassignedStudents': unassigned_students
            }
        }, status=200)
        
    except Exception as e:
        print(f"Get Admin dashboard stats error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
@require_role('HOD', 'ADMIN')
def export_students_csv(request):
    """
    Export students data as CSV
    """
    try:
        import csv
        from django.http import HttpResponse
        from .models import Student, HOD, Mentorship
        
        user_id = request.user_id
        user_role = request.user_role
        
        # Determine department filter
        department = request.GET.get('department')
        year = request.GET.get('year')
        programme = request.GET.get('programme')
        
        if user_role == 'HOD':
            try:
                hod = HOD.objects.get(user__id=user_id)
                department = hod.department  # Force HOD's department
            except HOD.DoesNotExist:
                return JsonResponse({'message': 'HOD profile not found'}, status=404)
        
        # Build query
        students = Student.objects.all()
        if department:
            students = students.filter(branch=department)
        if year:
            students = students.filter(year=int(year))
        if programme:
            students = students.filter(programme=programme)
        
        students = students.select_related('user').order_by('rollNumber')
        
        # Create CSV response
        from datetime import date
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="students_export_{department or "all"}_{date.today().isoformat()}.csv"'
        
        writer = csv.writer(response)
        
        # Header row
        writer.writerow([
            'Roll Number', 'Registration Number', 'Name', 'Email', 'Phone',
            'Department', 'Programme', 'Year', 'Section', 'Gender',
            'Date of Birth', 'Community', 'Father Name', 'Mother Name',
            'Address', 'Mentor Name', 'Mentor Employee ID'
        ])
        
        # Data rows
        for student in students:
            # Get mentor info
            active_mentorship = Mentorship.objects.filter(student=student, is_active=True).first()
            mentor_name = active_mentorship.faculty.name if active_mentorship else ''
            mentor_emp_id = active_mentorship.faculty.employeeId if active_mentorship else ''
            
            writer.writerow([
                student.rollNumber,
                student.registrationNumber,
                student.name,
                student.user.email if student.user else '',
                student.phoneNumber or '',
                student.branch,
                student.programme,
                student.year,
                student.section or '',
                student.gender or '',
                student.dateOfBirth.isoformat() if student.dateOfBirth else '',
                student.community or '',
                student.fatherName or '',
                student.motherName or '',
                student.presentAddress or '',
                mentor_name,
                mentor_emp_id
            ])
        
        return response
        
    except Exception as e:
        print(f"Export students CSV error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'message': 'Server error'}, status=500)
