---
title: Optimizing a Dockerfile with a Multi-stage Build
sidebar_position: 2
---

## Objective

In this lab we will optimize a container image size using a multi-stage build.

## Prerequisites

- [Building and Running Container Images with Java Application Using Docker](../../containers/java/build-image.md)

## 1. Optimizing the Dockerfile

We are now embedding additional build tools such as Maven, an image size will naturally increase. However, Maven is only needed during build-time and not for running the final JAR. You can therefore leverage a [multi-stage build](https://docs.docker.com/build/building/multi-stage/) to reduce the image size by separating the build from the runtime stage.

Check size of the initial image, it is **995 MB**

```bash showLineNumbers
docker images
```

:::info
Image size and application startup times might be different in your case
:::

```bash showLineNumbers
REPOSITORY             TAG                   IMAGE ID       CREATED         SIZE
unicorn-store-spring   latest            836da356dc0e   About a minute ago  995MB
```

Copy the prepared Dockerfile:

```bash showLineNumbers
cd ~/environment/unicorn-store-spring
cp dockerfiles/Dockerfile_02_multistage Dockerfile
```

Start the build for the container image. While it is building, you can move to the next step and inspect the Dockerfile.

```bash showLineNumbers
docker buildx build --load -t unicorn-store-spring:latest .
```

Inspect the Dockerfile.

As you can see in line 10 - we are starting with a fresh Amazon Corretto Image. On line 13 we are copying the artifact from the initial build stage to the fresh image.

```docker {10,13} showLineNumbers title="/unicorn-store-spring/Dockerfile"
FROM public.ecr.aws/docker/library/maven:3.9-amazoncorretto-17-al2023 as builder

COPY ./pom.xml ./pom.xml
RUN mvn dependency:go-offline -f ./pom.xml

COPY src ./src/
RUN mvn clean package && mv target/store-spring-1.0.0-exec.jar store-spring.jar
RUN rm -rf ~/.m2/repository

FROM public.ecr.aws/docker/library/amazoncorretto:17.0.9-al2023
RUN yum install -y shadow-utils

COPY --from=builder store-spring.jar store-spring.jar

RUN groupadd --system spring -g 1000
RUN adduser spring -u 1000 -g 1000

USER 1000:1000

EXPOSE 8080
ENTRYPOINT ["java","-jar","-Dserver.port=8080","/store-spring.jar"]
```

Check size of the image, it is **660 MB** now.

```bash showLineNumbers
docker images
```

Now we can see that the size of our image is less than in the previous build:

```bash showLineNumbers
REPOSITORY             TAG                   IMAGE ID       CREATED          SIZE
unicorn-store-spring   latest            ea42046620d4   29 seconds ago       660MB
```

With multi-stage build we achieved about **30%** reduction of container image size.

We will continue to optimize the image in the following modules.

## Conclusion

This lab explored the process of optimizing a container image size using a multi-stage build.
