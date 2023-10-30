---
title: Creating a Kubernetes Cluster with Minikube
sidebar_position: 2
---
## Objective
minikube is a tool that allows you to run Kubernetes locally. It creates a single-node or multi-node Kubernetes cluster inside a Virtual Machine (VM) on your local machine. The goal of this lab is to guide you in starting a local Kubernetes cluster using minikube and then creating a new namespace. This lays the groundwork for subsequent lab exercises.

## Prerequisites
- [Building and Running Multi-Architecture Containers](../../containers/python/multiarchitecture-image.md)

## Initial Setup
Navigate to the root directory of the 'python-fastapi-demo-docker' project where your [environment variables are sourced](../../introduction/python/environment-setup):
```bash
cd python-fastapi-demo-docker
```
## 1. Starting Minikube
Before we can deploy applications to Kubernetes, we need to have a running Kubernetes cluster. minikube allows us to create a local Kubernetes cluster, which is suitable for development and testing.

To start your minikube cluster, run the following command in your terminal:
```
minikube start
```
The expected output should look like this:
```bash
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

## 2. Create a Namespace
Namespaces in Kubernetes serve as a mechanism for dividing cluster resources between multiple users, applications, or environments. Creating separate namespaces for different applications or environments (e.g., development, staging, production) is a common practice. In our case, we are creating a namespace named my-cool-app to hold all the resources related to our application. 

To create the "my-cool-app" namespace, use the following command:
```bash
kubectl create namespace my-cool-app
```
The expected output should look like this:
```bash
namespace/my-cool-app created
```

## Conclusion
In this tutorial, we've introduced you to the basics of setting up a local Kubernetes development environment using minikube and the concept of Kubernetes namespaces. 