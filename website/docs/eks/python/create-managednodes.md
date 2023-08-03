---
title: Creating an Amazon EKS Cluster (Managed Node Groups)
sidebar_position: 4
---
## Objective
This guide shows you how to create an Amazon EKS cluster using managed node groups, specifically aimed at deploying the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) resources. To gain a deeper understanding of the different cluster configurations in the configuration file we'll use, refer to [Amazon EKS Cluster Options](about-cluster.md).

## 1. Creating the Cluster
From the 'python-fastapi-demo-docker' project directory, create the cluster using the eksctl configuration file:
```bash
eksctl create cluster -f eks/python-mng-create.yaml
```

:::tip

If you receive an “Error: checking AWS STS access” in the response, be sure to check that you’re using the right user identity for the current shell session. Depending on how you configured the AWS CLI, you may also need to specify a named profile (for example, `--profile clusteradmin`).

:::  

Upon completion, the output should look something like this:
```
2023-05-26 13:10:23 [✔]  EKS cluster "managednode-quickstart" in "us-east-1" region is ready
```

## 2. Viewing Namespaces
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

## 3. Creating a Namespace
Run the following command to create the "my-cool-app" namespace for the workshop:
```bash
kubectl create namespace my-cool-app
```

## Conclusion
This tutorial walked you through the process of creating and connecting to an Amazon EKS cluster using managed node groups for the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) application. By using the eksctl tool and understanding the ClusterConfig file, you are now better equipped to deploy and manage Kubernetes applications, while AWS takes care of the node lifecycle management.