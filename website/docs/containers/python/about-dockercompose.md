---
title: Introduction to Managing Multiple Services with Docker Compose
sidebar_position: 2
---
## Objective
This guide details how Docker Compose is leveraged in the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project for the orchestration of multiple containers. By the end of this guide, you'll understand how Docker Compose can facilitate the management and orchestration of multi-container environments.

## Configuration Overview

Our `docker-compose.yml` file in the `fastapi-microservices` project outlines two services: our FastAPI application (the 'web' service) and the PostgreSQL database (the 'db' service). Both services are part of the **webnet** network. Docker networks facilitate interaction between containers, which is crucial for our web service to communicate with the database. Additionally, the **web** service relies on the **db** service due to Docker Compose's **depends_on** directive. As a result, Docker Compose guarantees that the **db** service starts before the **web** service.

### web Service (FastAPI Application)

The **web** service builds a Docker image using the Dockerfile in our project directory and starts the FastAPI application. The current directory, containing the application code, is mounted into the '/server' directory inside the container. This setup ensures that any changes made to the application code on the host are immediately reflected in the container. Similar to the db service, this service is part of the 'webnet' network, allowing it to communicate with the db service. 

```
web:
  build: .
  command: uvicorn server.app.main:app --host 0.0.0.0 --port 8000
  volumes:
    - .:/server
  ports:
    - 8000:8000
  depends_on:
    - db
  networks:
    - webnet
  environment: 
    - DATABASE_URL=${DOCKER_DATABASE_URL}
```

### db Service (PostgreSQL Database)

The **db** service uses the official PostgreSQL image from Docker Hub. It's configured using environment variables for the database user, password, and database name. The volume `postgres_data` is used to store the database data persistently, ensuring data remains intact even if the container is stopped or deleted. The `init.sh` script is run in the PostgreSQL container at startup to initialize the database. It's part of the 'webnet' network, which facilitates communication between this service and the web service.

```
db:
  image: postgres:13
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB}
  volumes:
    - ./db/init.sh:/docker-entrypoint-initdb.d/init.sh
    - postgres_data:/var/lib/postgresql/data  # Persist PostgreSQL data
  networks:
    - webnet
```

## Conclusion

This guide has illustrated the role of Docker Compose in setting up a multi-container environment for the `fastapi-microservices` project. By leveraging Docker Compose, we can significantly simplify the management of our application's components and their interconnections.