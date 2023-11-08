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

For convenience, we are using the same VPC, subnets, and security group as our EKS cluster. Similarly, we are also setting the same database user and password for this cluster as we used for the PostgreSQL cluster deployed within the EKS cluster so that only minimal changes have to be made. Please keep in mind that this is not a best practice and that this is being done only for the sake of this lab exercise.

To create the CloudFormation stack please run the below command in your terminal. This command assumes that a Managed Nodegroup cluster was created using the file `eks/create-mng-python.yaml`. If instead a Fargate cluster was created using the file `eks/create-fargate-python.yaml` please update the `ClusterType` parameter to `Fargate` before running so that the stack can use the subnet and security group values exported from the EKS stack.

```bash
aws cloudformation create-stack \
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

## Recreate the fastapi-secret Object with the New Database Connection URL

Now that we've had a cup of coffee and our CloudFormation stack has completed, we can move on to updating the secret `fastapi-secret` with the new database endpoint.

To find this value, we can run the following command:

```bash
aws rds describe-db-clusters --db-cluster-identifier eksworkshop-rds --query 'DBClusters[0].Endpoint' --output text
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

## Create the Application's Database Using psql

We're in the home stretch now and our last step will be creating the `bookstore` database our application will be using. To accomplish this, we're going to run an Amazon Linux 2023 image, install the PostgreSQL client (psql), connect to our cluster, and then create our `bookstore` database.

Firstly, let's create our pod and get a shell to it:

```bash
kubectl run -it pgclient --image amazonlinux:2023
```

Next, we need to install `postgresql15`:

```bash
yum install postgresql15 -y
```

Now let's connect to our database and run the following commands:

```bash
psql -h eksworkshop-rds.cluster-xxxxxxxxxx.us-east-1.rds.amazonaws.com -p 5432 -U bookdbadmin -d postgres
```

This will then prompt to put in the password for user `bookdbadmin`. We can type in `dbpassword` and press the enter key. We should now see a prompt like this:

```bash
psql (15.4, server 13.12)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
Type "help" for help.

postgres=>
```

Now we'll run the following commands to create our database, grant permissions for our user on that database, close our connection, exit the pod, and delete the pod:

```bash
CREATE DATABASE bookstore;
ALTER DATABASE bookstore OWNER TO bookdbadmin;
GRANT ALL PRIVILEGES ON DATABASE bookstore TO bookdbadmin;
\q
exit
kubectl delete pod pgclient
```

## 4. Restart the FastAPI Deployment and Confirm Connectivity

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

![Screenshot of the FastAPI website showing that books have been created successfully](aws-rds-books.png)

## Cleanup

To clean up the resources provisioned during this lab we will just need to delete the CloudFormation stack using the command below:

```bash
aws cloudformation delete-stack --stack-name eksworkshop-rds
```