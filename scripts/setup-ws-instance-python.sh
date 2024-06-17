#bin/sh

## Go to tmp directory
cd /tmp

## Update OS
sudo yum update

## Install additional dependencies
sudo yum install -y jq

wget https://github.com/mikefarah/yq/releases/download/v4.33.3/yq_linux_amd64.tar.gz -O - |\
  tar xz && sudo mv yq_linux_amd64 /usr/bin/yq
yq --version

## Install docker buildx
export BUILDX_VERSION=$(curl --silent "https://api.github.com/repos/docker/buildx/releases/latest" |jq -r .tag_name)
curl -JLO "https://github.com/docker/buildx/releases/download/$BUILDX_VERSION/buildx-$BUILDX_VERSION.linux-amd64"
mkdir -p ~/.docker/cli-plugins
mv "buildx-$BUILDX_VERSION.linux-amd64" ~/.docker/cli-plugins/docker-buildx
chmod +x ~/.docker/cli-plugins/docker-buildx
docker run --privileged --rm tonistiigi/binfmt --install all
docker buildx create --use --driver=docker-container

## Install docker compose
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
echo 'alias docker-compose="docker compose"' >> ~/.bashrc
echo 'alias docker-compose="docker compose"' >> ~/.bash_profile
docker compose version

## Install eksctl
# for ARM systems, set ARCH to: `arm64`, `armv6` or `armv7`
ARCH=amd64
PLATFORM=$(uname -s)_$ARCH
curl -sLO "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"
# (Optional) Verify checksum
curl -sL "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_checksums.txt" | grep $PLATFORM | sha256sum --check
tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && rm eksctl_$PLATFORM.tar.gz
sudo mv /tmp/eksctl /usr/local/bin
eksctl version

## Install kubectl
# https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.28.2/2023-10-17/bin/linux/amd64/kubectl
chmod +x ./kubectl
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$PATH:$HOME/bin
echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc
kubectl version --output=yaml

## Install Helm
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
helm version

## Setup environment
cd ~/environment
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query Account)
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
export AWS_REGION=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
export PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
echo "export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}" | tee -a ~/.bash_profile
echo "export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}" | tee -a ~/.bashrc
echo "export AWS_REGION=${AWS_REGION}" | tee -a ~/.bash_profile
echo "export AWS_REGION=${AWS_REGION}" | tee -a ~/.bashrc
echo "export PUBLIC_IP=${PUBLIC_IP}" | tee -a ~/.bashrc
echo "export PUBLIC_IP=${PUBLIC_IP}" | tee -a ~/.bash_profile
aws configure set default.region ${AWS_REGION}

## Install minikube
cd /home/ec2-user/
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube version
rm minikube-linux-amd64

## Install VSCode extensions
code-server --install-extension amazonwebservices.aws-toolkit-vscode --force
code-server --install-extension ms-azuretools.vscode-docker --force
code-server --install-extension ms-kubernetes-tools.vscode-kubernetes-tools --force
code-server --install-extension ms-python.python --force

## Clone Git repository for the App
cd ~/environment
git clone https://github.com/aws-samples/python-fastapi-demo-docker.git /home/ec2-user/environment/python-fastapi-demo-docker/

## Print AWS env vars
echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
echo "AWS_REGION: $AWS_REGION"
echo "PUBLIC_IP: $PUBLIC_IP"