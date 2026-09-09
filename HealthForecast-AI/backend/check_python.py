import sys

if sys.version_info[:2] != (3, 14):
    raise SystemExit(
        f"HealthForecast-AI requires Python 3.14.x. Detected Python {sys.version.split()[0]}. "
        "Create the virtual environment with: py -3.14 -m venv .venv"
    )

print(f"Python {sys.version.split()[0]} OK - HealthForecast-AI requires Python 3.14.x")
