---
layout: post
title: "Caching bug in .NET 4.7"
description: "A .NET 4.7 caching bug that made cached items null on a machine in a different time zone"
tags: [.NET, cache, bug, time zone]
comments: true
published: true
categories:
  - Blog
image: https://www.thuannguy.com/images/blog-image.jpg
---
# Caching bug in .NET 4.7

Recently, one member in my team reported a weird error: our web application kept throwing NullReferenceException after he installed .NET 4.7 on his machine. Frankly, this is not the first time that installing a .NET update broke something, but the weird thing was that the issue didn't happen on other machines this time. Although reproducing it wasn't possible, the collected stack trace from the "faulty" machine suggested that somehow all items gotten from Cache were null. Googling the issue showed me that it is a [bug in .NET 4.7](https://support.microsoft.com/en-us/help/4035412). Another [question](https://forums.asp.net/t/2123507.aspx?+NET+Framework+4+7+breaking+Web+Forms+Page+Cache) in the ASP.NET forum spotted the exact issue in code:

![The buggy method](https://www.thuannguy.com/images/cachebug.png "The buggy method")

Fixing the issue for my own code without having to wait for a fix from .NET was easy: use UTC DateTime for the absoluteExpiration parameter.

But why did it happen on just one machine? Thinking about it, an object gotten from cache being null means it has expired. This in turn means that the absoluteExpiration time had to be before GMT+0 on that machine but be after GMT+0 on other machines. Yeah, time zone was the reason. That specific machine used GMT-8 while all other machines used GMT+7.

*Analysis: this post is written as an example of a short post about a problem I encounter with my daily job. The post needs to start from what the problem is to how to solve it and end with some additionally useful information.*