import sys
import os
import json
import urllib.request
import urllib.error

API_BASE = "http://localhost:8001/api"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            code = response.getcode()
            body = response.read().decode("utf-8")
            res_data = json.loads(body) if body else {}
            return code, res_data
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            res_data = json.loads(body)
        except:
            res_data = {"detail": body}
        return e.code, res_data
    except Exception as e:
        return 500, {"detail": str(e)}

print("--- Running Full-Stack Auth Verification REST client (urllib version) ---")

# Step 1: Sign up new candidate
print("\n1. Signing up a new candidate...")
signup_payload = {
    "name": "PowerShell Test User",
    "email": "pstest@example.com",
    "password": "pass123password",
    "title": "React Developer"
}
code, data = make_request(f"{API_BASE}/auth/signup", method="POST", data=signup_payload)
if code == 201:
    print("   Candidate signed up successfully!")
elif code == 400:
    print(f"   Candidate signup: {data.get('detail')} (OK)")
else:
    print(f"   Error signing up: {code} - {data}")

# Step 2: Login new candidate
print("\n2. Logging in as new candidate...")
login_payload = {
    "email": "pstest@example.com",
    "password": "pass123password"
}
code, login_data = make_request(f"{API_BASE}/auth/login", method="POST", data=login_payload)
assert code == 200
token = login_data["access_token"]
user_id = login_data["user"]["id"]
print(f"   Login SUCCESS. Token generated (length={len(token)}). User ID = {user_id}")

# Step 3: Fetch personal recommendations with token
print("\n3. Fetching user recommendations...")
headers = {"Authorization": f"Bearer {token}"}
code, recs = make_request(f"{API_BASE}/users/{user_id}/recommendations", headers=headers)
assert code == 200
print(f"   Successfully fetched {len(recs)} recommendation records!")
if recs:
    print(f"   Top Job recommendation: '{recs[0]['job']['title']}' (Score: {recs[0]['match_score']}%)")

# Step 4: Access admin endpoint with standard user token (should be forbidden)
print("\n4. Accessing admin dashboard with standard user token...")
code, data = make_request(f"{API_BASE}/applications", headers=headers)
print(f"   Status Code: {code} (Expected: 403)")
assert code == 403
print("   Authorization Guard: SUCCESS (Standard user access forbidden!)")

# Step 5: Log in as admin
print("\n5. Logging in as admin...")
admin_login = {
    "email": "chaithanya@example.com",
    "password": "password123"
}
code, admin_data = make_request(f"{API_BASE}/auth/login", method="POST", data=admin_login)
assert code == 200
admin_token = admin_data["access_token"]
print("   Admin Login: SUCCESS")

# Step 6: Get all applications as admin
print("\n6. Accessing admin applications table...")
admin_headers = {"Authorization": f"Bearer {admin_token}"}
code, apps = make_request(f"{API_BASE}/applications", headers=admin_headers)
assert code == 200
print(f"   Successfully fetched {len(apps)} applications!")

if apps:
    app_to_test = apps[0]
    app_id = app_to_test["id"]
    print(f"   Testing Application status update for candidate '{app_to_test['user']['name']}' on job '{app_to_test['job']['title']}' (App ID = {app_id})")
    
    # Step 7: Update application status as admin
    print("\n7. Updating candidate application status to 'Interviewing'...")
    code, status_res = make_request(
        f"{API_BASE}/applications/{app_id}/status",
        method="PATCH",
        data={"status": "Interviewing"},
        headers=admin_headers
    )
    assert code == 200
    print("   Application status update: SUCCESS")
    print(f"   Response details: {status_res}")

print("\n--- AUTH AND AUTHORIZATION VERIFICATION: ALL PASSED ---")
