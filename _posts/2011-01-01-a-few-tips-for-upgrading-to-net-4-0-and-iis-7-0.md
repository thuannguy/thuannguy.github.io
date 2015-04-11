---
layout: post
title: "A few tips for upgrading to .NET 4.0 and IIS 7.0"
description: "A few tips for upgrading to .NET 4.0 and IIS 7.0"
tags: [IIS, .Net 4.0]
comments: true
---

Last week I upgraded an ASP.NET 3.5 (.NET framework 2.0) which was running in IIS 6.0 to .NET framework 4.0 and IIS 7.0. The work mostly involved in modifying web.config file and setting up IIS. Although Visual Studio did a great job for me by cleaning up a messy-90-line web.config to just 20 lines, that specific project needed me to manually tweak a few more settings of its.

1. Custom HttpHandler

Given that there is a custom handler in WebControls assembly, TestProject.Namespace namespace. In the old IIS versions, it is configured in the system.web@httpHandlers section. In IIS 7.0, it should be in system.webServer@handlers.

Old:

		<system.web>
			<httpHandlers>
				<add verb="GET" path="CustomHandler.aspx" type="TestProject.Namespace.CustomHandler, WebControls"/>

New:

		<system.webServer>
			<handlers>
				<add name="CustomHandler" path="CustomHandler.aspx" verb="GET" type="TestProject.Namespace.CustomHandler, WebControls" resourceType="Unspecified" preCondition="integratedMode"/>
				
Notice that with IIS 7.0++, a new attribute is added: preCondition="integratedMode". The value is integratedMode because the web site is running in an application with that mode.

2. Allow requests for *.html pages

Although the project is written in ASP.NET, all requests to it end with html extension and a custom url rewriter which is called in Global.ascx convert them to corresponding aspx urls. In pre-IIS 7.0, one possible way to enable IIS to accept html requests for managed module is to set ASPNET_ISAPI.DLL to it. Now we have a much simpler web.config setting to do this:

		<system.webServer>
			<modules runAllManagedModulesForAllRequests="true">
			
3. Allow large files upload

This one should be familiar: we need to expand the maxRequestLength and maxAllowedContentLength settings. Notice that the former is in KBs while the latter is in bytes.

		<system.web>
			<httpRuntime maxRequestLength="200000" executionTimeout="600"/>
			<system.webServer>
			<security>
				<requestFiltering>
					<!-- in bytes -->
					<requestLimits maxAllowedContentLength="200000000"/>
				</requestFiltering>
			</security>
		</system.webServer>

