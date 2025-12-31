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
        - department: Required (CSE, ECE, EEE, MECH, CIVIL, BIO-TECH, MME, CHEM)
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
        
        # Validate department
        if not department:
            return JsonResponse(
                {'message': 'department query parameter is required'},
                status=400
            )
        
        # Validate department is valid enum value
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
        
        # Build query
        students_query = Student.objects.filter(branch=department)
        
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
            'department': department,
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
        
        internships = Internship.objects.filter(students=student).order_by('-semester')
        
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
                'examinationAnxiety': problems.examinationAnxiety,
                'timeManagementProblem': problems.timeManagementProblem,
                'procrastination': problems.procrastination,
                'worriesAboutFuture': problems.worriesAboutFuture,
                'fearOfPublicSpeaking': problems.fearOfPublicSpeaking
            }, status=200)
        except PersonalProblem.DoesNotExist:
            return JsonResponse({
                'id': None,
                'studentId': str(student.id),
                'stress': None,
                'anger': None,
                'examinationAnxiety': None,
                'timeManagementProblem': None,
                'procrastination': None,
                'worriesAboutFuture': None,
                'fearOfPublicSpeaking': None,
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
        
        projects = Project.objects.filter(students=student).select_related('mentor').order_by('-semester')
        
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
        
        if req.type == 'INTERNSHIP':
            # Create Internship
            internship = Internship.objects.create(
                semester=req.request_data['semester'],
                type=req.request_data['type'],
                organisation=req.request_data['organisation'],
                stipend=req.request_data.get('stipend', 0),
                duration=req.request_data['duration'],
                location=req.request_data['location']
            )
            # Add student to internship
            internship.students.add(req.student)
            created_object = internship
            
            # Update request with reference to created internship
            req.content_type = ContentType.objects.get_for_model(Internship)
            req.object_id = internship.id
            
        elif req.type == 'PROJECT':
            # Get project mentor if specified
            project_mentor = None
            if req.request_data.get('mentorId'):
                try:
                    project_mentor = Faculty.objects.get(id=req.request_data['mentorId'])
                except Faculty.DoesNotExist:
                    pass
            
            # Create Project
            project = Project.objects.create(
                semester=req.request_data['semester'],
                title=req.request_data['title'],
                description=req.request_data['description'],
                technologies=req.request_data.get('technologies', []),
                mentor=project_mentor
            )
            # Add student to project
            project.students.add(req.student)
            created_object = project
            
            # Update request with reference to created project
            req.content_type = ContentType.objects.get_for_model(Project)
            req.object_id = project.id
        
        # Update request status
        req.status = RequestStatus.APPROVED
        req.feedback = data.get('feedback', 'Approved')
        req.save()
        
        return JsonResponse({
            'message': f'{req.type.capitalize()} approved successfully',
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

