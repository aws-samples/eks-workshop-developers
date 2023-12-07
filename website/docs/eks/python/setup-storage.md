---
title: Setting up Scalable Storage in EKS
sidebar_position: 7
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This lab shows you how to setup and configure a data storage mechanism on your cluster. 

## Prerequisites

- [Setting up the AWS Application Load Balancer Controller (LBC) on the EKS Cluster](./setup-loadbalancing.md)

<!--This is a shared file at src/includes/get-env-vars.md that reminds users to source their environment variables.-->
<GetEnvVars />

<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

This lab shows you how to setup an [Elastic File System (EFS)](https://aws.amazon.com/efs/) volume within your Fargate cluster using the EFS CSI Driver. It's important to note that dynamic provisioning of persistent volumes is **not** supported for Fargate. As a result, in this lab, we'll be manually provisioning both the EFS filesystem and the corresponding Persistent Volume.

## 1. Configuring Mount Targets for the EFS File System

EFS only allows one mount target to be created in each Availability Zone, so you'll need to place the mount target on **each subnet**. 

1. Fetch the VPC ID associated with your EKS cluster and save it in a variable.

```bash
vpc_id=$(aws eks describe-cluster \
  --name "fargate-quickstart" \
  --region "$AWS_REGION" \
  --query "cluster.resourcesVpcConfig.vpcId" \
  --output "text")
```

2. Retrieve the CIDR range for the VPC of your EKS cluster and save it in a variable.

```bash
cidr_range=$(aws ec2 describe-vpcs \
  --vpc-ids "$vpc_id" \
  --query "Vpcs[].CidrBlock" \
  --output "text" \
  --region "$AWS_REGION")
```

1. Create a security group for your Amazon EFS mount points and save its ID in a variable.
   
```bash
security_group_id=$(aws ec2 create-security-group \
  --group-name "MyEfsSecurityGroup" \
  --description "My EFS security group" \
  --vpc-id "$vpc_id" \
  --region "$AWS_REGION" \
  --output "text")
```

4. Create an inbound rule on the new security group that allows NFS traffic from the CIDR for your cluster's VPC.


```bash
aws ec2 authorize-security-group-ingress \
  --group-id "$security_group_id" \
  --protocol "tcp" \
  --port "2049" \
  --region "$AWS_REGION" \
  --cidr "$cidr_range"
```

The expected output should look like this:

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
To further restrict access to your file system, you can optionally specify the CIDR of your subnet instead of using the entire VPC.
:::

5. Create the Amazon EFS File System for your cluster.
   
```bash
file_system_id=$(aws efs create-file-system \
  --region "$AWS_REGION" \
  --tags "Key=Name,Value=fargate-quickstart-efs" \
  --performance-mode "generalPurpose" \
  --query "FileSystemId" \
  --output "text")
```

6. Run the following command to create an EFS mount target in each of the cluster VPC's subnets.

```bash
for subnet in $(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --region "$AWS_REGION" --query 'Subnets[*].SubnetId' --output text)
do
  aws efs create-mount-target
  --file-system-id $file_system_id \
  --subnet-id $subnet \
  --region $AWS_REGION \
  --security-groups $security_group_id
done
```

The expected output for each subnet should look like this:
```bash
{
  "OwnerId": "01234567890",
  "MountTargetId": "fsmt-0dc4c9ca6537396a1",
  "FileSystemId": "fs-000f4681791902287",
  "SubnetId": "subnet-0e5891457fe105577",
  "LifeCycleState": "creating",
  "IpAddress": "192.168.61.208",
  "NetworkInterfaceId": "eni-0b59c825208f521b7",
  "AvailabilityZoneId": "use1-az3",
  "AvailabilityZoneName": "us-east-1a",
  "VpcId": "vpc-0f3ef22756b1abf1f"
}
```

## 2. Creating the Storage Class and Persistent Volumes

1. Deploy the Storage Class:

```bash
kubectl apply -f eks/efs-sc.yaml
```

The expected output should look like this:

```bash
storageclass.storage.k8s.io/efs-sc created
```

2. To create a persistent volume, you need to attach your EFS file system identifier to the PV. Run the following command to update the file system identifier in the `deploy-efs-pv-fargate.yaml` manifest:

```bash
sed -i 's/fs-000000001121212/$file_system_id/g' eks/efs-pv.yaml
```

**Optionally**, if you're running this on macOS, run the following command to update the file system identifier:

```bash
sed -i '' 's/fs-000000001121212/'"$file_system_id"'/g' eks/efs-pv.yaml
```

3. Deploy the Persistent Volume (PV):

```bash
kubectl apply -f eks/efs-pv.yaml
```

The expected output should look like this:

```bash
persistentvolume/efs-pv created
```

## 3. Verifying the Deployment of the Storage Class and Persistent Volumes

1. Verify that the Storage Class was successfully created:

```bash
kubectl get storageclass efs-sc
```

The expected output should look like this:
```bash
NAME     PROVISIONER       RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
efs-sc   efs.csi.aws.com   Delete          Immediate           false                  10m
```

2. Verify that your file system identifier was successfully attached:

```bash
kubectl describe pv efs-pv
```

The expected output should look like this:

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
    VolumeHandle:      fs-000f4681791902287
    ReadOnly:          false
    VolumeAttributes:  <none>
Events:                <none>
```
  </TabItem>

  <TabItem value="Managed Node Groups" label="Managed Node Groups">

This lab shows you how to verify the setup of the [Amazon Elastic Block Store](https://aws.amazon.com/ebs/) volume for your managed node groups-based EKS cluster, which enabled dynamic provisioning of persistent volumes on our cluster using the EBS CSI Driver. It's worth noting that we're also leveraging [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) configured during the creation of our cluster.

:::info

EBS CSI volumes only support the 'ReadWriteOnce' access mode. While this may seem restrictive, it's actually a good match for databases like PostgreSQL. PostgreSQL can handle multiple concurrent connections and queries, even though it runs on a single node. This means even if your application has numerous users reading from and writing to the database concurrently, PostgreSQL manages these operations internally. Therefore, using 'ReadWriteOnce' volumes with PostgreSQL on EKS is generally the recommended approach.

:::

## 1. Verifying EBS CSI Add-On Installation

You can verify that the EBS CSI add-on was successfully installed when you created your cluster in [create-mng-python.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/aws-opentelemetry/eks/create-mng-python.yaml#L41-L43) using the following command:

```bash
kubectl get pod -n kube-system --selector=app.kubernetes.io/name=aws-ebs-csi-driver 
```
The expected output should look like this:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
ebs-csi-controller-5bd7b5fdbf-6wpzv   6/6     Running   0          7h
ebs-csi-controller-5bd7b5fdbf-lnn96   6/6     Running   0          7h15m
ebs-csi-node-l7z5z                    3/3     Running   0          4h7m
ebs-csi-node-tvlkg                    3/3     Running   0          4h7m
```

  </TabItem>
</Tabs>
