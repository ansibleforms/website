---
layout: default
title: Microsoft 365
parent: Benachrichtigungskanäle
nav_order: 1.5
translated_from: 7726278c07b456c4b765f5319ffec54361f4c5f9
---

# Microsoft 365
{: .no_toc }

Mails über Microsoft 365 mit OAuth2 statt mit einem Passwort senden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Warum OAuth2

Microsoft schaltet SMTP AUTH mit Benutzer und Passwort (Basic Auth) in Exchange Online Ende Dezember 2026 standardmäßig ab.

Ab 7.6.0 kann ein Mail-Kanal stattdessen mit einer App-Registrierung über Microsoft 365 senden. Er nennt einen **Microsoft Entra ID**-Eintrag
statt eines smtp-Eintrags, und **Senden über** legt fest, wie er sendet:

| Senden über | Wie er sendet | Was Microsoft 365 braucht |
|---|---|---|
| **Microsoft Graph** (der Standard) | HTTPS an `sendMail` von Graph, als das Absenderpostfach, ohne SMTP | Die Anwendungsberechtigung `Mail.Send` oder Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, Port 587 mit STARTTLS, angemeldet mit einem Token statt eines Passworts | Die Berechtigung `SMTP.SendAsApp`, die App in Exchange, SMTP AUTH für das Postfach eingeschaltet |

**Mail-Absender** im Schritt **Absender** ist das Postfach, als das die Mail gesendet wird. Kanäle mit einem smtp-Eintrag senden wie bisher.

---

## Die App-Registrierung

Beide Wege beginnen mit einer App-Registrierung im Microsoft Entra Admin Center und einem Anmeldedaten-Eintrag, der sie enthält:

1. **App registrations > New registration**, Single Tenant. Notieren Sie ihre **Application (client) ID** und **Directory (tenant) ID**.
2. **Certificates & secrets**: ein neues Client-Secret (kopieren Sie seinen *Value*, nicht seine ID) oder ein Zertifikat, siehe [Ein Zertifikat statt eines Secrets](#a-certificate-instead-of-a-secret).
3. In AnsibleForms unter **Verbindungen > Anmeldedaten** ein Eintrag vom Typ **Microsoft Entra ID** mit **Tenant-ID** und
   **Client-ID**, und **Anmelden mit** auf **Client-Geheimnis** (dann der Wert des Secrets) oder **Zertifikat** gesetzt.
4. Wählen Sie am Mail-Kanal diesen Eintrag und **Senden über**.

Das Token wird bis fünf Minuten vor seinem Ablauf behalten; ein geändertes Secret oder Zertifikat bekommt ein neues. Eine nationale Cloud setzt
[`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) für das Token und
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) für Graph.

---

## Microsoft Graph

Graph sendet mit der Anwendungsberechtigung `Mail.Send`, die der App erlaubt, als jedes Postfach zu senden, sofern Exchange sie nicht einschränkt:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, dann **Grant admin consent**.
2. Um die App auf das sendende Postfach zu beschränken, geben Sie ihr die Berechtigung stattdessen über Exchange RBAC for Applications:
   Entfernen Sie `Mail.Send` aus der App-Registrierung, und in Exchange Online PowerShell:

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

SMTP mit OAuth2 braucht eine Exchange-Berechtigung, die in Exchange registrierte App und SMTP AUTH für das sendende Postfach:

1. In der App-Registrierung **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, dann **Grant admin consent**: SMTP braucht keine Graph-Berechtigung.
2. Registrieren Sie in Exchange Online PowerShell die App in Exchange, geben Sie ihr das Postfach und schalten Sie SMTP AUTH dafür ein:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Ein Zertifikat statt eines Secrets

Ein Entra ID-Eintrag kann sich statt mit seinem Client-Secret mit einem Zertifikat anmelden, nur für Mail:

1. Erstellen Sie ein Zertifikat und seinen Schlüssel, zum Beispiel:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Laden Sie das Zertifikat (`ansibleforms-mail.pem`) in der App-Registrierung unter **Certificates & secrets > Certificates** hoch.
3. Setzen Sie am Eintrag **Anmelden mit** auf **Zertifikat** und fügen Sie das **Zertifikat** und seinen privaten Schlüssel ein (PEM, RSA,
   ohne Passphrase). Beide werden beim **Speichern** geprüft; der Schlüssel wird verschlüsselt gespeichert und nie wieder angezeigt.

Ein SSO-Anbieter meldet sich immer mit dem Client-Secret an, daher behalten Anmeldedaten, die für Anmeldung und Mail dienen, auch ihr
Secret. Im [Config-Seed](../seed/) trägt ein `entraid`-Eintrag das Zertifikat in `client_cert` und seinen Schlüssel in `client_key`, und
der Mail-Kanal nimmt `send_through: graph` oder `send_through: smtp`.

---

## Wenn Microsoft ablehnt

**Test senden** am Kanal sagt in klaren Worten, was fehlt, nie das Secret, den Schlüssel oder das Token:

- die Berechtigung `Mail.Send` oder ihre Administratorzustimmung
- ein Absenderpostfach außerhalb des Bereichs der App (Exchange RBAC for Applications) oder ein Postfach, das nicht existiert
- ein falsches oder abgelaufenes Client-Secret oder Zertifikat
- SMTP AUTH für das Postfach ausgeschaltet, mit **SMTP (OAuth2)**
