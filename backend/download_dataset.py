"""Download Diabetes 130-US Hospitals Dataset from UCI."""

import io
import zipfile
from pathlib import Path
from urllib.request import Request, urlopen

ZIP_URL = "https://archive.ics.uci.edu/static/public/296/diabetes+130-us+hospitals+for+years+1999-2008.zip"

OUTPUT_DIR = Path(__file__).parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "diabetic_data.csv"


def download():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if OUTPUT_FILE.exists() and OUTPUT_FILE.stat().st_size > 1_000_000:
        print(f"Dataset already present: {OUTPUT_FILE}")
        return

    print("Downloading Diabetes 130-US Hospitals dataset...")
    req = Request(ZIP_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=120) as response:
        data = response.read()
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        zf.extractall(OUTPUT_DIR)
    print(f"Downloaded to {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    download()
