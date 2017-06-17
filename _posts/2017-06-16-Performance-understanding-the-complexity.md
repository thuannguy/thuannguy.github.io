---
layout: post
title: "Performance: understanding the complexity of SLAs"
description: "Performance: understanding the complexity of SLAs"
tags: [Asp.Net, performance, optimization, SLA, complexity]
comments: true
---

In the previous post I have discussed about the most common performance-wise SLAs and this second post will go into more details.
First of all, it is obvious that not all web applications need all those SLAs. For instance, let's say I have a web application that middle managers of an organization can use to review time registration of their employees every day. This kind of system generates very small load per second, but it must every request very quickly because the managers can be very impatient. Therefore, the latency SLA is all that you need to pay attention to. On the other hand, your application also has a feature what provides monthly time usage reports for all users, chance is that the users are more tolerant to slow responses, namely they are more willing to wait for a few second or even a minute to have their reports ready. Since the users can come in and request for the reports at the same time in the end of a month, it must be able to serve high amount of requests in short period of time which amplifies the importance of the throughput SLA.
In summary, when it comes to performance matter, it is important to analyze  usage models of your application to make sure you can define relevant SLAs for it.

For the rest of this post, I'm going to simplify how server resources are utilized for the ease of explaining my points.

Let's move on to the point of this post: how hard are those SLAs? In my opinion, each SLA alone is not difficult. It is the combination of them make the job hard, and sometimes deadly. Starting with the throughput SLA, given that a server has 8 cores and it needs to serve 200 GET requests/second, that results in 25 requests/second/core which roughly equivalent to 40ms/request. So if I can optimize my code to make sure it can process a GET request in 20ms, aren't that both the throughput and the latency SLAs satisfied? In Asp.Net world, it is not that easy due to various reasons.

## Common issues
Just ask Google for those: https://www.google.com/?q=asp.net+performance+issues


## Context switching
When an application is at high load, IIS and Asp.Net will need to switch between contexts between the requests more often that cause bigger latency.

## I/O bottleneck
A web application usually needs to access a database, write log data to disk, and call external services which are all I/O operations. If an I/O operation synchronously, a thread is blocked until the I/O is done which makes it one less worker thread to serve incoming requests. On the other hand, while asynchronous I/O can help reduce thread blocking, it doesn't always lead to lower latency because your application needs to wait for I/O to complete anyway.
A typical solution for reducing accessing database is to use caching. A distributed caching mechanism trades a I/O call to database with a I/O call to the caching service. Meanwhile, in-memory caching mechanism makes the w3wp.exe process consume more memory (letting aside the difficulty of doing cache invalidation properly).

Anyway, when a system is under high load, I/O blocks will happen more frequently which damage latency significantly.

## Memory usage
Every incoming request causes memory allocation which will need to be collected by GC later. Memory allocation for a single request is usually neglectable thank to managed code and GC. However, under high load, the total amount of allocated memory may be very high which means GC needs to work harder and more frequently. Remember the caching technique I mentioned above? Caching data in memory for long time makes them into GC Gen 2. When GC kicks in, sometimes it needs to block all threads even in Server mode which also causes slow response time. In one particular case, one of my applications allocated nearly a GB of memory to load a new package of data every hour which caused GC to block all threads for more than a second. 

## Data size
Data size is another common hidden problem. Code that runs well with a small amount of data doesn't mean it will perform well with large amount of data. Larger data means more memory usage, more time to get data from database, or more CPU time.

## The servers are not all mine
In reality, both the web and database servers are not all mine. In fact, they usually run other background applications, monitoring services, reporting services and more which all consume server resources.


While it is true that you can immediately think of a solution for each of the problem I mentioned above as well as there are many other problems, my point is that under high load things that are normally neglectable could suddenly damage responsiveness severely. Remember, if the responsiveness SLA is 99.9%, having just 2 slow requests out of 1000 requests is automatically a breach of contract. I can assure you that when it comes to responsiveness SLA, 90% is a piece of cake, 99% is pretty easy, 99.5% is harder but still doable. However, from 99.5% onwards, the difficulty increases exponentially for each 0.1%.
