"""
Script to create test users with bcrypt hashed passwords
Run this with: python manage.py shell < create_test_user.py
Or: python manage.py shell
Then: exec(open('create_test_user.py').read())
"""

import bcrypt
import uuid
from core.models import User

def create_test_user():
    """Create a test user with bcrypt hashed password"""
    
    # Test user credentials
    email = "test@example.com"
    password = "password123"
    role = "STUDENT"
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        print(f"❌ User with email {email} already exists")
        return
    
    # Hash password with bcrypt
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    
    # Create user
    user_id = str(uuid.uuid4())
    user = User.objects.create(
        id=user_id,
        email=email,
        password=hashed_password.decode('utf-8'),
        role=role
    )
    
    print(f"✅ Test user created successfully!")
    print(f"   ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Role: {user.role}")
    print(f"   Password: {password}")
    print(f"\nYou can now login with:")
    print(f'   Email: {email}')
    print(f'   Password: {password}')


def create_admin_user():
    """Create an admin user with bcrypt hashed password"""
    
    # Admin user credentials
    email = "admin@example.com"
    password = "admin123"
    role = "ADMIN"
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        print(f"❌ User with email {email} already exists")
        return
    
    # Hash password with bcrypt
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    
    # Create user
    user_id = str(uuid.uuid4())
    user = User.objects.create(
        id=user_id,
        email=email,
        password=hashed_password.decode('utf-8'),
        role=role
    )
    
    print(f"✅ Admin user created successfully!")
    print(f"   ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Role: {user.role}")
    print(f"   Password: {password}")
    print(f"\nYou can now login with:")
    print(f'   Email: {email}')
    print(f'   Password: {password}')


if __name__ == "__main__":
    print("=" * 60)
    print("Creating Test Users")
    print("=" * 60)
    
    print("\n--- Creating Regular Test User ---")
    create_test_user()
    
    print("\n--- Creating Admin User ---")
    create_admin_user()
    
    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)
