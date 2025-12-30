import os
import django
import bcrypt

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

from core.models import User

# The new password for all users
new_password = "password123"

# Hash the password with bcrypt
password_bytes = new_password.encode('utf-8')
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

print('='*80)
print('UPDATING ALL USER PASSWORDS')
print('='*80)
print(f'\nNew Password: {new_password}')
print(f'Bcrypt Hash: {hashed_password[:60]}...\n')

# Get all users
users = User.objects.all()
total_users = users.count()

print(f'Found {total_users} users to update\n')
print('='*80)

# Update each user
for user in users:
    old_hash = user.password[:50]
    user.password = hashed_password
    user.save()
    
    print(f'✅ Updated: {user.email}')
    print(f'   Role: {user.role}')
    print(f'   Old hash: {old_hash}...')
    print(f'   New hash: {hashed_password[:50]}...')
    print()

print('='*80)
print(f'SUCCESS: Updated {total_users} users')
print(f'All users now have password: {new_password}')
print('='*80)
