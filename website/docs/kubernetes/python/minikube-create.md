---
title: Creating a Kubernetes Cluster with Minikube
sidebar_position: 2
---
## Overview
minikube is a tool that allows you to run Kubernetes locally. It creates a single-node or multi-node Kubernetes cluster inside a Virtual Machine (VM) on your local machine. This tutorial demonstrates how to start a Minikube cluster and create a new Kubernetes namespace, which provide a way to divide cluster resources among multiple users, applications, or application environments.

## Prerequisites
- [Building and Running Multi-Architecture Containers](../../containers/python/multiarchitecture-image.md)
- [Install minikube](https://minikube.sigs.k8s.io/docs/start/)
## Objective
The goal of this tutorial is to guide you in starting a local Kubernetes cluster using minikube and then creating a new namespace. This lays the groundwork for developing, testing, and managing applications on Kubernetes without needing a full-scale Kubernetes cluster. 

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