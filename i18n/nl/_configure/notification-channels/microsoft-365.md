---
layout: default
title: Microsoft 365
parent: Meldingskanalen
nav_order: 1.5
translated_from: ed40e8d615d4ac22fad138311f56e478cccba98a
---

# Microsoft 365
{: .no_toc }

Mail via Microsoft 365 versturen met OAuth2 in plaats van een wachtwoord
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Waarom OAuth2

Microsoft schakelt SMTP AUTH met gebruiker en wachtwoord (basic auth) in Exchange Online eind december 2026 standaard uit.

Vanaf 7.6.0 kan een mailkanaal in plaats daarvan via Microsoft 365 versturen met een app-registratie. Het noemt een **Microsoft Entra ID**-referentie
in plaats van een smtp-referentie, en **Verzenden via** zegt hoe het verstuurt:

| Verzenden via | Hoe het verstuurt | Wat Microsoft 365 nodig heeft |
|---|---|---|
| **Microsoft Graph** (de standaard) | HTTPS naar `sendMail` van Graph, namens de afzendermailbox, zonder SMTP | De applicatiemachtiging `Mail.Send`, of Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, poort 587 met STARTTLS, aangemeld met een token in plaats van een wachtwoord | De machtiging `SMTP.SendAsApp`, de app in Exchange, SMTP AUTH aan voor de mailbox |

**Mail afzender** in de stap **Afzender** is de mailbox waarnamens de mail vertrekt. Kanalen met een smtp-referentie werken zoals voorheen.

---

## De app-registratie

Beide manieren beginnen met een app-registratie in het Microsoft Entra-beheercentrum, en een referentie die haar bevat:

1. **App registrations > New registration**, single tenant. Noteer de **Application (client) ID** en de **Directory (tenant) ID**.
2. **Certificates & secrets**: een nieuw clientgeheim (kopieer de *Value*, niet de ID), of een certificaat, zie [Een certificaat in plaats van een geheim](#a-certificate-instead-of-a-secret).
3. In AnsibleForms, onder **Verbindingen > Inloggegevens**, een referentie van het type **Microsoft Entra ID** met de **Tenant ID** en de
   **Client ID**, en **Aanmelden met** op **Geheim** (dan de waarde van het geheim als **Client secret**) of **Certificaat**.
4. Kies op het mailkanaal die referentie en de optie bij **Verzenden via**.

Het token wordt bewaard tot vijf minuten voordat het verloopt; een gewijzigd geheim of certificaat krijgt een nieuw token. Een nationale cloud
stelt [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) in voor het token en
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) voor Graph.

---

## Microsoft Graph

Graph verstuurt met de applicatiemachtiging `Mail.Send`, waarmee de app namens elke mailbox kan versturen, tenzij Exchange dat beperkt:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, dan **Grant admin consent**.
2. Om de app tot de afzendermailbox te beperken, geef je haar de machtiging in plaats daarvan via Exchange RBAC for Applications: verwijder
   `Mail.Send` uit de app-registratie, en in Exchange Online PowerShell:

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

SMTP met OAuth2 heeft een Exchange-machtiging nodig, de app geregistreerd in Exchange, en SMTP AUTH aan voor de afzendermailbox:

1. In de app-registratie: **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, dan **Grant admin consent**: SMTP heeft geen Graph-machtiging nodig.
2. Registreer de app in Exchange Online PowerShell in Exchange, geef haar de mailbox, en zet SMTP AUTH aan voor die mailbox:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Een certificaat in plaats van een geheim

Een Entra ID-referentie kan zich aanmelden met een certificaat in plaats van haar clientgeheim, alleen voor mail:

1. Maak een certificaat en de sleutel ervan, bijvoorbeeld:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Upload het certificaat (`ansibleforms-mail.pem`) naar de app-registratie, onder **Certificates & secrets > Certificates**.
3. Zet op de referentie **Aanmelden met** op **Certificaat** en plak het **Certificaat** en de privésleutel ervan, de **Clientsleutel** (PEM, RSA,
   zonder wachtwoordzin). Beide worden gecontroleerd bij **Opslaan**; de sleutel wordt versleuteld opgeslagen en nooit meer getoond.

Een SSO-provider meldt zich altijd aan met het clientgeheim, dus een referentie die voor zowel aanmelding als mail dient, behoudt ook haar geheim.
In de [configuratie-seed](../seed/) draagt een `entraid`-referentie het certificaat in `client_cert` en de sleutel in `client_key`, en het
mailkanaal neemt `send_through: graph` of `send_through: smtp`.

---

## Wanneer Microsoft weigert

**Test versturen** op het kanaal zegt in gewone woorden wat er ontbreekt, nooit het geheim, de sleutel of het token:

- de machtiging `Mail.Send`, of de beheerderstoestemming ervoor
- een afzendermailbox buiten het bereik van de app (Exchange RBAC for Applications), of een mailbox die niet bestaat
- een verkeerd of verlopen clientgeheim of certificaat
- SMTP AUTH uitgeschakeld voor de mailbox, met **SMTP (OAuth2)**
