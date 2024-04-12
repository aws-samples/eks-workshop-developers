---
title: Setup Amazon EKS for Java Application
sidebar_position: 202
---

## Objective

This chapter shows you how to deploy the Kubernetes resources for Java Application within an Amazon EKS cluster.

## Prerequisites

- [Creating an Amazon EKS Cluster](./eks-create.md)

[Amazon Elastic Kubernetes Service (Amazon EKS)](https://aws.amazon.com/eks/) is a managed service that you can use to run Kubernetes on AWS without needing to install, operate, and maintain your own Kubernetes control plane or nodes. Kubernetes is an open-source system for automating the deployment, scaling, and management of containerized applications.

## 1. Adding Kubernetes namespace for the application and a service account

The Java application needs to push events to EventBridge, read parameters from Parameter Store and secrets from Secrets Manager. To achieve that and develop a secure application with the "Principle of least privilege" we need to create a [Service Account](https://eksctl.io/usage/iamserviceaccounts/) and give it required permissions to access AWS services. We also want to create a Kubernetes namespace for the Java Application.

Create a Kubernetes namespace for the application:

```bash showLineNumbers
kubectl create namespace unicorn-store-spring
```

Create a Kubernetes Service Account with a reference to the previous created IAM policy:

```bash showLineNumbers
eksctl create iamserviceaccount --cluster=unicorn-store --name=unicorn-store-spring --namespace=unicorn-store-spring \
   --attach-policy-arn=$(aws iam list-policies --query 'Policies[?PolicyName==`unicorn-eks-service-account-policy`].Arn' --output text) --approve --region=$AWS_REGION
```

## 2. Synchronizing parameters and secrets

Create the Kubernetes External Secret resources:

```yml showLineNumbers
cat <<EOF | envsubst | kubectl create -f -
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: unicorn-store-spring-secret-store
  namespace: unicorn-store-spring
spec:
  provider:
    aws:
      service: SecretsManager
      region: $AWS_REGION
      auth:
        jwt:
          serviceAccountRef:
            name: unicorn-store-spring
EOF

cat <<EOF | kubectl create -f -
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: unicorn-store-spring-external-secret
  namespace: unicorn-store-spring
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: unicorn-store-spring-secret-store
    kind: SecretStore
  target:
    name: unicornstore-db-secret
    creationPolicy: Owner
  data:
    - secretKey: password
      remoteRef:
        key: unicornstore-db-secret
        property: password
EOF
```

## Conclusion

In this lab we walked you through the process of deploying the Kubernetes resources for Java Application within an Amazon EKS cluster.
