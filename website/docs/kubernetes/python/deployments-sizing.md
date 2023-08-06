---
title: Updating Kubernetes Manifests with Appropriate Resource Limits and Requests
sidebar_position: 7
---

## Objective
This guide shows how to update the resource requests and limits data based on our load testing to ensure that our applications have enough resources to handle high load, while also optimizing the overall resource usage in our cluster.
## Prerequisites
- [Right-Sizing Your Pods with Minikube and Metrics Server](./pods-sizing.md)
## 1. Updating fastapi-app.yaml for Enhanced Resource Management
The [fastapi-app.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/kubernetes/fastapi-app.yaml) manifest contains the resources for our FastAPI application. We're going to adjust the resource requests and limits for this deployment based on the data we've gathered.

From the 'python-fastapi-demo-docker' project directory, open the **fastapi-deployment.yaml** in a text editor and find the section that defines the resources for the **web** container:
```bash
        resources:
          requests:
            cpu: "100m"
            memory: "100Mi"
          limits:
            cpu: "500m"
            memory: "500Mi"
```

Based on our load testing results, increase the limits to allow the application to utilize more resources under high load:
```bash
        resources:
          requests:
            cpu: "200m"
            memory: "200Mi"
          limits:
            cpu: "1000m"
            memory: "1000Mi"
```

## 2. Updating postgres-db.yaml for Efficient Resource Utilization
The [postgres-db.yaml](https://github.com/aws-samples/python-fastapi-demo-docker/blob/main/kubernetes/postgres-db.yaml) manifest contains the resources for our PostgreSQL database. We'll adjust the resource requests and limits for this deployment as well. 

Open the **postgres-db.yaml** file in a text editor and find the section that defines the resources for the **db** container:
```bash
        resources:
          requests:
            cpu: "100m"
            memory: "100Mi"
          limits:
            cpu: "500m"
            memory: "500Mi"
```

Based on load testing, the PostgreSQL pod was not using much of its allocated resources, decrease the limits to free up resources for other pods:
```bash
        resources:
          requests:
            cpu: "50m"
            memory: "50Mi"
          limits:
            cpu: "250m"
            memory: "250Mi"
```

## 3. Applying the Configurations
Once you've updated your manifests, apply the changes using the following commands:
```bash
kubectl apply -f kubernetes/fastapi-app.yaml
kubectl apply -f kubernetes/postgres-db.yaml
```

## 4. Retrieving the Pod Names
Now let's confirm that the changes have been correctly applied by using the 'describe pod' command. This command provides a detailed view of the configuration for a specific pod, including its resource allocation. 

Since new pod names were generated based on our changes, let's retrieve the names of all pods in the namespace:
```bash
kubectl get pods -n my-cool-app
```
You should see something like this:
```bash
NAME                                  READY   STATUS    RESTARTS   AGE
fastapi-deployment-86574858b9-n2c8t   1/1     Running   0          2m32s
fastapi-postgres-0                    1/1     Running   0          2m15s
```

## 5. Verifying FastAPI App Resource Allocation
Next, check the 'fastapi-deployment' pod, which hosts our FastAPI application:

```bash
kubectl describe pod fastapi-deployment-86574858b9-n2c8t -n my-cool-app
```

Look for the 'Resources' section under 'Containers' in the output. This section will display the CPU and memory requests and limits that we just set for the pod:
```bash
Name:             fastapi-deployment-86574858b9-n2c8t
Namespace:        my-cool-app
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Tue, 30 May 2023 14:58:40 -0600
Labels:           app=fastapi-app
                  pod-template-hash=86574858b9
Annotations:      <none>
Status:           Running
IP:               10.244.0.182
IPs:
  IP:           10.244.0.182
Controlled By:  ReplicaSet/fastapi-deployment-86574858b9
Containers:
  web:
    Container ID:   docker://000e84888b11a3610e96f1b07a011ed1cded6f841d8f0c79ac49583e2e2c9a38
    Image:          000866617021.dkr.ecr.us-east-1.amazonaws.com/fastapi-microservices:1.0
    Image ID:       docker-pullable://000866617021.dkr.ecr.us-east-1.amazonaws.com/fastapi-microservices@sha256:0000787b6b4027380f8e94e21b02a7760b8ba75de555fba1d03eb8fb0773732b
    Port:           8000/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Tue, 30 May 2023 14:58:41 -0600
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     1
      memory:  1000Mi
    Requests:
      cpu:     200m
      memory:  200Mi
    Environment Variables from:
      fastapi-secret  Secret  Optional: false
    Environment:      <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-xhsbz (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  kube-api-access-xhsbz:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   Burstable
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  4m47s  default-scheduler  Successfully assigned my-cool-app/fastapi-deployment-86574858b9-n2c8t to minikube
  Normal  Pulled     4m46s  kubelet            Container image "985866617021.dkr.ecr.us-east-1.amazonaws.com/fastapi-microservices:1.0" already present on machine
  Normal  Created    4m46s  kubelet            Created container web
  Normal  Started    4m46s  kubelet            Started container web
```

## 6. Verifying PostgreSQL Resource Allocation
Finally, check the pod that hosts our PostgreSQL application:
```bash
kubectl describe pod fastapi-postgres-0 -n my-cool-app
```
You should see something like this:
```bash
Name:             fastapi-postgres-0
Namespace:        my-cool-app
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Tue, 30 May 2023 14:58:57 -0600
Labels:           app=fastapi-postgres
                  controller-revision-hash=fastapi-postgres-fd75b6dff
                  statefulset.kubernetes.io/pod-name=fastapi-postgres-0
Annotations:      <none>
Status:           Running
IP:               10.244.0.183
IPs:
  IP:           10.244.0.183
Controlled By:  StatefulSet/fastapi-postgres
Containers:
  db:
    Container ID:   docker://0002edf4824a407dad31db6f15bb9ae061387094e5c4e49e203ec9b4d68741d2
    Image:          postgres:13
    Image ID:       docker-pullable://postgres@sha256:000dfa460d462d50d2ddee473d0793f5d1b35626ea243ab58bfef78bd8e69091
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Tue, 30 May 2023 14:58:58 -0600
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     250m
      memory:  250Mi
    Requests:
      cpu:     50m
      memory:  50Mi
    Environment Variables from:
      fastapi-secret  Secret  Optional: false
    Environment:      <none>
    Mounts:
      /var/lib/postgresql/data from postgres-data (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-7n6xk (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  postgres-data:
    Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)
    ClaimName:  postgres-data-fastapi-postgres-0
    ReadOnly:   false
  kube-api-access-7n6xk:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
QoS Class:                   Burstable
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  13m   default-scheduler  Successfully assigned my-cool-app/fastapi-postgres-0 to minikube
  Normal  Pulled     13m   kubelet            Container image "postgres:13" already present on machine
  Normal  Created    13m   kubelet            Created container db
  Normal  Started    13m   kubelet            Started container db
```

## Conclusion
This guide showed how to update the Kubernetes manifests for the FastAPI and PostgreSQL deployments in response to our load testing data. This ensures that your application has the resources it needs to perform well under high load, while also making efficient use of your cluster's resources.