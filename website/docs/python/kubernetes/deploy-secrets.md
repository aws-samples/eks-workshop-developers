---
title: Securing FastAPI Microservices with Kubernetes Secrets
sidebar_position: 4
---
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective
In the evolving world of microservices and cloud-native applications, managing sensitive data securely is paramount. Kubernetes offers a "Secret" resource, designed for storing sensitive data like passwords, OAuth tokens, and ssh keys, separating them from the container image to enhance security and modularity. This lab shows you how to create Kubernetes secrets for the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project. 

## Prerequisites
- [Initializing PostgreSQL Database with Kubernetes ConfigMaps](deploy-configmap.md)

<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the 'python-fastapi-demo-docker' directory where their environment variables are sourced.-->
<GetEnvVars />

## 1. Creating the Kubernetes Secret for Amazon ECR
Our Amazon ECR repository is private, so we need to generate an Amazon ECR authorization token and create a Kubernetes Secret with it. This is a critical step because it ensures that your Kubernetes cluster can pull the necessary container images from your private ECR repository. Now, you might be wondering whether this ECR secret will survive pod restarts, especially considering that ECR tokens are only valid for 12 hours. Kubernetes will automatically refresh the secret when it nears expiration, ensuring uninterrupted access to your private ECR repository.


From the root directory of the 'python-fastapi-demo-docker' project, generate an Amazon ECR authorization token:
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
Namespace:    my-cool-app
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
DATABASE_URL:                58 bytes
HTTP_HOST:                   16 bytes
IMAGE_VERSION:               3 bytes
WORKSHOP_POSTGRES_PASSWORD:  10 bytes
AWS_REGION:                  9 bytes
DOCKER_DATABASE_URL:         53 bytes
POSTGRES_MASTER:             8 bytes
POSTGRES_TABLE:              5 bytes
APP_HOST:                    7 bytes
POSTGRES_HOST:               9 bytes
POSTGRES_PASSWORD:           15 bytes
POSTGRES_VOLUME:             2 bytes
WORKSHOP_POSTGRES_DB:        9 bytes
APP_PORT:                    4 bytes
DOCKER_USERNAME:             7 bytes
LOCAL_HOST:                  9 bytes
POSTGRES_PORT:               4 bytes
WORKSHOP_POSTGRES_USER:      11 bytes
```

## Conclusion
This tutorial took you through the secure handling of sensitive data using Kubernetes Secrets within a Minikube environment for the 'python-fastapi-demo-docker' application. By incorporating these methods, you have enhanced the security of your application and adhered to best practices for handling confidential data.
