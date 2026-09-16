import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

users = [
    ("doctor@hospital.com", "Password123"),
    ("researcher@hospital.com", "Password123"),
    ("admin@hospital.com", "Password123"),
    ("sysadmin@hospital.com", "Password123"),
]

print("Testing FastAPI app authentication with TestClient:")
for username, password in users:
    res = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    print(f"Login {username} -> Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print("  Token:", data.get("access_token")[:30], "...")
        print("  User Role:", data.get("user", {}).get("role"))
    else:
        print("  Error detail:", res.json())
