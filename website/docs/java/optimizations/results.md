---
title: "Results of the optimization steps"
sidebar_position: 306
---

In previous labs, we looked at one optimization at a time. We started with the initial container image without optimization, then used 'jlink' and 'jdeps' for a custom runtime, introduced 'jib', and finally used GraalVM. The following table shows the different versions with the image size and the start time of the application (tested using Amazon EKS).

| Version         | Image Size | Start time (p99) |
| -----------     |------------|------------------|
| No optimization | 380MB      | 12.5s            |
| Custom JRE      | 257MB      | 12.1s            |
| Jib             | 212MB      | 10.5s            |
| GraalVM         | 166MB      | 0.92s            |

We can see very clearly from the table that different optimizations lead to different results. All optimizations show a significant reduction in the size of the container image. In terms of startup times, GraalVM clearly stands out with less than one second, for well-known reasons.

The question remains, which optimization step should you use with your applications? On the one hand, this depends very much on what your optimization goal and technical skills available. The simplest of the optimization techniques is the use of Jib, as this hardly requires any changes in the build step. For a custom runtime, extensive changes in the Dockerfile are needed. In addition, 'jdeps' can only detect compile time dependencies, and any runtime dependencies have to be added manually. The most difficult optimization is using 'native-image' and 'GraalVM', especially for applications that have been implemented some time ago without GraalVM in mind.
