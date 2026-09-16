import httpx

print("Testing connection to http://127.0.0.1:8000/ ...")
try:
    r = httpx.get("http://127.0.0.1:8000/")
    print("127.0.0.1:8000 status:", r.status_code, r.json())
except Exception as e:
    print("127.0.0.1:8000 FAILED:", e)

print("Testing connection to http://localhost:8000/ ...")
try:
    r = httpx.get("http://localhost:8000/")
    print("localhost:8000 status:", r.status_code, r.json())
except Exception as e:
    print("localhost:8000 FAILED:", e)
