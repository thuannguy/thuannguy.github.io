---
layout: post
title: "Windbg commands"
description: "Windbg commands"
tags: [Windbg, commands]
comments: true
image: https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/images/windbggetstart01.png
---
Windbg commands

Occasionally I need to use [Windbg](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/getting-started-with-windbg) to analyze issue in production environment but I can never remember its commands and google for them can be annoying because the commands may change between different .Net versions. Perhaps writing a blog post so that I can find them later using Google is a good idea! 

## Common commands

Load SOS:
```
.loadby sos clr
```

## Memory commands

Dump all objects of a specific type:
```
!dumpheap -type [Type]
```

Get memory statistics:
```
!dumpheap -stat
```

View all heaps summary:
```
!EEHeap
```

View managed heap summary:
```
!EEHeap -gc
```

View loader heap summary:
```
!EEHeap -loader
```

View loaded modules which are loaded by using LoadLibrary:
```
lm
```

From CLR 4.0, custom .Net DLLs are no longer loaded using LoadLibrary. An alternative is:
```
!sos.dumpdomain
```


Check how much memory dlls/stack/heap takes:
```
!address -summary
```

which gives:
```
--- Usage Summary ---------------- RgnCount ----------- Total Size -------- %ofBusy %ofTotal
Free                                    451     7dfc`aa5e4000 ( 125.987 TB)           98.43%
<unknown>                              2745      203`40a8f000 (   2.013 TB)  99.98%    1.57%
Image                                  1340        0`11c92000 ( 284.570 MB)   0.01%    0.00%
Heap                                     45        0`01b0b000 (  27.043 MB)   0.00%    0.00%
Stack                                   136        0`015c0000 (  21.750 MB)   0.00%    0.00%
Other                                     7        0`001c5000 (   1.770 MB)   0.00%    0.00%
TEB                                      45        0`0005a000 ( 360.000 kB)   0.00%    0.00%
PEB                                       1        0`00001000 (   4.000 kB)   0.00%    0.00%
```

Native heaps:
```
!heap -s
```

## Exception commands
Dump all exceptions of a specific type:
```
!dumpheap -type [Exception type]
```
For example:
```
!dumpheap -type System.Reflection.ReflectionTypeLoadException
```

The fun thing is thanks to GC, exception objects are usually still in memory somewhere after they happened but before GC do its job.   

Dump content of an exception:
```
!DumpObj /d [Address]
```
This step is in fact simple because you can click on the address shown in Windbg.

## Threading commands
[Will update when I need them again :)]

##  Other memory tools

[Debug Diagnostic Tool](https://www.microsoft.com/en-us/download/confirmation.aspx?id=49924) is another useful tool with some predefined analysis rules. Its biggest advantage is that it can give a bunch of useful analysis details for us without the cumbersome of Windbg commands.  

[VMMAP](http://mattwarren.org/2017/07/10/Memory-Usage-Inside-the-CLR/) is another great tool. 

## Credits

- http://kate-butenko.blogspot.com/2012/07/investigating-issues-with-unmanaged.html