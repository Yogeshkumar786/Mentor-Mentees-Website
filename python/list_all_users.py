import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

from core.models import User

users = User.objects.select_related('student', 'faculty', 'hod', 'admin').all()

print('='*80)
print('ALL USERS IN DATABASE')
print('='*80)
print(f'\nTotal Users: {users.count()}\n')

for user in users:
    print('='*80)
    print(f'Email: {user.email}')
    print(f'Role: {user.role}')
    print(f'User ID: {user.id}')
    print(f'Account Status: {user.accountStatus}')
    print(f'Created: {user.createdAt}')
    
    # Get associated entity details
    if user.role == 'STUDENT' and hasattr(user, 'student') and user.student:
        s = user.student
        print(f'\nStudent Details:')
        print(f'  Name: {s.name}')
        print(f'  Roll Number: {s.rollNumber}')
        print(f'  Branch: {s.branch}')
        
    elif user.role == 'FACULTY' and hasattr(user, 'faculty') and user.faculty:
        f = user.faculty
        print(f'\nFaculty Details:')
        print(f'  Name: {f.name}')
        print(f'  Employee ID: {f.employeeId}')
        print(f'  Department: {f.department}')
        
    elif user.role == 'HOD' and hasattr(user, 'hod') and user.hod:
        h = user.hod
        print(f'\nHOD Details:')
        print(f'  Department: {h.department}')
        if h.faculty:
            print(f'  Name: {h.faculty.name}')
            print(f'  Employee ID: {h.faculty.employeeId}')
            
    elif user.role == 'ADMIN' and hasattr(user, 'admin') and user.admin:
        a = user.admin
        print(f'\nAdmin Details:')
        print(f'  Name: {a.name}')
        print(f'  Employee ID: {a.employeeId}')
    
    print(f'\nPassword: [BCRYPT HASHED - Cannot retrieve original]')
    print(f'Password Hash (first 60 chars): {user.password[:60]}')

print('\n' + '='*80)
print('NOTE: Passwords are hashed with bcrypt and cannot be retrieved.')
print('Use the credentials from test scripts or reset passwords as needed.')
print('='*80)
