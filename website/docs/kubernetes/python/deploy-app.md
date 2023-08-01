---
title: Deploying FastAPI and PostgreSQL Microservices to Kubernetes using Minikube
sidebar_position: 3
---

## Objective
This guide is designed to equip you with the necessary skills for efficient deployment and management of microservices, specifically those belonging to the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project, within a Kubernetes environment. Through the steps outlined in this guide, you will learn how to configure, deploy, and manage your microservices using Minikube and Amazon ECR. For a comprehensive understanding of the different Kubernetes resources being created, refer to [Introduction to Managing Multiple Services with Kubernetes](about-multiservice.md).

## 1. Creating the FastAPI Deployment and Service
The '[fastapi-app.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/kubernetes/fastapi-app.yaml)' manifest consists of two primary Kubernetes resources: a Service and a Deployment.

From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:
```bash
cd python-fastapi-demo-docker
kubectl apply -f kubernetes/fastapi-app.yaml
```
The expected output should look like this:
```bash
service/fastapi-service configured
deployment.apps/fastapi-deployment created
```

## 2. Creating the PostgreSQL StatefulSet, Service, and PersistentVolumeClaim
The '[postgres-db.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/kubernetes/postgres-db.yaml)' manifest also consists of three primary Kubernetes resources: a StatefulSet, a Service, and a PersistentVolumeClaim.

:::tip

Take note that the Kubernetes service name of 'db' **must** match the service name of 'db' in Docker `postgresql://bookdbadmin:dbpassword@db:5432/bookstore`.

:::  

From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:
```bash
cd python-fastapi-demo-docker
kubectl apply -f kubernetes/postgres-db.yaml
```
The expected output should look like this:
```bash
service/fastapi-postgres-service created
statefulset.apps/fastapi-postgres created
persistentvolumeclaim/postgres-pvc created
```

## 3. Verifying the Deployment
After applying the configuration, verify that the deployment is running correctly.

Check the services:
```bash
kubectl get services -n my-cool-app
```
The expected output should look like this:
```bash
NAME                       TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
fastapi-postgres-service   ClusterIP      None            <none>        5432/TCP       85m
fastapi-service            LoadBalancer   10.109.76.246   <pending>     80:30639/TCP   85m
```

Check the deployments:
```bash
kubectl get deployments -n my-cool-app
```
The expected output should look like this:
```bash
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
fastapi-deployment   1/1     1            1           9m
```

Check the StatefulSet:
```bash
kubectl get statefulsets -n my-cool-app
```
The expected output should look like this:
```bash
NAME               READY   AGE
fastapi-postgres   1/1     18m
```

Check the PersistentVolumeClaims:
```bash
kubectl get pvc -n my-cool-app
```
The expected output should look like this:
```bash
NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
postgres-data-fastapi-postgres-0   Bound    pvc-8772e860-0fcf-4307-9330-d8cf27754174   1Gi        RWO            standard       18m
postgres-pvc                       Bound    pvc-77773703-6d28-4581-adec-8741150df9ce   1Gi        RWO            standard       18m
```

Check the pods:
```bash
kubectl get pods -n my-cool-app
```
The expected output should look like this:
```bash
NAME                                  READY   STATUS    RESTARTS   AGE
fastapi-deployment-59fcfb8849-g2rwk   1/1     Running   0          19m
fastapi-postgres-0                    1/1     Running   0          19m
```
