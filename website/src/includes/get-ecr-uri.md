First, retrieve your Amazon ECR repository URI using the following command:

```bash
echo ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/fastapi-microservices:${IMAGE_VERSION}
```

The expected output should look like this:

```bash
012345678901.dkr.ecr.us-west-1.amazonaws.com/fastapi-microservices:1.0
```