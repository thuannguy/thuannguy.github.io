---
layout: post
title: "Windbg commands"
description: "Windbg commands"
tags: [Windbg, commands]
comments: true
published: false
---
Windbg commands

Occasionally I need to use Windbg to analyze issue in production environment. Problem is I can never remember its commands and google for them can be annoying because the commands may change between different .Net versions. Perhaps writing a blog post so that I can find them later using Google is a good idea! 

# Common commands
Load SOS:
```
.loadby sos clr
```

# Exception commands
Dump all exceptions of a specific type:
```
!dumpheap -type [Exception type]
```
For example:
```
!dumpheap -type System.Reflection.ReflectionTypeLoadException
```

The fun thing is thanks to GC, exception objects are usually still be in memory somewhere after they happened but before GC do its job.   

Dump content of an exception:
```
!DumpObj /d [Address]
```
This step is in fact simple because you can click on the address shown in Windbg.

# Threading commands
[Will update when I need them again :)]