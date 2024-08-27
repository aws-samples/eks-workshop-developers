---
title: Amazon Elastic Kubernetes Service (EKS)
sidebar_position: 200
---
In this chapter, we'll learn how to create an Amazon EKS cluster and deploy our containerized applications to it.

## Terms
Amazon Elastic Kubernetes Service (Amazon EKS) is a fully managed service that makes it easy to run Kubernetes on AWS without the need to manage the Kubernetes control plane or the worker nodes. With Amazon EKS, you can run Kubernetes applications on AWS without the need to operate your own Kubernetes control plane or worker nodes.

Amazon EKS supports multiple cluster types, including self-managed nodes, managed node groups, and Fargate clusters. The choice of cluster type depends on the level of control you require over the underlying infrastructure and the ease of management.

- A **self-managed node** cluster is a traditional Kubernetes cluster, where the worker nodes are EC2 instances that are managed by the user. With self-managed nodes, you have full control over the EC2 instances and the Kubernetes worker nodes, including the ability to use custom Amazon Machine Images (AMIs), use EC2 Spot instances to reduce costs, and use auto-scaling groups to adjust the number of nodes based on demand.
- **Managed node groups** are a managed worker node option that simplifies the deployment and management of worker nodes in your EKS cluster. With managed node groups, you can launch a group of worker nodes with the desired configuration, including instance type, AMI, and security groups. The managed node group will automatically manage the scaling, patching, and lifecycle of the worker nodes, simplifying the operation of the EKS cluster.
- **Fargate** clusters are another managed worker node option that abstracts away the underlying infrastructure, allowing you to run Kubernetes pods without managing the worker nodes. With Fargate clusters, you can launch pods directly on Fargate without the need for EC2 instances. Fargate clusters simplify the operation of the EKS cluster by abstracting away the worker nodes, allowing you to focus on the applications running in the Kubernetes cluster.
