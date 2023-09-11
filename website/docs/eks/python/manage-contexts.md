---
title: Managing Kubernetes Contexts in EKS Cluster
sidebar_position: 5
---
This guide will demonstrate how to verify and switch Kubernetes contexts in an EKS cluster. We'll make use of the kubectl command-line tool, which allows you to run commands against Kubernetes clusters. Specifically, you'll learn how to check your current context and switch to a different one if needed, allowing your local environment to interact with the desired cluster.

## Prerequisites
- [Creating an Amazon EKS Cluster (Fargate)](./Create-Cluster#1-creating-the-cluster) or [Creating an Amazon EKS Cluster (Managed Node Groups)](./Create-Cluster#creating-the-cluster)
- [Creating the .env File](../../intro/python/environment-setup#4-creating-the-env-file)

## 1. Verifying the Current Context
In Kubernetes, the term "context" refers to the cluster and namespace currently targeted by the kubectl command-line tool. Start by verifying the current context with the following command:

```bash
kubectl config current-context
```

This command will output the current context, which should resemble:
```
arn:aws:eks:us-east-1:123456789012:cluster/fargate-quickstart
```

## 2. Switching Contexts
If your current context doesn't match your EKS cluster, you need to switch contexts. Switching context essentially points your local Kubernetes CLI tool, kubectl, to interact with your desired cluster.

From the 'python-fastapi-demo-docker' project directory, update your local kubeconfig file using the following command:
```bash
aws eks --region ${AWS_REGION} update-kubeconfig --name fargate-quickstart
```

Executing this command should output a confirmation message similar to the one below, indicating a successful context switch:
```bash
Updated context arn:aws:eks:us-east-1:012345678901:cluster/fargate-quickstart in /Users/frank/.kube/config
```

## Conclusion
This guide provided a quick walkthrough on how to verify and switch Kubernetes contexts in an EKS cluster. With a good grasp of Kubernetes contexts, you're now better equipped to handle workloads on different EKS clusters efficiently.