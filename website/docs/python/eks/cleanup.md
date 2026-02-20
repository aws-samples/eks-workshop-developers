---
title: Cleaning Up Resources
sidebar_position: 15
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
  <TabItem value="EKS Auto Mode" label="EKS Auto Mode" default>

```bash
# Delete the ECR repository
aws ecr delete-repository --repository-name fastapi-microservices --force

# Delete FastAPI services
kubectl delete -f eks/deploy-app-python.yaml

# Delete PostgreSQL services
kubectl delete -f eks/deploy-db-python.yaml

# Delete the cluster
eksctl delete cluster -f eks/create-automode-python.yaml
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

# Delete the cluster
eksctl delete cluster -f eks/create-mng-python.yaml
```
  </TabItem>
</Tabs>
