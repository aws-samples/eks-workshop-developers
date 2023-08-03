---
title: About Multi-Stage Builds in Docker for Cost Savings
sidebar_position: 3
---
## Objective
This guide will shed light on the practical application of Docker's multi-stage builds within our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project's Dockerfile. By the end of this guide, you'll learn how multi-stage builds can help reduce the final Docker image size and how this can translate into cost savings in cloud environments.

## Dockerfile Structure
Our project's Dockerfile employs a two-stage build process: "builder" and "runner". This strategy, utilizing only necessary elements for the final image, minimizes size and separates build-time and run-time dependencies.

### Stage 1: Builder
The `builder` uses a Python base image, installs system dependencies, copies the requirements.txt file, and downloads Python dependencies as wheel files into the /server/wheels directory. These wheel files are binary packages facilitating safer, faster installations.

```
# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /server

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential

# Install Python dependencies
COPY ./server/requirements.txt /server/
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt
```

### Stage 2: Runner
The `runner` starts with a Python base image, installs system dependencies like netcat, copies wheel files from the builder stage, installs Python packages, copies the application code, exposes the application's port, and sets the startup command.

```
FROM python:3.9-slim-buster as runner

WORKDIR /server

# Install system dependencies
RUN apt-get update && apt-get install -y netcat

# Install Python dependencies
COPY --from=builder /server/wheels /server/wheels
COPY --from=builder /server/requirements.txt .
RUN pip install --no-cache /server/wheels/*
RUN pip install uvicorn

# Copy project
COPY . /server/

# Expose the port the app runs in
EXPOSE 8000

# Defines the command to start the container
CMD uvicorn server.app.main:app --host 0.0.0.0 --port 8000
```

## Conclusion

This guide underscores the strategic implementation of Docker's multi-stage builds in the Dockerfile for the fastapi-microservices project. This approach not only separates build-time and run-time dependencies but also reduces the final image size, thus optimizing resource utilization.
