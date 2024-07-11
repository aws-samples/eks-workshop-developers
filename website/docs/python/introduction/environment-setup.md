---
title: Setting up the Development Environment
sidebar_position: 2
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GetEnvVars from '../../../src/includes/get-env-vars.md';

## Objective

This guide shows you how to set up the necessary tools and environment to leverage the [python-fastapi-demo-docker](https://github.com/aws-samples/python-fastapi-demo-docker) project. For more samples, we recommend exploring the sample app collection (e.g., Python, Flask, FastAPI, PostgreSQL) at [docker/awesome-compose](https://github.com/docker/awesome-compose).

**Use the tabs below to see the steps for the specific environment where you are running this lab.**
<Tabs>

  <TabItem value="AWS Workshop Studio" label="AWS Workshop Studio" default>

If you are attending an AWS hosted event, you will have access to a new AWS account in AWS Workshop Studio. You will use this AWS account to run the labs in this workshop. The account is destroyed when the AWS event is finished.

Workshop Studio deploys a Visual Studio enviroment running on top of an EC2 instance that has been already configured with all required CLI tools and permissions. To run the workshop, you will connect to this Visual Studio environment and execute commands in the Visual Studio terminal.

There is no need to install additional tools or configure IAM permissions. You will be using the IAM permissions of the EC2 instance role where Visual Studio is running.


## Prerequisites

* Access the event via the one-click join event link provided by the event operator as part of an AWS hosted event.
* OR via the [Workshop Studio join URL](https://catalog.workshops.aws/join) with the 12 digit event access code distributed by an event operator.
* Carefully review the terms and conditions associated with this event.

## 1. Entering Workshop Studio Event

After joining the AWS event, you should see the **Event Dashboard** page with the event information and workshop details. The relevant sections are highlighted below in red:

![workshop-studio-event-python](./images/workshop-studio-event-python.jpg)

On the left side of the event page there is a section titled **AWS account access** with details to access the AWS account provisioned for you by Workshop Studio.
- Option **Open AWS Console** opens the AWS Console.
- Option **Get AWS CLI credentials** shows the AWS CLI credentials that you can use to execute aws cli commands.

The workshop deploys Visual Studio in an EC2 instance running in this AWS account. 
- To access Visual Studio, open the **IdeUrl** and log in using the **IdePassword**.

When running specifc steps in the workshop, you will be asked to connect to the Public IP of this EC2 instance.
-  Use **IdePublicIp** when required during the workshop to connect to the EC2 instance running Visual Studio from your web browser.

## 2. Accessing Visual Studio terminal

Open **IdeUrl** link in your web browser and log in using the **IdePassword**. A Visual Studio session will open.

Then open Visual Studio terminal by accessing Menu -> Terminal-> New Terminal. The required enviroment variables and IAM permissions have been configured in Visual Studio terminal already. 

Now, you are ready to start the labs in this workshop.

![visual-studio-terminal](./images/visual-studio-terminal.png)


</TabItem>

  <TabItem value="Local Computer" label="Local Computer" default>

The steps below will help you set up the enviroment in your local computer, using your own AWS Account.

:::warning
**In this workshop there will be a number of AWS resources created in your account. These resources will incur cost and will be billed to your AWS Account. Make sure you delete all resources after completing the workshop to avoid unnecessary costs. The steps to clean up resources are available in the last section of the workshop [Cleaning Up Resources](https://developers.eksworkshop.com/docs/python/eks/Cleanup)**
:::

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
cd /home/ec2-user/environment/python-fastapi-demo-docker
cp .env.example .env
```

Now update AWS variables in the `.env` file you just created using the AWS Account ID and region that you will use for this workshop:

```bash
AWS_ACCOUNT_ID=012345678901
AWS_REGION=us-east-1
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

