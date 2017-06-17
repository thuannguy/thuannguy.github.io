---
layout: post
title: "Performance: a development approach"
description: "Performance: a development approach"
tags: [Asp.Net, performance, optimization, SLA]
comments: true
---

In the two previous posts I have discussed about SLAs and the difficulty of satisfying all of them. Question now is: if I'm about to develop a new application or optimize an existing application, what should I do? How should I approach the problem? My suggestions are:

## Define SLAs
If you are developing an in-house application, you must define the SLAs. If you are developing an application for your customer, work with them to build the SLAs if they don't already have them. You need to know where you are going to.

## Define internal KPIs/metrics
In addition to SLAs, you can define a set of internal KPIs/metrics. For example, a GET request can comprise of a validation step, a rountrip to database, and returning data to the client side. You can define maximum latency that an access to database can have.

## Invest in a complete set of test cases, good testing tools and environments
In this step, you need to design all necessary test cases to cover all use cases specified by the SLAs.

Automating those test cases are a must because you will need to run them for every single change you make to code or environment. Tools such as JMeter, Selenium, Visual Studio tests can be great help here. If you want to load test a public-facing web applications, especially RESTful API, I'd recommend you check [loader.io](https://loader.io) out. That awesome tool has a free option that can generate thousands of test clients against your system.

Finally, you need to build good test environments that are as close to the production environments as possible. Using cloud services to only turn them on when you need them is a good way to save cost.
Make sure you tests can collect necessary information such as performance counters. In addition, your test tool must be able to generate performance reports that reflect all the SLAs. 
After all, building all the above needs tremendous efforts and money but you must have them in place.

## Measure, measure, and measure
I just can't emphasize this enough. You need to measure:
- Before doing optimization to know where you currently are.
- After finishing optimization to know how much your application has improved in compared to the previous state.
- After doing any change you make to make sure performance isn't down.
- After every change made to an environment.

Other tools such as Jetbrains' dottrace and memory trace, Red Gate's Ant profiler, Microsoft's Perfview, Windows' performance counters can be great help to collect and analyze performance issues.


## Have a team
I don't care how awesome a developer you are, you need a team and the more diversity the team is the better. Each member in a team is able to look at the same issue and data at different perspectives, raise his or her ideas and challenge your ideas.


## Pick external libraries right
Sadly, not all libraries are developed with performance in mind. When you need to use an external library, make sure that it has good reputation in term of performance. In the worst case, make sure that it is open source so that you can improve its performance when needed. 

## Performance is a feature
Yes, [Performance is a feature](https://blog.codinghorror.com/performance-is-a-feature/). Please pay attention to the usage of Miniprofiler. Making performance numbers visible to the whole team is a great way to increase awareness. You don't want anyone in your team to write code that kills performance of your application withoug noticing, do you?

## What's next?
In the first post of the series, I introduced about SLAs. The second post is about why it is hard to satisfy them all and this one is about a methodology to deal with them. Hopefully I will have time to come back with more posts about technical tips for each of the problems I described in the second post.
