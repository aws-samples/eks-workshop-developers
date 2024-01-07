---
title: "Results of the optimization steps"
sidebar_position: 6
---

For the different labs, we looked at one optimization at a time: we started with the initial container image without optimization, used jlink and jdeps for a custom runtime, introduced jib, and finally used GraalVM. The following table shows the different versions with the image size and the start time of the application (tested using Amazon EKS).

| Version         | Image Size | Start time (p99) |
| -----------     |------------|------------------|
| No optimization | 380MB      | 12.5s            |
| Custom JRE      | 257MB      | 12.1s            |
| Jib             | 212MB      | 10.5s            |
| GraalVM         | 166MB      | 0.92s            |

We can see very clearly from the table that different optimizations lead to different results. All optimizations show a significant reduction in the size of the container image. In terms of startup times, GraalVM clearly stands out with less than one second, for the well-known reasons.

But which optimization step should customers use in their applications? On the one hand, this depends very much on what the optimization goal is and what technical skills are available in the teams. The simplest of the optimization techniques mentioned is the use of Jib, as this hardly requires any changes in the build step. For a custom runtime, extensive changes in the Dockerfile are necessary. In addition, jdeps can only detect compile time dependencies, any runtime dependencies have to be added manually. The most difficult optimization is to use native-image and GraalVM, especially for applications that have been implemented some time ago without GraalVM in mind.
