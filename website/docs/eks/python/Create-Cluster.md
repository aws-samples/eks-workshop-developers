---
title: Creating an Amazon EKS Cluster
sidebar_position: 3
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview
Creating an Amazon EKS cluster with [eksctl](https://eksctl.io/) allows for a wide range of configurations to cater to different needs. This can be achieved directly via command-line parameters or, for more complex setups, by utilizing a configuration file. 

## Objective
This lab shows you how to create an Amazon EKS cluster using a configuration file specifically aimed at deploying the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project's resources. 

## Prerequisites
- [Building and Running Multi-Architecture Containers](../../containers/python/multiarchitecture-image.md)

## Initial Setup
Navigate to the root directory of the 'python-fastapi-demo-docker' project where your [environment variables are sourced](../../introduction/python/environment-setup):
```bash
cd python-fastapi-demo-docker
```

<Tabs>
  <TabItem value="Compute type Fargate" label="Fargate" default>

## 1. Using the cluster configuration file for Faragte nodes 
The **[create-fargate-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/create-fargate-python.yaml)** eksctl configuration file sets up a Fargate-based cluster for deploying our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) with the following components:  

- **Metadata**: This section contains crucial metadata about your cluster, such as the cluster's name ("fargate-quickstart"), the AWS region where the cluster will be hosted ("us-east-1"), and the Kubernetes version ("1.26") that the cluster will run.
- **Fargate Profiles**: This section configures the Fargate profiles, which determine how and which pods are launched on Fargate. By default, a maximum of five namespaces can be included. In our configuration, we're using the "default" and "kube-system" namespaces and have also added a custom namespace, "my-cool-app", to host the application we plan to deploy on the cluster.
- **Permissions (IAM)**: This section outlines how the configuration utilizes IAM roles for service accounts through an [OpenID Connect (OIDC) identity provider](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html). Two service accounts are established here: "aws-load-balancer-controller", which authorizes Kubernetes to manage the [AWS Load Balancer Controller (LBC)](https://kubernetes-sigs.github.io/aws-load-balancer-controller/), "ecr-access-service-account", which facilitates interactions with the [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/). 
- **Logs (CloudWatch)**: The configuration wraps up with a "cloudWatch" section, which sets up [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) logging for the cluster. All categories of Kubernetes control plane logs are enabled and are set to be retained for 30 days.

## 2. Creating the Cluster
From the 'python-fastapi-demo-docker' project directory, create the cluster using the eksctl configuration file:

:::caution
Make sure to verify the region specified in `eks/create-fargate-python.yaml` and change it, if needed. The region must be same as the one you used in your [.env file](../../introduction/python/environment-setup).
:::

```bash
eksctl create cluster -f eks/create-fargate-python.yaml
```

:::tip

- To avoid execution errors, update eksctl to the latest version using [eksctl official documentation](https://eksctl.io/introduction/#installation).
- If you receive an “Error: checking AWS STS access” in the response, be sure to check that you’re using the right IAM user identity for the current shell session. Depending on how you configured the AWS CLI, you may also need to specify a named profile (for example, `--profile clusteradmin`).
:::     

Upon completion, the output should look something like this:

```
2023-05-26 13:10:23 [✔]  EKS cluster "fargate-quickstart" in "us-east-1" region is ready
```

## 3. View Namespaces
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

:::tip

- If you receive authentication errors, update kubeconfig using the following command `aws eks update-kubeconfig --name fargate-quickstart`

:::   

## 4. Creating a Namespace
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

## 1. Using the cluster configuration file for Managed Node Groups 
The **[create-mng-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/create-mng-python.yaml)** eksctl configuration file sets up a managed node groups-based cluster for deploying our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) with the following components: 

- **Metadata**: This section contains crucial metadata about your cluster, such as the cluster's name ("managednode-quickstart"), the target AWS region ("us-east-1"), and the Kubernetes version ("1.26") to be deployed.
- **Permissions (IAM)**: This section outlines how the configuration utilizes IAM roles for service accounts through an [OpenID Connect (OIDC) identity provider](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html). Two service accounts are established here: "aws-load-balancer-controller", which authorizes Kubernetes to manage the [AWS Load Balancer Controller (LBC)](https://kubernetes-sigs.github.io/aws-load-balancer-controller/), "ecr-access-service-account", which facilitates interactions with the [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/). 
- **Managed node groups**: This section defines a managed node group called "eks-mng". Nodes within this group are based on "t3.medium" instance types, with an initial deployment of two nodes. For more instance types, see [Amazon EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/).
- **Managed add-ons**: The configuration contains an "addons" section, which defines the [EKS add-ons](https://docs.aws.amazon.com/eks/latest/userguide/eks-add-ons.html) to be enabled on the cluster. In this case, "kube-proxy", "vpc-cni" (a networking plugin for pods in VPC), and "coredns" (a DNS server) are activated. The "vpc-cni" addon is additionally linked with the [AmazonEKS_CNI_Policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html) policy.
- **Logs (CloudWatch)**: The configuration wraps up with a "cloudWatch" section, which sets up [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) logging for the cluster. All categories of Kubernetes control plane logs are enabled and are set to be retained for 30 days.

## 2. Creating the Cluster
From the 'python-fastapi-demo-docker' project directory, create the cluster using the eksctl configuration file:

:::caution
Make sure to verify the region specified in `eks/create-mng-python.yaml` and change it, if needed. The region must be same as the one you used in your [.env file](../../introduction/python/environment-setup).
:::

```bash
eksctl create cluster -f eks/create-mng-python.yaml
```

:::tip

- To avoid execution errors, update eksctl to the latest version using [eksctl official documentation](https://eksctl.io/introduction/#installation).
- If you receive an “Error: checking AWS STS access” in the response, be sure to check that you’re using the right user identity for the current shell session. Depending on how you configured the AWS CLI, you may also need to specify a named profile (for example, `--profile clusteradmin`).

:::  

Upon completion, the output should look something like this:
```
2023-05-26 13:10:23 [✔]  EKS cluster "managednode-quickstart" in "us-east-1" region is ready
```

## 3. Viewing Namespaces
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

:::tip

- If you receive authentication errors, update kubeconfig using the following command `aws eks update-kubeconfig --name managednode-quickstart`

:::   

## 4. Creating a Namespace
Run the following command to create the "my-cool-app" namespace for the workshop:
```bash
kubectl create namespace my-cool-app
```

## Conclusion
This tutorial walked you through the process of creating and connecting to an Amazon EKS cluster using managed node groups for the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) application. By using the eksctl tool and understanding the ClusterConfig file, you are now better equipped to deploy and manage Kubernetes applications, while AWS takes care of the node lifecycle management.
  </TabItem>
</Tabs>
