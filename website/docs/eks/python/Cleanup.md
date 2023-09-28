---
title: Cleanup
sidebar_position: 99
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



## Objective

Cleaning up created EKS and ECR resources.

## Initial Setup

Navigate to the root directory of the `python-fastapi-demo-docker` project where your [environment variables]((../../intro/python/environment-setup#2-configuring-the-shell-environment)) are sourced:

```bash
cd python-fastapi-demo-docker
```

## Prerequisites

- [Configuring the Shell Environment](../../intro/python/environment-setup#2-configuring-the-shell-environment)
- [Creating the .env File](../../intro/python/environment-setup#4-creating-the-env-file)
- [Importing environment variables](../../intro/python/environment-setup#5-import-environment-variables)

## Cleanup

To clean up EKS and ECR resources run the following command.

<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

Make sure to replace EFS ID `fs-040f4681791902287` with your EFS ID created in [setup storage section](../../eks/python/setupstorage#creating-storage-class-and-persistent-volumes)
```bash
cd python-fastapi-demo-docker
aws ecr delete-repository --repository-name fastapi-microservices --force
kubectl delete -f eks/deploy-app-python.yaml
kubectl delete -f eks/deploy-db-python-fargate.yaml
kubectl delete pvc postgres-data-fastapi-postgres-0 -n my-cool-app
kubectl delete -f eks/efs-pv.yaml
kubectl delete -f eks/efs-sc.yaml
for mount_target_id in $(aws efs describe-mount-targets --file-system-id fs-040f4681791902287 --output text --query 'MountTargets[*].MountTargetId'); do
aws efs delete-mount-target --mount-target-id "$mount_target_id";done
eksctl delete cluster -f eks/create-fargate-python.yaml
```

  </TabItem>
  <TabItem value="Managed node" label="Managed node">

```bash
cd python-fastapi-demo-docker
aws ecr delete-repository --repository-name fastapi-microservices --force
kubectl delete -f eks/deploy-app-python.yaml
kubectl delete -f eks/deploy-db-python.yaml
kubectl delete pdb coredns ebs-csi-controller -n kube-system
eksctl delete cluster -f eks/create-mng-python.yaml
```
  </TabItem>
</Tabs>