---
title: Setting up Scalable Storage in EKS
sidebar_position: 7
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This lab shows you how to setup and configure a data storage mechanism on your cluster. 

## Prerequisites

- [Setting up the Application Load Balancer on the EKS Cluster](./setup-loadbalancing.md)

<!--This is a shared file at src/includes/get-env-vars.md that reminds users to source their environment variables.-->
<GetEnvVars />

<Tabs>
  <TabItem value="EKS Auto Mode" label="EKS Auto Mode" default>

## 1. Creating StorageClass

StorageClass is used for dynamic provisioning of PersistentVolumes to fulfill PersistentVolumeClaims (PVCs). Run the following command from the python-fastapi-demo-docker project directory to create the StorageClass:

``` bash
kubectl apply -f eks/sc-automode.yaml
```

The expected output should look like this:

```
storageclass.storage.k8s.io/ebs-sc created
```

  </TabItem>

  <TabItem value="Managed Node Groups" label="Managed Node Groups">

This lab shows you how to verify the setup of the [Amazon Elastic Block Store](https://aws.amazon.com/ebs/) volume for your managed node groups-based EKS cluster, which enabled dynamic provisioning of persistent volumes on our cluster using the EBS CSI Driver. It's worth noting that we're also leveraging [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) configured during the creation of our cluster.

:::info

EBS CSI volumes only support the 'ReadWriteOnce' access mode. While this may seem restrictive, it's actually a good match for databases like PostgreSQL. PostgreSQL can handle multiple concurrent connections and queries, even though it runs on a single node. This means even if your application has numerous users reading from and writing to the database concurrently, PostgreSQL manages these operations internally. Therefore, using 'ReadWriteOnce' volumes with PostgreSQL on EKS is generally the recommended approach.

:::

## 1. Verifying EBS CSI Add-On Installation

You can verify that the EBS CSI add-on was successfully installed when you created your cluster in [create-mng-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/aws-opentelemetry/eks/create-mng-python.yaml#L41-L43) using the following command:

```bash
kubectl get pod -n kube-system --selector=app.kubernetes.io/name=aws-ebs-csi-driver 
```
The expected output should look like this:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
ebs-csi-controller-5bd7b5fdbf-6wpzv   6/6     Running   0          7h
ebs-csi-controller-5bd7b5fdbf-lnn96   6/6     Running   0          7h15m
ebs-csi-node-l7z5z                    3/3     Running   0          4h7m
ebs-csi-node-tvlkg                    3/3     Running   0          4h7m
```

## 2. Creating StorageClass

StorageClass is used for dynamic provisioning of PersistentVolumes to fulfill PersistentVolumeClaims (PVCs). Run the following command from the python-fastapi-demo-docker project directory to create the StorageClass:

``` bash
kubectl apply -f eks/sc.yaml
```

The expected output should look like this:

```
storageclass.storage.k8s.io/ebs-sc created
```

  </TabItem>
</Tabs>
