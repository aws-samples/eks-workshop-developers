---
title: Containers
sidebar_position: 200
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview

This chapter introduces the process of containerizing an application, emphasizing the creation of multi-stage images compatible with Kubernetes. Subsequently, we'll show how to deploy these images to a private Amazon Elastic Container Registry (ECR) and manage them within a Kubernetes environment.

## Objective

This guide aims to introduce essential concepts and practices related to containerization. It focuses on familiarizing you with the benefits of containerization, the role of Amazon ECR as a container registry, the importance of multi-stage images for Kubernetes, and how Kubernetes uses containerization for efficient application deployment and management.

## Terms

Containerization is a method of running applications in isolated environments, each with its own resources.

- A **container image** is a self-contained, lightweight package holding everything necessary to run an application. It comprises a series of read-only layers, each layer signifying a modification to its predecessor. These images are stored in a container registry and can be deployed on any system supporting containerization.

- A **container** is a running instance of a container image, operating as a process on a host system. With its unique file system, network interface, and resource set, it's isolated from other containers and the host system. Containers are transient, capable of swift creation, commencement, halting, and deletion.

- A **container registry** is a centralized platform for storing, managing, and distributing container images. It acts as a repository, facilitating easy image access and retrieval across various hosts or environments. Container registries can be public or private, reflecting the organization's security needs. While public registries like Docker Hub allow unrestricted image upload and access, private ones like Amazon Elastic Container Registry (ECR) cater to enterprise applications.

## Services

- [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/)
