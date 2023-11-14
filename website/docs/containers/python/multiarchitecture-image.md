---
title: Building and Running Multi-Architecture Containers
sidebar_position: 5
---
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This lab shows you how to create a multi-architecture container image for the FastAPI application using [docker buildx](https://docs.docker.com/engine/reference/commandline/buildx/), which is essential when deploying to a Kubernetes cluster. The PostgreSQL database, utilizing the official "postgres:13" image, is sourced directly from Docker Hub, eliminating the necessity to construct and deploy a custom image for it.

## Prerequisites

- [Integrating Amazon ECR with Docker Compose](integration-ecr.md)

<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the 'python-fastapi-demo-docker' directory where their environment variables are sourced.-->
<GetEnvVars />

## 1. Logging into Amazon ECR

From the 'python-fastapi-demo-docker' project directory, authenticate the Docker CLI to your Amazon ECR registry using:

```bash
aws ecr get-login-password \
--region ${AWS_REGION} | docker login \
--username AWS \
--password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

You should see the following response output: “Login Succeeded”.

For Finch authenticate to your Amazon ECR registry using:

```bash
aws ecr get-login-password \
--region ${AWS_REGION} | finch login \
--username AWS \
--password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

## 2. Building Multi-Architecture Docker Image for the Web Service

You can use 'docker buildx' to build Docker images for application and database services that are compatible with multiple architectures, including Kubernetes clusters.

First, create and start new builder instances for the web service:

```bash
docker buildx create --name webBuilder
docker buildx use webBuilder
docker buildx inspect --bootstrap
```

The expected output should look like this:

```bash
webBuilder
[+] Building 2.7s (1/1) FINISHED
 => [internal] booting buildkit                                                                                            2.6s
 => => pulling image moby/buildkit:buildx-stable-1                                                                         1.1s
 => => creating container buildx_buildkit_webbuilder0                                                                      1.5s
Name:   webBuilder
Driver: docker-container

Nodes:
Name:      webbuilder0
Endpoint:  unix:///var/run/docker.sock
Status:    running
Platforms: linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/mips64le, linux/mips64, linux/arm/v7, linux/arm/v6
```

> Note: There is no direct equivalent for `buildx` using Finch. You can target a set of platforms though.
>The `finch build` command allows targeting different platforms via the `--platform` flag, similar to buildx. You can build binaries for Linux, macOS, and Windows on AMD64 or ARM architectures. For example: `finch build --platform=amd64,arm64 .` to target both AMD and ARM architectures.

## 3. Pushing the Image to Amazon ECR

Next, build and push the images for your web service by running the following commands:

```bash
docker buildx use webBuilder
docker buildx build --platform linux/amd64,linux/arm64 -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION} . --push
```

This builds Docker images based on the Dockerfile instructions and pushes them to your ECR repository.
The expected output should look like this :

```bash
[+] Building 305.4s (30/30) FINISHED
 => [internal] load build definition from Dockerfile                                                                       0.1s
 => => transferring dockerfile: 1.01kB                                                                                     0.0s
 => [linux/amd64 internal] load metadata for docker.io/library/python:3.9-slim-buster                                      2.3s
 => [linux/arm64 internal] load metadata for docker.io/library/python:3.9-slim-buster                                      2.2s
 => [auth] library/python:pull token for registry-1.docker.io                                                              0.0s
 => [internal] load .dockerignore                                                                                          0.0s
 => => transferring context: 2B                                                                                            0.0s
 => [linux/amd64 builder 1/5] FROM docker.io/library/python:3.9-slim-buster@sha256:320a7a4250aba4249f458872adecf92eea88dc  1.3s
 => => resolve docker.io/library/python:3.9-slim-buster@sha256:320a7a4250aba4249f458872adecf92eea88dc6abd2d76dc5c0f01cac9  0.2s
 => => sha256:2e1c130fa3ec1777a82123374b4c500623959f903c1dd731ee4a83e1f1b38ff2 3.14MB / 3.14MB                             1.1s
 => => sha256:84c8c79126f669beec1dcf6f34cd88094471745570c19c29b465dfa7db1fdabd 243B / 243B                                 0.2s
 => => sha256:8d53da26040835f622504d7762fad14d226ac414efeb5363f5febebc89ff224d 11.04MB / 11.04MB                           3.2s
 => => sha256:8b91b88d557765cd8c6802668755a3f6dc4337b6ce15a17e4857139e5fc964f3 27.14MB / 27.14MB                          15.1s
 => => sha256:824416e234237961c9c5d4f41dfe5b295a3c35a671ee52889bfb08d8e257ec4c 2.78MB / 2.78MB                             1.3s
 => => extracting sha256:8b91b88d557765cd8c6802668755a3f6dc4337b6ce15a17e4857139e5fc964f3                                  4.3s
 => => extracting sha256:824416e234237961c9c5d4f41dfe5b295a3c35a671ee52889bfb08d8e257ec4c                                  1.4s                            0.0s
 => => extracting sha256:2e1c130fa3ec1777a82123374b4c500623959f903c1dd731ee4a83e1f1b38ff2                                  1.3s
 => [linux/arm64 builder 1/5] FROM docker.io/library/python:3.9-slim-buster@sha256:320a7a4250aba4249f458872adecf92eea88dc  0.7s
 => => resolve docker.io/library/python:3.9-slim-buster@sha256:320a7a4250aba4249f458872adecf92eea88dc6abd2d76dc5c0f01cac9  0.2s
 => [internal] load build context                                                                                          0.3s
 => => transferring context: 130.52kB                                                                                      0.1s
 => [linux/arm64 builder 2/5] WORKDIR /server                                                                              0.3s
 => [linux/arm64 builder 3/5] RUN apt-get update && apt-get install -y build-essential                                   120.4s
 => [linux/arm64 runner 3/8] RUN apt-get update && apt-get install -y netcat                                              71.4s
 => [linux/amd64 builder 2/5] WORKDIR /server                                                                              0.1s
 => [linux/amd64 runner 3/8] RUN apt-get update && apt-get install -y netcat                                              16.6s
 => [linux/amd64 builder 3/5] RUN apt-get update && apt-get install -y build-essential                                    50.2s
 => [linux/amd64 builder 4/5] COPY ./server/requirements.txt /server/                                                      0.2s
 => [linux/amd64 builder 5/5] RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt       13.3s
 => [linux/amd64 runner 4/8] COPY --from=builder /server/wheels /server/wheels                                             0.1s
 => [linux/amd64 runner 5/8] COPY --from=builder /server/requirements.txt .                                                0.0s
 => [linux/amd64 runner 6/8] RUN pip install --no-cache /server/wheels/*                                                  15.3s
 => [linux/amd64 runner 7/8] RUN pip install uvicorn                                                                       2.3s
 => [linux/amd64 runner 8/8] COPY . /server/                                                                               0.1s
 => [linux/arm64 builder 4/5] COPY ./server/requirements.txt /server/                                                      0.1s
 => [linux/arm64 builder 5/5] RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt       43.3s
 => [linux/arm64 runner 4/8] COPY --from=builder /server/wheels /server/wheels                                             0.1s
 => [linux/arm64 runner 5/8] COPY --from=builder /server/requirements.txt .                                                0.0s
 => [linux/arm64 runner 6/8] RUN pip install --no-cache /server/wheels/*                                                  83.4s
 => [linux/arm64 runner 7/8] RUN pip install uvicorn                                                                      11.4s
 => [linux/arm64 runner 8/8] COPY . /server/                                                                               0.1s
 => exporting to image                                                                                                    18.2s
 => => exporting layers                                                                                                    5.8s
 => => exporting manifest sha256:b0470562af55ca88d950a848ff258f7baed1231d11e73a93e79d9dec19c77382                          0.0s
 => => exporting config sha256:f0e3c543a641a36f19e8fea24195e1aee441b00502798c607397ae93405604a3                            0.0s
 => => exporting manifest sha256:0faad539de2df68a509bb9e08fbe457681cd161a0dbba98d4519b4b5c1e3cb39                          0.0s
 => => exporting config sha256:d298c0b1ce0f96e0b1a4b1e05cd99706ef767045f17f118e48906273443cb88b                            0.0s
 => => exporting manifest list sha256:894e90606e81e42117077fb6797a1332131dd077fa91c75ba4b498619d90e9e7                     0.0s
 => => pushing layers                                                                                                     11.1s
 => => pushing manifest for ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/fastapi-microservices:1.0@sha256:894e90606e81e42  1.2s
 => [auth] sharing credentials for ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

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

**Optionally**, if you want to stop the workshop at this point, run the following command to clean up created images:

```bash
docker rmi -f $(docker images "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/*" -q)
```

## Conclusion

This lab explored the process of constructing and executing Docker containers using Docker Compose in the 'python-fastapi-demo-docker' project. We also demonstrated how to use Docker's buildx feature to create Docker images that are compatible with multiple CPU architectures. This approach provides an efficient way to manage multi-service applications, enhancing their portability and ensuring they can run on a wider range of platforms.

## What's Next?

- [Kubernetes](../../kubernetes/index.md)
