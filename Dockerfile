FROM python:3.10-slim-buster

# Install MySQL client development libraries
RUN apt-get update && apt-get install -y libmariadb-dev default-libmysqlclient-dev

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the rest of your application code
COPY . .

# Define the command to run your application (adjust as needed)
CMD ["gunicorn", "frelix.wsgi", "--bind", "0.0.0.0:5000"]
# For Django: CMD ["gunicorn", "<your_project_name>.wsgi", "--bind", "0.0.0.0:8080"]