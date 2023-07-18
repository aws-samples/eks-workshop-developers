---
title: Uploading Container Images to Amazon ECR
sidebar_position: 5
---
## Overview
Learn how to leverage Amazon Elastic Container Registry (ECR) as a secure and efficient storage solution for Docker images in the context of our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project.

## Objective
This tutorial simplifies the process of pushing Docker images to Amazon ECR using the FastAPI and PostgreSQL images from our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project. We'll showcase how uploading these Docker images to ECR enhances your development, testing, and deployment workflows by making the images accessible across different environments.

## Prerequisites
- [Building and Running the Docker Containers](build-image.md)

## 1. Creating an ECR Repository
Create a new private Amazon ECR repository:
```bash
aws ecr create-repository --repository-name fastapi-microservices
```

## 2. Logging into Amazon ECR
Authenticate your Docker CLI to your Amazon ECR registry using:
```bash
aws ecr get-login-password \
--region ${AWS_REGION} | docker login \
--username AWS \
--password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

You should see the following response output: “Login Succeeded”.

## 3. Uploading Docker Images to ECR
Tag your Docker image for the ECR repository:
```bash
docker tag fastapi-microservices:${IMAGE_VERSION} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

Push the tagged image to the ECR repository:
```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

## 4. Retrieving the Docker Image from ECR
Retrieve the Docker image from your ECR repository with this command:
```bash
docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

Look for an output message stating that the image is up-to-date, signaling a successful operation.

## Conclusion

This guide walked you through the process of pushing a Docker container image to Amazon ECR. This method provides a convenient way to manage and distribute Docker images, making it an essential tool for any developer working with Docker.


