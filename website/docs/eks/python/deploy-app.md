---
title: Deploying FastAPI and PostgreSQL Microservices to EKS
sidebar_position: 9
---
## Objective
This guide shows you how to deploy the microservices of the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project onto your Amazon EKS cluster&mdash;either your AWS Fargate or managed node groups-based cluster. To gain a deeper understanding of the Kubernetes resources in these manifests, refer to [Deploying FastAPI and PostgreSQL Kubernetes resources to Amazon EKS](about-deploy.md).

## Prerequisites

- [Securing FastAPI Microservices with Kubernetes Secrets in Amazon EKS](./deploy-secrets.md)

## 1. Creating db-init-script Configmap

Run the following command from `python-fastapi-demo-docker` directory to create config map

```bash
cd python-fastapi-demo-docker
kubectl create configmap db-init-script --from-file=init.sh=server/db/init.sh -n my-cool-app
```

The expected output should look like this:
```bash
configmap/db-init-script created
```

To confirm that your Kubernetes Configmap has been successfully created, you can use the kubectl get configmap command. This command lists all secrets that exist in the current namespace:

```bash
kubectl get configmap -n my-cool-app
```

The expected output should look like this:

```bash

NAME               DATA   AGE
db-init-script     1      4m47s
kube-root-ca.crt   1      5m36s
```

## 2. Deploying the PostgreSQL StatefulSet, Service, and PersistentVolumeClaim

The **[deploy-db-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-db-python.yaml)** file is used for the deployment of the PostgreSQL database and consists of four primary resources: a StorageClass, Service, StatefulSet, and PersistentVolumeClaim.

From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:

```
kubectl apply -f eks/deploy-db-python.yaml
```

## 3. Deploying the FastAPI Deployment, Service, and Ingress

The **[deploy-app-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-app-python.yaml)** manifest file is used for the deployment of the FastAPI application and consists of three primary resources: a Service, Deployment, and Ingress. 


To identify the ECR repository URI execute the following command.

```bash
aws ecr describe-repositories --region ${AWS_REGION} --repository-names  fastapi-microservices --output table --query "repositories[*].{repositoryUri:repositoryUri}"
```

The expected output should look like this:

```bash
-------------------------------------------------------------------------------
|                            DescribeRepositories                             |
+-----------------------------------------------------------------------------+
|                                repositoryUri                                |
+-----------------------------------------------------------------------------+
|  999999999999.dkr.ecr.us-west-2.amazonaws.com/fastapi-microservices         |
+-----------------------------------------------------------------------------+
```

Open fastapi-app.yaml and replace `0123456789.dkr.ecr.us-east-1.amazonaws.com/fastapi-microservices:1.0` with your ECR repository URI image and tag(`1.0`).

```bash
cd python-fastapi-demo-docker
vi eks/deploy-app-python.yaml
```

From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:

```bash
cd python-fastapi-demo-docker
kubectl apply -f eks/deploy-app-python.yaml
```

## 4. Verifying the Deployment

After applying the configuration, verify that the deployment is running correctly.

Check the services:

```bash
kubectl get services -n my-cool-app
```

The expected output should look like this:

```bash
NAME              TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
db                ClusterIP   None            <none>        5432/TCP       2m48s
fastapi-service   NodePort    10.100.18.255   <none>        80:30952/TCP   21s
```

Check the ingress:

```bash
kubectl get ingress -n my-cool-app
```

The expected output should look like this:

```bash
NAME              CLASS    HOSTS   ADDRESS                                                                  PORTS   AGE
fastapi-ingress   <none>   *       k8s-mycoolap-fastapii-8114c40e9c-860636650.us-west-2.elb.amazonaws.com   80      3m17s
```

Check the deployments:

```bash
kubectl get deployments -n my-cool-app
```

The expected output should look like this:

```bash
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
fastapi-deployment   1/1     1            1           67s
```

Check the StatefulSet:

```bash
kubectl get statefulsets -n my-cool-app
```

The expected output should look like this:

```bash
NAME               READY   AGE
fastapi-postgres   1/1     3m59s
```

Check the PersistentVolumeClaims:

```bash
kubectl get pvc -n my-cool-app
```

The expected output should look like this:

```bash
NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
postgres-data-fastapi-postgres-0   Bound    pvc-84d12ce1-916c-4044-8056-94eb97e25ccd   1Gi        RWO            ebs-sc         4m12s
```

Check the pods:

```bash
kubectl get pods -n my-cool-app
```

The expected output should look like this:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
fastapi-deployment-6b587dfb54-j26pc   1/1     Running   0          2m19s
fastapi-postgres-0                    1/1     Running   0          4m46s
```