---
title: About FastAPI and PostgreSQL Kubernetes resources
sidebar_position: 2
---
## Overview
This chapter shows you how to deploy the Kubernetes resources for our FastAPI application and PostgreSQL database within an Amazon EKS cluster. 

## Objective
This guide provides an overview of the resources to deploy the FastAPI application and PostgreSQL database within our Amazon EKS cluster. 

## FastAPI - Deployment, Service, and Ingress
The **[deploy-app-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-app-python.yaml)** manifest file is used for the deployment of the FastAPI application and consists of three primary resources:

- **Service:** The service in the manifest exposes the FastAPI application running on the EKS cluster to the external world. It routes incoming traffic on port 80 to the FastAPI application's listening port (8000). The service uses a NodePort type which automatically allocates a port from the NodePort range (default: 30000-32767) and proxies traffic on each node from that port into the Service. This allows for the Service to be externally accessible to Application and Network Load Balancers.
- **Deployment:** The deployment in the manifest dictates how the FastAPI application should be deployed onto the EKS cluster. It specifies the number of replicas (i.e. the number of application instances that should be running), the container image to be used, and the necessary environment variables from a secret. It sets resource requests and limits for the containers to ensure the application gets the necessary resources.
- **Ingress:** The Ingress in the manifest provides HTTP route management for services within the EKS cluster. It routes incoming traffic to the FastAPI service based on the request path. In this scenario, all requests are directed to the FastAPI service. When using Managed node groups, you'll need to use the AWS Load Balancer Controller, which configures an Application Load Balancer (ALB) that is internet-facing and employs an IP-based target type. On the other hand, when using EKS Auto Mode, you'll use the EKS Auto Mode instead, eliminating the need for separate installation and management of the AWS Load Balancer Controller.


## PostgreSQL - StatefulSet, Service, and VolumeClaimTemplates
The **[deploy-db-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-db-python.yaml)** file is used for the deployment of the PostgreSQL database and consists of four primary resources:

- **Service:** The Service in the manifest exposes the PostgreSQL database within the EKS cluster, facilitating the FastAPI application to access it. The Service listens on port 5432, which is the default PostgreSQL port. The Service is headless (as indicated by `clusterIP: None`), meaning it enables direct access to the Pods in the StatefulSet rather than load balancing across them.
- **StatefulSet:** The StatefulSet in the manifest manages the PostgreSQL database deployment. A StatefulSet is used instead of a Deployment as it ensures each Pod receives a stable network identity and stable storage, which is essential for databases. The PostgreSQL container uses a Secret to obtain its environment variables and mounts a volume for persistent storage.
- **VolumeClaimTemplates**: The volumeClaimTemplates within the StatefulSet definition request a specific storage amount for the PostgreSQL database. It requests a storage capacity of 1Gi with [ReadWriteOnce](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) access mode, and it uses the AWS EBS StorageClass defined in this manifest. This ensures that each Pod within the StatefulSet gets its own PersistentVolume, guaranteeing the database data remains persistent across pod restarts, and the data is accessible from any node in the EKS cluster.
