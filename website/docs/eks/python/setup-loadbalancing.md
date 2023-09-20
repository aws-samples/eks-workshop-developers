---
title: Setting up the AWS Application Load Balancer Controller (LBC) on the EKS Cluster
sidebar_position: 6
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Objective
This lab shows you how to set up the [AWS Load Balancer Controller (LBC)](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) on your cluster, which enables the routing of external traffic to your Kubernetes services. We'll leverage the [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) we configured when we created our cluster, ensuring that the controller has the required permissions.

:::info

Classic Load Balancers and Network Load Balancers are not supported on pods running on Fargate.

:::

## Prerequisites
- [Managing Kubernetes Contexts in EKS Cluster](./manage-contexts.md)
- [Creating the .env File](../../intro/python/environment-setup#4-creating-the-env-file)

## 1. Set Environment Variables
Before we start setting up our EKS cluster, we need to set an environment variable for our cluster name and VPC. Optionally, you can add these to the `.env` file at the root of the 'python-fastapi-demo-docker' project directory.

From the 'python-fastapi-demo-docker' project directory, fetch the VPC ID associated with your EKS cluster and set an environment variable to that value:

<Tabs>
  <TabItem value="Fargate cluster" label="Fargate cluster" default>

```bash
cd python-fastapi-demo-docker
export CLUSTER_VPC=$(aws eks describe-cluster --name fargate-quickstart --region ${AWS_REGION} --query "cluster.resourcesVpcConfig.vpcId" --output text)
```

set your EKS cluster name as an environment variable:

```bash
export CLUSTER_NAME=fargate-quickstart
```

  </TabItem>
    <TabItem value="Managed node group(EC2) Cluster" label="Managed node group(EC2) Cluster" default>

```bash
cd python-fastapi-demo-docker
export CLUSTER_VPC=$(aws eks describe-cluster --name managednode-quickstart --region ${AWS_REGION} --query "cluster.resourcesVpcConfig.vpcId" --output text)
```

set your EKS cluster name as an environment variable:

```bash
export CLUSTER_NAME=managednode-quickstart
```

  </TabItem>
</Tabs>



## 2. Verify the Service Account
First, we need to make sure the "aws-load-balancer-controller" service account is correctly set up in the "kube-system" namespace in our cluster.

Run the following command:
```bash
kubectl get sa aws-load-balancer-controller -n kube-system -o yaml
```
The expected output should look like this:
```bash
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::985866617021:role/eksctl-fargate-quickstart-addon-iamserviceac-Role1-J2T54L9SG5L0
  creationTimestamp: "2023-05-30T23:09:32Z"
  labels:
    app.kubernetes.io/managed-by: eksctl
  name: aws-load-balancer-controller
  namespace: kube-system
  resourceVersion: "2102"
  uid: 2086b1c0-de23-4386-ae20-19d51b7db4a1
```

## 3. Deploy Custom Resource Definitions (CRDs)
For the AWS Load Balancer controller to create a load balancer and define the TargetGroupBinding object, we need to create some Custom Resource Definitions (CRDs).

Add the EKS chart repository to Helm:
```bash
helm repo add eks https://aws.github.io/eks-charts
```

Install the CRDs for the AWS Load Balancer controller:
```bash
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"
```
The expected output should look like this:
```bash
customresourcedefinition.apiextensions.k8s.io/ingressclassparams.elbv2.k8s.aws configured
customresourcedefinition.apiextensions.k8s.io/targetgroupbindings.elbv2.k8s.aws configured
```

## 4. Updating Your Helm Repos
Next, update the repositories to ensure Helm is aware of the latest versions of the charts:
```bash
helm repo update
```

## 5. Deploy the Load Balancer Controller
To install the AWS Load Balancer Controller in the "kube-system" namespace of the EKS cluster, run the following Helm command, replacing region with your specific region:
```bash
helm upgrade -i aws-load-balancer-controller eks/aws-load-balancer-controller \
    --set clusterName=${CLUSTER_NAME} \
    --set serviceAccount.create=false \
    --set region=${AWS_REGION} \
    --set vpcId=${CLUSTER_VPC} \
    --set serviceAccount.name=aws-load-balancer-controller \
    -n kube-system
```

You should receive an output confirming the successful installation of the AWS Load Balancer Controller (LBC):
```bash
NAME: aws-load-balancer-controller
LAST DEPLOYED: Sat May 11 01:21:04 2023
NAMESPACE: kube-system
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
AWS Load Balancer controller installed!
```

To list installed helm releases run the following

```bash
helm list -A
```

You should receive simillar output:

```bash
NAME                        	NAMESPACE  	REVISION	UPDATED                             	STATUS  	CHART                             	APP VERSION
aws-load-balancer-controller	kube-system	1       	2023-09-11 00:31:57.585623 -0400 EDT	deployed	aws-load-balancer-controller-1.6.0	v2.6.0
```