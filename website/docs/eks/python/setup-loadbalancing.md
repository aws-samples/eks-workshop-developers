---
title: Setting up the AWS Application Load Balancer Controller (LBC) on the EKS Cluster
sidebar_position: 9
---
## Objective
This guide shows you how to set up the [AWS Load Balancer Controller (LBC)](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) on your cluster, which enables the routing of external traffic to your Kubernetes services. We'll leverage the [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) we configured when we created our cluster, ensuring that the controller has the required permissions.
!!! note
    Classic Load Balancers and Network Load Balancers are not supported on pods running on Fargate.

## 1. Set Environment Variables
Before we start setting up our EKS cluster, we need to set an environment variable for our cluster name and VPC. Optionally, you can add these to the `.env` file at the root of the 'fastapi-microservices' project directory.

From the 'fastapi-microservices' project directory, fetch the VPC ID associated with your EKS cluster and set an environment variable to that value:
```bash
cd fastapi-microservices
export CLUSTER_VPC=$(aws eks describe-cluster --name fargate-quickstart --region ${AWS_REGION} --query "cluster.resourcesVpcConfig.vpcId" --output text)
```

Fetch your EKS cluster name and set an environment variable:
```bash
export CLUSTER_NAME=$(eksctl get cluster --region ${AWS_REGION} | awk 'FNR == 2 {print $1}')
```

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

## 4. Deploy the Load Balancer Controller
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

## 5. Updating Your Helm Repos
Next, update the repositories to ensure Helm is aware of the latest versions of the charts:
```bash
helm repo update
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