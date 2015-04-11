---
layout: post
title: "Saml 2.0 responses and signature verification"
description: "Saml 2.0 responses and signature verification"
tags: [digest, saml, saml 2.0, signature, signedxml, verify, wif]
comments: true
---

Disclaimer: this post is rather messy due to the amount of information I want to put in vs. spare time I have

This post is all about my experiences on troubleshooting the issues of verifying Saml 2.0 responses' signatures. To understand how the signatures should be verified, I think it is essential to understand how Saml 2.0 response messages are signed first. This answer on SO is a good read: http://stackoverflow.com/a/7073749/572488. Please note that if assertion encryption is used, the encryption step should happen after step 6. Another note is that some vendors may prefer signing the assertion elements only while some other may opt to sign just the whole responses.

When both the message and assertion are signed, structure of the signed message is:

		<Response>
			<Signature>
			</Signature>
			<Assertion>
				<Signature>
				</Signature>
			<Assertion>
		</Response>

Signature verification requires that both signatures should be verified:

Response:

		<Response>
			// Response's signature element is removed when verifying
			// signature of the whole response message
			<Assertion>
				<Signature>
				</Signature>
			<Assertion>
		</Response>

And assertion:

		<Assertion>
			// Assertion's signature element is removed
			// when verifying signature of the assertion.
		<Assertion>

 

While the good part of signature verification is that it helps to Identify tampered messages, it is the evil part of it usually drives me mad: that's is when a message that is assumed to be valid is verified as invalid. To make it worse, while signature verification APIs can tell you about invalid signatures, they can't tell you what the exact cause is.

Common causes:

- Message content is modified during transmission, e.g. when it goes through a proxy, a load balancer, or when it is transferred from a *nix environment to a Windows environment.

- Use a wrong key to verify signatures.

- Wrong signing procedure. I once found an IdP who signs a response message without taking assertion's signature into account.

Possible causes for failure of verifying signature using WIF:

- Some providers create Response messages with white spaces and line breaks. How such a message is loaded into xml documents before feeding to WIF is important. Briefly speaking, you need to use a reader that can normalize \r\n to \n only. Reader such as .NET's XmlTextReader doesn't do that normalization. As a result, WIF converts "r" into "&#xD" which breaks signature verification.

Possible causes for failure of verifying signature using SignedXml:

- Load a message into XmlDocument with PreserveWhitespaces=false.

- You write incorrect code to verify signatures. Part of the verification step which is done by SignedXml is to remove a signature from a message before calculating digest value of the remaining message as described in the beginning of this post. However, when a message contains two signatures, most of the code sample I found on the internet can't remove the correct signature element. The trick is that when loading the assertion element, the element should be "detached" from the parent document. One way to do that is to import it to a new xml document.

- Remember that you can enable SignedXml tracing log to find out if the loaded message has white spaces preserved or the verification step correctly removes relevant signature element.
