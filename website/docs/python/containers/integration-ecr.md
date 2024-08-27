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
    build: .
    image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

## 3. Running Docker Compose

Authenticate your Docker CLI to your Amazon ECR registry before running Docker Compose:

```bash
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

Alternatively, if you're using Finch, run the following command to login to Amazon ECR:

```bash
aws ecr get-login-password --region ${AWS_REGION} | finch login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

Now, initiate the services with Docker Compose, pulling the image from Amazon ECR:

```bash
docker-compose up
```

Alternatively, if you're using Finch, run the following command to compose and pull the image from Amazon ECR:

```bash
finch compose up
```

This command will now pull the image from the Amazon ECR repository, as specified in the docker-compose.yml file, and start your services.

Press `Ctrl+C` to stop the services.

## 4. Updating Docker Images

If you're working with a team and sharing the Docker image for the FastAPI application on Amazon ECR, you might find yourself pulling updates from ECR, making changes, and then pushing updates back to ECR. Here's the typical workflow.

To pull the latest image, run:

```bash
docker-compose pull web
```

Alternatively, if you're using Finch, run the following command to pull the latest image:

```bash
finch compose pull web
```

To start your services, run:

```bash
docker-compose up
```

Alternatively, if you're using Finch, run the following command:

```bash
finch compose up
```

After making changes to your application, stop the running services with `Ctrl+C`.
Then update the image version value in your environment variable:

```
export IMAGE_VERSION=1.1
```
Verify that `IMAGE_VERSION` is updated by executing the following command:

```bash
echo $IMAGE_VERSION
1.1
```

To build a new image for your application, run:

```bash
docker-compose build web
```

Alternatively, if you're using Finch, run the following command:

```bash
finch compose build web
```

Above command will build image with ECR tag to verify please run following command:

```bash
docker image ls | grep amazonaws.com/fastapi-microservices
AWS_ACCOUNT_ID.dkr.ecr.AWS_REGION.amazonaws.com/fastapi-microservices   1.1                             defd60e3e376   6 minutes ago   233MB
AWS_ACCOUNT_ID.dkr.ecr.AWS_REGION.amazonaws.com/fastapi-microservices   1.0                             abc11f568055   2 hours ago     233MB
```

Alternatively, if you're using Finch, run the following command:

```bash
finch image ls | grep amazonaws.com/fastapi-microservices
```

The expected output should look like this:

```text
AWS_ACCOUNT_ID.dkr.ecr.AWS_REGION.amazonaws.com/fastapi-microservices   1.1                             defd60e3e376   6 minutes ago   233MB
AWS_ACCOUNT_ID.dkr.ecr.AWS_REGION.amazonaws.com/fastapi-microservices   1.0                             abc11f568055   2 hours ago     233MB
```

To push the new image to your ECR repository, run:

```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

Alternatively, if you're using Finch, run the following command to push the new image:

```bash
finch push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

## Cleanup

To clean up created images run the following command:

```bash
docker rmi -f $(docker images "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/*" -q)
```

Alternatively, if you're using Finch, run the following command:

```bash
finch rmi -f $(finch images --filter reference=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com -q)
```

Stop and remove the containers of both services by running the following command:

```bash
docker-compose down --volumes
```

Alternatively, if you're using Finch, run the following command to stop and remove the containers:

```bash
finch compose down
```

## Conclusion

Through this lab, we've achieved seamless integration of Docker images with Docker Compose by uploading them to Amazon ECR. This approach has increased the portability of our FastAPI application and PostgreSQL database, allowing any Docker-equipped environment to pull images, create containers, and run the application with minimal fuss.
