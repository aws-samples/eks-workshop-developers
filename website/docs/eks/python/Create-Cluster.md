---
title: Creating an Amazon EKS Cluster
sidebar_position: 3
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Objective
This lab shows you how to create an Amazon EKS cluster, specifically aimed at deploying the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project's resources. To gain a deeper understanding of the different cluster configurations in the configuration file we'll use, refer to [About Amazon EKS Cluster Nodes](about-cluster.md).

## Prerequisites
- [Building and Running Multi-Architecture Containers](../../containers/python/multiarchitecture-image.md)

## Initial Setup
Navigate to the root directory of the 'python-fastapi-demo-docker' project where your [environment variables are sourced](../../intro/python/environment-setup):
```bash
cd python-fastapi-demo-docker
```

<Tabs>
  <TabItem value="Compute type Fargate" label="Fargate" default>

## 1. Creating the Cluster
From the 'python-fastapi-demo-docker' project directory, create the cluster using the eksctl configuration file:

:::caution
Make sure to verify the region specified in `eks/create-fargate-python.yaml` and change it, if needed. The region must be same as the one you used in your [.env file](../../intro/python/environment-setup#4-creating-the-env-file).
:::

```bash
eksctl create cluster -f eks/create-fargate-python.yaml
```

:::tip

If you receive an “Error: checking AWS STS access” in the response, be sure to check that you’re using the right user identity for the current shell session. Depending on how you configured the AWS CLI, you may also need to specify a named profile (for example, `--profile clusteradmin`).

:::     

Upon completion, the output should look something like this:

```
2023-05-26 13:10:23 [✔]  EKS cluster "fargate-quickstart" in "us-east-1" region is ready
```

## 2. View Namespaces
Check the namespaces in your cluster by running the following command:
```bash
kubectl get namespaces
```
The output should look something like this:
```bash
NAME              STATUS   AGE
default           Active   27m
kube-node-lease   Active   27m
kube-public       Active   27m
kube-system       Active   27m
```

## 3. Creating a Namespace
While we've already created the necessary Fargate profile and namespace for this workshop, to create any additional namespace and fargate profile, run the following commands:
```bash
kubectl create namespace my-cool-app
```
To create Fargate Profile, a [PodExecutionRole](https://docs.aws.amazon.com/eks/latest/userguide/pod-execution-role.html) is needed. Create the role if it doesn't exists and update the ARN in below command.
```bash
aws eks create-fargate-profile \
    --region ${AWS_REGION} \
    --cluster fargate-quickstart \
    --fargate-profile-name fp-dev \
    --pod-execution-role-arn arn:aws:iam::0123456789:role/AmazonEKSFargatePodExecutionRole
    --selectors namespace=my-cool-app
```

## Conclusion
This lab has walked you through the process of creating an Amazon EKS Fargate cluster pre-configured to deploy the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project's resources. By following these instructions, you've set up a functioning Kubernetes cluster on Amazon EKS, ready for deploying applications.
  </TabItem>
    <TabItem value="Compute type Managed node group(EC2)" label="Managed Node Groups (EC2)" default>

## Creating the Cluster
From the 'python-fastapi-demo-docker' project directory, create the cluster using the eksctl configuration file:

:::caution
Make sure to verify the region specified in `eks/create-mng-python.yaml` and change it, if needed. The region must be same as the one you used in your [.env file](../../intro/python/environment-setup#4-creating-the-env-file).
:::

```bash
eksctl create cluster -f eks/create-mng-python.yaml
```

:::tip

If you receive an “Error: checking AWS STS access” in the response, be sure to check that you’re using the right user identity for the current shell session. Depending on how you configured the AWS CLI, you may also need to specify a named profile (for example, `--profile clusteradmin`).

:::  

Upon completion, the output should look something like this:
```
2023-05-26 13:10:23 [✔]  EKS cluster "managednode-quickstart" in "us-east-1" region is ready
```

## Viewing Namespaces
Check the namespaces in your cluster by running the following command:
```bash
kubectl get namespaces
```
The output should look something like this:
```bash
NAME              STATUS   AGE
default           Active   41h
kube-node-lease   Active   41h
kube-public       Active   41h
kube-system       Active   41h
```

## Creating a Namespace
Run the following command to create the "my-cool-app" namespace for the workshop:
```bash
kubectl create namespace my-cool-app
```

## Conclusion
This tutorial walked you through the process of creating and connecting to an Amazon EKS cluster using managed node groups for the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) application. By using the eksctl tool and understanding the ClusterConfig file, you are now better equipped to deploy and manage Kubernetes applications, while AWS takes care of the node lifecycle management.
  </TabItem>
</Tabs>
