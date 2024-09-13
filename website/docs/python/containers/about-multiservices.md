---
title: About Docker Build and Service Orchestration
sidebar_position: 1
---

## Overview

This page serves as an introduction to Docker and Docker Compose, focusing on the deployment and orchestration of our Python-based FastAPI application using multi-stage builds and service management.

## Multi-Stage Builds in Docker for Cost Savings

This section describes the practical application of Docker's multi-stage builds within our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project's Dockerfile, reducing the final Docker image size and cost savings in cloud environments. Our project's Dockerfile employs a two-stage build process: "builder" and "runner". This strategy, utilizing only necessary elements for the final image, minimizes size and separates build-time and run-time dependencies.

### Stage 1: Builder

The `builder` uses a Python base image, installs system dependencies, copies the requirements.txt file, and downloads Python dependencies as wheel files into the /server/wheels directory. These wheel files are binary packages facilitating safer, faster installations.

```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /server

# Install system dependencies and Python dependencies
COPY ./server/requirements.txt /server/
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt
```

### Stage 2: Runner

The `runner` starts with a Python base image, installs system dependencies like netcat, copies wheel files from the builder stage, installs Python packages, copies the application code, exposes the application's port, and sets the startup command.

```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /server

# Install system dependencies and Python dependencies
COPY ./server/requirements.txt /server/
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt

FROM python:3.9-slim-buster as runner

WORKDIR /server

# Install system dependencies and Python dependencies
COPY --from=builder /server/wheels /server/wheels
COPY --from=builder /server/requirements.txt .
RUN pip install --no-cache-dir /server/wheels/* \
    && pip install --no-cache-dir uvicorn

# Copy project
COPY . /server/

# Expose the port the app runs in
EXPOSE 8000

# Define the command to start the container
CMD ["uvicorn", "server.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Managing Multiple Services with Docker Compose

This section details how Docker Compose is leveraged in the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project for the orchestration of multiple services. Our `docker-compose.yml` file in the 'python-fastapi-demo-docker' project outlines two services: our FastAPI application (the 'web' service) and the PostgreSQL database (the 'db' service).

### web Service (FastAPI Application)

The **web** service builds a container image using the Dockerfile in our project directory and starts the FastAPI application. The current directory, containing the application code, is mounted into the '/server' directory inside the container. This setup ensures that any changes made to the application code on the host are immediately reflected in the container. This service is part of the 'webnet' network, allowing it to communicate with the 'db' service.

```
  web:
    build: .
    image: fastapi-microservices:${IMAGE_VERSION}
    command: uvicorn server.app.main:app --host 0.0.0.0 --port 8000
    volumes:
      - .:/server
    ports:
      - 8000:8000
    depends_on:
      - db
    networks:
      - webnet
    env_file:
      - .env
```

### db Service (PostgreSQL Database)

The **db** service uses the official PostgreSQL image available on DockerHub. It is configured using environment variables in the `.env` file. Utilizing the `postgres_data` volume, the service ensures persistent storage of database data, safeguarding it against data loss even if the container is terminated. An `init.sh` script is executed upon container startup to initialize the database. This service is part of the 'webnet' network, allowing it to communicate with the 'web' service.

```
  db:
    image: postgres:13
    env_file:
      - .env
    volumes:
      - ./server/db/init.sh:/docker-entrypoint-initdb.d/init.sh
      - postgres_data:/var/lib/postgresql/data
    networks:
      - webnet
```

### Defining Networks

The webnet network in the `docker-compose.yml` file plays a pivotal role in facilitating communication between our FastAPI application (the 'web' service) and the PostgreSQL database (the 'db' service). This custom network isolates the services in our project, ensuring that they can interact securely and efficiently.

```yaml
networks:
  webnet:
```

### postgres_data Volume

The `postgres_data` volume in the `docker-compose.yml` is configured to store the PostgreSQL database data persistently. This ensures that the data remains intact even when the PostgreSQL container is stopped or deleted, providing a robust solution for data persistence.

```yaml
volumes:
  postgres_data: 
```
