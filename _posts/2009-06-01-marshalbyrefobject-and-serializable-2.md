---
layout: post
title: "MarshalByRefObject and Serializable"
description: "MarshalByRefObject and Serializable"
tags: [MarshalByRefObject, Serializable, .Net]
comments: true
---

Recently I ran into a problem with "serializable" object. After I figured the problem out, I think it is deserved to share with everyone who just begins to learn C# :-P

The case is simple: I have a component which opens a port so that another application can connect to. I'm developing it, and want to write an integration test; in which I start the component in a remote host.

My Component is as simple as this:

		AppDomainSetup setup = new AppDomainSetup{ConfigurationFile = "remoteApp.config"};
		var remoteAppDomain = AppDomain.CreateDomain("aremotedomain", null, setup);
		var remoteService = (SimpleComponent)remoteAppDomain.CreateInstanceFromAndUnwrap("SimpleService.dll", "SimpleServiceNameSpace.SimpleComponent");
		Console.Out.WriteLine("Current AppDomain Id: " + AppDomain.CurrentDomain.Id);
		remoteService.Start();

Now I start the component in a remote AppDomain: 

		AppDomainSetup setup = new AppDomainSetup{ConfigurationFile = "remoteApp.config"};
		var remoteAppDomain = AppDomain.CreateDomain("aremotedomain", null, setup);
		var remoteService = (SimpleComponent)remoteAppDomain.CreateInstanceFromAndUnwrap("SimpleService.dll", "SimpleServiceNameSpace.SimpleComponent");
		Console.Out.WriteLine("Current AppDomain Id: " + AppDomain.CurrentDomain.Id);
		remoteService.Start();

When running the code, CreateInstanceFromAndUnwrap throws an exception: 

		Type 'SimpleServiceNameSpace.SimpleComponent' in assembly 'SimpleService, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null' is not marked as serializable.

Uhm, the object is created in the remote AppDomain and is transfer to the CurrentAppDomain, so it makes sense to require the object to be serializable. Make the object serializable? Nothing is as simple as this, isn't it? I come back to the class and mark it with the "Serializable" attribute. 

		[Serializable]
		public class SimpleComponent

Yeah, I get no more error now. I can create an AppDomain and start my component. However, the debug code (Console.Out.WriteLine...) gives me:

> Current AppDomain Id: 1

> Remote AppDomain Id: 1

Oops, doesn't it mean that the component is started in the CurrentAppDomain, not in the remote one!??
Well, it's time to ask my old friend, Google, for help. After searching and looking at sample codes which do similar scenario, I realize that those classes inherit from MarshalByRefObject instead of marking with Serializable attribute.
Honestly speaking, I read document about MarshalByRefObject many times before I didn't get what it is used for :-P In fact, I just understand some thing when I really need it!!!
A quote from MSDN (http://msdn.microsoft.com/en-us/library/system.marshalbyrefobject.aspx):

> MarshalByRefObject is the base class for objects that communicate across application domain boundaries by exchanging messages using a proxy. Objects that do not inherit from MarshalByRefObject are implicitly marshal by value. When a remote application references a marshal by value object, a copy of the object is passed across application domain boundaries.

Using MarshalByRefObject, I get:

> Current AppDomain Id: 1

> Remote AppDomain Id: 2

Blah blah, it works.
Shortly speaking: with MarshalByRefObject I get a reference to the remote object via a proxy. When I invoke a method, it is invoked in the remote appdomain via that proxy. On the contrary, with Serializable attribute, a copy of the remote object is made in the current app domain. Thus, the method is invoked in the current app domain as well.
