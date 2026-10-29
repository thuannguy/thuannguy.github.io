---
layout: post
title: "Windows Security Event Log"
description: "Windows Security Event Log"
tags: [Windows, Security Event Log]
comments: true
---

While I wrote this post with the hope that it will remind me of how to solve some frustrating problems when working with Windows Security Event Log in the future, I also hope that it can help everyone who unfortunately encounters the same problems.

First of all, to start (or re-start) working with Windows Security Event Log, http://msdn.microsoft.com/en-us/magazine/cc163718.aspx is an excellent must-read document.

Unfortunately, although it is a great document and covers almost everything I need to know, I still made some mistakes which prevented my application from being able to audit to the security log. And for all the mistakes I made, I received the same (and one of the most useless ever) error message:

		The parameter is incorrect
		...
		Exception Details: System.ComponentModel.Win32Exception: The parameter is incorrect
		Error code: 0*80004005

The mistakes I made are:
1.Didn't enable Audit Object Access. To do: open secpol.msc -> Audit Policy -> Audit Object Access and check to audit both "Success" and "Failure" events. 
2.Didn't grant enough permission for the user account under which my ASP.NET application pool runs. To do: in the same console page above, navigate to User Rights Assignment -> Generate security audits -> add the user to that list. My application pool runs under a domain user account other than NETWORK SERVICE, so this step is a must. 
3.Didn't restart IIS after registering the Resource DLL. To do: always restart IIS every time registration is done. 
4.Initiated AuditPolicy and AuditProvider more than once per process (or AppDomain?): I accidentally wrote code that initiated new AuditPolicy and AuditProvider objects every time an event is logged. As a result, after IIS was restarted, my application was able to write the first entry to Security Event Log but failed to write from the second one. When this situation happens, Windows itself logs the event message below to the Security log. To do: make the AuditProvider class a singleton or static.
