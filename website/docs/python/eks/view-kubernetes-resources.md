---
title: Viewing Kubernetes Resources Using the EKS Console
sidebar_position: 10
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Objective

This lab shows you how to view Kubernetes resources such as Pods, Services, and Nodes using the EKS console. With EKS, there is no need to deploy and manage a Kubernetes Dashboard Pod in order to view Kubernetes resources. To use this EKS console feature, the IAM principal logged into the EKS console must have the required permissions to access the EKS cluster. 

Of course, it's also possible to use the Kubernetes Dashboard instead of the EKS console. If you use Kubernetes Dashboard, please check the [kubernetes/dashboard: General-purpose web UI for Kubernetes clusters](https://github.com/kubernetes/dashboard) in the GitHub for installation instructions. You can also refer to [Monitoring Kubernetes Resources Using the Dashboard](http://localhost:3000/docs/python/kubernetes/kubernetes-dashboard) page for operation methods.

## Prerequisites

- [Accessing the FastAPI App](./access-app.md)

## 1. Checking IAM permissions for the IAM principal logging into the EKS console

**Use the tabs below to see the steps for the specific environment where you are running this lab.**

<Tabs>
  <TabItem value="AWS Workshop Studio" label="AWS Workshop Studio" default>

You can access the EKS Console from the AWS Workshop Studio session. 

The IAM role used by Workshop Studio is the same IAM role that was initially configured in VS Code environment and it was used to create the EKS cluster. This role is the creator of the cluster and it already has the required permissions.

Next, skip to step '[4. View Kubernetes resources](#4-viewing-your-kubernetes-resources)' 

</TabItem>
  <TabItem value="Local Computer" label="Local Computer" default>

Make sure that the IAM principal you are using to log into the EKS console has the required permissions according to [View Kubernetes resources](https://docs.aws.amazon.com/eks/latest/userguide/view-kubernetes-resources.html#view-kubernetes-resources-permissions) in EKS documentation. If any permissions are missing, add them. Once the necessary permissions have been added, proceed to the next step.


</TabItem>


</Tabs>

## 2. Creating Kubernetes RBAC resources


:::caution

If the IAM principal logged into the EKS console is the creator of the EKS cluster, skip this step and proceed to step '[4. View Kubernetes resources](#4-viewing-your-kubernetes-resources)'. This is because this IAM principal already has the necessary RBAC permissions.

:::


To view Kubernetes resources for all namespaces, create RBAC resources by applying the following manifest:

```bash
kubectl apply -f https://s3.us-west-2.amazonaws.com/amazon-eks/docs/eks-console-full-access.yaml
```

The expected output should look like this:

```bash
clusterrole.rbac.authorization.k8s.io/eks-console-dashboard-full-access-clusterrole created
clusterrolebinding.rbac.authorization.k8s.io/eks-console-dashboard-full-access-binding created
```

You can also view Kubernetes resources limited to a specific namespace. Refer to the EKS documentation for more details on creating RBAC bindings for a namespace.

## 3. Adding the IAM principal ARN to the `aws-auth` ConfigMap

:::caution

If the IAM principal logged into the EKS console is the creator of the EKS cluster, skip this step and proceed to step '[4. View Kubernetes resources](#4-viewing-your-kubernetes-resources)'. Performing this step by mistake will overwrite the original super-user permissions in the ConfigMap 'aws-auth', which can make the EKS cluster difficult to manage.

:::

**Optionally**, you can register an existing IAM principal ARN logged into the EKS console to the ConfigMap 'aws-auth' by running the following command. Make sure to substitute the sample value with your _existing_ IAM principal ARN as the value for the `--arn` argument:

<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

```bash
eksctl create iamidentitymapping \
    --cluster fargate-quickstart \
    --region $AWS_REGION \
    --arn arn:aws:iam::012345678901:role/my-console-viewer-role \
    --group eks-console-dashboard-full-access-group \
    --no-duplicate-arns
```

  </TabItem>
    <TabItem value="Managed Node Groups" label="Managed Node Groups" default>

```bash
eksctl create iamidentitymapping \
    --cluster managednode-quickstart \
    --region $AWS_REGION \
    --arn arn:aws:iam::012345678901:role/my-console-viewer-role \
    --group eks-console-dashboard-full-access-group \
    --no-duplicate-arns
```
  </TabItem>
</Tabs>

The expected output should look like this:

```bash
2023-11-10 10:11:50 [ℹ]  checking arn arn:aws:iam::012345678901:role/my-console-viewer-role against entries in the auth ConfigMap
2023-11-10 10:11:50 [ℹ]  adding identity "arn:aws:iam::012345678901:role/my-console-viewer-role" to auth ConfigMap
```

## 4. Viewing your Kubernetes resources

You can check your Kubernetes resources on the 'Resources' tab on the cluster details page in the EKS console. 

Note: The following examples use a Fargate cluster.

![kubernetes-resources-1](./images/kubernetes-resources-1.jpg)

### View the details of the Pod 'fastapi-deployment'

Select the 'Pods' in the 'Workloads' tree under the 'Resource Types', and click on the 'fastapi-deployment' Pod link in the red frame.

![kubernetes-resources-2](./images/kubernetes-resources-2.jpg)

As a result, you can check the details of the Pod's resource information. You can troubleshoot by checking the Events log. Also, in the case of Fargate Pods, you can check the compute resources provisioned from the 'CapacityProvisioned' annotation. In this example, it's '0.25 vCPU 0.5 GB'.

![kubernetes-resources-3](./images/kubernetes-resources-3.jpg)

### View the details of the Service 'fastapi-service'

Then, select the 'Services' in the 'Service and Networking' tree under the 'Resource Types' and click on the 'fastapi-service' service link in the red frame.

![kubernetes-resources-4](./images/kubernetes-resources-4.jpg)

As a result, you can check the Service's resource details. You can check the Event logs and see the Pods to which requests are routed in the 'Endpoints', and you can navigate to those Pods from these links.

![kubernetes-resources-5](./images/kubernetes-resources-5.jpg)
