---
title: Creating an Amazon EKS Cluster (Fargate)
sidebar_position: 4
---
## Objective
This guide shows you how to create an Amazon EKS cluster using AWS Fargate, specifically aimed at deploying the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project's resources. To gain a deeper understanding of the different cluster configurations in the configuration file we'll use, refer to [Amazon EKS Cluster Options](about-cluster.md).

## 1. Creating the Cluster
From the 'python-fastapi-demo-docker' project directory, create the cluster using the eksctl configuration file:
```bash
eksctl create cluster -f eks/python-fargate-create.yaml
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
my-cool-app       Active   27m
```

## 3. Creating a Namespace
While we've already created the necessary Fargate profile and namespace for this workshop, to create any additional namespaces, run the following command:
```bash
aws eks create-fargate-profile \
    --region ${AWS_REGION} \
    --cluster fargate-quickstart \
    --profile-name fp-dev \
    --selectors namespace=my-other-cool-app
```

## Conclusion
This guide has walked you through the process of creating an Amazon EKS Fargate cluster pre-configured to deploy the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project's resources. By following these instructions, you've set up a functioning Kubernetes cluster on Amazon EKS, ready for deploying applications. 