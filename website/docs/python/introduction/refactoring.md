---
title: Refactoring Python Apps Using Twelve-Factor App Principles
sidebar_position: 3
---

## Objective

This guide provides an overview of [The Twelve-Factor App](https://12factor.net/) principles and the steps we've taken to apply them to the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker/tree/main) project. It explains the process of building the app, highlighting the key principles that were used to refactor it for Containers and Kubernetes environments. It also talks about applying principles beyond what we've provided in the app. By following this guide, you’ll gain insight into the thought process and techniques employed to align your Python application with the twelve-factor methodology and enable seamless deployment and scaling in a Kubernetes environment.

## Twelve-Factor App Principles 

### 1. One codebase tracked in revision control, many deploys 
<!--@Smruti -->

It's important to use one codebase when working in multiple environments to maintain consistency and efficiency. This helps avoid different code paths and makes CI/CD pipelines more efficient. By following this principle, you'll be able to manage multiple deployments, such as staging or production environments, without added confusion or overhead. An effective strategy to manage these deployments is through the use of branches or tags in your version control system. Production, staging, and test environment releases can be segregated using either distinct branches or with [tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging#_git_tagging). This allows for specific branches or release tags to be deployed in each environment using GitOps principles, ensuring a streamlined and organized deployment process. For more information, see [GitOps](https://www.eksworkshop.com/docs/automation/gitops/). In the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project, we've organized the FastAPI application, Docker configurations, and Kubernetes YAML files to facilitate easy management and deployments. To illustrate this, consider the following:

#### In App

```
# main.py
app = FastAPI()
...
```

#### In Containers

```
# Dockerfile
FROM python:3.9-slim-buster as builder
...
```

#### In Kubernetes

```
# deploy-app-python.yaml
apiVersion: v1
kind: Service
metadata:
name: fastapi-service
namespace: my-cool-app
...
```

### 2. Explicitly declare and isolate dependencies 
<!--@Leah -->

When we explicitly mention the dependencies that our application relies on, it becomes easier to move the application to different environments and reduces the chances of errors occurring. In a complex system such as Kubernetes, not revealing the dependencies can cause significant problems and lead to unstable deployments. We’ll demonstrate the approach we have taken to clearly specify and separate the dependencies, which ultimately enhances the reproducibility and manageability of the entire system. To illustrate this, consider the following:

#### In App

* Dependencies are clearly declared to ensure the application can be consistently recreated. In Python, this is often done in our `requirements.txt` file. We’re also specifying the most compatible release versions for each library.

```
# requirements.txt
fastapi~=0.84.0
uvicorn~=0.23.2
sqlalchemy~=2.0.19
...
```

* In every Python script, all imports are explicitly declared at the top.

```
# connect.py
import os
import time
import psycopg2
import logging
from urllib.parse import urlparse
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
...
```

#### In Container

* Python dependencies are listed in a `requirements.txt` file and installed within our Dockerfile.

```
# Dockerfile
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt
```

#### In Kubernetes

* When deploying applications on Kubernetes environments, dependencies extend beyond the libraries and modules your code directly uses; they also include the services and resources that your application relies upon to function within the Kubernetes ecosystem. The app’s Service essentially becomes the interface through which other components, such as front-ends, APIs, or other microservices, interact with your main app. By explicitly declaring each Service in Kubernetes manifests, you improve reproducibility, portability, etc.

```
apiVersion: v1
kind: Service
metadata:
  name: fastapi-service
..
```

### 3. Store config in the environment
<!--@Joe -->
An application's configuration is everything that one would expect to vary between deployment environments such as production, staging, development, etc. These may include resources such as database connection strings, credentials for external services, and logging verbosity. Rather than hardcoding these values into the application code, we instead look to use language features to read these values from environment variables and dynamically use these in our code. Using environment variables as opposed to configuration files improves our security posture by eliminating the chance of accidentally committing sensitive information into our version control systems. This method also improves our application's portability as there is only a single codebase which can be deployed into multiple environments without the need for any changes to per-environment configuration files. To illustrate this, consider the following examples:

#### In App

* This line in `connect.py` uses Python's built-in [`os` module](https://docs.python.org/3/library/os.html) to read the value of the environment variable `DOCKER_DATABASE_URL`, allowing you to change the configuration without modifying the codebase.

```
# connect.py
import os
DATABASE_URL = os.getenv("DOCKER_DATABASE_URL")
```

#### In Containers

* Environment variables are isolated in a `.env` file and are loaded into containers. This adds an extra layer of security and makes it easier to manage an environment’s configurations. Ideally, you might consider coupling environment variables with development, staging, and production environments. The following environment variable files could be modified to suit different environments (e.g., `.env.prod`, `.env.dev`).

```
# docker-compose.yml
env_file:
- .env
```

#### In Kubernetes

* Secrets store sensitive environment settings, such as database secrets. This example shows how we load environment variables from a [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/).

```
# deploy-app-python.yaml
envFrom:
- secretRef:
  name: fastapi-secret
```

* ConfigMaps store nonsensitive environment settings. This example shows how we load the `init.sh` script from a Kubernetes ConfigMap. 

```
# deploy-db-python.yaml
volumes:
- configMap:
    items:
    - key: init.sh
      path: init.sh
    name: db-init-script
  name: db-init-script
```

### 4. Treat backing services as attached resources 
<!--@Leah -->

Treating backing services as attached resources improves the portability and maintainability of your application. This approach enables you to connect or disconnect services such as databases without making changes to the core application. We’ll show you how we’ve designed our FastAPI application and Kubernetes configurations in a manner that facilitates the seamless replacement of databases and other backing services, without causing any disruptions. To illustrate this, consider the following:

#### In App

* Abstract application's configuration details like database URL, secret keys, etc., are set as environment variables. We use Python's built-in [`os` module](https://docs.python.org/3/library/os.html) to access these environment variables in the container. This loads the environment variable `DOCKER_DATABASE_URL` which contains the connection string for the PostgreSQL database.

```
import os
DATABASE_URL = os.getenv("DOCKER_DATABASE_URL")
```

* The `DATABASE_URL` specifies the database's location, which the application needs to connect to. In a local environment, the database host may be `localhost`, but in a Docker environment, it's common to use the name of the database service (in this case, `db`). Take note of the database service name (in this case, `db`), which is/**must** be referenced as `db` to match our container `db` service and Kubernetes Service objects.

```
# .env
DOCKER_DATABASE_URL=postgresql://bookdbadmin:dbpassword@db:5432/bookstore
```

* Treating all external services, like databases, as resources that can be attached or detached at will is a must. Our `connect.py` connects to the PostgreSQL database, treating it as a backing service. This function is also designed to wait until the database is ready before proceeding. It does this in a loop until successful, pausing and retrying if not successful.

```
# connect.py
...
while retries < max_retries:
    # ... connection code ...
    retries += 1
...
wait_for_db(DATABASE_URL)
```

* This line in the `wait_for_db` function attempts to connect to a PostgreSQL database, treating it as an attached backing service.

```
# connect.py
conn = psycopg2.connect(
    dbname=dbname, user=user, password=password, host=host, port=port
)
```

* The `wait_for_db` function is invoked with `DATABASE_URL` as its argument, which is sourced from the `DOCKER_DATABASE_URL` environment variable holding the PostgreSQL connection string. Now, as for parsing `db_url`, this is done using the `urlparse` function from Python's built-in `urllib.parse` module. `urlparse` breaks down the URL into its components, like the scheme (http, https, etc.), netloc (the hostname and port), path (the specific resource in the server), query (any query parameters), etc. These are then used in [psycopg2](https://www.psycopg.org/docs/module.html)'s `connect` function to establish a connection to the database.

```
result = urlparse(db_url)
```

#### In Containers

* Services are clearly separated into their individual containers, `db` for the database and `web` for the FastAPI application. This separation of concerns makes it easy to manage, scale, and maintain each service.

```
# docker-compose.yml
services:
  db:
    image: postgres:13
...
  web:
    build: .
```

#### In Kubernetes

* Backing services like databases are defined as separate entities so that they can be easily replaced or detached. Here, the database service is treated as an attached resource. Notice that we’re using a service name of `db`, to match our container’s service name of `db`.

```
apiVersion: v1
kind: Service
metadata:
  name: db
  namespace: my-cool-app
...
```

### 5. Strictly separate build and run stages 
<!--@Smruti -->

Keeping build and run stages separate makes development and deployment cycles more focused and less prone to errors. For example, Docker's multi-stage builds can minimize the size of your final container image and reduce the potential for attacks. We'll show you how we've organized our Docker and Kubernetes setups to clearly define build and run stages, optimizing CI/CD pipelines. To illustrate this, consider the following:

#### In Container

* Precompiling dependencies into [wheel](https://packaging.python.org/en/latest/glossary/#term-Wheel) files allows us to package our application into a deployable artifact. This contributes to separating the build stage, where dependencies are compiled, from the run stage, where they are merely installed and run.

```
# Dockerfile
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt
```

* The `web` service is designed to use a custom-built image, which is generated through a multi-stage build process specified in the `Dockerfile`. Later on, we also upload this optimized image to Amazon ECR and tag it with a version, which adds another layer of optimization and version control. This allows you to efficiently manage the container lifecycle and ensure that you are running the correct version of the image in production or staging environments. As a best practice, images are only tagged with the build version and never the `latest` tag as this necessitates the use of specific image versions rather than a tag which can update unexpectedly leading to potentially undesired results.

```
# docker-compose.yml
web:
  build: .
  image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
...
```

* Multi-stage builds are used in the `Dockerfile` as well. Here, the first stage (`builder`) is used to prepare the dependencies and generate Python wheels. The second stage (`runner`) copies these pre-built wheels and installs them. This approach minimizes the final image size as only the necessary components are included in the final image, thereby optimizing storage, startup time for the container, and ultimately storage costs.

```
FROM python:3.9-slim-buster as builder
...
FROM python:3.9-slim-buster as runner
```
Ideally, you would manage the build and deployment as separate stages using CI/CD tools like GitOps or [Amazon CodeCatalyst](https://codecatalyst.aws/).
<!-- In this link(link to codecatalyst) we show how you can use codecatalyst to manage the build and deployment stages.-->

#### In Kubernetes

* Within your Kubernetes setup, the Deployment YAML file essentially serves as your run stage configuration. This file is distinct from your build process and describes how the already-built container image should be run, which secrets it should use, and how it should scale. It references the image built in the build stage and lays out how it should be run, including which secrets to use.  The image is also immutable; any change should result in a new version of the image, promoting the practice of immutable infrastructure.

```
apiVersion: apps/v1
kind: Deployment
...
   containers:
    - name: web
      image: 012345678901.dkr.ecr.us-west-1.amazonaws.com/fastapi-microservices:1.1
```

### 6. Execute the app as one or more stateless processes
<!--@Leah -->
When you develop your application as stateless, it becomes more scalable and manageable. Kubernetes is designed to support this type of architecture, which means it's easier to scale your application horizontally. We'll demonstrate how we've designed our application and Kubernetes workloads to be stateless, which simplifies the process of scaling and managing applications. To illustrate this, consider the following:

#### In App

* The FastAPI application is stateless, with any stateful data stored in a stateful backing service like a database. It accesses database information through scoped sessions, not through a shared state.

```
# main.py
def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db.close()
```

* The `connect.py` script uses SQLAlchemy, which inherently supports connection pooling. This makes it easier to scale your application horizontally since each instance can efficiently manage its own pool of database connections.

```
engine = create_engine(DATABASE_URL)
db_session = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)
```

* Ideally, a production application would have separate frontend and backend processes. The current architecture of the app combines the frontend and backend into a single FastAPI application. In our application, the code in `app/main.py` serves both the frontend and API endpoints. Ideally, we would decouple the frontend and backend into separate services, so it follows a true microservices architecture. Here are some examples of extracting the FastAPI views that serve HTML templates into a dedicated front-end service (e.g., FastAPI), keeping the FastAPI routes that serve as the API separate, where all the business logic will reside.

```
# main.py
# Remove HTML templates
@app.post("/api/books/")
def create_book_api(title: str, author: str, description: str, db: Session = Depends(get_db)):
    book = Book(title=title, author=author, description=description)
    db.add(book)
    db.commit()
    db.refresh(book)
    return {"id": book.id, "title": book.title}
```
```
# frontend_routes.py
# Makes an API call to main.py to manage books and render using an HTML template
@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    response = requests.get("http://backend-service-address/api/books/")  # Placeholder for demo purposes
    books = response.json().get("books", [])
    return templates.TemplateResponse("index.html", {"request": request, "books": books})
```

#### In Container

* A dedicated network (`webnet`) is set up for container communication between services. This is essential for service discovery and easier communication between containers.

```
# docker-compose.yml
networks:
   webnet:
```

* Volumes are used to persist PostgreSQL data. This data persists even after the container is stopped or deleted. When you spin up the container again, PostgreSQL checks the data directory (`/var/lib/postgresql/data`). If we've already initialized the database and the data volume (`postgres_data`) is still intact, running `docker-compose up` won't re-run the initialization scripts, and our previously initialized database will be used.

```
# docker-compose.yml
volumes:
- postgres_data:/var/lib/postgresql/data
```

* The command to start the FastAPI application is specified under the `web` service, making it clear and explicit how the application should start.

```
# docker-compose.yml
command: uvicorn server.app.main:app --host 0.0.0.0 --port 8000
```

* Ideally, a production application would also have a separate frontend and backend Dockerfile. This would involve specifying the working directory and the destination path for copying code into the containers, both for the frontend and backend components.
```
# Docker.frontend
FROM python:3.9-slim-buster as frontend-builder

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /frontend
```
```
# docker-compose.yml
...
  backend:
    build: 
      context: .
      dockerfile: Dockerfile.backend
    image: fastapi-backend-microservices:${IMAGE_VERSION}
    command: uvicorn server.app.main:app --host 0.0.0.0 --port 8000
    # no change
  
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile.frontend
    image: fastapi-frontend-microservices:${IMAGE_VERSION}
    command: uvicorn frontend.app.main:app --host 0.0.0.0 --port 8000
    volumes:
      - ./frontend:/frontend
...
```

#### In Kubernetes

* In the Kubernetes ecosystem, the principle of executing our application as a stateless process is well-aligned with the use of Deployments. Deployments manage stateless, scalable application instances, orchestrating seamless updates and rollbacks. We utilize Kubernetes Deployments to manage our stateless FastAPI application, which ensure that a specified number of identical Pods (apps) are running, enabling horizontal scaling and self-healing. We also use a StatefulSet for the database, ensuring persistent storage and ordered, graceful deployment and scaling.

```
# deploy-app-python.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
  namespace: my-cool-app
...
# deploy-db-python.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: fastapi-postgres
  namespace: my-cool-app
...
```
* Ideally, a production application would have a separate frontend and backend Dockerfile. This would involve updating ingress configurations to route all requests with paths starting with `/api/` to the backend service (`fastapi-service`) and all other requests to the frontend service (`fastapi-frontend-service`).
```
# deploy-app-python.yaml
# Updated ingress configuration example
...
spec:
  rules:
  - http:
      paths:
      - path: /api/
        pathType: Prefix
        backend:
          service:
            name: fastapi-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fastapi-frontend-service
            port:
              number: 80
...
```

* Ideally, you would deploy a caching system, like [Redis](https://gallery.ecr.aws/ubuntu/redis), with a `Deployment` backed by a `PersistentVolume` for the cache data. This approach is essential for maintaining high availability and fast data access. For example:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-cache-deployment
  namespace: my-cool-app
spec:
  ...
  template:
    ...
    volumes:
      - name: cache-volume
        persistentVolumeClaim:
          claimName: redis-cache-pvc
```

* Furthermore, you would ideally scale the cache deployment in response to varying traffic loads to sustain performance. Pair this with a stateless application frontend, also managed via a Deployment, programmed to consult the cache prior to making database calls. The app should, upon a cache miss, query the database and update the cache accordingly. For example:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
  namespace: my-cool-app
spec:
  ...
  template:
    ...
    containers:
      - name: web
        ...
        env:
          - name: CACHE_ENDPOINT
            value: redis-cache-service.my-cool-app.svc.cluster.local
```

* To connect to the cache and the database, you would ideally establish Kubernetes Services that expose the Pods, allowing the stateless application to communicate with these components using DNS names. For example:

```
apiVersion: v1
kind: Service
metadata:
  name: redis-cache-service
  namespace: my-cool-app
spec:
  ...
```

* Configuration details, like cache expiration and service endpoints, should ideally be abstracted into ConfigMaps and mounted as volumes inside the stateless application Pods to maintain a clear separation between code and configuration:

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: fastapi-config
  namespace: my-cool-app
data:
  CACHE_EXPIRATION: "3600"
  ...
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
  namespace: my-cool-app
spec:
  ...
  template:
    ...
    volumes:
      - name: config-volume
        configMap:
          name: fastapi-config
```

### 7. Export services via port binding
<!--@Joe -->

Port binding is an important facet to 12 Factor Apps and ensure that an application is completely self-contained. In this model, the application itself binds to a port and listens to incoming requests on that port. This is in contrast to applications which might run as a module inside a web server like HTTPD or Tomcat. That is to say, there is no reliance on the injection of a web server into the execution environment at runtime to have a web service. To illustrate this, consider the following:

#### In Containers

* Our FastAPI app is configured to bind to a port, as evident in our Dockerfile and `docker-compose.yml`.

```
# Dockerfile
EXPOSE 8000
CMD uvicorn server.app.main:app --host 0.0.0.0 --port 8000

# docker-compose.yml
ports:
  - 8000:8000
command: uvicorn server.app.main:app --host 0.0.0.0 --port 8000
```

#### In Kubernetes

* Kubernetes Service and Ingress objects allow you to expose services. This is the Python application service being exposed on port 8000 to align with the port being used in the `Dockerfile` entrypoint.

```
# deploy-app-python.yaml
ports:
   - containerPort: 8000
```

### 8. Scale out via the process model
<!--@Smruti -->

Scalability is crucial in designing and architecting applications, especially in cloud-native environments like Kubernetes. We’ll show you how we've prepared our FastAPI application for horizontal scaling using Kubernetes features which enable our services to automatically adjust to higher loads without the need for manual intervention, ensuring both high availability and efficient resource utilization. To illustrate this, consider the following:

#### In Containers

* Our FastAPI application, running on an ASGI server like [Uvicorn](https://www.uvicorn.org/), is capable of handling multiple simultaneous connections. This is crucial for scaling out because each instance of our application can serve multiple requests concurrently, and you can increase capacity by running more instances. Here, the `command` field to run the application is configured as part of the container in docker-compose.yml.

```
# docker-compose.yml
command: uvicorn server.app.main:app --host 0.0.0.0 --port 8000
```

#### In Kubernetes

* ReplicaSets allow us to scale our application. Here, the `replicas` field tells Kubernetes how many instances of your application should run at any given time. Ideally, you’d couple this with the [Cluster Autoscaler (CA)](https://aws.github.io/aws-eks-best-practices/cluster-autoscaling/) for high-traffic applications, or [Karpenter](https://karpenter.sh/) for compute-intensive applications (such as batch or machine learning applications).

<!-- HPA or Karpenter. We can remove CA as it is related to node only. -->

```
# deploy-app-python.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
  namespace: my-cool-app
spec:
  replicas: 1
...
```

### 9. Maximize robustness with fast startup and graceful shutdown
<!--@Dola -->
Application robustness ensures uninterrupted service and efficient resource utilization. Achieving a resilient application involves paying attention to startup and shutdown procedures. Robustness goes beyond merely handling failures; it entails optimizing resource usage and enabling seamless operations. We’ll show you the mechanisms we've implemented to ensure our FastAPI application starts swiftly and shuts down gracefully, ultimately minimizing downtime and improving the user experience. To illustrate this, consider the following:

#### In App

* The loop in `wait_for_db` tries to connect to the database a limited number of times (`max_retries`), contributing to fast startup and graceful shutdown behavior.

```
while retries < max_retries:
    # ... connection code ...
    retries += 1
```

#### In Container

* Implement startup and shutdown scripts that handle initialization and termination gracefully. Here, our use of Docker ensures that our app can be easily started or stopped.

```
# Docker command
docker-compose build
docker-compose up
docker-compose down
```

#### In Kubernetes

* Resource requests and limits can contribute to application robustness. Ideally, you would also use [liveness, readiness, and startup](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) probes for Kubernetes to know when an application is ready to accept traffic and when it should be shut down. 

```
resources:
   requests:
      cpu: "200m"
      memory: "200Mi"
...
```

### 10. Keep development, staging, and production as similar as possible
<!--@Leah -->
One of the main challenges in software development is ensuring that what works in one environment will also work in other environments. You’ll learn the mechanisms we’ve implemented to maintain consistency across development, staging, and production environments using things like ConfigMaps, Secrets, and environment variables to ensure smooth transitions between different stages of an application's lifecycle. To illustrate this, consider the following:

#### In App

* Environment variables are used to keep parity between our different environments. This file contains variables related to the application, database credentials, AWS credentials, and Docker configurations.

```
# .env
# APP INFO
APP_PORT=8000
APP_HOST=0.0.0.0
# DB CREDENTIALS
WORKSHOP_POSTGRES_USER=bookdbadmin
WORKSHOP_POSTGRES_PASSWORD=dbpassword
...
```

* The way you specify directories across environments is particularly important for containers as it does not rely on a fixed path. In our case, we’re loading HTML templates from a specified directory. The expression `os.path.dirname(os.path.abspath(__file__))` calculates the absolute path to the directory of the currently running Python script (`__file__`). The `os.path.join` function then appends "templates" to this path, which results in an absolute path to the "templates" directory, in the same directory as the current script. This guarantees the accuracy of the path to the templates directory, regardless of the environment.

```
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates"))
```

#### In Containers

* Environment variables like `DATABASE_URL` are set dynamically, ensuring that you can use the same Docker image for different environments. By setting these variables appropriately for each environment using an `.env` file you maintain consistency in how your application runs.

```
env_file:
  - .env
```

#### In Kubernetes

* Namespaces are used to isolate environments within the same cluster. Ideally, you might consider coupling Namespaces along with ConfigMaps or Secrets to further segregate development, staging, and production environments, while still using the same Docker images across them. This helps to validate that if the app works in one environment, it will work in others, fulfilling the principle of keeping environments as similar as possible. The following namespace could be modified to suit different environments (e.g., `my-cool-app-dev`, `my-cool-app-prod`).

```
metadata:
namespace: my-cool-app
...
```

* Kubernetes secrets are used to store sensitive information from the `.env` file.

```
envFrom:
- secretRef:
  name: fastapi-secret
```

### 11. Treat logs as event streams
<!--@Leah -->
In modern applications, logs are more than just a debugging tool; they're a crucial component for observability and monitoring. You'll learn the essentials of twelve-factor logging which allows you to monitor your application more effectively, and troubleshoot issues more efficiently, thereby improving your system's overall reliability. To illustrate this, consider the following:

#### In App

* Logging is set up in our `connect.py` to provide information and error messages using Python's built-in `logging` library. These lines set up logging to `stdout`, allowing you to treat logs as event streams and forward them to a logging service if needed.

```
# connect.py
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# ... 
logger.info("Connection successful!")
# ...
logger.warning("Postgres is not ready yet. Waiting...")
# ...
logger.error("Max retries reached. Unable to connect to the database.")
```

#### In Kubernetes

* When you're running an application in a Kubernetes pod, logs written to `stdout` and `stderr` (Standard Error) are automatically picked up by the Kubernetes logging agent and can be accessed via the `kubectl logs` command. Our Deployment would write logs to stdout, which can then be captured by a Kubernetes logging solution.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
  namespace: my-cool-app
...
```

### 12. Run admin/management tasks as one-off processes
<!--@Leah -->
Navigating administrative tasks presents a delicate balance: they must be executed in isolation to avoid interfering with live services, yet also need to function in a setting identical to your application for maximum compatibility. Although, we don’t apply this principle extensively in our application, there are a few ways you can apply this principle. To illustrate this, consider the following:

#### In App

* Administrative operations like database setup and table initialization are encapsulated within a designated shell script named `init.sh`. This ensures that such tasks are carried out in an environment that closely mirrors the application’s settings, providing the required isolation and compatibility. 

```
# init.sh
...
create_database
grant_permissions
create_table
```

#### In Containers

* In a Docker environment, initialization scripts like `init.sh` are executed only when the database container is first created. These scripts are stored in the `/docker-entrypoint-initdb.d/` directory inside the PostgreSQL image and are executed in alphabetical order.

```
# docker-compose.yml
volumes:
   - ./server/db/init.sh:/docker-entrypoint-initdb.d/init.sh
```

