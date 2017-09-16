---
layout: post
title: "Dependency injection: dealing with large object graph"
description: "Dependency injection: dealing with large object graph"
tags: [dependency injection, object graph, performance]
comments: true
---
# Dependency injection: dealing with large object graph

When using an IoC container to do [Dependency Injection](https://martinfowler.com/articles/injection.html), while resolving the [composition root](https://stackoverflow.com/questions/6277771/what-is-a-composition-root-in-the-context-of-dependency-injection) seems effortless because the container does it all, in fact it does take CPU time and in some cases it takes more than expected. In this post, I'm discussing about a case in which resolving time became a real problem for me as well as a few methods to solve it ranging from typical to extreme extent.

*Analysis: In this introduction section I quickly described about a problem and stated that there will be a few solutions in the next sections.*

## The problem with large object graph

When I started developing my web application, I used per-web-request lifestyle for most of the services registered to the IoC container. Everything had worked just fine until at one point the object graph reached to more than 600 objects and I had to [improve performance](https://www.thuannguy.com/blog/2017/06/16/Performance-understanding-the-complexity/) for it due to customers' demand. One of the first thing I noticed was that resolving the composition root alone took from 7ms to 25ms depending on load status of a server. As a side note, size of object graph is not the only factor that causes slow resolve time but it is out of the topic of this post.

*Analysis: In this section I described the problem in greater details. Alternatively, I can merge this section into the introduction section which means I can write about the problem in details directly there.*

## Measure

Any performance improvement must start with measuring the current state. However, my experience with this issue taught me one thing: for code that is as critical as resolving composition root of a whole big application, I should have had built-in profiling code for it from the beginning. It can be a custom [Performance counter](https://stackoverflow.com/questions/6277771/what-is-a-composition-root-in-the-context-of-dependency-injection), [Mini profiler](http://miniprofiler.com/), or at least using Stopwatch with a switch to turn on/off easily.

*Analysis: This section is when I started developing ideas to solve the problem.*

## Make objects cheap to create and dispose

Resolving a composition root means the whole object graph needs to be created. If some of the objects are expensive to create, namely their constructors take too much time and/or memory to create, I will have a big problem. I had a similar problem before when an object of mine created an object from an 3rd library that took 100ms.

*Analysis: One method after another. Notice that all sections focus on the sole problem mentioned in the opening section.*

## Decompose composition root

Another solution is to decompose the composition root into many smaller roots and only resolve the one I really need for an operation. I do think this should be the most viable options for most applications.

## Singleton, singleton, singleton all the ways

When all the above don't help as in my specific case, an extreme solution could be using Singleton for all the components in the object graph. Don't get me wrong, I'm not saying it is a great idea or should be used everywhere, but sometimes that sometimes the end justifies the means.

The point of this solution is that when my composition root is registered as a singleton service to a container, every time the container needs to resolve the composition root it simply returns the same object without having to create the whole object graph again and again. By doing this way, I was actually able to reduce resolving time to less than 0.1ms. However, there are a few challenges to get make this solution viable.

*Analysis: All the methods appeared in a specific order: from the most typical, easy to apply methods to the most extreme, difficult to apply ones which I think can help get my audiences get along with my post. If I had had start with the most extreme method, they might have thought I was making any sense and gotten back to browsing cat photos*

### Singleton all the ways

The first challenge is simple: all the objects in object graph that are dependency-injected to other objects must have singleton lifestyle due to the [Captive dependency issue](http://blog.ploeh.dk/2014/06/02/captive-dependency/)

### Singleton needs thread-safe

Since those singleton-lifestyle objects can be used by many threads concurrently, they must be thread-safe. Luckily, most of the classes of my application were designed as either a data object or a stateless service class, aka service class that has no data fields but fields that store references to other thread-safe services. Data objects are created manually and passed into the services. As a side note, A minority number of classes do have static fields to store some data though. I just had to make sure they are thread-safe.

### But not all classes can be designed that way

It's true. I have a few options:

* Use factory pattern which means that I can inject the factory service with singleton lifestyle and use it to create the real objects for each individual request.

```cs
public interface IPerWebRequestLifestyleServiceFactory
{
    public IPerWebRequestLifestyleService Create(/* more parameters can go here */);
}

public class DoSomethingSingletonService
{
    private readonly IPerWebRequestLifestyleServiceFactory perWebRequestLifestyleServiceFactory;
    public DoSomethingSingletonService(IPerWebRequestLifestyleServiceFactory perWebRequestLifestyleServiceFactory)
    {
        // sanity check...
        this.perWebRequestLifestyleServiceFactory = perWebRequestLifestyleServiceFactory;
    }

    public void DoSomething(int someInput)
    {
        var service = perWebRequestLifestyleServiceFactory.Create();
        service.DoSomething(someInput);
    }
}
```

* New objects directly.
* Define a container service which wraps the actual container and inject it to where it is needed. This option is useful when I need create a whole (small) object graph instead of just a single object. While you can rightly point out that this is a kind of service locator anti-pattern, I still happily used it because it worked well for me while none of the other options were viable on that specific situation.

```cs
public class DoSomethingSingletonService
{
    private readonly IContainerWrapper container;
    public DoSomethingSingletonService(IContainerWrapper container)
    {
        // sanity check...
        this.container = container;
    }

    public void DoSomething(int someInput)
    {
        var service = container.Resolve<IPerWebRequestLifestyleService>();
        service.DoSomething(someInput);
    }
}
```

## Befriend with container but also beware of it

In summary, an IoC container is a great tool to do DI with so many benefits. The hidden cost of resolving object graph is not container's fault but is caused by flaws in code design. Such hidden cost is easy to be overlooked because the container magically does all the hard job itself. Of all the methods I mentioned above, the singleton method is pretty extreme and should only be used after all the other methods still don't get you close to the performance level you need.

*Analysis: A short section that can help readers notice one more time all the main points as well as the unusualness of the singleton method.*