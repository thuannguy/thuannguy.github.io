---
layout: post
title: "Debugging SignedXml"
description: "Debugging SignedXml"
tags: [SignedXml, .Net]
comments: true
---

This super small post is all about how to enable debug log for the SignedXml class which may help you figure out, for example, what the heck goes wrong when the CheckSignature returns false while it is supposed to return true for a valid signed xml document that you feed to it. All you need to you is to put the configuration section below to the web.config/app.config file of your application:

		<system.diagnostics> 
		  <sources> 
			<source name="System.Security.Cryptography.Xml.SignedXml" switchName="spSwitch"> 
			  <listeners> 
				<add initializeData="C:tempsignedxml-output.txt" type="System.Diagnostics.TextWriterTraceListener" 
					name="myLocalListener" /> 
			  </listeners> 
			</source> 
		  </sources> 
		  <switches> 
			<add name="spSwitch" value="Verbose" /> 
		  </switches> 
		  <trace autoflush="true"/> 
		</system.diagnostics> 

Hope this helps :)
