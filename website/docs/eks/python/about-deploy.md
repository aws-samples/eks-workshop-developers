---
title: Deploying FastAPI and PostgreSQL Kubernetes resources to Amazon EKS
sidebar_position: 3
---
## Overview
This chapter shows you how to deploy the Kubernetes resources for our FastAPI application and PostgreSQL database within an Amazon EKS cluster. 

## Objective
This guide provides an overview of the resources we'll deploy to deploy the FastAPI application and PostgreSQL database within our Amazon EKS cluster. 

## FastAPI - Deployment, Service, and Ingress
The **[deploy-app-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-app-python.yaml)** manifest file is used for the deployment of the FastAPI application and consists of three primary resources:

- **Service:** The service in the manifest exposes the FastAPI application running on the EKS cluster to the external world. It routes incoming traffic on port 80 to the FastAPI application's listening port (8000). The service uses a LoadBalancer type, which automatically distributes incoming application traffic across multiple targets, such as containers, and IP addresses in multiple Availability Zones, enhancing the availability and fault tolerance of your applications.
- **Deployment:** The deployment in the manifest dictates how the FastAPI application should be deployed onto the EKS cluster. It specifies the number of replicas (i.e., the number of application instances that should be running), the container image to be used, and the necessary environment variables from a secret. It sets resource requests and limits for the containers to ensure the application gets the necessary resources. Importantly, the deployment uses the 'ecr-access-service-account', enabling it to pull images from the Amazon ECR repository.
- **Ingress:** The Ingress in the manifest provides HTTP route management for services within the EKS cluster. It routes incoming traffic to the FastAPI service based on the request path. In this scenario, all requests are directed to the FastAPI service. The Ingress configuration in this file is specifically set up for AWS using the AWS Load Balancer Controller, configuring an Application Load Balancer (ALB) that is internet-facing and employs an IP-based target type.

## PostgreSQL - StatefulSet, Service, StorageClass, and VolumeClaimTemplates
The **[deploy-db-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-db-python.yaml)** file is used for the deployment of the PostgreSQL database and consists of four primary resources:

- **StorageClass**: The StorageClass in the manifest is specific to AWS EBS (Elastic Block Store) and allows dynamic provisioning of storage for PersistentVolumeClaims. The EBS provisioner enables PersistentVolumes to have a stable and resilient storage solution for our PostgreSQL database.
- **Service:** The Service in the manifest exposes the PostgreSQL database within the EKS cluster, facilitating the FastAPI application to access it. The service listens on port 5432, which is the default PostgreSQL port. The service is headless (as indicated by clusterIP: None), meaning it enables direct access to the Pods in the StatefulSet rather than load balancing across them.
- **StatefulSet:** The StatefulSet in the manifest manages the PostgreSQL database deployment. A StatefulSet is used instead of a Deployment as it ensures each Pod receives a stable network identity and stable storage, which is essential for databases. The PostgreSQL container uses a Secret to obtain its environment variables and mounts a volume for persistent storage.
- **VolumeClaimTemplates**: The volumeClaimTemplates within the StatefulSet definition request a specific storage amount for the PostgreSQL database. It requests a storage capacity of 1Gi with ReadWriteOnce access mode, and it uses the AWS EBS StorageClass defined in this manifest. This ensures that each Pod within the StatefulSet gets its own PersistentVolume, guaranteeing the database data remains persistent across pod restarts, and the data is accessible from any node in the EKS cluster.
