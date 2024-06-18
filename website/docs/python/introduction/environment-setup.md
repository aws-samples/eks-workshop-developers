---
title: Setting up the Development Environment
sidebar_position: 3
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This guide shows you how to set up the necessary tools and environment to leverage the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project. For more samples, we recommend exploring the sample app collection (e.g., Python, Flask, FastAPI, PostgreSQL) at [docker/awesome-compose](https://github.com/docker/awesome-compose).

**Use the tabs below to see the steps for the specific environment where you are running this lab.**
<Tabs>

  <TabItem value="AWS Workshop Studio" label="AWS Workshop Studio" default>

If you are attending an AWS hosted event, you will have access to an AWS account in AWS Workshop Studio, where the infrastructure and IAM policies needed to complete this workshop have been  pre-provisioned. The goal of this section is to complete the configuration of enviroment variables that will allow you to run commands in Vistual Studio terminal.

## Prerequisites

* Access the event via the one-click join event link provided by the event operator as part of an AWS hosted event.
* OR via the [Workshop Studio join URL](https://catalog.workshops.aws/join) with the 12 digit event access code distributed by an event operator.
* Carefully review the terms and conditions associated with this event.

## 1. Accessing Visual Studio terminal

After joining the event, you should see the page with event information and workshop details. You should also see a section titled **"AWS account access"** on the left navigation bar. You can use these options to see AWS CLI credentials and access the AWS account provided to you for this workshop.

This workshop deploys Visual Studion in an EC2 instance running in this AWS account. To access Visual Studio, open the **IdeUrl** and log in using the **IdePassword**.

When running specifc steps int he workshop, you will asked to connect to the Public IP of this EC2 instance. For that, use the instance Public IP shown in **IdePublicIp**.

![workshop-studio-event-python](./images/workshop-studio-event-python.jpg)

After logging in Visual Studio, you can open Visual Studio terminal by accessing Menu -> Terminal-> New Terminal.

![visual-studio-terminal](./images/visual-studio-terminal.jpg)

## 2. Creating the .env file

We'll be heavily reliant on environment variables to ease the set-up process throughout this workshop.

First, navigate into the project directory and make a copy of the example environment variables file.

```bash
cd python-fastapi-demo-docker
cp .env.example .env
```
Then, update variables inside `.env` file as indicated below.

Update variables `AWS_ACCOUNT_ID` and `AWS_REGION` with the values returned by the following commands:
```bash
echo $AWS_ACCOUNT_ID
echo $AWS_REGION
```

Update variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, and add variable `AWS_SESSION_TOKEN` using the credentials values from the AWS WorkshopStudio session, available under WorkshopStudio Event section "AWS account access - Get AWS CLI credentials".
These credentials will be used when executing aws commands in Visual Studio terminal. 

After updating AWS variables, file .env should look like below:

```bash
...
# AWS CREDENTIALS
# Run "aws sts get-caller-identity" to get your account id
# Run "aws configure" to setup your credentials
AWS_ACCOUNT_ID=0123EXAMPLE
AWS_REGION=us-east-example
AWS_ACCESS_KEY_ID="ASIAWNZPPVHEXAMPLE"
AWS_SECRET_ACCESS_KEY="bPxRfiCYEXAMPLE"
AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjECMaCXVzLWVhc3QtMSJHMEUCIAUqOHDilurbiEXAMPLE..."
...
```

Add your [DockerHub](https://hub.docker.com/) user name. If you don't have a DockerHub account, you can delete this variable from the `.env` file

```
DOCKER_USERNAME=frank9
```

## 3. Import Environment Variables

Next, from the root directory of the 'python-fastapi-demo-docker' project, import all environment variables by running the following commands.

```bash
cd python-fastapi-demo-docker
set -a; source .env; set +a
printenv
```

</TabItem>

  <TabItem value="Local Computer" label="Local Computer" default>

## 1. Installing Required Tools

To facilitate a beginner-friendly introduction to Kubernetes, this workshop is structured with user-friendly tools at its core. Central to this approach is the use of [eksctl](https://eksctl.io/), an Infrastructure as Code (IaC) tool that allows you to update the control plane, manage add-ons, and oversee worker node updates. 

If you're planning to complete the workshop in full, make sure you've set up the following tools on your local machine.

- [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Create a DockerHub Account](https://hub.docker.com/)
- [Install Python 3.9+](https://www.python.org/downloads/release/python-390/)
- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Install minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Install eksctl](https://eksctl.io/installation)
- [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [Install Helm](https://helm.sh/docs/intro/install/)

## 2. (Optional) Alternative Tools
Optionally, if you are using macOS catalina (10.15) or higher, you can use Finch, instead of Docker. Finch is an open source tool for local container development. It is available for macOS on Intel and Apple Silicon. Finch and Docker can be installed together; however, for performing the workshop exercises, we recommend using either Finch or Docker consistently for all the steps.

- [Install Finch](https://runfinch.com/docs/managing-finch/macos/installation/)

## 3. Configuring the Shell Environment

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

## 4. Setting Up the Application

Clone the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) repository and navigate into the project directory:

```bash
git clone https://github.com/aws-samples/python-fastapi-demo-docker.git 
```

If you prefer not to use git, you can alternatively [download the Zip file](https://github.com/aws-samples/python-fastapi-demo-docker/archive/refs/heads/main.zip).

## 5. Creating the .env File

We'll be heavily reliant on environment variables to ease the set-up process throughout this workshop.

First, navigate into the project directory and make a copy of the example environment variables file.

```bash
cd python-fastapi-demo-docker
cp .env.example .env
```

Now add your AWS credentials to the `.env` file you just created:

```bash
AWS_ACCOUNT_ID=012345678901
AWS_ACCESS_KEY_ID=ASIAWNZPPVHEXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLE
AWS_REGION=us-east-1
```

Update the sample value with your [DockerHub](https://hub.docker.com/) user name:

```
DOCKER_USERNAME=frank9
```

## 6. Import Environment Variables

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
set -a; source .env; set +a
printenv
```

## 7. Install Other Tools (Recommended)

- Consider installing the [Docker VS Code Extension](https://code.visualstudio.com/docs/containers/overview). This tool simplifies the management of container images and allows you to access container logs and console output directly from VS Code 🔥.

- Verify the Finch installation by running the following commands:

```bash
finch vm init
finch run public.ecr.aws/finch/hello-finch:latest
```

</TabItem>

</Tabs>
## What's Next?

- [Containers](../containers/index.md)
