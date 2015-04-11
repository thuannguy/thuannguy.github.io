---
layout: post
title: "Race condition bug of Windsor Castle child container 3.x"
description: "Race condition bug of Windsor Castle child container 3.x"
tags: [container, race condition, thread-safe, Windsor Castle]
comments: true
---

Our web application uses the child container feature of Windsor Castle. For every web request, a new child container is created:

		var childContainer = new WindsorContainer { Parent = container }; 

Problem is the child container occasionally couldn't resolve services that are registered in the parent container when the system is under high load. Some debugging showed me that when the error happened, childContainer.Kernel.Parent is null while normally it is not. What could probably happen here? Following code of the Parent setter eventually led me to:


		public virtual void AddChildContainer(IWindsorContainer childContainer) 
		{ 
			if (childContainer == null) 
				throw new ArgumentNullException("childContainer"); 
			if (this.childContainers.ContainsKey(childContainer.Name)) 
				return; 
			lock (this.childContainersLocker) 
			{ 
				if (this.childContainers.ContainsKey(childContainer.Name)) 
					return; 
				this.kernel.AddChildKernel(childContainer.Kernel); 
				this.childContainers.Add(childContainer.Name, childContainer); 
				childContainer.Parent = (IWindsorContainer) this; 
			} 
		}

Windsor container has a dictionary which keeps track of all children whose key is container's name. According to that piece of code, child kernel won't be set when a container's name already exists in the dictionary. Let's look at how the container's name is generated (reflected code):

		public WindsorContainer(IKernel kernel, IComponentsInstaller installer) 
			: this(AppDomain.CurrentDomain.FriendlyName + (object) " xD83CxDFF0 " + (string) (object) ++WindsorContainer.instanceCount, kernel, installer) 
		{ 
		}

++WindsorContainer.instanceCount is obviously not thread-safe. 

A workaround is to switch to use another constructor where I can generate truly unique name:

		var childContainer = new WindsorContainer(Guid.NewGuid().ToString(), 
			new DefaultKernel(), new DefaultComponentInstaller()) { Parent = container }; 
