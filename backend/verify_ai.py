import json
import urllib.request
import urllib.error

API_BASE = "http://localhost:8001/api"

def make_request(url, method="POST", data=None, headers=None):
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

print("--- Running AI Chatbot RAG Integration Test ---")

# Step 1: Login
print("\n1. Logging in as candidate (chaithanya@example.com)...")
login_payload = {
    "email": "chaithanya@example.com",
    "password": "password123"
}
code, login_data = make_request(f"{API_BASE}/auth/login", method="POST", data=login_payload)
assert code == 200
token = login_data["access_token"]
print("   Login SUCCESS!")

headers = {"Authorization": f"Bearer {token}"}

# Step 2: Query recommendations
print("\n2. Querying AI: 'What job recommendations do we have?'")
code, res = make_request(f"{API_BASE}/ai/chat", method="POST", data={"message": "recommendations"}, headers=headers)
assert code == 200
print(f"   AI Chat Response:\n{res['response']}")

# Step 3: Query application status
print("\n3. Querying AI: 'Show me my application status'")
code, res = make_request(f"{API_BASE}/ai/chat", method="POST", data={"message": "status of my applications"}, headers=headers)
assert code == 200
print(f"   AI Chat Response:\n{res['response']}")

print("\n--- AI CHATBOT INTEGRATION TEST: ALL PASSED ---")
