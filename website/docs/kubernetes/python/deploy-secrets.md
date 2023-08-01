---
title: Securing FastAPI Microservices with Kubernetes Secrets
sidebar_position: 4
---

## Overview
In the evolving world of microservices and cloud-native applications, managing sensitive data securely is paramount. Kubernetes offers a "Secret" resource, designed for storing sensitive data like passwords, OAuth tokens, and ssh keys, separating them from the container image to enhance security and modularity. 

## Objective
The goal of this tutorial is to show you how to create Kubernetes secrets for the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project. By the end, you'll have a firm understanding of managing sensitive data and running your microservices securely. To gain a deeper understanding of the different Kubernetes resources we're creating, refer to [Introduction to Managing Multiple Services with Kubernetes](about-multiservice.md).

## 1. Creating the Kubernetes Secret for Amazon ECR
Our Amazon ECR repository is private, so we need to generate an Amazon ECR authorization token and create a Kubernetes Secret with it. This Secret allows your Kubernetes cluster to authenticate with Amazon ECR and pull the Docker image.

Change directories to the 'python-fastapi-demo-docker' project directory:
```bash
cd python-fastapi-demo-docker
```

Generate an Amazon ECR authorization token:
```
ECR_TOKEN=$(aws ecr get-login-password --region ${AWS_REGION})
```

Run the following command to create the Kubernetes Secret in the "my-cool-app" namespace:
```
kubectl create secret docker-registry regcred \
--docker-server=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com \
--docker-username=AWS \
--docker-password="${ECR_TOKEN}" \
-n my-cool-app
```
The expected output should look like this:
```bash
secret/regcred created
```

## 2. Creating a Generic Kubernetes Secret from a .env File
After generating the Docker registry secret, the next step is to create a Kubernetes Secret from the .env file. This file contains sensitive information typically stored as environment variables for your application. Using a Kubernetes Secret allows for safer management and access to this sensitive data within your Kubernetes cluster.

Run the following command to create the Kubernetes Secret in the "my-cool-app" namespace:
```
kubectl create secret generic fastapi-secret --from-env-file=.env -n my-cool-app
```
The expected output should look like this:
```bash
secret/fastapi-secret created
```

## 3. Verifying the Secret Creation with kubectl get secret
To confirm that your Kubernetes Secret has been successfully created, you can use the kubectl get secret command. This command lists all secrets that exist in the current namespace:
```bash
kubectl get secrets -n my-cool-app
```
The expected output should look like this:
```bash
NAME             TYPE                             DATA   AGE
fastapi-secret   Opaque                           20     9m
regcred          kubernetes.io/dockerconfigjson   1      13m
```

## 4. Inspecting the Secret Details with kubectl describe secret
If you want more details about your created Secret, you can use the kubectl describe secret command. This command provides more detailed information about the specified secret. Here's how to use it:

```bash
kubectl describe secret fastapi-secret -n my-cool-app
```
The expected output should look like this:
```bash
Name:         fastapi-secret
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
POSTGRES_PASSWORD:      10 bytes
POSTGRES_MASTER:        8 bytes
DOCKER_DATABASE_URL:    53 bytes
HTTP_HOST:              16 bytes
IMAGE_VERSION:          3 bytes
POSTGRES_DB:            9 bytes
POSTGRES_HOST:          9 bytes
POSTGRES_PORT:          4 bytes
POSTGRES_USER:          11 bytes
APP_PORT:               4 bytes
AWS_ACCOUNT_ID:         12 bytes
AWS_SECRET_ACCESS_KEY:  40 bytes
DOCKER_USERNAME:        9 bytes
AWS_ACCESS_KEY_ID:      20 bytes
AWS_REGION:             9 bytes
LOCAL_HOST:             9 bytes
POSTGRES_DATABASE_URL:  60 bytes
POSTGRES_TABLE:         5 bytes
POSTGRES_VOLUME:        2 bytes
APP_HOST:               7 bytes
```

## Conclusion
This tutorial took you through the secure handling of sensitive data using Kubernetes Secrets within a Minikube environment for the 'python-fastapi-demo-docker' application. By incorporating these methods, you have enhanced the security of your application and adhered to best practices for handling confidential data.
