---
title: Managing Kubernetes Contexts in EKS Cluster
sidebar_position: 5
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
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
arn:aws:eks:us-east-1:012345678901:cluster/automode-quickstart
```

or

```bash
admin@automode-quickstart.us-east-1.eksctl.io
```

## 2. Switching Contexts

If your current context doesn't match your EKS cluster, you need to switch contexts. Switching contexts points your local Kubernetes CLI tool, kubectl, to interact with your desired cluster.

From the `python-fastapi-demo-docker` project directory, update your local kubeconfig file using either one of the following commands:

<Tabs>
  <TabItem value="EKS Auto Mode" label="EKS Auto Mode" default>

```bash
aws eks --region ${AWS_REGION} update-kubeconfig --name automode-quickstart
```

or

```bash
eksctl utils write-kubeconfig --cluster automode-quickstart --region ${AWS_REGION}
```

Executing the above commands should output a confirmation message similar to the output below, indicating a successful context switch:

```bash
Updated context arn:aws:eks:us-east-1:012345678901:cluster/automode-quickstart in /Users/frank/.kube/config
```
or

```bash
2025-06-18 13:24:37 [✔]  saved kubeconfig as "/Users/frank/.kube/config"
```
</TabItem>

<TabItem value="Managed Node Groups" label="Managed Node Groups" default>

```bash
aws eks --region ${AWS_REGION} update-kubeconfig --name managednode-quickstart
```

or

```bash
eksctl utils write-kubeconfig --cluster managednode-quickstart --region ${AWS_REGION}
```

Executing the above commands should output a confirmation message similar to the output below, indicating a successful context switch:

```bash
Updated context arn:aws:eks:us-east-1:012345678901:cluster/managednode-quickstart in /Users/frank/.kube/config
```
or

```bash
2025-06-20 22:22:14 [✔]  saved kubeconfig as "/Users/frank/.kube/config"
```
  </TabItem>
</Tabs>


:::tip

- If using an AWS CLI version older than 1.16.156, make sure that the `aws-iam-authenticator` is installed in your environment. Refer to [Installing aws-iam-authenticator](https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html) in the EKS documentation.

:::  

## Conclusion

This lab provided a quick walkthrough on how to verify and switch Kubernetes contexts in an EKS cluster. With a good grasp of Kubernetes contexts, you're now better equipped to handle workloads on different EKS clusters efficiently.
