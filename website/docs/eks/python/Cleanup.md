---
title: Cleaning Up Resources
sidebar_position: 14
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This guide shows you how to delete all the resources you created in this workshop.

<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the 'python-fastapi-demo-docker' directory where their environment variables are sourced.-->
<GetEnvVars />

## Cleanup

To avoid incurring future charges, you should delete the resources you created during this workshop.

<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

1. Retrieve the EFS ID (e.g., `fs-040f4681791902287`) you configured in the [previous lab exercise](setup-storage.md), then replace the sample value in [eks/efs-pv.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/efs-pv.yaml) with your EFS ID.
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

<TabItem value="Managed Node Groups" label="Managed Node Groups">

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