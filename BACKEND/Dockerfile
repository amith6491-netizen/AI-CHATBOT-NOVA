# ==========================================
# Python Backend Container
# ==========================================
FROM python:3.11-slim

# Prevent bytecode generation and configure unbuffered python output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000

WORKDIR /app

# Install curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-privileged user and runtime directory for Gunicorn
RUN useradd -m -u 1000 appuser \
    && mkdir -p /run/gunicorn \
    && chown -R appuser:appuser /run/gunicorn


# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose backend service port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Launch using production WSGI server Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "--worker-tmp-dir", "/dev/shm", "--no-control-socket", "--access-logfile", "-", "pythonserver:app"]


