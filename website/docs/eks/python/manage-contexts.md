---
title: Managing Kubernetes Contexts in EKS Cluster
sidebar_position: 5
---
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective
This lab shows how to verify and switch Kubernetes contexts in an EKS cluster. We'll make use of the kubectl command-line tool, which allows you to run commands against Kubernetes clusters. Specifically, you'll learn how to check your current context and switch to a different one if needed, allowing your local environment to interact with the desired cluster.

## Prerequisites

- [Creating an Amazon EKS Cluster](create-cluster.md)

<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the 'python-fastapi-demo-docker' directory where their environment variables are sourced.-->
<GetEnvVars />

## 1. Verifying the Current Context

In Kubernetes, the term "context" refers to the cluster and namespace currently targeted by the kubectl command-line tool. Start by verifying the current context with the following command:

```bash
kubectl config current-context
```

This command will output the current context, which should resemble:

```bash
arn:aws:eks:us-east-1:123456789012:cluster/fargate-quickstart
```
or
```bash
admin@fargate-quickstart.us-east-1.eksctl.io
```

## 2. Switching Contexts

If your current context doesn't match your EKS cluster, you need to switch contexts. Switching context essentially points your local Kubernetes CLI tool, kubectl, to interact with your desired cluster.

From the 'python-fastapi-demo-docker' project directory, update your local kubeconfig file using either one of the following commands:

```bash
aws eks --region ${AWS_REGION} update-kubeconfig --name fargate-quickstart
```
or
```bash
eksctl utils write-kubeconfig --cluster=fargate-quickstart --region ${AWS_REGION}
```

Executing the following commands should output a confirmation message similar to the output below, indicating a successful context switch:

```bash
Updated context arn:aws:eks:us-east-1:012345678901:cluster/fargate-quickstart in /Users/frank/.kube/config
```
or
```bash
2023-09-22 17:00:52 [✔]  saved kubeconfig as "/Users/user1/.kube/config"
```

:::tip

- If using eksctl to switch contexts, make sure that the `aws-iam-authenticator` is installed in your environment. Refer to [Installing aws-iam-authenticator](https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html) in EKS documentation.

:::  

## Conclusion

This lab provided a quick walkthrough on how to verify and switch Kubernetes contexts in an EKS cluster. With a good grasp of Kubernetes contexts, you're now better equipped to handle workloads on different EKS clusters efficiently.

