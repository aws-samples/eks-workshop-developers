---
title: Workshop Overview
sidebar_position: 1
---

Welcome to the Python workshop! We'll embark on an end-to-end journey with the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project, a Python-based application developed with FastAPI and PostgreSQL as the database. This workshop will guide you from the fundamentals of containerization, Kubernetes, and finally to deploying the application on Amazon Web Services (AWS).

## About This Workshop
This workshop dives into the unique aspects of both stateless and stateful applications within the project, broken down into three key sections:

- **[Containers](containers/containers.md)**: This chapter shows you how to containerize applications using Docker and deploy a multi-architecture container image to [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/). 
- **[Kubernetes](kubernetes/kubernetes.md)**: This chapter shows you how deploy your containerized application to a local Kubernetes cluster, providing an introduction into essential Kubernetes concepts such as service definitions, deployments, and secrets.
- **[Amazon EKS](eks/eks.md)**: This chapter shows you how to deploy your containerized application stored in Amazon ECR onto an [Amazon EKS](https://aws.amazon.com/eks/) cluster, exploring use-case specific cluster set-up and integration with other AWS services. 

## Stateful and Stateless Microservices Use Case
The [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) serves as a practical case study throughout this workshop. It uses [FastAPI](https://fastapi.tiangolo.com/lo/), an asynchronous Python web framework, and employs a [PostgreSQL](https://www.postgresql.org/) database for persistent data storage.

- **FastAPI Application (Web Service)**: This stateless component serves as the primary application layer. Leveraging the FastAPI framework, this Python-based web service enables the rapid construction of APIs while maintaining top-notch performance. It offers robust data validation, serialization, and documentation via its integral [OpenAPI](https://swagger.io/specification/) support. Despite being stateless, it can process requests and return responses without preserving any data, thereby enhancing scalability and resilience.
- **PostgreSQL Database (DB Service)**: Representing the stateful element of the project, this service employs the official PostgreSQL image from Docker Hub. Known for its robustness, reliability, and performance, PostgreSQL is an open-source object-relational database system that is responsible for data persistence in the project. This statefulness enables the application's data to be stored, accessed, and modified over time.
 
