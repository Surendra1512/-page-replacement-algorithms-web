FROM python:3.11-slim

# Create app directory
WORKDIR /app

# Install system deps (if needed) and pip dependencies
COPY backend/requirement.txt /app/backend/requirement.txt
RUN pip install --no-cache-dir -r /app/backend/requirement.txt

# Copy the rest of the project
COPY . /app

# Expose Flask port
EXPOSE 5000

# Run the Flask app
CMD ["python", "backend/app.py"]
