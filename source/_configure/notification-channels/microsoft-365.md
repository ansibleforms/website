---
layout: default
title: Microsoft 365
parent: Notification channels
nav_order: 1.5
---

# Microsoft 365
{: .no_toc }

Send mail through Microsoft 365 with OAuth2 instead of a password
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Why OAuth2

Microsoft turns off SMTP AUTH with a user and password (basic auth) in Exchange Online by default at the end of December 2026.

From 7.6.0 a mail channel can send through Microsoft 365 with an app registration instead. It names a **Microsoft Entra ID**
credential in place of an smtp one, and **Send through** says how it sends:

| Send through | How it sends | What Microsoft 365 needs |
|---|---|---|
| **Microsoft Graph** (the default) | HTTPS to Graph's `sendMail`, as the sender mailbox, without SMTP | The `Mail.Send` application permission, or Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, port 587 with STARTTLS, signed in with a token instead of a password | The `SMTP.SendAsApp` permission, the app in Exchange, SMTP AUTH on for the mailbox |

**Mail from** on the **Sender** step is the mailbox the mail is sent as. Channels with an smtp credential send as before.

---

## The app registration

Both ways start with an app registration in the Microsoft Entra admin center, and a credential that holds it:

1. **App registrations > New registration**, single tenant. Note its **Application (client) ID** and **Directory (tenant) ID**.
2. **Certificates & secrets**: a new client secret (copy its *Value*, not its ID), or a certificate, see [A certificate instead of a secret](#a-certificate-instead-of-a-secret).
3. In AnsibleForms, under **Connections > Credentials**, a credential of type **Microsoft Entra ID** with the **Tenant ID** and
   **Client ID**, and **Sign in with** set to **Secret** (then the secret's value as **Client secret**) or **Certificate**.
4. On the mail channel, choose that credential and the **Send through**.

The token is kept until five minutes before it expires; a changed secret or certificate gets a new one. A national cloud sets
[`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) for the token and
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) for Graph.

---

## Microsoft Graph

Graph sends with the `Mail.Send` application permission, which lets the app send as any mailbox unless Exchange limits it:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, then **Grant admin consent**.
2. To keep the app to the sending mailbox, give it the permission through Exchange RBAC for Applications instead: remove
   `Mail.Send` from the app registration, and in Exchange Online PowerShell:

```powershell
# the ObjectId is the one of the Enterprise application (service principal), not of the app registration
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
New-ManagementScope -Name "AnsibleForms mail" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'noreply@contoso.com'"
New-ManagementRoleAssignment -App <client-id> -Role "Application Mail.Send" -CustomResourceScope "AnsibleForms mail"
# check: InScope is True for the sender, False for another mailbox
Test-ServicePrincipalAuthorization -Identity <client-id> -Resource noreply@contoso.com
```

---

## SMTP (OAuth2)

SMTP with OAuth2 needs an Exchange permission, the app registered in Exchange, and SMTP AUTH turned on for the sending mailbox:

1. In the app registration, **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, then **Grant admin consent**: SMTP needs no Graph permission.
2. In Exchange Online PowerShell, register the app in Exchange, give it the mailbox, and turn SMTP AUTH on for that mailbox:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## A certificate instead of a secret

An Entra ID credential can sign in with a certificate instead of its client secret, for mail only:

1. Make a certificate and its key, for example:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Upload the certificate (`ansibleforms-mail.pem`) to the app registration, under **Certificates & secrets > Certificates**.
3. On the credential, set **Sign in with** to **Certificate** and paste the **Certificate** and its private key, the **Client key** (PEM, RSA,
   without a passphrase). Both are checked on **Save**; the key is stored encrypted and never shown again.

An SSO provider always signs in with the client secret, so a credential used for both sign-in and mail keeps its secret too. In the
[config seed](../seed/), an `entraid` credential carries the certificate in `client_cert` and its key in `client_key`, and the mail
channel takes `send_through: graph` or `send_through: smtp`.

---

## When Microsoft refuses

**Send test** on the channel says in plain words what is missing, never the secret, the key or the token:

- the `Mail.Send` permission, or its admin consent
- a sender mailbox outside the app's scope (Exchange RBAC for Applications), or a mailbox that does not exist
- a wrong or expired client secret or certificate
- SMTP AUTH turned off for the mailbox, with **SMTP (OAuth2)**
