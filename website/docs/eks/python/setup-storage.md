---
title: Setting up Scalable Storage with the EBS CSI Driver in Amazon EKS
sidebar_position: 10
---
## Objective
This guide shows you how to set up the EBS CSI Driver on your cluster, which enables dynamic provisioning of Amazon EBS volumes in Kubernetes. We'll leverage [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) configured during the creation of our cluster to provide the necessary permissions to the driver.

:::info

EBS CSI volumes only support the 'ReadWriteOnce' access mode. While this may seem restrictive, it's actually a good match for databases like PostgreSQL. PostgreSQL can handle multiple concurrent connections and queries, even though it runs on a single node. This means even if your application has numerous users reading from and writing to the database concurrently, PostgreSQL manages these operations internally. Therefore, using 'ReadWriteOnce' volumes with PostgreSQL on EKS is generally the recommended approach.

:::     

## 1. Verifying the Service Account
First, we need to make sure the "ebs-csi-controller-sa" service account is correctly set up in the "kube-system" namespace in our cluster.

Run the following command:
```bash
kubectl get sa ebs-csi-controller-sa -n kube-system -o yaml
```
Response:
```bash
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    meta.helm.sh/release-name: aws-ebs-csi-driver
    meta.helm.sh/release-namespace: kube-system
  creationTimestamp: "2023-06-06T20:53:06Z"
  labels:
    app.kubernetes.io/component: csi-driver
    app.kubernetes.io/instance: aws-ebs-csi-driver
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: aws-ebs-csi-driver
    app.kubernetes.io/version: 1.19.0
    helm.sh/chart: aws-ebs-csi-driver-2.19.0
  name: ebs-csi-controller-sa
  namespace: kube-system
  resourceVersion: "1485703"
  uid: 517c71c9-2f59-473f-8d15-dae84be476b7
```

## 2. Adding the EBS CSI Driver as a Helm Repo
Start by adding the 'aws-ebs-csi-driver' as a helm repository. This makes the EBS CSI driver chart available to your helm client.

```bash
helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver
```
You can search for the driver with the following command:
```bash
helm search repo aws-ebs-csi-driver
```

## 3. Updating the Helm Repo
Before installing the driver, make sure to update the helm repository:
```bash
helm repo update
```

## 4. Deploying the EBS CSI Driver
To install the EBS CSI driver on the EKS cluster in the current context, use the following Helm command:
```bash
helm upgrade --install aws-ebs-csi-driver \
  --namespace kube-system \
  --set serviceAccount.controller.create=false \
  --set serviceAccount.snapshot.create=false \
  --set enableVolumeScheduling=true \
  --set enableVolumeResizing=true \
  --set enableVolumeSnapshot=true \
  --set serviceAccount.snapshot.name=ebs-csi-controller-sa \
  --set serviceAccount.controller.name=ebs-csi-controller-sa \
  aws-ebs-csi-driver/aws-ebs-csi-driver
```

The output will confirm the successful installation of the EBS CSI driver:
```bash
Release "aws-ebs-csi-driver" has been upgraded. Happy Helming!
NAME: aws-ebs-csi-driver
LAST DEPLOYED: Tue Jun  6 14:53:58 2023
NAMESPACE: kube-system
STATUS: deployed
```


