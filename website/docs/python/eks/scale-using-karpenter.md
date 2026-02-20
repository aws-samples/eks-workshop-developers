---
title: Managing Worker Node Scaling with Karpenter
sidebar_position: 14
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';
import GetECRURI from '../../../src/includes/get-ecr-uri.md';

## Objective

In this Lab, we will first explain the concepts of Karpenter, followed by hands-on exercises to try the following:

- When Pod replicas are increased, necessary worker nodes are provisioned, and when Pod replicas are decreased, unnecessary nodes are deprovisioned
- Worker node instances are cost-optimized through Consolidation, one of Karpenter's key features

## Prerequisites

* [Deploying FastAPI and PostgreSQL Microservices to EKS](./deploy-app.md)

<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the 'python-fastapi-demo-docker' directory where their environment variables are sourced.-->
<GetEnvVars />

---

## 1. Understanding the Concepts

Karpenter is a flexible, high-performance open-source Kubernetes cluster autoscaler built by AWS. While the traditional Kubernetes Cluster Autoscaler (CAS) adjusted the number of worker nodes using EC2 Auto Scaling groups, Karpenter is characterized by its speed and flexibility as it directly launches appropriate EC2 instances as needed, rather than manipulating EC2 Auto Scaling groups. Note that EKS Auto Mode includes a fully managed Karpenter as one of its feature suites, so installation is not required.

Karpenter uses the following Custom Resource Definitions (CRDs) to configure its behavior:

- NodePool  
  This CRD allows you to configure what kind of nodes you want to launch.
  - Node requirements (architecture, OS, instance types, etc.)
  - Resource limits
  - Scaling behavior
  - Node lifecycle management
- EC2NodeClass/NodeClass  
  This CRD defines the node configuration itself and AWS-specific information. For example, it configures kubelet settings, roles, subnets, etc. In EKS Auto Mode, NodeClass is used instead of EC2NodeClass.
- NodeClaim  
  This CRD is created by Karpenter and is not created manually. It represents the request for nodes that will actually be launched. EC2 instances are launched based on this.

