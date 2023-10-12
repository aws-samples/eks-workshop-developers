---
title: Deploying FastAPI and PostgreSQL Microservices to EKS
sidebar_position: 9
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Objective

This lab shows you how to deploy the microservices of the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project onto your Amazon EKS cluster&mdash;either for your AWS Fargate or Managed Node Groups-based cluster. To gain a deeper understanding of the Kubernetes resources in these manifests, refer to [Deploying FastAPI and PostgreSQL Kubernetes resources to Amazon EKS](about-deploy.md).

## Prerequisites

- [Securing FastAPI Microservices with Kubernetes Secrets in Amazon EKS](./deploy-secrets.md)


## 1. Create FastAPI and PosgreSQL Resources
<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

### Creating the Database Initialization Script as a Configmap

1. Run the following command from the `python-fastapi-demo-docker` directory to create a ConfigMap for the database [init.sh](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/server/db/init.sh) script:

```bash
cd python-fastapi-demo-docker
kubectl create configmap db-init-script --from-file=init.sh=server/db/init.sh -n my-cool-app
```

The expected output should look like this:

```bash
configmap/db-init-script created
```

2. To confirm the ConfigMap was successfully created, run the following command:

```bash
kubectl get configmap -n my-cool-app
```

The expected output should look like this:

```bash

NAME               DATA   AGE
db-init-script     1      4m47s
kube-root-ca.crt   1      5m36s
```
### Deploying the PostgreSQL StatefulSet, Service, and PersistentVolumeClaim

The **[eks/deploy-db-python-fargate.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-db-python-fargate.yaml)** file is used for the deployment of the PostgreSQL database resources.

1. From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:
```bash
kubectl apply -f eks/deploy-db-python-fargate.yaml
```

2. It'll take a few minutes for Fargate to provision the pods. To verify that the 'db' pod is running, run the following command:
```bash
kubectl get po fastapi-postgres-0 -n my-cool-app
```
The expected output should look like this:
```
NAME                 READY   STATUS    RESTARTS   AGE
fastapi-postgres-0   1/1     Running   0          5m
```

### Deploying the FastAPI Deployment, Service, and Ingress

The **[eks/deploy-app-python-fargate.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-app-python-fargate.yaml)** manifest file is used for the deployment of the FastAPI application resources.

1. Retrieve your ECR URI:

```bash
echo ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

The expected output should look like this:
```bash
01234567890.dkr.ecr.us-west-1.amazonaws.com/fastapi-microservices:1.0
```

2. Open the **[eks/deploy-app-python-fargate.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-app-python-fargate.yaml)**, and replace the sample value with your ECR URI.

3. From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:
```bash
kubectl apply -f eks/deploy-app-python-fargate.yaml
```
</TabItem>


<TabItem value="Managed Node Groups" label="Managed Node Groups">

### Creating the Database Initialization Script as a Configmap

1. Run the following command from the `python-fastapi-demo-docker` directory to create a ConfigMap for the database [init.sh](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/server/db/init.sh) script:

```bash
cd python-fastapi-demo-docker
kubectl create configmap db-init-script --from-file=init.sh=server/db/init.sh -n my-cool-app
```

The expected output should look like this:

```bash
configmap/db-init-script created
```

2. To confirm the ConfigMap was successfully created, run the following command:

```bash
kubectl get configmap -n my-cool-app
```

The expected output should look like this:

```bash

NAME               DATA   AGE
db-init-script     1      4m47s
kube-root-ca.crt   1      5m36s
```
### Deploying the PostgreSQL StatefulSet, Service, and PersistentVolumeClaim

The **[eks/deploy-db-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-db-python.yaml)** file is used for the deployment of the PostgreSQL database resources.

1. From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:
```bash
kubectl apply -f eks/deploy-db-python.yaml
```
### Deploying the FastAPI Deployment, Service, and Ingress
The **[eks/deploy-app-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-app-python.yaml)** manifest file is used for the deployment of the FastAPI application resources. 

1. Retrieve your ECR URI:

```bash
echo ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

The expected output should look like this:
```bash
01234567890.dkr.ecr.us-west-1.amazonaws.com/fastapi-microservices:1.0
```

2. Open the **[eks/deploy-app-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/deploy-app-python.yaml)**, and replace the sample value with your ECR URI.

3. From the 'python-fastapi-demo-docker' project directory, apply the Kubernetes configuration:

```bash
kubectl apply -f eks/deploy-app-python.yaml
```

  </TabItem>
</Tabs>


## 2. Verifying the Deployment

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