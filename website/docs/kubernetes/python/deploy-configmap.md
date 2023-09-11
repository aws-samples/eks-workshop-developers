---
title: Initializing PostgreSQL Database with Kubernetes ConfigMaps
sidebar_position: 3
---

## Objective
In the realm of container orchestration and cloud-native applications, initializing databases securely and efficiently is crucial. Kubernetes ConfigMaps offer a way to manage configuration data and scripts, like our `init.sh`, separate from the container image for better modularity and security. This lab walks you through the process of creating a Kubernetes ConfigMap for the `init.sh` script in the 'my-cool-app' namespace.

## Prerequisites
- [Creating a Kubernetes Cluster with Minikube](./minikube-create.md)

## 1. Creating the Kubernetes ConfigMap for Database Initialization
Our PostgreSQL database requires custom initialization, which is why we use an init.sh script. This script creates the database, user, and table. To manage this script, we create a Kubernetes ConfigMap. This ensures that the script is executed when the PostgreSQL container starts, initializing the database as required.

Navigate to the root directory of the 'python-fastapi-demo-docker' project where the init.sh script is located:
```bash
cd python-fastapi-demo-docker$
```

Generate the Kubernetes ConfigMap:
```bash
kubectl create configmap db-init-script --from-file=init.sh=server/db/init.sh -n my-cool-app
```

The expected output should look like this:
```bash
configmap/db-init-script created
```

## 2. Verifying the ConfigMap Creation
To ensure that your Kubernetes ConfigMap has been successfully created, you can use the kubectl get configmap command. This command lists all ConfigMaps in the current namespace:
```bash
kubectl get configmap -n my-cool-app
```

The expected output should look like this:
```bash
NAME               DATA   AGE
db-init-script     1      4m47s
kube-root-ca.crt   1      5m36s
```

## 3. Inspecting the ConfigMap Details
For a deeper understanding of your created ConfigMap, you can use the following command to obtain detailed information about the specified ConfigMap:
```bash
kubectl describe configmap db-init-script -n my-cool-app
```

The expected output should look like this:
```bash
Name:         db-init-script
Namespace:    my-cool-app
Labels:       <none>
Annotations:  <none>

Data
====
init.sh:
----
#!/bin/bash
...
```

## Conclusion
This lab guided you through the process of creating a Kubernetes ConfigMap that securely initializes your PostgreSQL database within a Minikube environment. 
