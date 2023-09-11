---
title: Deploying FastAPI and PostgreSQL Microservices to EKS
sidebar_position: 10
---
## Objective

Cleaning up created EKS and ECR resources.

## Prerequisites

- [Configuring the Shell Environment](../../intro/python/environment-setup#2-configuring-the-shell-environment)
- [Creating the .env File](../../intro/python/environment-setup#4-creating-the-env-file)
- [Importing environment variables](../../intro/python/environment-setup#5-import-environment-variables)

## Cleanup

To clean up EKS and ECR resources run the following command.

```bash
cd python-fastapi-demo-docker
aws ecr delete-repository --repository-name fastapi-microservices --force
kubectl delete -f eks/deploy-db-python.yaml
kubectl delete -f eks/deploy-app-python.yaml
kubectl delete pdb coredns ebs-csi-controller -n kube-system
eksctl delete cluster -f eks/create-mng-python.yaml
```