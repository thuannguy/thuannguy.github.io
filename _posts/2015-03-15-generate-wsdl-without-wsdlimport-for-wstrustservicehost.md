---
layout: post
title: "Generate WSDL without wsdl:import for WSTrustServiceHost"
date: 2015-03-15
categories:
  - programming
image: https://unsplash.it/2000/1200?image=1003
image-sm: https://unsplash.it/500/300?image=1003
---
I have a WCF-powered WSTrust Security Token Service that has an endpoint like this:

        host.AddServiceEndpoint( 
                      typeof(IWSTrust13SyncContract), 
                      new UserNameWSTrustBinding(SecurityMode.Message) 
                      "/username");

The service also has a mex endpoint to publish WSDL. Problem is, while that metadata could be consumed by Visual Studio using the “Add service reference” function, Java Netbeans threw exception when I tried to do the same thing:

    Web Service Client can not be created by JAXWS:wsimport utility. 
    Reason: duplicate "message" entity: "IWSTrust13Sync_Trust13Cancel_InputMessage" 

The output log gave me:

        Retrieved :    https://example.org/services/trust/mex
        
                    Saved at: C:UserstestuserDocumentsNetBeansProjectsJavaApplication1xml-resourcesweb-service-referencesmex_2wsdlexample.orgservicestrustmex.wsdl
        
        Retrieving Location: https://example.org/services/trust/mex?xsd=xsd0
        
                    Found in document: https://example.org/services/trust/mex
        
        Retrieved :    https://example.org/services/trust/mex?xsd=xsd0
        
                    Saved at: C:UserstestuserDocumentsNetBeansProjectsJavaApplication1xml-resourcesweb-service-referencesmex_2wsdlexample.orgservicestrustmex.xsd_xsd0.xsd
        
        Retrieving Location: https://example.org/services/trust/mex?xsd=xsd1
        
                    Found in document: https://example.org/services/trust/mex
        
        Retrieved :    https://example.org/services/trust/mex?xsd=xsd1
        
                    Saved at: C:UserstestuserDocumentsNetBeansProjectsJavaApplication1xml-resourcesweb-service-referencesmex_2wsdlexample.orgservicestrustmex.xsd_xsd1.xsd
        
        Retrieving Location: https://example.org/services/trust/mex?wsdl=wsdl0
        
                    Found in document: https://example.org/services/trust/mex
    
                    Retrieved :    https://example.org/services/trust/mex?wsdl=wsdl0
    
                    Saved at: C:UserstestuserDocumentsNetBeansProjectsJavaApplication1xml-resourcesweb-service-referencesmex_2wsdlexample.orgservicestrustmex.wsdl_wsdl0.wsdl
    
        Retrieving Location: https://example.org/services/trust/mex?wsdl
    
                    Found in document: https://example.org/services/trust/mex?wsdl=wsdl0
    
        File name already exists with the same content length. Ignoring the file. : C:UserstestuserDocumentsNetBeansProjectsJavaApplication1xml-resourcesweb-service-referencesmex_2wsdlexample.orgservicestrustmex.wsdl:
    
                    Retrieving Location: https://example.org/services/trust/mex?wsdl
    
                    Found in document: https://example.org/services/trust/mex?wsdl=wsdl0

It seemed that part about the wsdl=wsdl0 was the culprit. Looking up for it in the published WSDL showed me:

        wsdl:definitions name="SecurityTokenService" targetNamespace="http://schemas.microsoft.com/ws/2008/06/identity/securitytokenservice" …
        <wsdl:import namespace="http://tempuri.org/" location="https://example.org/services/trust/mex?wsdl=wsdl0"/    
        <wsdl:types>

It’s time to say hello to Google and Stackoverflow:
> http://stackoverflow.com/questions/985320/wcf-how-to-generate-a-single-wsdl-document-without-wsdlimport

The accepted answer was also the answer for me, although it took me a few hour to figure out what I needed to do with it. After all, all I needed to do is to set the endpoint’s namespace to the correct one:

        host.AddServiceEndpoint( 
                        typeof(IWSTrust13SyncContract), 
                        new UserNameWSTrustBinding(SecurityMode.Message)
    
                       { 
                           Namespace = http://schemas.microsoft.com/ws/2008/06/identity/securitytokenservice
    
                       }, 
                        "/username");

If you ever wonder where that string comes from, you can take a look at the definition of the service contract:

        [ServiceContract(Name = "IWSTrust13Sync", Namespace = "
