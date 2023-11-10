---
title: Integrating with AWS Secrets Manager
sidebar_position: 13
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

In this lab we'll be discussing Kubernetes Secrets, the security precautions to be aware of when using them, and the use of AWS Secrets Manager as an alternative. We'll be going through the following steps during our exercise:

1. Review our implementation in the FastAPI application
2. Create our secret in AWS Secrets Manager
3. Build and deploy the new version of the application to our EKS cluster

## Prerequisites
* [Deploying FastAPI and PostgreSQL Microservices to EKS](../python/deploy-app.md)
  
<!--This is a shared file at src/includes/get-env-vars.md that tells users to navigate to the 'python-fastapi-demo-docker' directory where their environment variables are sourced.-->
<GetEnvVars />

---

:::caution
When using Kubernetes Secrets there are a number of security considerations to keep in mind to ensure that they are not inadvertently exposed. The following pages are a good starting place for Kubernetes in general and EKS specifically.

- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/#information-security-for-secrets)
- [Good practices for Kubernetes Secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)
- [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/security/docs/data/)
:::

## 1. Reviewing Our Implementation for Fetching Secrets

As mentioned in some of the links above on Secrets best practices both volume mounts and environment variables have potential security pitfalls that are important to be aware of. For this reason, we've gone with the most secure path by cutting out Kubernetes Secrets from the equation. Instead, we're using [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) (AWS SDK for Python) and making calls to AWS Secrets Manager directly. The code snippet below from [connect.py](https://github.com/aws-samples/python-fastapi-demo-docker/blob/4eb157b28bae2c688b6530cfe9c076dc77a4396c/server/app/connect.py#L40) shows how we're making this work:

```python
# Retrieves secret by name from AWS Secrets Manager
def get_secret(secret_name):

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager'
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print("The requested secret " + secret_name + " was not found")
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            print("The request was invalid due to:", e)
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            print("The request had invalid params:", e)
        elif e.response['Error']['Code'] == 'DecryptionFailure':
            print("The requested secret can't be decrypted using the provided KMS key:", e)
        elif e.response['Error']['Code'] == 'InternalServiceError':
            print("An error occurred on service side:", e)
    else:
        # Secrets Manager decrypts the secret value using the associated KMS CMK
        # Depending on whether the secret was a string or binary, only one of these fields will be populated
        if 'SecretString' in get_secret_value_response:
            return get_secret_value_response['SecretString']
        else:
            return get_secret_value_response['SecretBinary']

secret_data = get_secret('eksdevworkshop-db-url')

# Parse the json string in secret_data and extract connectionstring
DATABASE_URL = json.loads(secret_data)['connectionstring']
```

The `get_secret()` function accepts the `SecretId` of the Secret we're looking to fetch from Secrets Manager. We handle a number of potential error cases and should the retrieval succeed we then look for either the `SecretString` or `SecretBinary` keys in the response. Whichever one is present is what we return back to the caller. Once the JSON data for the Secret `eksdevworkshop-db-url` is stored in `secret_data`  we then parse this JSON string and get the value of the `connectionstring` key.

Ideally, this secret would be cached if it needs to be used more than once however for our use we've opted to keep things simple. For Python, the [`aws-secretsmanager-caching`](https://github.com/aws/aws-secretsmanager-caching-python) package is available to use.

## 2. Create Our Secret in Secrets Manager

Now that we know how the fetching from Secrets Manager is being done in the code let's go ahead and actually create this Secret using the `awscli`.

First, we need to make sure we have our environment variable loaded by running the command:

```bash
source .env
```

Next, let's show the value of the `DOCKER_DATABASE_URL` variable:

```bash
echo $DOCKER_DATABASE_URL
```

The output should look like this:

```bash
postgresql://bookdbadmin:dbpassword@db:5432/bookstore
```

With this value, we can run the following command to create our secret:

```bash
SECRET_ARN=$(aws --region $AWS_REGION secretsmanager  create-secret --name eksdevworkshop-db-url --secret-string '{"connectionstring":"postgresql://bookdbadmin:dbpassword@db:5432/bookstore"}' --query 'ARN')
```

With our secret now created we'll need to create an IAM policy document which provides permissions to access this Secret. We can do this with the following command:

```bash
cat << EOF > fastapi-policy.json
{
    "Version": "2012-10-17",
    "Statement": [ {
        "Effect": "Allow",
        "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
        "Resource": [${SECRET_ARN}]
    } ]
}
EOF
```

This creates the file `fastapi-policy.json` in the root of our project folder. Let's confirm that this file looks as we expect:

```bash
cat fastapi-policy.json
```

The output should should look as follows:

```json
{
    "Version": "2012-10-17",
    "Statement": [ {
        "Effect": "Allow",
        "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
        "Resource": ["arn:aws:secretsmanager:region:012345678901:secret:eksdevworkshop-db-url-xxxxxx"]
    } ]
}
```

We can now create our IAM policy using this JSON document with this command:

```bash
POLICY_ARN=$(aws --region $AWS_REGION --query Policy.Arn --output text iam create-policy --policy-name fastapi-secrets-access --policy-document file://fastapi-policy.json)
```
Lastly, we'll need to create our IAM Role for the FastAPI application using this policy and create our `serviceaccount` for IRSA to provide credentials for this role to our application.

<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

```bash
eksctl create iamserviceaccount --name fastapi-deployment-sa --region $AWS_REGION --cluster fargate-quickstart --attach-policy-arn $POLICY_ARN --namespace my-cool-app --approve --override-existing-serviceaccounts
```

  </TabItem>
  <TabItem value="Managed Node Groups" label="Managed Node Groups">

```bash
eksctl create iamserviceaccount --name fastapi-deployment-sa --region $AWS_REGION --cluster managednode-quickstart --attach-policy-arn $POLICY_ARN --namespace my-cool-app --approve --override-existing-serviceaccounts
```

  </TabItem>
</Tabs>

After a minute or two of CloudFormation templates running we should see success messages showing us that our IAM Role and `serviceaccount` have been created.

## 3. Build and Deploy the New Version of the Application

We're in the home stretch now and all that's left is to build and deploy our application. To do this, let's first switch to the Git branch `aws-secrets-manager-lab` which has our updated application code and deployment manifest.

```bash
git switch aws-secrets-manager-lab
```

Next we'll update our `IMAGE_VERSION` environment variable to use a new version:

:::info
This is an important step as using the same image version from previous parts of this workshop can result in an old image being used since they get cached by each EKS worker node after being pulled.
:::

```bash
export IMAGE_VERSION=2.0
```

Let's get our credentials for ECR and login with Docker so we can push our image to our repository using this command:

```bash
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

Now, we can run the following commands to build, tag, and push our image to ECR:

```bash
docker build -t fastapi-microservices .
docker tag fastapi-microservices:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/fastapi-microservices:$IMAGE_VERSION
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/fastapi-microservices:$IMAGE_VERSION
```

With our new image successfully uploaded to ECR we can now update our deployment file `eks/deploy-app-python.yaml` to use our new image. First we'll get the URI we need to use:

```bash
echo $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/fastapi-microservices:$IMAGE_VERSION
```

The output should look as follows:

```bash
012345678901.dkr.ecr.us-east-1.amazonaws.com/fastapi-microservices:2.0
```

We can take this URI and update our deployment file on line 32 to now be as follows:

```yaml
image: 012345678901.dkr.ecr.us-east-1.amazonaws.com/fastapi-microservices:2.0
```

Lastly, the moment we've all been waiting for, let's deploy this new version to our EKS cluster with the following command:

```bash
kubectl apply -f eks/deploy-app-python.yaml
```

The output should look as follows:

```bash
service/fastapi-service unchanged
deployment.apps/fastapi-deployment configured
ingress.networking.k8s.io/fastapi-ingress unchanged
```

We can watch our deployment's progress by watching the pods in the `my-cool-app` namespace and waiting until our new pod reaches the `Running` state:

```bash
kubectl get pods -n my-cool-app --watch
```

Let's take a look at our pod logs to make sure everything is working as expected:

```bash
kubectl logs deploy/fastapi-deployment -n my-cool-app
```

We'll see something like the following once it's ready:

```bash
NAME                                 READY   STATUS    RESTARTS   AGE
fastapi-deployment-bbfd7b7b4-d6cgh   1/1     Running   0          1m
fastapi-postgres-0                   1/1     Running   0          18h
```

We should see the following in the output showing that our exercise has been successful:

```log
INFO:server.app.connect:Trying to connect to db:5432 as bookdbadmin...
INFO:server.app.connect:Connection successful!
INFO:     Started server process [6]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
Database URL: postgresql://bookdbadmin:dbpassword@db:5432/bookstore
INFO:     192.168.33.158:42464 - "GET / HTTP/1.1" 200 OK
INFO:     192.168.25.22:30050 - "GET / HTTP/1.1" 200 OK
```

## 4. Cleanup Resources

To delete the resources we created during this lab run the following commands:

<Tabs>
  <TabItem value="Fargate" label="Fargate" default>

```bash
kubectl delete -f eks/deploy-app-python.yaml
aws secretsmanager delete-secret --region $AWS_REGION --force-delete-without-recovery --secret-id eksdevworkshop-db-url
eksctl delete iamserviceaccount --name fastapi-deployment-sa --region $AWS_REGION --cluster fargate-quickstart --namespace my-cool-app
aws iam delete-policy --policy-arn $POLICY_ARN
```

  </TabItem>
  <TabItem value="Managed Node Groups" label="Managed Node Groups">


```bash
kubectl delete -f eks/deploy-app-python.yaml
aws secretsmanager delete-secret --region $AWS_REGION --force-delete-without-recovery --secret-id eksdevworkshop-db-url
eksctl delete iamserviceaccount --name fastapi-deployment-sa --region $AWS_REGION --cluster managednode-quickstart --namespace my-cool-app
aws iam delete-policy --region $AWS_REGION --policy-arn $POLICY_ARN
```

  </TabItem>
</Tabs>
