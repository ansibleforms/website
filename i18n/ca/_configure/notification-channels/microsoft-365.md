---
layout: default
title: Microsoft 365
parent: Canals de notificació
nav_order: 1.5
translated_from: ed40e8d615d4ac22fad138311f56e478cccba98a
---

# Microsoft 365
{: .no_toc }

Envia correu a través de Microsoft 365 amb OAuth2 en lloc d'una contrasenya
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Per què OAuth2

Microsoft desactiva per defecte l'SMTP AUTH amb usuari i contrasenya (autenticació bàsica) a Exchange Online a finals de desembre de 2026.

Des de la 7.6.0 un canal de correu pot enviar a través de Microsoft 365 amb un registre d'aplicació. Nomena una credencial
**Microsoft Entra ID** en lloc d'una smtp, i **Envia a través de** indica com envia:

| Envia a través de | Com envia | Què necessita Microsoft 365 |
|---|---|---|
| **Microsoft Graph** (el predeterminat) | HTTPS al `sendMail` de Graph, com la bústia del remitent, sense SMTP | El permís d'aplicació `Mail.Send`, o Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, port 587 amb STARTTLS, amb un token en lloc d'una contrasenya | El permís `SMTP.SendAsApp`, l'aplicació a Exchange i l'SMTP AUTH activat per a la bústia |

El **Remitent** del pas **Remitent** és la bústia en nom de la qual s'envia el correu. Els canals amb una credencial smtp envien com abans.

---

## El registre d'aplicació

Totes dues maneres comencen amb un registre d'aplicació al Microsoft Entra admin center, i una credencial que el conté:

1. **App registrations > New registration**, d'un sol tenant. Anota'n l'**Application (client) ID** i el **Directory (tenant) ID**.
2. **Certificates & secrets**: un secret de client nou (copia'n el *Value*, no l'ID), o un certificat, vegeu [Un certificat en lloc d'un secret](#a-certificate-instead-of-a-secret).
3. A AnsibleForms, a **Connexions > Credencials**, una credencial de tipus **Microsoft Entra ID** amb l'**ID del tenant** i
   l'**ID del client**, i **Inicia la sessió amb** a **Secret** (i llavors el valor del secret com a **Secret del client**) o a **Certificat**.
4. Al canal de correu, tria aquesta credencial i l'opció **Envia a través de**.

El token es conserva fins a cinc minuts abans que caduqui; un secret o un certificat canviat n'obté un de nou. Un núvol nacional
defineix [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) per al token i
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) per a Graph.

---

## Microsoft Graph

Graph envia amb el permís d'aplicació `Mail.Send`, que permet a l'aplicació enviar com qualsevol bústia tret que Exchange ho limiti:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, i després **Grant admin consent**.
2. Per limitar l'aplicació a la bústia que envia, dona-li el permís mitjançant Exchange RBAC for Applications: treu
   `Mail.Send` del registre d'aplicació i, a Exchange Online PowerShell:

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

L'SMTP amb OAuth2 necessita un permís d'Exchange, l'aplicació registrada a Exchange i l'SMTP AUTH activat per a la bústia que envia:

1. Al registre d'aplicació, **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, i després **Grant admin consent**: l'SMTP no necessita cap permís de Graph.
2. A Exchange Online PowerShell, registra l'aplicació a Exchange, dona-li la bústia i activa l'SMTP AUTH per a aquesta bústia:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Un certificat en lloc d'un secret

Una credencial Entra ID pot iniciar sessió amb un certificat en lloc del seu secret de client, només per al correu:

1. Crea un certificat i la seva clau, per exemple:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Puja el certificat (`ansibleforms-mail.pem`) al registre d'aplicació, a **Certificates & secrets > Certificates**.
3. A la credencial, posa **Inicia la sessió amb** a **Certificat** i enganxa el **Certificat** i la seva clau privada, la **Clau del client** (PEM, RSA, sense
   frase de pas). Tots dos es comproven en fer **Desa**; la clau es desa xifrada i no es torna a mostrar mai.

Un proveïdor SSO sempre inicia sessió amb el secret de client, així que una credencial que serveix per a l'inici de sessió i per al
correu també conserva el seu secret. A la [llavor de configuració](../seed/), una credencial `entraid` porta el certificat a
`client_cert` i la seva clau a `client_key`, i el canal de correu pren `send_through: graph` o `send_through: smtp`.

---

## Quan Microsoft ho rebutja

**Envia una prova** al canal diu en paraules planeres què falta, mai el secret, la clau ni el token:

- el permís `Mail.Send`, o el seu consentiment d'administrador
- una bústia de remitent fora de l'abast de l'aplicació (Exchange RBAC for Applications), o una bústia que no existeix
- un secret de client o un certificat incorrecte o caducat
- l'SMTP AUTH desactivat per a la bústia, amb **SMTP (OAuth2)**
