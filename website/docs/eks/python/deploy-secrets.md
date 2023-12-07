---
title: Securing FastAPI Microservices with Kubernetes Secrets in Amazon EKS
sidebar_position: 8
---
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This lab will help you secure sensitive information in your Amazon EKS Kubernetes cluster. By the end of it, you will be able to create Kubernetes secrets from an environment file and verify the creation of these secrets.

## Prerequisites

- [Setting up Scalable Storage with the EBS CSI Driver in Amazon EKS](./setup-storage.md)

<!--This is a shared file at src/includes/get-env-vars.md that reminds users to source their environment variables.-->
<GetEnvVars />

## 1. Creating a Generic Kubernetes Secret from the .env File

Create the Kubernetes Secret in the `my-cool-app` namespace:

```bash
kubectl create secret generic fastapi-secret --from-env-file=.env -n my-cool-app
```

The expected output should look like this:

```bash
secret/fastapi-secret created
```

## 2. Verifying the Secret Creation with kubectl get secret

To confirm that your Kubernetes Secret has been successfully created, you can use [`kubectl get secrets`](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/#verify-the-secret) to list all secrets that exist in the specified namespace:

```bash
kubectl get secrets -n my-cool-app
```

The expected output should look like this:

```bash
NAME             TYPE                             DATA   AGE
fastapi-secret   Opaque                           20     9m
```