To learn more, see [Concepts | Karpenter](https://karpenter.sh/docs/concepts/) in Karpenter documentation.

## 2. Installing Karpenter


<Tabs>
  <TabItem value="EKS Auto Mode" label="EKS Auto Mode" default>

  EKS Auto Mode does not require Karpenter installation. Additionally, since NodePools are pre-configured in EKS Auto Mode, you can use them without creating additional NodePools.

  ```bash
  kubectl get NodePool
  NAME              NODECLASS   NODES   READY   AGE
  general-purpose   default     1       True    21h
  system            default     1       True    21h
  ```

  However, in this Lab, we will create and use a custom NodePool to more clearly understand the functionality. The custom ModePool manifest is [eks/karpenter/nodepool.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/karpenter/nodepool.yaml).

  Create with the following command:

  ```bash
  kubectl apply -f eks/karpenter/nodepool.yaml
  ```

  The expected output should look like this:

  ```bash
  nodepool.karpenter.sh/developrs-workshop-pool created
  ```

  </TabItem>
  <TabItem value="Managed Node Groups" label="Managed Node Groups">

  When using managed node groups, you need to install the Karpenter add-on. In this lab, we will use eksctl due to its ease of installation. Currently, eksctl only supports adding the Karpenter add-on during cluster creation. To learn more, see [Karpenter Support - eksctl](https://eksctl.io/usage/eksctl-karpenter/) in eksctl documentation.
  Therefore, we will create a new cluster using eksctl. The cluster config file is located at [eks/karpenter/create-mng-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/eks/karpenter/create-mng-python.yaml). Please modify the region setting as appropriate.

  ```bash
  metadata:
    (snip)
    # region: The AWS region where your EKS cluster will be created.
    region: us-west-2
  ```

  Just in case, logout of helm registry to perform an unauthenticated pull against the public ECR:

  ```
  helm registry logout public.ecr.aws
  ```

  The expected output should look like this:

  ```bash
  Removing login credentials for public.ecr.aws
  ```

  Execute the following command to create an EKS cluster named 'managednode-quickstart-karpenter':

  ```bash
  eksctl create cluster -f eks/karpenter/create-mng-python.yaml
  ```

  The expected output should look like this:

  ```bash
  2025-08-12 22:45:53 [✔]  EKS cluster "managednode-quickstart-karpenter" in "us-east-1" region is ready
  ```

  Add the necessary permissions to the IAM role 'eksctl-managednode-quickstart-karpenter-iamservice-role', which is automatically created for the Karpenter Pod. First, create a JSON file for the policy:

  ```bash
  $ cat > karpenter-role-policy.json << EOF
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": "eks:DescribeCluster",
              "Resource": "arn:aws:eks:*:*:cluster/managednode-quickstart-karpenter"
          },
          {
              "Effect": "Allow",
              "Action": "iam:RemoveRoleFromInstanceProfile",
              "Resource": "*"
          }
      ]
  }
  EOF
  ```

  If successful, no output will be displayed.
  Next, add this as an inline policy to the IAM role 'eksctl-managednode-quickstart-karpenter-iamservice-role':

  ```bash
  aws iam put-role-policy --role-name eksctl-managednode-quickstart-karpenter-iamservice-role --policy-name karpeneter-additional-policy --policy-document file://karpenter-role-policy.json
  ```

  If successful, no output will be displayed.

  Next, create the NodePool and EC2NodeClass.

  ```bash
  kubectl apply -f eks/karpenter/ec2nodeclass.yaml
  kubectl apply -f eks/karpenter/nodepool-mng.yaml
  ```

  The expected each output should look like this:

  ``` bash
  ec2nodeclass.karpenter.k8s.aws/default created
  nodepool.karpenter.sh/developrs-workshop-pool created
  ```

  Since we have created a new cluster, we need to recreate the necessary resources:

  ```bash
  kubectl create ns my-cool-app
  kubectl apply -f eks/sc.yaml
  kubectl create secret generic fastapi-secret --from-env-file=.env -n my-cool-app
  kubectl create configmap db-init-script --from-file=init.sh=server/db/init.sh -n my-cool-app
  ```

  The expected each output should look like this:

  ```bash
  namespace/my-cool-app created
  storageclass.storage.k8s.io/ebs-sc created
  secret/fastapi-secret created
  configmap/db-init-script created
  ```

  To learn more about how to install, see [Getting Started with Karpenter | Karpenter](https://karpenter.sh/docs/getting-started/getting-started-with-karpenter/) in Karpenter documentation.

  </TabItem>
</Tabs>

Additionally, in this Lab, we will install and use eks-node-viewer to better visualize worker nodes. This tool makes it easy to monitor the status and utilization of worker nodes.

<Tabs>
  <TabItem value="Mac (Homebrew)" label="Mac (Homebrew)" default>

  Install the eks-node-viewer:

  ```bash
  brew tap aws/tap
  brew install eks-node-viewer
  ```

  The expected output should look like this:

  ```bash
  ==> Fetching downloads for: eks-node-viewer
  ==> Fetching aws/tap/eks-node-viewer
  ==> Downloading https://github.com/awslabs/eks-node-viewer/releases/download/v0.7.4/eks-node-viewer_Darwin_all
  ==> Downloading from https://release-assets.githubusercontent.com/github-production-release-asset/575555632/3c568f24-b0e6-42f6-9c73-f208a106f94f?sp=r&sv=2018-11-09&sr=b&spr=https&se=2025-08-12T22%3A13%3A41Z&rscd=attachment%3B+filename%3Deks-node-viewer_Darwin_all
  ######################################################################################################################################################################################################################################################### 100.0%
  ==> Installing eks-node-viewer from aws/tap
  🍺  /opt/homebrew/Cellar/eks-node-viewer/0.7.4: 4 files, 136.0MB, built in 4 seconds
  ==> Running `brew cleanup eks-node-viewer`...
  Disable this behaviour by setting `HOMEBREW_NO_INSTALL_CLEANUP=1`.
  Hide these hints with `HOMEBREW_NO_ENV_HINTS=1` (see `man brew`).
  ==> No outdated dependents to upgrade!
  ```

  </TabItem>
  <TabItem value="Manual" label="Manual">

  Install the eks-node-viewer:

  ```bash
  go install github.com/awslabs/eks-node-viewer/cmd/eks-node-viewer@latest
  ```

  If the command succeeds, nothing is output.

  </TabItem>
</Tabs>

If any issues arise, for troubleshooting purposes, see [GitHub - awslabs/eks-node-viewer: EKS Node Viewer](https://github.com/awslabs/eks-node-viewer) README.md.

## 3. Trying Scaling Up/Down

First, let's deploy an application for testing. We'll start by deploying the DB application Pod:

```bash
kubectl apply -f eks/deploy-db-python.yaml
```

The expected output should look like this:

```bash
service/db created
statefulset.apps/fastapi-postgres created
```

Next, let's deploy the Web application Pod:

```bash
kubectl apply -f eks/karpenter/deploy-app-python.yaml
```

The expected output should look like this:

```bash
deployment.apps/fastapi-deployment created
```

After deployment, verify that the Pods have started normally. Run the following command and confirm that the READY column matches:

```bash
kubectl get po -n my-cool-app -o wide
```

The expected output should look like this:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE     IP               NODE                  NOMINATED NODE   READINESS GATES
fastapi-deployment-6f69d7cf44-9wxpr   1/1     Running   0          118s    192.168.65.192   i-0123456789abcdef0   <none>           <none>
fastapi-postgres-0                    1/1     Running   0          2m38s   192.168.115.80   i-0123456789abcdef1   <none>           <none>
```

Next, use another terminal to launch eks-node-viewer:

```bash
eks-node-viewer --node-selector workload-type=developers-workshop
```

The expected output should look like this:

```bash
1 nodes (      200m/1780m) 11.2% cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ $0.042/hour | $30.740/month
4 pods (0 pending 4 running 4 bound)

i-0123456789abcdef0 cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11% (1 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
```

You can confirm that one worker node is running with one Pod running on it.

Now, let's scale up the ReplicaSet of Deployment fastapi-deployment:

```bash
kubectl scale deploy -n my-cool-app fastapi-deployment --replicas=9
```

The expected output should look like this:

```bash
deployment.apps/fastapi-deployment scaled
```

After waiting a moment, check eks-node-viewer. As shown below, because one worker node ran out of capacity to start Pods, Karpenter provisions a new worker node. You can confirm that the Pods that couldn't be scheduled on the existing worker node are now running on the new worker node.

:::note

Please note that the actual placement of Pods on worker nodes may differ from the results shown below. Additionally, the following results are for EKS Auto Mode. In the case of Managed Node Groups, be aware that Pods from DaemonSets such as aws-node, ebs-csi-node, and kube-proxy will be present on the worker nodes.

:::


```bash
2 nodes (     1800m/3560m) 50.6% cpu ████████████████████░░░░░░░░░░░░░░░░░░░░ $0.084/hour | $61.481/month
12 pods (0 pending 12 running 12 bound)

i-0123456789abcdef0 cpu ███████████████████████████████░░░░  90% (8 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
i-0123456789abcdef2 cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11% (1 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
```

Conversely, let's scale down the Deployment's ReplicaSet with the following command:

```bash
kubectl scale deploy -n my-cool-app fastapi-deployment --replicas=1
```

The expected output should look like this:

```bash
deployment.apps/fastapi-deployment scaled
```

In eks-node-viewer, you can confirm that Karpenter has removed the Pods that were running on the old worker node.

```bash
2 nodes (      200m/3560m) 5.6% cpu ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ $0.084/hour | $61.481/month
4 pods (0 pending 4 running 4 bound)

i-0123456789abcdef0 cpu ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
i-0123456789abcdef2 cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11% (1 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
```

After a while, you can confirm that Karpenter removes the empty worker node. This is because the empty worker node was disrupted by Karpenter's Consolidation feature.

```bash
1 nodes (      200m/1780m) 11.2% cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ $0.042/hour | $30.740/month
4 pods (0 pending 4 running 4 bound)

i-0123456789abcdef2 cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11% (1 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
```

## 4. Trying Consolidation Feature

Consolidation is one of many useful features of Karpenter. In this Lab, we're using the same values as Karpenter's defaults, where Karpenter automatically performs worker node deletion or replacement when nodes are empty or underutilized. In this section, we'll also verify the behavior when utilization is low.

```yaml
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized
    consolidateAfter: 0s
```

Karpenter will delete a worker node if all Pods can run using the available capacity of other worker nodes. Additionally, it will replace nodes if all Pods can run using a combination of available capacity on other worker nodes and one lower-cost alternative worker node.

First, let's scale up:

```bash
kubectl scale deploy -n my-cool-app fastapi-deployment --replicas=9
```

The expected output should look like this:

```bash
deployment.apps/fastapi-deployment scaled
```

In eks-node-viewer, you can confirm that Karpenter has provisioned new worker nodes as shown below.

```bash
2 nodes (     1800m/3560m) 50.6% cpu ████████████████████░░░░░░░░░░░░░░░░░░░░ $0.084/hour | $61.481/month
12 pods (0 pending 12 running 12 bound)

i-0123456789abcdef2 cpu ███████████████████████████████░░░░  90% (8 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
i-0123456789abcdef3 cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11% (1 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
```

Next, let's decrease the number of replicas by one:

```bash
kubectl scale deploy -n my-cool-app fastapi-deployment --replicas=8
```

The expected output should look like this:

```bash
deployment.apps/fastapi-deployment scaled
```

As a result, one of the worker nodes now has enough available capacity to run all 8 Pods:

```bash
2 nodes (     1600m/3560m) 44.9% cpu ██████████████████░░░░░░░░░░░░░░░░░░░░░░ $0.084/hour | $61.481/month
11 pods (0 pending 11 running 11 bound)

i-0123456789abcdef2 cpu ████████████████████████████░░░░░░░  79% (7 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
i-0123456789abcdef3 cpu ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11% (1 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
```

Consequently, Karpenter determines that one worker node is unnecessary and disrupts it.

```bash
2 nodes (     1600m/3560m) 44.9% cpu ██████████████████░░░░░░░░░░░░░░░░░░░░░░ $0.084/hour | $61.481/month
11 pods (0 pending 11 running 11 bound)

i-0123456789abcdef2 cpu ███████████████████████████████░░░░  90% (8 pods) t3a.medium/$0.0421 On-Demand/Auto -        Ready -
i-0123456789abcdef3 cpu ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0 pods) t3a.medium/$0.0421 On-Demand/Auto Deleting Ready -
```

```bash
1 nodes (     1600m/1780m) 89.9% cpu ████████████████████████████████████░░░░ $0.042/hour | $30.740/month
11 pods (0 pending 11 running 11 bound)

i-0123456789abcdef2 cpu ███████████████████████████████░░░░  90% (8 pods) t3a.medium/$0.0421 On-Demand/Auto - Ready -
```

To learn more, see [Disruption | Karpenter](https://karpenter.sh/docs/concepts/disruption/#consolidation) in Karpenter documentation.

## 5. Clean Up Resources

To clean up all resources created in this lab exercise and the workshop up to this point, run the following commands.

<Tabs>
 <TabItem value="EKS Auto Mode" label="EKS Auto Mode" default>
  ``` bash
  cd /home/ec2-user/environment/python-fastapi-demo-docker
  kubectl delete -f eks/deploy-db-python.yaml
  kubectl delete -f eks/karpenter/deploy-app-python.yaml
  kubectl delete -f eks/karpenter/nodepool.yaml
  ```
 </TabItem>
 <TabItem value="Managed Node Groups" label="Managed Node Groups">

  ``` bash
  cd /home/ec2-user/environment/python-fastapi-demo-docker
  eksctl delete cluster -f eks/karpenter/create-mng-python.yaml
  ```

</TabItem>
</Tabs>

## Conclusion

In this lab, we first understood the concepts of Karpenter, and then practically tested scaling up and down. The scale-down behavior was achieved through Consolidation, one of Karpenter's features, which we examined in more detail.
Additionally, Karpenter can perform autoscaling when used in conjunction with the Horizontal Pod Autoscaler.
