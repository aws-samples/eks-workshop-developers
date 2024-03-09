---
title: Setup Amazon EKS for Java Application
sidebar_position: 2
---

## Objective

This chapter shows you how to deploy the Kubernetes resources for Java Application within an Amazon EKS cluster.

## Prerequisites

- [Creating an Amazon EKS Cluster](./eks-create.md)

[Amazon Elastic Kubernetes Service (Amazon EKS)](https://aws.amazon.com/eks/) is a managed service that you can use to run Kubernetes on AWS without needing to install, operate, and maintain your own Kubernetes control plane or nodes. Kubernetes is an open-source system for automating the deployment, scaling, and management of containerized applications.

## 1. Adding IAM permissions & service accounts

The Java application needs to push events to EventBridge, read parameters from Parameter Store and secrets from Secrets Manager. To achieve that and develop a secure application with the "Principle of least privilege" we need to create a [Service Account](https://eksctl.io/usage/iamserviceaccounts/) and give it required permissions to access AWS services. We also want to create a Kubernetes namespace for the Java Application.

Create a Kubernetes namespace for the application:

```bash showLineNumbers
kubectl create namespace unicorn-store-spring
```

Create an IAM-Policy with the proper permissions to publish to EventBridge, retrieve secrets & parameters and basic monitoring:

```json showLineNumbers
cat <<EOF > service-account-policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "xray:PutTraceSegments",
            "Resource": "*",
            "Effect": "Allow"
        },
        {
            "Action": "events:PutEvents",
            "Resource": "arn:aws:events:$AWS_REGION:$ACCOUNT_ID:event-bus/unicorns",
            "Effect": "Allow"
        },
        {
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret"
            ],
            "Resource": "$(aws cloudformation describe-stacks --stack-name UnicornStoreInfrastructure --query 'Stacks[0].Outputs[?OutputKey==`arnUnicornStoreDbSecret`].OutputValue' --output text)",
            "Effect": "Allow"
        },
        {
            "Action": [
                "ssm:DescribeParameters",
                "ssm:GetParameters",
                "ssm:GetParameter",
                "ssm:GetParameterHistory"
            ],
            "Resource": "arn:aws:ssm:$AWS_REGION:$ACCOUNT_ID:parameter/databaseJDBCConnectionString",
            "Effect": "Allow"
        }
    ]
}
EOF
aws iam create-policy --policy-name unicorn-eks-service-account-policy --policy-document file://service-account-policy.json
```

Create a Kubernetes Service Account with a reference to the previous created IAM policy:

```bash showLineNumbers
eksctl create iamserviceaccount --cluster=unicorn-store --name=unicorn-store-spring --namespace=unicorn-store-spring \
   --attach-policy-arn=$(aws iam list-policies --query 'Policies[?PolicyName==`unicorn-eks-service-account-policy`].Arn' --output text) --approve --region=$AWS_REGION
rm service-account-policy.json
```

## 2. Synchronizing parameters and secrets

We need to synchronize the database secret from AWS Secrets Manager to a Kubernetes secret to use it in a deployment. To achieve that, we will use [External Secrets](https://external-secrets.io/) and install it via [Helm](https://helm.sh/docs/intro/using_helm/):

Install the External Secrets Operator:

```bash showLineNumbers
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets \
external-secrets/external-secrets \
-n external-secrets \
--create-namespace \
--set installCRDs=true \
--set webhook.port=9443 \
--wait
```

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
