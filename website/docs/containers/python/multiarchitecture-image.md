---
title: Building and Running Multi-Architecture Containers
sidebar_position: 5
---
## Objective
This guide shows you how to create a multi-architecture container image for the FastAPI application using [docker buildx](https://docs.docker.com/engine/reference/commandline/buildx/), which is essential when deploying to a Kubernetes cluster. The PostgreSQL database, utilizing the official "postgres:13" image, is sourced directly from Docker Hub, eliminating the necessity to construct and deploy a custom image for it. 

## Prerequisites
- [Integrating Amazon ECR with Docker Compose](integration-ecr.md)

## 1. Logging into Amazon ECR
From the 'python-fastapi-demo-docker' project directory, authenticate the Docker CLI to your Amazon ECR registry using:
```
aws ecr get-login-password \
--region ${AWS_REGION} | docker login \
--username AWS \
--password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

You should see the following response output: “Login Succeeded”.

## 2. Building Multi-Architecture Docker Image for the Web Service
You can use 'docker buildx' to build Docker images for application and database services that are compatible with multiple architectures, including Kubernetes clusters.

First, create and start new builder instances for the web service:
```bash
docker buildx create --name webBuilder
docker buildx use webBuilder
docker buildx inspect --bootstrap
```

## 3. Pushing the Image to Amazon ECR
Next, build and push the images for your web service by running the following commands:
```bash
docker buildx use webBuilder
docker buildx build --platform linux/amd64,linux/arm64 -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION} . --push
```
This builds Docker images based on the Dockerfile instructions and pushes them to your ECR repository. 

## 4. Running the Services as Docker Containers
After building the images, start the application and database services in separate Docker containers using Docker Compose:
```bash
docker-compose up
```

This command initiates containers for each service as specified in the docker-compose.yml file. Upon navigating to [http://localhost:8000](http://localhost:8000/) in your browser, you should see the FastAPI application running.

## 5. Stopping the Services and Their Containers
Stop and remove the containers of both services by pressing `CTRL + C` or running the following command:
```bash
docker-compose down
```

## 6. Rebuilding and Restarting Docker Services
If you make changes to your application, rebuild the multi-architecture images and restart the services simultaneously using the following commands:
```bash
docker buildx use webBuilder
docker buildx build --platform linux/amd64,linux/arm64 -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION} . --push
```

This halts your services, rebuilds the Docker images, and reboots the services with the new images, ensuring your services are always operating with the latest application version.

## Cleanup

To clean up created images run the following command:

```bash
docker rmi -f $(docker images "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/*" -q)
```


## Conclusion
This guide explored the process of constructing and executing Docker containers using Docker Compose in the 'python-fastapi-demo-docker' project. We also demonstrated how to use Docker's buildx feature to create Docker images that are compatible with multiple CPU architectures. This approach provides an efficient way to manage multi-service applications, enhancing their portability and ensuring they can run on a wider range of platforms.
