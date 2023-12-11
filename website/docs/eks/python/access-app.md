---
title: Accessing the FastAPI App
sidebar_position: 10
---
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This guide aims to guide you through the process of accessing your microservices deployed onto EKS cluster. By using ingress object we were able to expose FastAPI service through Application Loadbalancer. The Management of Application Loadbalancer is done by AWS Loadbalancer controller through ingress manifest.

## Prerequisites

- [Deploying FastAPI and PostgreSQL Microservices to EKS](./deploy-app.md)

<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the `python-fastapi-demo-docker` directory where their environment variables are sourced.-->
<GetEnvVars />

## 1. Checking the Status of Pods

Before we try to access our application, we need to ensure that all of our pods are running correctly. To check the status of all pods, run the following command:

```bash
kubectl get pods -n my-cool-app
```

All your pods should be in the "Running" state. If they're not, you will need to troubleshoot the deployment before proceeding.

## 2. Getting the ALB URL

Run the following command to get the ALB URL:

```bash
kubectl get ingress -n my-cool-app
```

The expected output should look like this:

```bash
NAME              CLASS    HOSTS   ADDRESS                                                                  PORTS   AGE
fastapi-ingress   <none>   *       k8s-mycoolap-fastapii-8114c40e9c-860636650.us-west-2.elb.amazonaws.com   80      3m17s
```

## 3. Accessing the FastAPI Service

In the previous lab exercise, we used the AWS Load Balancer Controller (LBC) to dynamically provision an [Application Load Balancer (ALB)](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html). Note that it takes several minutes or more before the ALB has finished provisioning. 

1. **Check the status**: Open the [Load Balancers](https://console.aws.amazon.com/ec2/#LoadBalancers:) page on the Amazon EC2 console and select the AWS Region in which your Amazon EKS cluster resides. Next, select your ALB name, such as `k8s-mycoolap-fastapii-8004c40e9c`.
2. **Open the app**: Open a new tab in your browser paste the ALB link, such as `k8s-mycoolap-fastapii-8114c40e9c-860636650.us-west-2.elb.amazonaws.com`. You should see the welcome page:

![](./images/app-home.png)

## 4. Verifying the Setup by Adding a Book

To confirm that everything is functioning as expected, attempt to add a book by selecting the **Create a book** option.

![](./images/app-create-book.png)

## Conclusion

This guide has walked you through the steps necessary to access the FastAPI service deployed on an EKS cluster. We've shown you how to check the status of your pods and verify your setup by interacting with the FastAPI service.