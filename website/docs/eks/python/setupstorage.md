---
title: Setting up Scalable Storage in EKS
sidebar_position: 7
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="Fargate(EFS)" label="Fargate(EFS)" default>

## Objective

This lab shows you how to setup EFS on EKS Fargate Cluster. Curretly we can not use dynamic persistent volume provisioning with Fargate nodes. Hence we will need manually create EFS volume and Persistant Volume.

## Prerequisites
- [creating and importing .env file](../../intro/python/environment-setup)
- [Setting up the AWS Application Load Balancer Controller (LBC) on the EKS Cluster](./setup-loadbalancing.md)

## Create an Amazon EFS file system and Mount points.

1. Retrieve the VPC ID that your cluster is in and store it in a variable for use in a later step. Replace `fargate-quickstart` with your cluster name

   ```bash
   vpc_id=$(aws eks describe-cluster \
       --name fargate-quickstart \
       --region $AWS_REGION \
       --query "cluster.resourcesVpcConfig.vpcId" \
       --output text)
   ```

2. Retrieve the CIDR range for your cluster's VPC and store it in a variable for use in a later step. Replace `region-code` with the AWS Region that your cluster is in

   ```bash
   cidr_range=$(aws ec2 describe-vpcs \
       --vpc-ids $vpc_id \
       --query "Vpcs[].CidrBlock" \
       --output text \
       --region $AWS_REGION)
   ```

3. Create a security group with an inbound rule that allows inbound NFS traffic for your Amazon EFS mount points

   - Create a security group. Replace the *`example values`* with your own

      ```bash
      security_group_id=$(aws ec2 create-security-group \
      --group-name MyEfsSecurityGroup \
      --description "My EFS security group" \
      --vpc-id $vpc_id \
      --region $AWS_REGION \
      --output text)
      ```

   - Create an inbound rule that allows inbound NFS traffic from the CIDR for your cluster's VPC

      ```bash
      aws ec2 authorize-security-group-ingress \
      --group-id $security_group_id \
      --protocol tcp \
      --port 2049 \
      --region $AWS_REGION \
      --cidr $cidr_range
      ```

      expected output

      ```bash
        {
            "Return": true,
            "SecurityGroupRules": [
                {
                    "SecurityGroupRuleId": "sgr-0ad5de1c44ffce249",
                    "GroupId": "sg-01a4ec3c5d2f85c10",
                    "GroupOwnerId": "991242130495",
                    "IsEgress": false,
                    "IpProtocol": "tcp",
                    "FromPort": 2049,
                    "ToPort": 2049,
                    "CidrIpv4": "192.168.0.0/16"
                }
            ]
        }
      ```

:::note
To further restrict access to your file system, you can use the CIDR for your subnet instead of the VPC.
:::

4. Create an Amazon EFS file system for your Amazon EKS cluster

   - Create a file system.

      ```bash
      file_system_id=$(aws efs create-file-system \
      --region $AWS_REGION \
      --tags Key=Name,Value=fargate-quickstart-efs \
      --performance-mode generalPurpose \
      --query 'FileSystemId' \
      --output text)
      ```

   - Create mount targets
      - Determine the IP address of your cluster nodes.

         ```bash
         kubectl get nodes
         ```

         The example output is as follows.

         ```bash
         NAME                                         STATUS   ROLES    AGE   VERSION
         ip-192-168-56-0.region-code.compute.internal   Ready    <none>   19m   v1.XX.X-eks-49a6c0
         ```

   - Determine the IDs of the subnets in your VPC and which Availability Zone the subnet is in.

      ```bash
      aws ec2 describe-subnets \
      --filters "Name=vpc-id,Values=$vpc_id" \
      --region $AWS_REGION \
      --query 'Subnets[*].{SubnetId: SubnetId,AvailabilityZone: AvailabilityZone,CidrBlock: CidrBlock}' \
      --output table
      ```

      The example output is as follows.

      ```bash
      |                           DescribeSubnets                          |
      +------------------+--------------------+----------------------------+
      | AvailabilityZone |     CidrBlock      |         SubnetId           |
      +------------------+--------------------+----------------------------+
      |  region-codec    |  192.168.128.0/19  |  subnet-EXAMPLE6e421a0e97  |
      |  region-codeb    |  192.168.96.0/19   |  subnet-EXAMPLEd0503db0ec  |
      |  region-codec    |  192.168.32.0/19   |  subnet-EXAMPLEe2ba886490  |
      |  region-codeb    |  192.168.0.0/19    |  subnet-EXAMPLE123c7c5182  |
      |  region-codea    |  192.168.160.0/19  |  subnet-EXAMPLE0416ce588p  |
      +------------------+--------------------+----------------------------+
      ```

   - Add mount targets for the subnets that your nodes are in. From the output in the previous two steps, the cluster has one node with an IP address of `192.168.56.0`. That IP address is within the `CidrBlock` of the subnet with the ID `subnet-EXAMPLEe2ba886490`. As a result, the following command creates a mount target for the subnet the node is in. If there were more nodes in the cluster, you'd run the command once for a subnet in each AZ that you had a node in, replacing `subnet-EXAMPLEe2ba886490` with the appropriate subnet ID.

      ```bash
      aws efs create-mount-target \
      --file-system-id $file_system_id \
      --subnet-id subnet-EXAMPLEe2ba886490 \
      --region $AWS_REGION \
      --security-groups $security_group_id
      ```

      ```bash
        {
            "OwnerId": "01234567890",
            "MountTargetId": "fsmt-0dc4c9ca6537396a1",
            "FileSystemId": "fs-040f4681791902287",
            "SubnetId": "subnet-0e5891457fe105577",
            "LifeCycleState": "creating",
            "IpAddress": "192.168.61.208",
            "NetworkInterfaceId": "eni-0b59c825208f521b7",
            "AvailabilityZoneId": "use2-az3",
            "AvailabilityZoneName": "us-east-1a",
            "VpcId": "vpc-0f3ef22756b1abf1f"
        }
      ```

