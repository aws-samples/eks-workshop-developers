---
title: Introduction to Kubernetes
sidebar_position: 301
---
## Overview
This chapter provides a basic introduction to how Kubernetes manages applications within its environment. It delves into Kubernetes objects for different use cases and deployments on a local cluster, such as Deployments, Services, Secrets, and PersistentVolumeClaims, all integral to state, networking, and access management. 

## Objective
This guide aims to expose you to Kubernetes' core components and functionalities. Its primary objective is to equip you with knowledge of the basic components of a Kubernetes environment.

## Terms
Kubernetes is an open-source container orchestration platform used to manage containerized applications. At a high level, Kubernetes consists of two main components: the Control Plane and Data Plane.

### Control Plane
The **control plane** manages the Kubernetes cluster by maintaining the desired state of the system. It includes the following components:

- **API Server**: The API server is the front-end for the Kubernetes Control Plane. It handles and validates requests, and stores data in the etcd database.
- **etcd**: etcd is a distributed key-value store used by Kubernetes to store configuration data.
- **Controller Manager**: The Controller Manager is responsible for running controllers that regulate the state of the cluster.
- **Scheduler**: The Scheduler assigns new workloads to nodes based on available resources and workload constraints.

### Data Plane
The **data plane** consists of nodes, which act as the worker machines that run the containerized applications. Each node runs a set of components that communicate with the Control Plane to maintain the desired state of the system. The main components running on a node are:

- **kubelet**: The kubelet is responsible for managing the state of the node, including starting, stopping, and maintaining the containers on the node.
- **kube-proxy**: The kube-proxy is responsible for network communication between services and pods in the cluster.
- **Container Runtime**: The container runtime is responsible for pulling the container images from a registry and running them on the node.

## Tools
Before you begin, make sure you've completed the following:

* [Install minikube](https://minikube.sigs.k8s.io/docs/start/)
* [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
