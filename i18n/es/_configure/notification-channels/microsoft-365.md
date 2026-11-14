---
layout: default
title: Microsoft 365
parent: Canales de notificación
nav_order: 1.5
translated_from: ed40e8d615d4ac22fad138311f56e478cccba98a
---

# Microsoft 365
{: .no_toc }

Enviar correo a través de Microsoft 365 con OAuth2 en lugar de una contraseña
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Por qué OAuth2

Microsoft desactiva por defecto SMTP AUTH con usuario y contraseña (basic auth) en Exchange Online a finales de diciembre de 2026.

Desde la 7.6.0 un canal de correo puede enviar a través de Microsoft 365 con un registro de aplicación. Nombra una credencial
**Microsoft Entra ID** en lugar de una smtp, y **Enviar a través de** indica cómo envía:

| Enviar a través de | Cómo envía | Qué necesita Microsoft 365 |
|---|---|---|
| **Microsoft Graph** (el predeterminado) | HTTPS al `sendMail` de Graph, como el buzón remitente, sin SMTP | El permiso de aplicación `Mail.Send`, o Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, puerto 587 con STARTTLS, con inicio de sesión mediante un token en lugar de una contraseña | El permiso `SMTP.SendAsApp`, la aplicación en Exchange, SMTP AUTH activado para el buzón |

**Correo de** en el paso **Remitente** es el buzón como el que se envía el correo. Los canales con una credencial smtp envían como antes.

---

## El registro de aplicación

Ambas formas empiezan con un registro de aplicación en el Microsoft Entra admin center, y una credencial que lo contiene:

1. **App registrations > New registration**, de un solo inquilino. Anota su **Application (client) ID** y su **Directory (tenant) ID**.
2. **Certificates & secrets**: un nuevo secreto de cliente (copia su *Value*, no su ID), o un certificado, consulta [Un certificado en lugar de un secreto](#a-certificate-instead-of-a-secret).
3. En AnsibleForms, en **Conexiones > Credenciales**, una credencial de tipo **Microsoft Entra ID** con el **ID de inquilino** y el
   **ID de cliente**, e **Iniciar sesión con** en **Secreto** (y después el valor del secreto como **Secreto de cliente**) o en **Certificado**.
4. En el canal de correo, elige esa credencial y el **Enviar a través de**.

El token se conserva hasta cinco minutos antes de que caduque; un secreto o un certificado cambiado obtiene uno nuevo. Una nube nacional
define [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) para el token y
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) para Graph.

---

## Microsoft Graph

Graph usa el permiso de aplicación `Mail.Send`, con el que la aplicación envía como cualquier buzón salvo que Exchange lo limite:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, y después **Grant admin consent**.
2. Para limitar la aplicación al buzón remitente, dale el permiso mediante Exchange RBAC for Applications en su lugar: quita
   `Mail.Send` del registro de aplicación y, en Exchange Online PowerShell:

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

SMTP con OAuth2 necesita un permiso de Exchange, la aplicación registrada en Exchange y SMTP AUTH activado para el buzón remitente:

1. En el registro de aplicación, **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, y después **Grant admin consent**: SMTP no necesita ningún permiso de Graph.
2. En Exchange Online PowerShell, registra la aplicación en Exchange, dale el buzón y activa SMTP AUTH para ese buzón:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Un certificado en lugar de un secreto

Una credencial Entra ID puede iniciar sesión con un certificado en lugar de su secreto de cliente, solo para el correo:

1. Crea un certificado y su clave, por ejemplo:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Sube el certificado (`ansibleforms-mail.pem`) al registro de aplicación, en **Certificates & secrets > Certificates**.
3. En la credencial, pon **Iniciar sesión con** en **Certificado** y pega el **Certificado** y su clave privada, la **Clave de cliente** (PEM, RSA, sin
   frase de contraseña). Ambos se comprueban al pulsar **Guardar**; la clave se guarda cifrada y no se vuelve a mostrar.

Un proveedor SSO siempre inicia sesión con el secreto de cliente, así que una credencial usada para el inicio de sesión y para el correo
conserva también su secreto. En la [semilla de configuración](../seed/), una credencial `entraid` lleva el certificado en `client_cert` y
su clave en `client_key`, y el canal de correo toma `send_through: graph` o `send_through: smtp`.

---

## Cuando Microsoft rechaza

**Enviar prueba** en el canal dice con palabras claras lo que falta, nunca el secreto, la clave ni el token:

- el permiso `Mail.Send`, o su consentimiento de administrador
- un buzón remitente fuera del ámbito de la aplicación (Exchange RBAC for Applications), o un buzón que no existe
- un secreto de cliente o un certificado incorrecto o caducado
- SMTP AUTH desactivado para el buzón, con **SMTP (OAuth2)**
