---
title: "Optimize Container Images"
sidebar_position: 1
---

Fast startup times are key to quickly react to disruptions and demand peaks, and they can increase the resource efficiency. In this section we start with a typical implementation with a base image and a full JRE. We're going to leverage [jib](https://github.com/GoogleContainerTools/jib) and build our own JRE using jdeps and jlink. As an additional step we'll use GraalVM native images to reduce the startup time and memory consumption of our application.

In this section, we will explicitly not perform code-level optimizations, as these are always very specific to a workload and profiling is usually required to find expensive code blocks. AWS offers [Amazon CodeGuru Profiler](https://docs.aws.amazon.com/codeguru/latest/profiler-ug/what-is-codeguru-profiler.html) for profiling applications. Amazon CodeGuru Profiler collects runtime performance data from your live applications, and provides recommendations that can help you fine-tune your application performance. Using machine learning algorithms, CodeGuru Profiler can help you find your most expensive lines of code and suggest ways you can improve efficiency and remove CPU bottlenecks.

Another important topic is memory management for Java applications in containers. Since Java 10, it has become much easier to manage the memory of a Java application in containers in a meaningful way, because previously the JVM was not aware of the memory and CPU allocated to the container. Fortunately, the fix has been backported to Java 8 (version 8u191). Now the JVM calculates its memory based on the memory for the container and not based on the memory for the underlying host. The best way to identify how much memory is necessary is through load testing in a pre-production environment such as a staging environment. You can collect these metrics with a service such as CloudWatch Container Insights. Or, do so by using Amazon Managed Service for Prometheus together with Amazon Managed Grafana. 

OOM errors are likely to occur during these tests. In order to be able to analyze these with tools such as Eclipse MAT (https://projects.eclipse.org/projects/tools.mat), it is necessary to generate a heap dump. This can be implemented automatically using `java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dump`, for example. Of course, a host file system must be included in the container so that the heap dump can also be analyzed later by the developers. With AWS Fargate, Amazon Elastic File System is ideal for this. Amazon Elastic File System (EFS) automatically grows and shrinks as you add and remove files with no need for management or provisioning.

![container-layers](./images/container-layers.png)
