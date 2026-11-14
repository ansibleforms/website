---
layout: default
title: Microsoft 365
parent: Canaux de notification
nav_order: 1.5
translated_from: ed40e8d615d4ac22fad138311f56e478cccba98a
---

# Microsoft 365
{: .no_toc }

Envoyer du mail via Microsoft 365 avec OAuth2 au lieu d'un mot de passe
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pourquoi OAuth2

Microsoft désactive par défaut SMTP AUTH avec un utilisateur et un mot de passe (authentification basique) dans Exchange Online fin décembre 2026.

Depuis la 7.6.0, un canal mail peut envoyer via Microsoft 365 avec une inscription d'application à la place. Il nomme un identifiant
**Microsoft Entra ID** au lieu d'un identifiant smtp, et **Envoyer par** indique comment il envoie :

| Envoyer par | Comment il envoie | Ce dont Microsoft 365 a besoin |
|---|---|---|
| **Microsoft Graph** (par défaut) | HTTPS vers le `sendMail` de Graph, au nom de la boîte aux lettres de l'expéditeur, sans SMTP | La permission d'application `Mail.Send`, ou Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, port 587 avec STARTTLS, connecté avec un jeton au lieu d'un mot de passe | La permission `SMTP.SendAsApp`, l'application dans Exchange, SMTP AUTH activé pour la boîte aux lettres |

**Expéditeur mail** à l'étape **Expéditeur** est la boîte aux lettres au nom de laquelle le mail est envoyé. Les canaux avec un identifiant smtp envoient comme avant.

---

## L'inscription d'application

Les deux façons commencent par une inscription d'application dans le Microsoft Entra admin center, et un identifiant qui la contient :

1. **App registrations > New registration**, single tenant. Notez son **Application (client) ID** et son **Directory (tenant) ID**.
2. **Certificates & secrets** : un nouveau secret client (copiez sa *Value*, pas son ID), ou un certificat, voir [Un certificat au lieu d'un secret](#a-certificate-instead-of-a-secret).
3. Dans AnsibleForms, sous **Connexions > Identifiants**, un identifiant de type **Microsoft Entra ID** avec l'**ID du tenant** et
   l'**ID client**, et **Se connecter avec** réglé sur **Secret** (puis la valeur du secret comme **Secret client**) ou **Certificat**.
4. Sur le canal mail, choisissez cet identifiant et l'option **Envoyer par**.

Le jeton est conservé jusqu'à cinq minutes avant son expiration ; un secret ou un certificat modifié en obtient un nouveau. Un cloud national définit
[`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) pour le jeton et
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) pour Graph.

---

## Microsoft Graph

Graph envoie avec la permission d'application `Mail.Send`, qui permet à l'application d'envoyer au nom de n'importe quelle boîte aux lettres, sauf si Exchange la limite :

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, puis **Grant admin consent**.
2. Pour limiter l'application à la boîte aux lettres d'envoi, donnez-lui plutôt la permission via Exchange RBAC for Applications : retirez
   `Mail.Send` de l'inscription d'application, et dans Exchange Online PowerShell :

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

SMTP avec OAuth2 nécessite une permission Exchange, l'application inscrite dans Exchange, et SMTP AUTH activé pour la boîte aux lettres d'envoi :

1. Dans l'inscription d'application, **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, puis **Grant admin consent** : SMTP n'a besoin d'aucune permission Graph.
2. Dans Exchange Online PowerShell, inscrivez l'application dans Exchange, donnez-lui la boîte aux lettres, et activez SMTP AUTH pour cette boîte :

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Un certificat au lieu d'un secret

Un identifiant Entra ID peut se connecter avec un certificat au lieu de son secret client, pour le mail uniquement :

1. Créez un certificat et sa clé, par exemple :

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Téléversez le certificat (`ansibleforms-mail.pem`) dans l'inscription d'application, sous **Certificates & secrets > Certificates**.
3. Sur l'identifiant, réglez **Se connecter avec** sur **Certificat** et collez le **Certificat** et sa clé privée, la **Clé client** (PEM, RSA, sans phrase
   secrète). Les deux sont vérifiés au moment d'**Enregistrer** ; la clé est stockée chiffrée et n'est plus jamais affichée.

Un fournisseur SSO se connecte toujours avec le secret client, si bien qu'un identifiant utilisé à la fois pour l'authentification et pour le mail garde
aussi son secret. Dans le [seed de configuration](../seed/), un identifiant `entraid` porte le certificat dans `client_cert` et sa clé dans
`client_key`, et le canal mail prend `send_through: graph` ou `send_through: smtp`.

---

## Quand Microsoft refuse

**Envoyer un test** sur le canal indique en termes simples ce qui manque, jamais le secret, la clé ni le jeton :

- la permission `Mail.Send`, ou son consentement administrateur
- une boîte aux lettres d'expéditeur hors de la portée de l'application (Exchange RBAC for Applications), ou une boîte aux lettres qui n'existe pas
- un secret client ou un certificat erroné ou expiré
- SMTP AUTH désactivé pour la boîte aux lettres, avec **SMTP (OAuth2)**
