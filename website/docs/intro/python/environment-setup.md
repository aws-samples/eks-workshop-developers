# Setting up the Development Environment

## Objective
This guide shows you how to up the necessary tools and environment to leverage the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project. For more samples, we recommend exploring the sample app collection (e.g., Python, Flask, FastAPI, PostgreSQL) at [docker/awesome-compose](https://github.com/docker/awesome-compose).

## 1. Installing Required Tools
If you're planning to complete the Python workshop in full, make sure you've set-up the following on your local machine.

- [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Create a DockerHub Account](https://hub.docker.com/)
- [Install Python 3.9+](https://www.python.org/downloads/release/python-390/)
- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Install minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Install eksctl](https://eksctl.io/introduction/#installation)
- [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [Install Helm](https://helm.sh/docs/intro/install/)

## 2. Configuring the Shell Environment
First, configure your AWS credentials to be able to create AWS resources from the command line. Configure the AWS CLI by running:
```bash
aws configure
```

Enter your AWS credentials:
```bash
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-2
Default output format [None]: json
```

## 3. Setting Up the Application
Clone the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) repository and navigate into the project directory:
```
git clone https://github.com/aws-samples/python-fastapi-demo-docker.git 
```

If you prefer not to use git, you can alternatively [download the Zip file](https://github.com/aws-samples/python-fastapi-demo-docker/archive/refs/heads/main.zip).

## 4. Creating the .env File
We'll be heavily reliant on environment variables to ease the set-up process throughout this workshop. 

First, navigate into the project directory and make a copy of the example environment variables file.
```
cd python-fastapi-demo-docker
cp .env.example .env
```

Now add your AWS credentials to the `.env` file you just created:
```
AWS_ACCOUNT_ID=012345678901
AWS_ACCESS_KEY_ID=ASIAWNZPPVHEXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLE
AWS_REGION=us-east-1
```

Update the sample value with your [DockerHub](https://hub.docker.com/) user name:
```
DOCKER_USERNAME=frank9
```

## 5. Import Environment Variables
Next, from the root directory of the 'python-fastapi-demo-docker' project, import all environment variables by running the following commands.

**macOS**
```bash
set -o allexport; source .env
printenv
```
**Windows**
```bash
@echo off
for /f "usebackq delims=" %%x in (".env") do set "%%x"
set
```
**Linux**
```bash
source .env
printenv
```

## 6. Install Other Tools (Recommended)
- Consider installing the [Docker VS Code Extension](https://code.visualstudio.com/docs/containers/overview). This tool simplifies the management of container images and allows you to access container logs and console output directly from VS Code 🔥.
