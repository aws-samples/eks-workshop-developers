---
title: Cleanup
sidebar_position: 99
---
## Objective

Cleaning up created EKS and ECR resources.

## Initial Setup

Navigate to the root directory of the 'python-fastapi-demo-docker' project where your [environment variables are sourced](../../intro/python/environment-setup):

```bash
cd python-fastapi-demo-docker
```

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