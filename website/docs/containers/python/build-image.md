---
title: Building and Running the Docker Containers
sidebar_position: 2
---

## Objective
This lab walks you through the process of building container images for our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project and running them as distinct services using Docker Compose. By the end, you'll know how to manage your multi-service applications more effectively, ensuring smoother development, deployment, and updates.
## Prerequisites
- [Setting up the Development Environment](../../intro/python/environment-setup.md)

## Initial Setup
Navigate to the root directory of the 'python-fastapi-demo-docker' project where your [environment variables are sourced](../../intro/python/environment-setup):
```bash
cd python-fastapi-demo-docker
```
## 1. Building Docker Images for Each Service
Build Docker images for the application and database services by running:

```bash
docker-compose build
```

This builds Docker images based on the configurations in the docker-compose.yml file. Docker follows the Dockerfile instructions during each service's build process, creating separate images for the 'python-fastapi-demo-docker-web' and 'python-fastapi-demo-docker-db' services.

## 2. Running the Services as Docker Containers
After building the images, start the application and database services in separate Docker containers using:
```bash
docker-compose up
```

This command initiates containers for each service as specified in the docker-compose.yml file. Upon navigating to [http://localhost:8000](http://localhost:8000/) in your browser, you should see the FastAPI application running.

![Image](./images/app-home.png)

## 3. Verify the Setup by Adding a Book
To confirm that everything is functioning as expected, attempt to add a book by selecting the **Create a book** option.

![Image](./images/app-create-book.png)

## 4. Interpreting Containers
Your application ('python-fastapi-demo-docker-web' service) and your database ('python-fastapi-demo-docker-db' service) will operate in separate containers. The "Containers" tab in the [Docker VS Code Extension](https://code.visualstudio.com/docs/containers/overview) shows the containers for our python-fastapi-demo-docker application, as instances of the services in our Docker Compose configuration.

![Image](./images/docker-extension-open-in-browser.png)

## 5. Stopping the Services and Their Containers
Stop and remove the containers of both services by pressing `CTRL + C` or running the following command:
```bash
docker-compose down
```

This command halts the containers and, by default, also removes the containers, networks, and volumes as described in your docker-compose.yml file. You should receive the following response output:

```
Removing python-fastapi-demo-docker_web_1 ... done
Removing python-fastapi-demo-docker_db_1  ... done
Removing network python-fastapi-demo-docker_webnet
```

## 6. Rebuilding and Restarting Docker Services

To rebuild the images and restart the services simultaneously, execute the following command:

```bash
docker-compose up --build
```

This halts your services, rebuilds the Docker images, and reboots the services with the new images, ensuring your services are always operating with the latest application version.

## Conclusion

This lab explored the process of constructing and executing Docker containers using Docker Compose in the 'python-fastapi-demo-docker' project. This approach provides an efficient way to manage multi-service applications, which greatly benefits developers by streamlining the process.
