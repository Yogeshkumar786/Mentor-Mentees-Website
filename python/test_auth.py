"""
Test Login and Logout APIs
"""
import requests

BASE_URL = "http://127.0.0.1:3000"

def test_login():
    """Test login API"""
    print("="*50)
    print("TEST: Login API")
    print("="*50)
    
    # Test with valid credentials
    print("\n1. Testing with valid credentials...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "student1@college.edu",
            "password": "password"
        }
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print(f"   Cookies: {dict(response.cookies)}")
    
    if response.status_code == 200:
        print("   ✅ Login SUCCESS")
        return response.cookies
    else:
        print("   ❌ Login FAILED")
        return None


def test_login_invalid():
    """Test login with invalid credentials"""
    print("\n2. Testing with invalid password...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "student1@college.edu",
            "password": "wrongpassword"
        }
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    if response.status_code == 401:
        print("   ✅ Correctly rejected invalid password")
    else:
        print("   ❌ Should have returned 401")


def test_login_missing_email():
    """Test login with missing email"""
    print("\n3. Testing with missing email...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "password": "password"
        }
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    if response.status_code == 400:
        print("   ✅ Correctly rejected missing email")
    else:
        print("   ❌ Should have returned 400")


def test_logout(cookies):
    """Test logout API"""
    print("\n" + "="*50)
    print("TEST: Logout API")
    print("="*50)
    
    print("\n4. Testing logout with valid token...")
    response = requests.post(
        f"{BASE_URL}/api/auth/logout",
        cookies=cookies
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    if response.status_code == 200:
        print("   ✅ Logout SUCCESS")
    else:
        print("   ❌ Logout FAILED")


def test_logout_no_token():
    """Test logout without token"""
    print("\n5. Testing logout without token...")
    response = requests.post(
        f"{BASE_URL}/api/auth/logout"
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    if response.status_code == 401:
        print("   ✅ Correctly rejected unauthenticated logout")
    else:
        print("   ❌ Should have returned 401")


def test_me_endpoint(cookies):
    """Test /me endpoint to verify token works"""
    print("\n" + "="*50)
    print("TEST: /me Endpoint (Get User Role)")
    print("="*50)
    
    print("\n6. Testing /me with valid token...")
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        cookies=cookies
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    if response.status_code == 200:
        print("   ✅ /me SUCCESS")
    else:
        print("   ❌ /me FAILED")


def main():
    print("\n" + "#"*50)
    print("  TESTING LOGIN/LOGOUT APIs")
    print("#"*50)
    
    try:
        # Test login with valid credentials
        cookies = test_login()
        
        # Test login with invalid credentials
        test_login_invalid()
        
        # Test login with missing email
        test_login_missing_email()
        
        # Test /me endpoint if login succeeded
        if cookies:
            test_me_endpoint(cookies)
        
        # Test logout with token
        if cookies:
            test_logout(cookies)
        
        # Test logout without token
        test_logout_no_token()
        
        print("\n" + "="*50)
        print("ALL TESTS COMPLETED")
        print("="*50 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server.")
        print("   Make sure Django server is running on port 3000")
        print("   Run: python manage.py runserver 3000")


if __name__ == "__main__":
    main()
