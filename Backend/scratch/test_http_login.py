import httpx

url = "http://127.0.0.1:8000/api/v1/auth/login"

users = [
    ("doctor@hospital.com", "Password123"),
    ("researcher@hospital.com", "Password123"),
    ("admin@hospital.com", "Password123"),
    ("sysadmin@hospital.com", "Password123"),
]

for username, password in users:
    try:
        res = httpx.post(url, data={"username": username, "password": password})
        print(f"Login {username} -> Status: {res.status_code}")
        if res.status_code == 200:
            print("  Token received:", res.json().get("access_token")[:25], "...")
        else:
            print("  Response body:", res.text)
    except Exception as e:
        print(f"Error connecting to {url}: {e}")
