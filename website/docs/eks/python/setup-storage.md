---
title: Verify EBS CSI Driver is installed 
sidebar_position: 7
---
## Objective
This lab shows how to verify the installation of EBS CSI driver add-on. EBS CSI driver is used to procure persistent volume claims for postgres db. EBS CSI Driver on your cluster, enables dynamic provisioning of Amazon EBS volumes in Kubernetes. Managing the EBS CSI driver as an add-on improve security and reduce the amount of work.

:::info

EBS CSI volumes only support the 'ReadWriteOnce' access mode. While this may seem restrictive, it's actually a good match for databases like PostgreSQL. PostgreSQL can handle multiple concurrent connections and queries, even though it runs on a single node. This means even if your application has numerous users reading from and writing to the database concurrently, PostgreSQL manages these operations internally. Therefore, using 'ReadWriteOnce' volumes with PostgreSQL on EKS is generally the recommended approach.

:::     

## Prerequisites
- [Setting up the AWS Application Load Balancer Controller (LBC) on the EKS Cluster](./setup-loadbalancing.md)


## 1. Installing the EBS CSI Addon as part of eksctl.

You can see that EBS CSI being deployed as part of add-ons in [create-mng-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/aws-opentelemetry/eks/create-mng-python.yaml#L41-L43)


## 2. Verifying the Deployment of EBS CSI Driver

Run the following command:

```bash
kubectl get po -n kube-system --selector=app.kubernetes.io/name=aws-ebs-csi-driver 
```

Response:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
ebs-csi-controller-5bd7b5fdbf-6wpzv   6/6     Running   0          7h
ebs-csi-controller-5bd7b5fdbf-lnn96   6/6     Running   0          7h15m
ebs-csi-node-l7z5z                    3/3     Running   0          4h7m
ebs-csi-node-tvlkg                    3/3     Running   0          4h7m
```
