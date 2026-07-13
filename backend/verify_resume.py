import json
import urllib.request
import urllib.error

API_BASE = "http://localhost:8001/api"

def make_request(url, method="POST", data=None, headers=None, multipart_file=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if multipart_file is not None:
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
        
        filename, file_bytes = multipart_file
        part_header = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
            f"Content-Type: application/octet-stream\r\n\r\n"
        ).encode("utf-8")
        
        part_footer = f"\r\n--{boundary}--\r\n".encode("utf-8")
        req_data = part_header + file_bytes + part_footer
    elif data is not None:
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
        print(f"   [HTTPError] URL: {url} | Code: {e.code} | Detail: {res_data}")
        return e.code, res_data
    except Exception as e:
        print(f"   [Error] Message: {str(e)}")
        return 500, {"detail": str(e)}

print("\n--- Running Resume Parser & Suggestions Optimizer Integration Test ---")

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

# Step 2: Upload and parse plain text resume
print("\n2. Uploading plain text resume content for parsing...")
resume_text = """
Chaithanya Repose
Email: chaithanya@example.com
Title: Senior React & Python Developer
Experience: 6+ years of experience in software engineering.
Skills: Python, FastAPI, React, TypeScript, Docker, SQL, Git
"""
code, parsed_data = make_request(
    f"{API_BASE}/resume/parse",
    method="POST",
    headers=headers,
    multipart_file=("resume.txt", resume_text.encode("utf-8"))
)
assert code == 200
print(f"   Parsed Data: {json.dumps(parsed_data, indent=2)}")
assert parsed_data["name"] == "Chaithanya Repose"
assert "React" in parsed_data["skills"]

# Step 3: Fetch jobs list and run comparisons
print("\n3. Fetching available vacancies and testing comparison...")
code, jobs_list = make_request(f"{API_BASE}/jobs", method="GET", headers=headers)
assert code == 200
assert len(jobs_list) > 0
first_job = jobs_list[0]
print(f"   Selected Job: ID {first_job['id']} - '{first_job['title']}' at {first_job['company']}")

# Compare resume with job
compare_payload = {
    "skills": parsed_data["skills"],
    "experience_years": parsed_data["experience_years"]
}
code, compare_res = make_request(
    f"{API_BASE}/resume/compare/{first_job['id']}",
    method="POST",
    data=compare_payload,
    headers=headers
)
assert code == 200
print(f"   Match Score: {compare_res['match_score']}%")
print(f"   Suggestions:\n" + "\n".join(f"     - {s}" for s in compare_res["suggestions"]))

print("\n--- RESUME PARSER INTEGRATION TEST: ALL PASSED ---")
