---
title: Migrating to Amazon Aurora PostgreSQL Database
sidebar_position: 12
---

## Objective

This lab will show you how to create an Amazon Aurora Serverless v2 PostgreSQL database and update the FastAPI application to connect to this database. We'll be going through the following steps in this lab:

1. Deploy the Amazon Aurora PostgreSQL database using CloudFormation
2. Recreate the fastapi-secret object with the new database connection URL
3. Create the application's database using psql
4. Restart our application and confirm the connection to the new database

## Prerequisites

* [Securing FastAPI Microservices with Kubernetes Secrets](../python/deploy-secrets.md)
* [Deploying FastAPI and PostgreSQL Microservices to EKS](../python/deploy-app.md)

## 1. Deploy the Amazon Aurora PostgreSQL Database Using CloudFormation

Deploying an Amazon Aurora Serverless v2 PostgreSQL database cluster using CloudFormation allows us to predictably create our required resources and take advantage of the values exported by our EKS cluster's CloudFormation stack. There are 3 resources that will be created by our CloudFormation template:

1. An `AWS::RDS::DBCluster` which is the regional PostgreSQL cluster
2. An `AWS::RDS::DBInstance` which is the instance where our database connections will be made
3. An `AWS::RDS::DBSubnetGroup` which specifies which VPC and subnets our `DBInstance` can be placed in

For convenience, we are using the same VPC, subnets, and security group as our EKS cluster. Similarly, we are also setting the same database user and password for this cluster as we used for the PostgreSQL cluster deployed within the EKS cluster so that only minimal changes have to be made. Please keep in mind that this is not a best practice and that this is being done only for the sake of this lab exercise. This CloudFormation stack is also creating our `bookstore` database by default so there is no need to manually create this. Since we're also using the admin credentials for the cluster we do not need to manually assign any privileges for `bookdbadmin` to this database.

:::info
Before running any of the commands in this exercise, please ensure that you have updated the file `.env` to set `AWS_REGION` to the same region where your EKS cluster was created. Run the following command to source these variables into your terminal:

```bash
source .env
```
:::

To create the CloudFormation stack please run the below command in your terminal. This command assumes that a Managed Nodegroup cluster was created using the file `eks/create-mng-python.yaml`. If instead a Fargate cluster was created using the file `eks/create-fargate-python.yaml` please update the `ClusterType` parameter to `Fargate` before running so that the stack can use the subnet and security group values exported from the EKS stack.

```bash
aws cloudformation create-stack --region $AWS_REGION \
  --stack-name eksworkshop-rds-cluster \
  --template-body file://eks/rds-serverless-postgress.json \
  --parameters ClusterType=ManagedNodegroup
```

The output should look as follows:

```json
{
    "StackId": "arn:aws:cloudformation:$AWS_REGION:$AWS_ACCOUNT_ID:stack/eksworkshop-rds-cluster/9aa714d0-7e3d-11ee-91c8-0aa42affc2ab"
}
```

The CloudFormation stack will take between 15 and 20 minutes to run so now will be a good time for a coffee break ☕.

## 2. Recreate the fastapi-secret Object with the New Database Connection URL

Now that we've had a cup of coffee and our CloudFormation stack has completed, we can move on to updating the secret `fastapi-secret` with the new database endpoint.

To find this value, we can run the following command:

```bash
aws rds describe-db-clusters --region $AWS_REGION --db-cluster-identifier eksworkshop-rds --query 'DBClusters[0].Endpoint' --output text
```

The output should look as follows:

```
eksworkshop-rds.cluster-xxxxxxxxxx.us-east-1.rds.amazonaws.com
```

From here, we can edit our `.env` file and update the `DOCKER_DATABASE_URL` variable to replace `db` with the above endpoint. After the update, the value should look like this:

```bash
DOCKER_DATABASE_URL=postgresql://bookdbadmin:dbpassword@eksworkshop-rds.cluster-xxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/bookstore
```

With this new value in place the `fastapi-secret` object can now be deleted and recreated:

```bash
kubectl delete secret fastapi-secret -n my-cool-app && \
kubectl create secret generic fastapi-secret --from-env-file=.env -n my-cool-app
```

The output should look as follows:

```
secret "fastapi-secret" deleted
secret/fastapi-secret created
```

## 3. Restart the FastAPI Deployment and Confirm Connectivity

With all of the pieces in place we can now restart the deployment `fastapi-deployment` which will get the new database URL from `fastapi-secret` and will create our database schema for us automatically:

```bash
kubectl rollout restart deploy/fastapi-deployment -n my-cool-app
```

Once this finishes we can then view our logs for the deployment and make sure we're seeing that it has connected successfully.

```bash
kubectl logs deploy/fastapi-deployment -n my-cool-app
```

We should see the following in the output:

```log
INFO:server.app.connect:Trying to connect to eksworkshop-rds.cluster-xxxxxxxxxx.us-east-1.rds.amazonaws.com:5432 as bookdbadmin...
INFO:server.app.connect:Connection successful!
INFO:     Started server process [7]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

We can now visit our website and see that it's still working as expected:

![Screenshot of the FastAPI website showing that books have been created successfully](./images/aws-rds-books.png)

## Cleanup

To clean up the resources provisioned during this lab we will just need to delete the CloudFormation stack using the command below:

```bash
aws cloudformation delete-stack --region $AWS_REGION --stack-name eksworkshop-rds
```