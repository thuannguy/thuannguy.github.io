---
layout: post
title: "Troubleshooting: ASP.NET returns empty response on a production server"
description: "Last week I got to solve a problem that only happened on a customer's server"
tags: [asp.net, response, async, stream, perfview]
comments: true
published: true
categories:
  - Blog
image: https://www.thuannguy.com/images/blog-image.jpg
---
# Troubleshooting: ASP.NET returns empty response on a production server

Last week I got to solve a problem that only happened on a customer's server: one of the endpoints always returned a blank page. Checking the network log showed me that the response had no content. Since it didn't happen on our development boxes, debugging needed to be done using log files and all kinds of traces I could collect.

## Debugging using Perfview

[Perfview](https://github.com/Microsoft/perfview) is a great tool to collect what a .NET process just did because it is portable yet powerful and has a simple GUI.

Examining a log file pointed us to a suspected method which is probably the last piece of my code that ran:
![suspect](/images/emptyresponse/suspect.png)
Briefly speaking, that method copied content from an HttpResponseMessage object to HttpResponse.OutputStream. Another important note is that it is an ActionResult.ExecuteResult method which is called by ASP.NET itself.

A colleague of mine helped by using Perfview to collect a trace of what happened internally when the application served that blank response. Although all stacktraces showed that my code ran as expected without any error, the exception view revealed a hidden NullReferenceException happening deep down in ASP.NET framework code:
![exception](/images/emptyresponse/exception.png)

Up to this point, my guess was that the exception happened while content was being written to HttpResponse.OutputStream. However, I needed more proof in order to find a good fix because I wouldn't be able to test it on my development box.

I opened the code of CopyToAsync found on GitHub: ![copytoasync method](/images/emptyresponse/copytoasync.png)
After checking the type of the stream object, I was able to confirm that code ran into the "else" branch that called SerializeToStreamAsync:
![serialize](/images/emptyresponse/serialize.png)

This is where SerializeToStreamAsync called WriteToStreamAsync:
![SerializeToStreamAsync](/images/emptyresponse/SerializeToStreamAsync.png)

Finally, the code of WriteToAnyStreamAsync is:
![WriteToAnyStreamAsync](/images/emptyresponse/WriteToAnyStreamAsync.png)

Which suggested that either the buffer object or the destination object or something inside the destination object must be null. However, because the buffer was just created locally previously, it couldn't be null. That left me with the destination object being null. Tracing code backward showed me that the destination object is the OutputStream of HttpResponse. All those clues were enough for me to conclude that the error happened because that stream content copy code was executed asynchronously, but by the time it was executed, ASP.NET had already closed the response. Interestingly, my guess for why it only happened on that server is that the server had limited resources, so ASP.NET had to close response streams much sooner than when we tested on our development boxes.

By the way, I fixed it by changing ConfigureAwait to Wait. You might scream at me because they are two different things and calling Wait is evil, but I can assure you for this piece of code and for all the constraints that my web application has to fulfill, using Wait is the only viable solution. I wish the ASP.NET team changed their mind about [adding support for ExecuteResultAsync](https://github.com/aspnet/AspNetWebStack/issues/113) though.