---
layout: post
title: "Dependency injection: dealing with large object graph"
description: "Dependency injection: dealing with large object graph"
tags: [dependency injection, object graph, performance]
comments: true
---
Dependency injection: dealing with large object graph

I have a big web application that applies [Dependency Injection](https://martinfowler.com/articles/injection.html). Since it is a web application, it made sense that I started with using per-web-request lifestyle for most of the services registered to the IoC container. Everything had worked just fine until at one point my application had more than 600 components and I had to [improve performance](https://www.thuannguy.com/blog/2017/06/16/Performance-understanding-the-complexity/) for it. It turned out that resolving the [composition root](https://stackoverflow.com/questions/6277771/what-is-a-composition-root-in-the-context-of-dependency-injection) alone took from 7ms to 25ms depending on load status of a server. As a side note, size of object graph is not the only factor that causes slow resolve time but it is out of the topic of this post. Getting back on topic, I will discuss a few ways to deal with this issue.

# Measure
Any performance improvement must start with measuring the current state. However, my experience with this issue taught me one thing: for code that as critical as resolving composition root of a whole big application, I should have had built-in profiling code for it from the beginning. It can be a custom [Performance counter](https://stackoverflow.com/questions/6277771/what-is-a-composition-root-in-the-context-of-dependency-injection), [Mini profiler](http://miniprofiler.com/), or at least using Stopwatch with a switch to turn on/off easily.

# Make objects cheap to create and dispose
Resolving a composition root means the whole object graph needs to be created. If some of the objects are expensive to create, namely their constructors take too much time and/or memory to create, I will have a big problem. I had a similar problem before when an object of mine created an object from an 3rd library that took 100ms.

# Decompose composition root
Another solution is to decompose the composition root into many smaller roots and only resolve the one I really need for an operation.

# Singleton, singleton, singleton all the ways
When all the above don't help, an extreme solution could be using Singleton for all the components in the object graph. Don't get me wrong, I'm not saying it is a great or should be used everywhere, but sometimes that sometimes the end justifies the means.

The point of this solution is that when my composition root is registered as a singleton service to a container, every time the container needs to resolve the composition root it simply returns the same object without having to create the whole object graph again and again. By doing this way, I was actually able to reduce resolving time to less than 0.1ms. However, there are a few challenges to get make this solution viable.

## Singleton all the ways
The first challenge is simple: all the objects in object graph that are dependency-injected to other objects must have singleton lifestyle due to the [Captive dependency issue](http://blog.ploeh.dk/2014/06/02/captive-dependency/)

## Singleton means thread-safe
Since those singleton-lifestyle objects can be used by many threads concurrently, they must be thread-safe. Luckily, most of the classes of my application were designed as either a data object or a stateless service class, aka service class that has no data fields but fields that store references to other thread-safe services. Data objects are created manually and passed into the services. As a side note, A minority number of classes do have static fields to store some data though. I just had to make sure they are thread-safe. 

## But not all classes can be designed that way
It's true. I have a few options:

* Use factory pattern. This means that I can inject the factory service with singleton lifestyle and use it to create dedicated objects for each individual request.
* New objects directly.
* Define a container service which wraps the actual container and inject it to where it is needed. This option is useful when I need create a whole (small) object graph instead of just a single object. While you can rightly point out that this is a kind of service locator anti-pattern, I still happily use it because it works well for me.
