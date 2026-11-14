---
layout: default
title: Microsoft 365
parent: Canali di notifica
nav_order: 1.5
translated_from: 7726278c07b456c4b765f5319ffec54361f4c5f9
---

# Microsoft 365
{: .no_toc }

Inviare mail tramite Microsoft 365 con OAuth2 invece di una password
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Perché OAuth2

A fine dicembre 2026 Microsoft disattiva di default SMTP AUTH con utente e password (basic auth) in Exchange Online.

Dalla 7.6.0 un canale mail può invece inviare tramite Microsoft 365 con una registrazione dell'app. Indica una credenziale
**Microsoft Entra ID** al posto di una smtp, e **Invia tramite** dice come invia:

| Invia tramite | Come invia | Cosa serve a Microsoft 365 |
|---|---|---|
| **Microsoft Graph** (il predefinito) | HTTPS verso `sendMail` di Graph, come la casella di posta del mittente, senza SMTP | Il permesso applicativo `Mail.Send`, o Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, porta 587 con STARTTLS, con accesso tramite un token invece di una password | Il permesso `SMTP.SendAsApp`, l'app in Exchange, SMTP AUTH attivo per la casella di posta |

**Mittente mail** nel passaggio **Mittente** è la casella di posta da cui parte la mail. I canali con una credenziale smtp inviano come prima.

---

## La registrazione dell'app

Entrambi i modi iniziano con una registrazione dell'app nel Microsoft Entra admin center, e una credenziale che la contiene:

1. **App registrations > New registration**, single tenant. Annota il suo **Application (client) ID** e il **Directory (tenant) ID**.
2. **Certificates & secrets**: un nuovo client secret (copia il suo *Value*, non il suo ID), o un certificato, vedi [Un certificato invece di un segreto](#a-certificate-instead-of-a-secret).
3. In AnsibleForms, in **Connessioni > Credenziali**, una credenziale di tipo **Microsoft Entra ID** con il **Tenant ID** e il
   **Client ID**, e **Accedi con** impostato su **Segreto client** (poi il valore del segreto) o **Certificato**.
4. Sul canale mail, scegli quella credenziale e l'opzione **Invia tramite**.

Il token viene conservato fino a cinque minuti prima che scada; un segreto o un certificato cambiato ne ottiene uno nuovo. Un cloud
nazionale imposta [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) per il token e
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) per Graph.

---

## Microsoft Graph

Graph invia con il permesso applicativo `Mail.Send`, che consente all'app di inviare come qualsiasi casella, salvo limiti di Exchange:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, poi **Grant admin consent**.
2. Per limitare l'app alla casella di posta del mittente, dalle invece il permesso tramite Exchange RBAC for Applications: rimuovi
   `Mail.Send` dalla registrazione dell'app, e in Exchange Online PowerShell:

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

SMTP con OAuth2 richiede un permesso Exchange, l'app registrata in Exchange, e SMTP AUTH attivo per la casella di posta del mittente:

1. Nella registrazione dell'app, **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, poi **Grant admin consent**: SMTP non richiede nessun permesso Graph.
2. In Exchange Online PowerShell, registra l'app in Exchange, dalle la casella di posta, e attiva SMTP AUTH per quella casella:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Un certificato invece di un segreto

Una credenziale Entra ID può accedere con un certificato invece del suo client secret, solo per la mail:

1. Crea un certificato e la sua chiave, per esempio:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Carica il certificato (`ansibleforms-mail.pem`) nella registrazione dell'app, in **Certificates & secrets > Certificates**.
3. Sulla credenziale, imposta **Accedi con** su **Certificato** e incolla il **Certificato** e la sua chiave privata (PEM, RSA, senza
   passphrase). Entrambi vengono verificati al **Salva**; la chiave è salvata cifrata e non viene più mostrata.

Un provider SSO accede sempre con il client secret, quindi una credenziale usata sia per l'accesso sia per la mail mantiene anche il suo
segreto. Nel [config seed](../seed/), una credenziale `entraid` porta il certificato in `client_cert` e la sua chiave in `client_key`, e
il canale mail prende `send_through: graph` o `send_through: smtp`.

---

## Quando Microsoft rifiuta

**Invia prova** sul canale dice in parole semplici cosa manca, mai il segreto, la chiave o il token:

- il permesso `Mail.Send`, o il suo consenso dell'amministratore
- una casella di posta del mittente fuori dall'ambito dell'app (Exchange RBAC for Applications), o una casella che non esiste
- un client secret o un certificato errato o scaduto
- SMTP AUTH disattivato per la casella di posta, con **SMTP (OAuth2)**
