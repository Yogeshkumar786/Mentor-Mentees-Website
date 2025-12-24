"""
Test script for authentication APIs
Run this after starting the Django server with: python manage.py runserver
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/auth"

def test_login():
    """Test login endpoint"""
    print("\n=== Testing Login ===")
    url = f"{BASE_URL}/login"
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Extract cookies for subsequent requests
    cookies = response.cookies
    return cookies


def test_logout(cookies):
    """Test logout endpoint"""
    print("\n=== Testing Logout ===")
    url = f"{BASE_URL}/logout"
    
    response = requests.post(url, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_change_password(cookies):
    """Test change password endpoint"""
    print("\n=== Testing Change Password ===")
    url = f"{BASE_URL}/change-password"
    data = {
        "oldPassword": "password123",
        "newPassword": "newpassword456"
    }
    
    response = requests.post(url, json=data, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_unauthorized_access():
    """Test accessing protected endpoint without authentication"""
    print("\n=== Testing Unauthorized Access ===")
    url = f"{BASE_URL}/change-password"
    data = {
        "oldPassword": "password123",
        "newPassword": "newpassword456"
    }
    
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_register(cookies):
    """Test register endpoint (requires admin access)"""
    print("\n=== Testing Register ===")
    url = f"{BASE_URL}/register"
    data = {
        "email": "newuser@example.com",
        "password": "password123",
        "role": "STUDENT"
    }
    
    response = requests.post(url, json=data, cookies=cookies)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


if __name__ == "__main__":
    print("=" * 60)
    print("Authentication API Test Suite")
    print("=" * 60)
    
    # Test unauthorized access first
    test_unauthorized_access()
    
    # Test login and get cookies
    cookies = test_login()
    
    if cookies and 'token' in cookies:
        # Test authenticated endpoints
        test_change_password(cookies)
        test_register(cookies)
        
        # Test logout
        test_logout(cookies)
        
        print("\n=== All tests completed ===")
    else:
        print("\n❌ Login failed - cannot proceed with authenticated tests")
        print("Make sure you have a test user in the database with:")
        print("  Email: test@example.com")
        print("  Password: password123")
