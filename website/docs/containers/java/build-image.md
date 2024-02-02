---
title: Building and Running Container Images with Java Application Using Docker
sidebar_position: 1
---

## Objective

In the first lab you are going to build the application locally. We are leveraging [Amazon Corretto](https://aws.amazon.com/corretto/) a no-cost, multi-platform, production-ready distribution of the Open Java Development Kit (OpenJDK). Corretto comes with long-term support that will include performance enhancements and security fixes. Amazon runs Corretto internally on thousands of production services and Corretto is certified as compatible with the Java SE standard.

## Prerequisites

- [Setting up the Development Environment](../../introduction/java/workshop-setup.md)

## 1. Building the application locally

Navigate to the application folder and build the application via Maven:

```bash showLineNumbers
cd ~/environment/unicorn-store-spring
mvn clean package && mv target/store-spring-1.0.0-exec.jar store-spring.jar
```

## 2. Running the application locally

To run the Java Application we need to get a valid database `connection-url` and `password`. The database url is stored in [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) and the database password in [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/). The values will be provided to the application as environment variables.

Set the environment variables from Secrets Manager and Parameter Store:

```bash showLineNumbers
export SPRING_DATASOURCE_URL=$(aws ssm get-parameter --name databaseJDBCConnectionString | jq --raw-output '.Parameter.Value')
export SPRING_DATASOURCE_PASSWORD=$(aws secretsmanager get-secret-value --secret-id unicornstore-db-secret | jq --raw-output '.SecretString' | jq -r .password)
```

Start the Java application locally (listening on port 8080):

```bash showLineNumbers
java -jar -Dserver.port=8080 store-spring.jar
```

Open another terminal window and test the application via curl:

```bash showLineNumbers
export SVC_URL=localhost:8080
curl --location --request POST $SVC_URL'/unicorns'   --header 'Content-Type: application/json'   --data-raw '{
    "name": "'"Something-$(date +%s)"'",
    "age": "20",
    "type": "Animal",
    "size": "Very big"
}' | jq
```

:::info
Keep this terminal window open. We will use it in subsequent steps.
:::

You should see the following output:

![test-success](./images/test-success.png)

Switch back to the Java application terminal window, and stop the application with `Ctrl+C`.

## 3. Containerizing the application

The local build can be a good starting point, but in the real world, another development machine might miss some of the required dependencies to run the application. To solve the "works okay on my machine" problem, we can use containers.

A **container** is a standardized unit of software development that holds everything that your software application requires to run. This includes relevant code, runtime, system tools, and system libraries.

Containers are created from a read-only template that's called an image. Images are typically built from a Dockerfile. A Dockerfile is a plaintext file that specifies all of the components that are included in the container. After they're built, these images are stored in a registry such as Amazon ECR where they can be uploaded and downloaded.

Copy a simple Dockerfile to the current application folder:

```bash showLineNumbers
cd ~/environment/unicorn-store-spring
cp dockerfiles/Dockerfile_00_initial Dockerfile
```

Inspect the Dockerfile. You will see that we just copy our previously created jar file into the container.
We are adding a dedicated user and group (1000) to use the least privilege identity ([read more about this in our Well-Architected Container Build Lens](https://docs.aws.amazon.com/wellarchitected/latest/container-build-lens/identity-and-access-management.html)).

```docker {5} showLineNumbers title="/unicorn-store-spring/Dockerfile"
FROM public.ecr.aws/docker/library/maven:3.9-amazoncorretto-17-al2023 as builder

RUN yum install -y shadow-utils

COPY store-spring.jar store-spring.jar

RUN groupadd --system spring -g 1000
RUN adduser spring -u 1000 -g 1000

USER 1000:1000

EXPOSE 8080
ENTRYPOINT ["java","-jar","-Dserver.port=8080","/store-spring.jar"]
```

Build a container image:

```bash showLineNumbers
docker buildx build --load -t unicorn-store-spring:latest .
```

List previously built container images:

```bash showLineNumbers
docker images
```

Run the container instance locally:

```bash showLineNumbers
docker run \
-e SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL \
-e SPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD \
-p 8080:8080 \
unicorn-store-spring:latest
```

Open the terminal window with the test command and run it again:

```bash showLineNumbers
export SVC_URL=localhost:8080
curl --location --request POST $SVC_URL'/unicorns'   --header 'Content-Type: application/json'   --data-raw '{
    "name": "'"Something-$(date +%s)"'",
    "age": "20",
    "type": "Animal",
    "size": "Very big"
}' | jq
```

Switch back to the Java application terminal window, and stop the application with `Ctrl+C`.

## 4. Building the application in the container

Instead of building the Java application on your local machine and then transferring the final binaries to the container, an alternative is to run the build process directly within the container. This approach eliminates the need for your development or build machines to handle the installation of necessary build tools. The image now incorporates all the dependencies needed for building your application.

Copy the new Dockerfile to the current folder

```bash showLineNumbers
cd ~/environment/unicorn-store-spring
cp dockerfiles/Dockerfile_01_original Dockerfile
```

Start the build for the container image. While it is building, you can move to the next step and inspect the Dockerfile.

```bash showLineNumbers
docker buildx build --load -t unicorn-store-spring:latest .
```

Inspect the Dockerfile. You can now see that we are running the Maven command inside the container:

```docker {8-9} showLineNumbers title="/unicorn-store-spring/Dockerfile"
FROM public.ecr.aws/docker/library/maven:3.9-amazoncorretto-17-al2023 as builder

RUN yum install -y shadow-utils

COPY ./pom.xml ./pom.xml
RUN mvn dependency:go-offline -f ./pom.xml

COPY src ./src/
RUN mvn clean package && mv target/store-spring-1.0.0-exec.jar store-spring.jar
RUN rm -rf ~/.m2/repository

RUN groupadd --system spring -g 1000
RUN adduser spring -u 1000 -g 1000

USER 1000:1000

EXPOSE 8080
ENTRYPOINT ["java","-jar","-Dserver.port=8080","/store-spring.jar"]
```

List the container images:

```bash showLineNumbers
docker images
```

Run a container instance:

```bash showLineNumbers
docker run \
-e SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL \
-e SPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD \
-p 8080:8080 \
unicorn-store-spring:latest
```

Open the terminal window with the test command and run it again:

```bash showLineNumbers
export SVC_URL=localhost:8080
curl --location --request POST $SVC_URL'/unicorns'   --header 'Content-Type: application/json'   --data-raw '{
    "name": "'"Something-$(date +%s)"'",
    "age": "20",
    "type": "Animal",
    "size": "Very big"
}' | jq
```

Switch back to the Java application terminal window, and stop the application with `Ctrl+C`.

## Conclusion

This lab explored the process of constructing and running Docker containers. This approach provides an efficient way to manage multi-service applications, which greatly benefits developers by streamlining the process.