## Creating Storage Class and Persistent Volumes

To Create efs storage class please run the following command.

```bash
cd python-fastapi-demo-docker  
kubectl apply -f eks/efs-sc.yaml
```

To create Persistant volume EFS volume ID is necessary. Please run the following command to fetch the EFS volume ID.

```bash
echo $file_system_id
fs-040f4681791902287
```

Open `efs-pv.yaml` and replace `fs-040f4681791902287` with your EFS volume ID

```bash
vi eks/efs-pv.yaml
```

From the 'python-fastapi-demo-docker' project directory, apply the kubernetes configuration:

```bash
kubectl apply -f eks/efs-pv.yaml
```

expected output:

```bash
persistentvolume/efs-pv created
```

## Verifying the deployment of Storage class and Persistent Volumes

To verify that the Storage Class is installed please run the following command

```bash
kubectl get storageclass efs-sc
```

Response:

```bash
NAME     PROVISIONER       RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
efs-sc   efs.csi.aws.com   Delete          Immediate           false                  5h44m
```

To verify that correct file system ID was added to the  Persistent Volumes please run the following command:

```bash
kubectl describe pv efs-pv
```
Response:

```bash
Name:            efs-pv
Labels:          <none>
Annotations:     <none>
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:    efs-sc
Status:          Available
Claim:
Reclaim Policy:  Retain
Access Modes:    RWX
VolumeMode:      Filesystem
Capacity:        5Gi
Node Affinity:   <none>
Message:
Source:
    Type:              CSI (a Container Storage Interface (CSI) volume source)
    Driver:            efs.csi.aws.com
    FSType:
    VolumeHandle:      fs-040f4681791902287
    ReadOnly:          false
    VolumeAttributes:  <none>
Events:                <none>
```

  </TabItem>
  <TabItem value="Managed node(EBS)" label="Managed node(EBS)">

## Objective
This lab shows you how to set up the EBS CSI Driver on your cluster, which enables dynamic provisioning of Amazon EBS volumes in Kubernetes. We'll leverage [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) configured during the creation of our cluster and EBS Add-On to deploy EBS CSI Driver. 

:::info

EBS CSI volumes only support the 'ReadWriteOnce' access mode. While this may seem restrictive, it's actually a good match for databases like PostgreSQL. PostgreSQL can handle multiple concurrent connections and queries, even though it runs on a single node. This means even if your application has numerous users reading from and writing to the database concurrently, PostgreSQL manages these operations internally. Therefore, using 'ReadWriteOnce' volumes with PostgreSQL on EKS is generally the recommended approach.

:::

## Prerequisites

- [Setting up the AWS Application Load Balancer Controller (LBC) on the EKS Cluster](./setup-loadbalancing.md)


## 1. Installing the EBS CSI Addon as part of eksctl.

You can see that EBS CSI being deployed as part of add-ons in [create-mng-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/aws-opentelemetry/eks/create-mng-python.yaml#L41-L43)


## 2. Verifying the Deployment of EBS CSI Driver

Run the following command:

```bash
kubectl get po -n kube-system --selector=app.kubernetes.io/name=aws-ebs-csi-driver 
```

Response:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
ebs-csi-controller-5bd7b5fdbf-6wpzv   6/6     Running   0          7h
ebs-csi-controller-5bd7b5fdbf-lnn96   6/6     Running   0          7h15m
ebs-csi-node-l7z5z                    3/3     Running   0          4h7m
ebs-csi-node-tvlkg                    3/3     Running   0          4h7m
```

  </TabItem>
</Tabs>
