"""
Simple script to create test users with bcrypt hashed passwords
"""

import sys
import os
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

import bcrypt
import uuid
from core.models import User

def create_test_users():
    """Create test and admin users"""
    
    # Test user
    email1 = "test@example.com"
    password1 = "password123"
    
    if User.objects.filter(email=email1).exists():
        print(f"User {email1} already exists, skipping...")
    else:
        password_bytes = password1.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        User.objects.create(
            id=str(uuid.uuid4()),
            email=email1,
            password=hashed.decode('utf-8'),
            role='STUDENT'
        )
        print(f"Created test user: {email1} / {password1}")
    
    # Admin user
    email2 = "admin@example.com"
    password2 = "admin123"
    
    if User.objects.filter(email=email2).exists():
        print(f"User {email2} already exists, skipping...")
    else:
        password_bytes = password2.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        User.objects.create(
            id=str(uuid.uuid4()),
            email=email2,
            password=hashed.decode('utf-8'),
            role='ADMIN'
        )
        print(f"Created admin user: {email2} / {password2}")

if __name__ == "__main__":
    create_test_users()
    print("\nDone! You can now login with these credentials.")
