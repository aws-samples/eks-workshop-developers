---
title: Deploying FastAPI and PostgreSQL Microservices to EKS Fargate
sidebar_position: 6
---
## Objective
This guide shows you how to deploy the microservices of the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project on Amazon EKS Fargate. To gain a deeper understanding of the Kubernetes resources in these manifests, refer to [Deploying FastAPI and PostgreSQL Kubernetes resources to Amazon EKS](about-deploy.md).

## 1. Deploying the FastAPI Deployment, Service, and Ingress
The **[eks-deploy-app.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/eks-deploy-app.yaml)** manifest file is used for the deployment of the FastAPI application and consists of three primary resources: a Service, Deployment, and Ingress. 

From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:
```
cd python-fastapi-demo-docker
kubectl apply -f eks/deploy-app-python.yaml
```

## 2. Deploying the PostgreSQL StatefulSet, Service, and PersistentVolumeClaim
The **[deploy-db-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/eks-deploy-db.yaml)** file is used for the deployment of the PostgreSQL database and consists of four primary resources: a StorageClass, Service, StatefulSet, and PersistentVolumeClaim. 

From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:
```
kubectl apply -f eks/eks-deploy-db.yaml
```



