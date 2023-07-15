---
title: Introduction to Managing Multiple Services with Kubernetes
sidebar_position: 2
---
## Overview
The lab exercises that follow serve as an introduction to Kubernetes, covering the components and deployment of our microservices-based application on a local Kubernetes cluster using [minikube](https://minikube.sigs.k8s.io/docs/). 

## Objective
This guide shows how Kubernetes is utilized for our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project, specifically the roles of Deployments, StatefulSets, Services, PersistentVolumeClaims, and Secrets in the orchestration and management of our multi-service application. 

## Configuration Overview
Our Kubernetes configurations for the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project outline two main components in our Kubernetes cluster: our FastAPI application and the PostgreSQL database.

## FastAPI Application (Deployment and Service)
The **[fastapi-app.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/kubernetes/fastapi-app.yaml)** manifest file sets up a minikube cluster with the following Kubernetes resources:

- **Deployment**: Our FastAPI application is defined as a [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) in Kubernetes. The Deployment, as detailed in our 'fastapi-app.yaml' manifest file, ensures that a specified number of pods (in our case, one) is always running at all times within the minikube cluster. It utilizes the Docker image hosted in our Amazon ECR repository and starts the FastAPI application. The Deployment also sets environment variables similar to those in our docker-compose.yml file and uses a Kubernetes Secret for ECR authentication. Resource limits and requests for the pods are also defined in the Deployment.
- **Service**: The associated [Service](https://kubernetes.io/docs/concepts/services-networking/service/) exposes the FastAPI application to be accessible outside the cluster. We use a "LoadBalancer" service type which minikube then routes to a specific "NodePort" for external access (i.e., outside the cluster). The Service is a primary Kubernetes resource that manages incoming traffic to our application.
- **Secret**: Sensitive data, such as ECR login credentials, are securely handled via a Kubernetes [Secret](https://kubernetes.io/docs/concepts/configuration/secret/).

## PostgreSQL Database (StatefulSet, Service, and PersistentVolumeClaim)
The **[postgres-db.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/kubernetes/postgres-db.yaml)** manifest file sets up a minikube cluster with the following Kubernetes resources:

- **StatefulSet**: Our PostgreSQL database is defined as a [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) with a corresponding [Service](https://kubernetes.io/docs/concepts/services-networking/service/) to allow interaction with the FastAPI application within the minikube cluster. The StatefulSet, as detailed in our 'postgres-db.yaml' manifest file, manages the deployment and scaling of a set of Pods and maintains the state of deployed pods, allowing PostgreSQL to persist across pod restarts. It uses the official PostgreSQL image from Docker Hub and is configured using environment variables.
- **PersistentVolumeClaim**: The database data is stored persistently using a [PersistentVolumeClaim](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) tied to the StatefulSet, ensuring data remains intact even if the pod is stopped or deleted. This approach enhances the resilience of our data storage and facilitates better data management. The PersistentVolumeClaim is another primary Kubernetes resource used to provide persistent storage for PostgreSQL, ensuring data persistence across pod restarts and survival during pod deletion. It requests a storage capacity of 1Gi and requires the volume to allow read-write access by a single node.
- **Service**: The corresponding Service provides network access to your PostgreSQL database within the cluster, allowing other components, such as our FastAPI application, to communicate with the database.

## Conclusion
This guide has illustrated the role of Kubernetes in setting up a multi-pod environment for the 'python-fastapi-demo-docker' project. By leveraging Kubernetes and its Deployment and StatefulSet resources, we can significantly simplify the management of our application's components and their interconnections, efficiently scale our application to handle increased loads, and ensure the resilience and persistence of our database.