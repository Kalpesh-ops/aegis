# Use a lightweight Python image
FROM python:3.11-slim

# Prevent Python from writing pyc files and enforce unbuffered stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy the requirements file we just generated
COPY requirements.txt .

# Install dependencies (ignoring cache to save space)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port Cloud Run expects
EXPOSE 8080

# Boot the FastAPI monolithic server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
