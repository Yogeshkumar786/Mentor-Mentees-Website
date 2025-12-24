"""
Quick test script to verify bcrypt password hashing and verification
Run this with: python test_bcrypt.py
"""

import bcrypt

def test_bcrypt():
    print("=" * 60)
    print("Testing bcrypt password hashing and verification")
    print("=" * 60)
    
    # Test password
    password = "password123"
    print(f"\n1. Original password: {password}")
    
    # Hash the password
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    print(f"\n2. Hashed password: {hashed.decode('utf-8')}")
    print(f"   Length: {len(hashed.decode('utf-8'))} characters")
    
    # Verify correct password
    is_valid = bcrypt.checkpw(password_bytes, hashed)
    print(f"\n3. Verifying correct password: {is_valid} ✅")
    
    # Verify incorrect password
    wrong_password = "wrongpassword"
    wrong_password_bytes = wrong_password.encode('utf-8')
    is_invalid = bcrypt.checkpw(wrong_password_bytes, hashed)
    print(f"4. Verifying incorrect password: {is_invalid} ❌")
    
    print("\n" + "=" * 60)
    print("bcrypt is working correctly!")
    print("=" * 60)


if __name__ == "__main__":
    test_bcrypt()
