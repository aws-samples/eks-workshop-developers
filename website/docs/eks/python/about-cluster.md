---
title: About Amazon EKS Cluster Nodes
sidebar_position: 2
---

## Overview
Creating an Amazon EKS cluster with [eksctl](https://eksctl.io/) allows for a wide range of configurations to cater to different needs. This can be achieved directly via command-line parameters or, for more complex setups, by utilizing a configuration file. 

## Objective
This guide describes the configuration files used to set up the worker nodes in our EKS clusters: [managed node groups](https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html) and [AWS Fargate](https://docs.aws.amazon.com/eks/latest/userguide/fargate.html). 

### Managed Node Groups
The **[create-mng-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/create-mng-python.yaml)** eksctl configuration file sets up a managed node groups-based cluster for deploying our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) with the following components: 

- **Metadata**: This section contains crucial metadata about your cluster, such as the cluster's name ("managednode-quickstart"), the target AWS region ("us-east-1"), and the Kubernetes version ("1.26") to be deployed.
- **Permissions (IAM)**: This section outlines how the configuration utilizes IAM roles for service accounts through an [OpenID Connect (OIDC) identity provider](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html). Two service accounts are established here: "aws-load-balancer-controller", which authorizes Kubernetes to manage the [AWS Load Balancer Controller (LBC)](https://kubernetes-sigs.github.io/aws-load-balancer-controller/), "ecr-access-service-account", which facilitates interactions with the [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/). 
- **Managed node groups**: This section defines a managed node group called "eks-mng". Nodes within this group are based on "t3.medium" instance types, with an initial deployment of two nodes. For more instance types, see [Amazon EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/).
- **Managed add-ons**: The configuration contains an "addons" section, which defines the [EKS add-ons](https://docs.aws.amazon.com/eks/latest/userguide/eks-add-ons.html) to be enabled on the cluster. In this case, "kube-proxy", "vpc-cni" (a networking plugin for pods in VPC), and "coredns" (a DNS server) are activated. The "vpc-cni" addon is additionally linked with the [AmazonEKS_CNI_Policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html) policy.
- **Logs (CloudWatch)**: The configuration wraps up with a "cloudWatch" section, which sets up [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) logging for the cluster. All categories of Kubernetes control plane logs are enabled and are set to be retained for 30 days.

### Fargate
The **[create-fargate-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/create-fargate-python.yaml)** eksctl configuration file sets up a managed node groups-based cluster for deploying our [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) with the following components:  

- **Metadata**: This section contains crucial metadata about your cluster, such as the cluster's name ("fargate-quickstart"), the AWS region where the cluster will be hosted ("us-east-1"), and the Kubernetes version ("1.26") that the cluster will run.
- **Fargate Profiles**: This section configures the Fargate profiles, which determine how and which pods are launched on Fargate. By default, a maximum of five namespaces can be included. In our configuration, we're using the "default" and "kube-system" namespaces and have also added a custom namespace, "my-cool-app", to host the application we plan to deploy on the cluster.
- **Permissions (IAM)**: This section outlines how the configuration utilizes IAM roles for service accounts through an [OpenID Connect (OIDC) identity provider](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html). Two service accounts are established here: "aws-load-balancer-controller", which authorizes Kubernetes to manage the [AWS Load Balancer Controller (LBC)](https://kubernetes-sigs.github.io/aws-load-balancer-controller/), "ecr-access-service-account", which facilitates interactions with the [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/). 
- **Logs (CloudWatch)**: The configuration wraps up with a "cloudWatch" section, which sets up [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) logging for the cluster. All categories of Kubernetes control plane logs are enabled and are set to be retained for 30 days.

