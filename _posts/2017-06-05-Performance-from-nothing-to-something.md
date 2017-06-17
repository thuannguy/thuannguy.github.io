---
layout: post
title: "Performance: from nothing to something"
description: "Performance: from nothing to something"
tags: [Asp.Net, performance, optimization, SLA]
comments: true
---

# Performance: from nothing to something

In this series I'm writing about my little journey on writing high performance web application using Asp.Net (disclaimer: performance of my application is still not high enough yet!) with focus on knowing your targets, understanding the complexity of those targets, and working towards the targets. As a side note, I'm using the terms "high performance" and "highly scalable" interchangeably.

To start with, the most interesting observation is that in order to design and develop high performance application you need to have a clear definition about what kind of performance you want to have. Throughout my career so far, I have gone through a few levels of definitions:

## 1. I didn't know/I didn't care
That was when I just started working as a developer and my only target was to write code that could work!
## 2. I thought I wrote good code
I applied a few best practices such as using StringBuilder to concatenate many strings, avoiding boxing and unboxing, or using dictionary for fast look up etc. As a result, I could proudly (and wrongly) claim that I knew how to write high performance code and that my application could highly perform.
## 3. The "perceptive" high performance application
This was when I faced a little bit reality check: Usually a customer came and told me that my application was too slow to load a page or to serve a request and that I needed to make it faster. No problem then! Let fire up my favorite profiler tools to find out some stupid SQL queries or backend code or JavaScript. At the end of the day, code did run faster and the customer was happy. 

The problem of all the above cases is that they produced an illusion about performance capacity of my applications as well as my skills. As it turned out, I had absolutely no evidence to prove that performance of my application was good (and in fact, more often than not it sucked). The third case, while had some output value to my customers, was actually very limited because it worked just for those customers in some specific condition. One unfortunate aspect of cases like this is that it creates an illusion about performance capacity of my applications as well as my skills. I have seen many developers, including myself, who designed and claimed to have "high-performance and scalable" systems but only took this kind of performance criteria into account.
## 4. The ugly truth or SLAs
In the context of this blog post, I will focus on SLAs that are relevant to performance of web applications. SLA stands for "Service Level Agreement" which defines (again, in the context of this blog post) in exact numbers the level of performance that your applications must satisfy. In my opinion, the rule of thumb when it comes to performance is that you must always work with numbers. For example, do not say "my application is very fast" but say "my application is very fast because it can serve all requests in under 10ms". The 3 most popular SLAs are:
Availability: While availability is not a pure SLA for performance, I mention it here because what is the point of having a high performance application that is not available to use?

| Availability | 99.9% |   |   |   |
|--------------|-------|---|---|---|
| Availability | 99%   |   |   |   |

For instance, a week has 10080 minutes which means if SLA is 99.9% I will have 10 minutes down time/week for maintenance or upgrade. I gotta do it quickly!
Throughput: Throughput is a measure of the rate that work can be completed and is measured in operations per second.
Credit: I learned about the definitions for all these concepts from https://blogs.msdn.microsoft.com/mcsuksoldev/2015/01/22/why-building-highly-scalable-applications-is-hard-part-1/ It is the best article about writing highly scalable software I have ever read and I just can't recommend it highly enough.

| System                            | Throughput               | Throughput                  |   |   |
|-----------------------------------|--------------------------|-----------------------------|---|---|
| User account page                 | 100 users/second/node    | 280 users/second/3 nodes    |   |   |
| GET a single user via RESTful API | 200 requests/second/node | 550 requests/second/3 nodes |   |   |

The numbers are straightforward: for every 1000 API requests, at least 999 of them must be served within 800ms.

Latency: Latency is a measure of how long it takes an operation to complete and is normally measured in seconds. 

| System                            | Response time | Percentage | Response time | Percentage |
|-----------------------------------|---------------|------------|---------------|------------|
| User account page                 | 1000ms        | 90%        | 2000ms        | 99.9%      |
| GET a single user via RESTful API | 500ms         | 90%        | 800ms         | 99.9%      |

Concurrency: Concurrency is the number of operations that are being processed at any moment.
			Concurrency = Latency x Throughput.
So if latency of a GET request is 0.5s and my application can serve 200 requests/second, its concurrency is 0.5 * 200 = 100 concurrent active requests.

Taking all the above into account, my application must be able to:
	- Serve 200 GET user requests/second/node.
	- Serve 200 GET user requests/second/node and each request must take maximum 800ms.
	- Serve 200 GET user requests/second/node and each request must take maximum 800ms during a long period of time without any hiccup: 24hours or 7 days.
	- Serve 200 GET user requests/second/node and each request must take maximum 2000ms during a long period of time without any hiccup: 24hours or 7 days when your database has 100.000.
	
As a side note, all SLAs should be defined with a minimum requirements for hardware configurations. By the time of this writing, a popular server may sport 8 cores with 8-16GB memory. For systems that need other hardware such as database servers, you should define minimum configurations for them too.
