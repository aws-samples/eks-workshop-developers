---
title: Integrating Amazon ECR with Docker Compose
sidebar_position: 4
---
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective
This lab shows to streamline the process of uploading Docker images to Amazon ECR and employing them within Docker Compose. By shifting the Docker image storage to Amazon ECR and harnessing them in Docker Compose, we aim to enhance deployment smoothness and the scalability of your microservices application.

## Prerequisites
- [Uploading Container Images to Amazon ECR](upload-ecr.md)

<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the 'python-fastapi-demo-docker' directory where their environment variables are sourced.-->
<GetEnvVars />

## 1. Adjustments to the Dockerfile
After the successful upload of Docker images to Amazon ECR, no changes are required in the Dockerfile, which serves as a consistent blueprint for defining the environment, dependencies, and image creation steps.

## 2. Updating Docker Compose Configuration
To ensure consistent deployments and resource efficiency, update the `docker-compose.yml` file to use images from your Amazon ECR repository, rather than building them locally.

Replace the local build directive in your `docker-compose.yml`:
```yaml
  web:
    build: .
    image: fastapi-microservices:${IMAGE_VERSION}
```

Instead, use the pre-built Docker image hosted on Amazon ECR:
```yaml
  web:
    image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

## 3. Running Docker Compose
Authenticate your Docker CLI to your Amazon ECR registry before running Docker Compose:
```bash
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

Now, initiate the services with Docker Compose, pulling the image from Amazon ECR:
```bash
docker-compose up
```
This command will now pull the image from the Amazon ECR repository, as specified in the docker-compose.yml file, and start your services.

## 4. Updating Docker Images
If you're working with a team and sharing the Docker image for the FastAPI application on Amazon ECR, you might find yourself pulling updates from ECR, making changes, and then pushing updates back to ECR. Here's the typical workflow.

To pull the latest image, run:

```bash
docker-compose pull web
```

To start your services, run:
```bash
docker-compose up
```

After making changes to your application, stop the running services with `Ctrl+C` and then update the image version value in your `.env` file. For example:
```
IMAGE_VERSION=1.1
```


After editing `.env` make sure to [re-import your environment variables](../../introduction/python/environment-setup) and verify if `IMAGE_VERSION` is updated.

```bash
echo $IMAGE_VERSION
1.1
```


To build a new image for your application, run:
```bash
docker-compose build web
```

Above command will build image with ECR tag to verify please run following command:
```bash
docker image ls | grep amazonaws.com/fastapi-microservices
AWS_ACCOUNT_ID.dkr.ecr.AWS_REGION.amazonaws.com/fastapi-microservices   1.1                             defd60e3e376   6 minutes ago   233MB
AWS_ACCOUNT_ID.dkr.ecr.AWS_REGION.amazonaws.com/fastapi-microservices   1.0                             abc11f568055   2 hours ago     233MB
```

To push the new image to your ECR repository, run:
```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

## Cleanup

To clean up created images run the following command:

```bash
docker rmi -f $(docker images "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/*" -q)
```

## Conclusion
Through this lab, we've achieved seamless integration of Docker images with Docker Compose by uploading them to Amazon ECR. This approach has increased the portability of our FastAPI application and PostgreSQL database, allowing any Docker-equipped environment to pull images, create containers, and run the application with minimal fuss.