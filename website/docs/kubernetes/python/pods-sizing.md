---
title: Right-Sizing Your Pods with Minikube and Metrics Server
sidebar_position: 6
---

## Objective
This guide aims to equip you with the necessary skills to optimally size your Kubernetes pods according to your application's specific needs. You will learn how to install and configure the Kubernetes Metrics Server to monitor your pods' resource consumption. Additionally, you will utilize the ['hey' tool](https://github.com/rakyll/hey) to simulate real-world load scenarios. 

## Prerequisites
- [Accessing the FastAPI App](./access-app.md)
## 1. Installing the 'hey' tool
In a terminal, install 'hey' with [Homebrew](https://brew.sh/):
```bash
brew install hey
```
Alternatively, for other installation options, refer to the ['hey' documentation](https://github.com/rakyll/hey).

## 2. Enabling the Metrics Server
If it's not already running, start minikube:
```bash
minikube start
```

Enable the Metrics Server in minikube with the following command:
```bash
minikube addons enable metrics-server
```

## 3. Retrieving the Microservices Application URL
In this step, we're going to retrieve the URL for the 'fastapi-service' from our minikube cluster. This URL will be used to direct requests to our microservices application.

Use the following command to get the service URL:
```bash
minikube service fastapi-service -n my-cool-app --url
```
## 4. Generating Load
In this step, we'll generate load on our microservices application using the 'hey' tool. First, replace the `YOUR_URL` placeholder in the following command with the URL you obtained in the previous step. Then, run the command to send 1000 requests with a concurrency of 50 to the application:
```bash
hey -n 1000 -c 50 YOUR_URL
```
This 'hey' command will make 50 requests at a time until it reaches a total of 1000 requests.

## 5. Examining CPU and Memory Usage
After the 'hey' command finishes executing, you'll see a summary of the performance results. Here's an example of what you might see:
```
Summary:
  Total:	1.1407 secs
  Slowest:	0.1167 secs
  Fastest:	0.0045 secs
  Average:	0.0543 secs
  Requests/sec:	876.6463
  
  Total data:	385000 bytes
  Size/request:	385 bytes

Response time histogram:
  0.005 [1]	|
  0.016 [101]	|■■■■■■■■■■■■■
  0.027 [313]	|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.038 [37]	|■■■■■
  0.049 [5]	|■
  0.061 [4]	|■
  0.072 [30]	|■■■■
  0.083 [281]	|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.094 [122]	|■■■■■■■■■■■■■■■■
  0.105 [66]	|■■■■■■■■
  0.117 [40]	|■■■■■


Latency distribution:
  10% in 0.0157 secs
  25% in 0.0179 secs
  50% in 0.0725 secs
  75% in 0.0820 secs
  90% in 0.0951 secs
  95% in 0.1042 secs
  99% in 0.1151 secs

Details (average, fastest, slowest):
  DNS+dialup:	0.0006 secs, 0.0045 secs, 0.1167 secs
  DNS-lookup:	0.0000 secs, 0.0000 secs, 0.0000 secs
  req write:	0.0000 secs, 0.0000 secs, 0.0021 secs
  resp wait:	0.0532 secs, 0.0045 secs, 0.1015 secs
  resp read:	0.0003 secs, 0.0000 secs, 0.0630 secs

Status code distribution:
  [200]	1000 responses
```

## 6. Monitoring CPU and Memory Usage
Proper monitoring of your application's resource usage is crucial for performance tuning and infrastructure planning. As your application receives requests, both the CPU and memory consumption may vary. To assess how your application performs under load, we will utilize Kubernetes Metrics Server to monitor the CPU and memory usage.

### Retrieving Pod Names
First, retrieve the names of all pods running in your Kubernetes cluster. You can accomplish this using the following command:
```bash
kubectl get pods -n my-cool-app
```
Your output should look something like this:
```bash
NAME                                  READY   STATUS    RESTARTS   AGE
fastapi-deployment-59fcfb8849-g2rwk   1/1     Running   0          19h
fastapi-postgres-0                    1/1     Running   0          16h
```

### Checking Resource Usage for a Specific Pod
Once you have the pod names, you can monitor the CPU and memory usage of each pod using the "top pod" command. Here's how to check the resource usage of a specific pod:
```bash
kubectl top pod <pod name>
```

This will provide you with the CPU and memory usage of the specified pod, as shown in the following examples:
```
NAME                                 CPU(cores)   MEMORY(bytes)
fastapi-microservices-7c997f68cc-nrrj8   101m         103Mi
```
```bash
NAME                 CPU(cores)   MEMORY(bytes)   
fastapi-postgres-0   1m           17Mi   
```

### Checking Resource Usage for the Entire Node
To gain an overall understanding of the resource consumption in your node, you can use the "top node" command. Run the following command to get the resource usage for all pods running on your node:
```bash
kubectl top node
```
You should see something like this:
```bash
NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%   
minikube   418m         10%    2388Mi          30%    
```

## 7. Interpreting the Data
The "kubectl top pod" and "kubectl top node" commands provided us with some insightful data about our [CPU](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-cpu) and [memory](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory) usage. Here's a quick rundown on what we learned.

:::caution

Take note that setting **CPU limits** in a Kubernetes environment is generally not recommended unless you have a thorough understanding of your application's thread behavior within CPU time slices. For more details on managing CPU limits, refer to [Using Prometheus to Avoid Disasters with Kubernetes CPU Limits](https://aws.amazon.com/blogs/containers/using-prometheus-to-avoid-disasters-with-kubernetes-cpu-limits/).

:::
#### 'fastapi-microservices-7c997f68cc-nrrj8' Pod
 
- **CPU(cores)**: This pod was using approximately 101m CPU. This value, expressed in milliCPU units (m), represents the amount of CPU resources the pod is using. In this case, 101m corresponds to roughly 0.1 of a single CPU core. If your application experiences high load, it may benefit from an increase in the CPU limits defined in the Kubernetes pod configuration.
- **MEMORY(bytes)**: The memory usage of this pod was around 103Mi, which is about 103 Mebibytes of RAM. If the application encounters high load, consider increasing the memory limits in the Kubernetes pod configuration.

#### 'fastapi-postgres-0' Pod

- **CPU(cores)**: The CPU usage was only 1m, signifying that the pod is using approximately 0.001 of a single CPU core. This minimal usage suggests that the current CPU resources allocated are more than sufficient.
- **MEMORY(bytes)**: This pod was using around 17Mi memory, or about 17 Mebibytes of RAM. This suggests that the current memory allocation is more than adequate.

#### Node Resource Usage

- **CPU%**: The entire node was using 10% of its total available CPU capacity. If your application needs more CPU resources under high load, the node has substantial unused capacity to accommodate this demand.
- **MEMORY%**: The node was using 30% of its total available memory. Should your application require additional memory resources during high load, the node has ample unused memory to meet this need.

## Conclusion
This guide has provided you with the understanding and tools needed to optimally size your Kubernetes pods based on your application's unique requirements. By using the 'hey' tool and Kubernetes Metrics Server, you can simulate real-world load scenarios, monitor resource usage, and make informed decisions regarding your pods' CPU and memory requests. Remember that setting CPU limits should be approached with caution, understanding the intricacies involved in the process.