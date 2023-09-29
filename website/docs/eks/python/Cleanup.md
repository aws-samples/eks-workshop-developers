---
title: Cleanup
sidebar_position: 99
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



## Objective

This guide shows you how to delete all of the resources you created in this workshop.

## Initial Setup

Navigate to the root directory of the `python-fastapi-demo-docker` project where your [environment variables]((../../intro/python/environment-setup#2-configuring-the-shell-environment)) are sourced:

```bash
cd python-fastapi-demo-docker
```

## Cleanup

To avoid incurring future charges, you should delete the resources created during this workshop.

<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

1. Retrieve the EFS ID (e.g., `fs-040f4681791902287`) you configured in the [previous lab exercise](setupstorage.md), then replace the sample value in [eks/efs-pv.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/efs-pv.yaml) with your EFS ID.
```bash
echo $file_system_id
```

2. Run the following commands to delete all resources created in this workshop.
```bash
# Delete the ECR repository
aws ecr delete-repository --repository-name fastapi-microservices --force

# Delete FastAPI services
kubectl delete -f eks/deploy-app-python.yaml

# Delete PostgreSQL services
kubectl delete -f eks/deploy-db-python-fargate.yaml

# Delete the Persistent Volume Claim (PVC)
kubectl delete pvc postgres-data-fastapi-postgres-0 -n my-cool-app

# Delete the Persistent Volume (PV)
kubectl delete -f eks/efs-pv.yaml

# Delete the Storage Class
kubectl delete -f eks/efs-sc.yaml

# Delete all mount targets associated with your EFS file system
for mount_target_id in $(aws efs describe-mount-targets --file-system-id $file_system_id --output text --query 'MountTargets[*].MountTargetId'); do
  aws efs delete-mount-target --mount-target-id "$mount_target_id"
done

# Delete the cluster
eksctl delete cluster -f eks/create-fargate-python.yaml
```

  </TabItem>
  <TabItem value="Managed node" label="Managed node">

```bash
# Delete the ECR repository
aws ecr delete-repository --repository-name fastapi-microservices --force

# Delete FastAPI services
kubectl delete -f eks/deploy-app-python.yaml

# Delete PostgreSQL services
kubectl delete -f eks/deploy-db-python.yaml

# Delete PodDisruptionBudgets for 'coredns' and 'ebs-csi-controller'
kubectl delete pdb coredns ebs-csi-controller -n kube-system

# Delete the cluster
eksctl delete cluster -f eks/create-mng-python.yaml
```
  </TabItem>
</Tabs>