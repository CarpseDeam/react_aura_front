# Dockerfile
# Use an official lightweight Python image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy ONLY the requirements files first to leverage Docker's layer caching.
# This is the most critical step for speeding up deployments.
# If these files don't change, the `pip install` step will be skipped.
COPY requirements.txt .

# Install all dependencies for the main backend application.
RUN pip install --no-cache-dir -r requirements.txt

# Now, copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# The command to run your main application using Gunicorn.
CMD ["gunicorn", "-c", "gunicorn.conf.py", "src.main:app"]