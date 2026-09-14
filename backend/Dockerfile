# ==============================================================================
# HealthForecast AI - Backend Dockerfile
# Production-ready Python FastAPI container with ML dependencies
# ==============================================================================

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system runtime & build dependencies (libgomp1 required for XGBoost/Scikit-learn, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for caching efficiency
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create directory for persistent SQLite data with write permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Copy application source code
COPY . /app/

# Expose FastAPI default port
EXPOSE 8000

# Health check configuration
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/api/health || exit 1

# Start Uvicorn ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
