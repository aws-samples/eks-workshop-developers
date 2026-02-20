---
title: Setting up the Application Load Balancer on the EKS Cluster
sidebar_position: 6
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This lab shows you how to prepare your cluster for using Application Load Balancers (ALB). When using Managed node groups, you need to install the [AWS Load Balancer Controller (LBC)](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) on your cluster, which enables the routing of external traffic to your Kubernetes services. We'll leverage the [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) we configured when we created our cluster, ensuring that the controller has the required permissions. However, if you're using EKS Auto Mode, this installation is not necessary as the functionality is built-in.

:::info

Classic Load Balancers are not supported for pods running on Fargate. Network Load Balancers are only supported when using the AWS Load Balancer Controller and IP target type mode.

:::

## Prerequisites
- [Managing Kubernetes Contexts in EKS Cluster](./manage-contexts.md)

<!--This is a shared file at src/includes/get-env-vars.md that reminds users to source their environment variables.-->
<GetEnvVars />

<Tabs>
  <TabItem value="EKS Auto Mode" label="EKS Auto Mode" default>

## 1. Creating IngressClass

IngressClass defines which Ingress controller manages the Ingress, while IngressClassParams defines the parameters that are commonly applied to Ingress resources.

Run the following command from the python-fastapi-demo-docker project directory to create the IngressClass and IngressClassParams:

``` bash
kubectl apply -f eks/ic-automode.yaml
```

The expected output should look like this:

```
ingressclass.networking.k8s.io/alb created
ingressclassparams.eks.amazonaws.com/alb created
```

</TabItem>


<TabItem value="Managed Node Groups" label="Managed Node Groups" default>



## 1. Set Environment Variables
Before we start setting up our EKS cluster, we need to set a couple environment variables.

Export the name of your EKS cluster and the VPC ID associated with your EKS cluster executing the following commands:

```bash
export CLUSTER_VPC=$(aws eks describe-cluster --name managednode-quickstart --region ${AWS_REGION} --query "cluster.resourcesVpcConfig.vpcId" --output text)
export CLUSTER_NAME=managednode-quickstart
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
    eks.amazonaws.com/role-arn: arn:aws:iam::012345678901:role/eksctl-fargate-quickstart-addon-iamserviceac-Role1-J2T54L9SG5L0
  creationTimestamp: "2025-06-21T05:09:27Z"
  labels:
    app.kubernetes.io/managed-by: eksctl
  name: aws-load-balancer-controller
  namespace: kube-system
  resourceVersion: "1406"
  uid: 28939c82-5ed9-4a82-9be7-f6c5606ae4ac
```

## 3. Add and Update EKS chart repository to Helm:

Add the EKS chart repository to Helm:

```bash
helm repo add eks https://aws.github.io/eks-charts
```

Update the repositories to ensure Helm is aware of the latest versions of the charts:

```bash
helm repo update
```

## 4. Deploy the Load Balancer Controller
To install the AWS Load Balancer Controller in the "kube-system" namespace of the EKS cluster, run the following Helm command, replacing region with your specific region:

:::note
If the below command fails with an error similar to `Error: INSTALLATION FAILED: cannot re-use a name that is still in use`, it means the AWS Load Balancer Controller is already installed. In this case, replace `helm install` with `helm upgrade -i` in the below command to ensure the latest version of the controller and Helm Chart.
:::

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
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
LAST DEPLOYED: Fri Jun 20 22:27:18 2025
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
NAME                        	NAMESPACE  	REVISION	UPDATED                             	STATUS  	CHART                              	APP VERSION
aws-load-balancer-controller	kube-system	1       	2025-06-20 22:27:18.048668 -0700 PDT	deployed	aws-load-balancer-controller-1.13.3	v2.13.3
```


## 5. Verifying IngressClass Installation

You can verify that the IngressClass was successfully installed when you deployed the AWS Load Balancer Controller using the following command:

``` bash
kubectl get ingressclasses
```

The expected output should look like this:

``` bash
NAME   CONTROLLER            PARAMETERS   AGE
alb    ingress.k8s.aws/alb   <none>       6m50s
```

  </TabItem>
</Tabs>
