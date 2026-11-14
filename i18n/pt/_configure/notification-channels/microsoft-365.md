---
layout: default
title: Microsoft 365
parent: Canais de notificação
nav_order: 1.5
translated_from: 7726278c07b456c4b765f5319ffec54361f4c5f9
---

# Microsoft 365
{: .no_toc }

Enviar email através do Microsoft 365 com OAuth2 em vez de uma palavra-passe
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Porquê OAuth2

A Microsoft desliga por predefinição no Exchange Online, no final de dezembro de 2026, o SMTP AUTH com utilizador e palavra-passe
(basic auth), que deixa de funcionar para o envio de email a partir de aplicações como o AnsibleForms.

A partir da 7.6.0, um canal de email pode enviar através do Microsoft 365 com um registo de aplicação. Nomeia uma credencial
**Microsoft Entra ID** em vez de uma smtp, e **Enviar através de** diz como envia:

| Enviar através de | Como envia | O que o Microsoft 365 precisa |
|---|---|---|
| **Microsoft Graph** (a predefinição) | HTTPS para o `sendMail` do Graph, como a caixa de correio do remetente, sem SMTP | A permissão de aplicação `Mail.Send`, ou o Exchange RBAC for Applications |
| **SMTP (OAuth2)** | `smtp.office365.com`, porta 587 com STARTTLS, com sessão iniciada com um token em vez de uma palavra-passe | A permissão `SMTP.SendAsApp`, a aplicação no Exchange, o SMTP AUTH ligado para a caixa de correio |

O **Remetente** no passo **Remetente** é a caixa de correio em nome da qual o email é enviado.
Os canais com uma credencial smtp continuam a enviar como antes, através do seu servidor de correio e do seu acesso.

---

## O registo de aplicação

As duas formas começam com um registo de aplicação no Microsoft Entra admin center, e uma credencial que o guarda:

1. **App registrations > New registration**, single tenant. Anote o seu **Application (client) ID** e o **Directory (tenant) ID**.
2. **Certificates & secrets**: um novo client secret (copie o seu *Value*, não o seu ID), ou um certificado, ver [Um certificado em vez de um segredo](#a-certificate-instead-of-a-secret).
3. No AnsibleForms, em **Ligações > Credenciais**, uma credencial do tipo **Microsoft Entra ID** com o **Tenant ID** e o
   **Client ID**, e **Iniciar sessão com** definido como **Segredo de cliente** (depois o valor do segredo) ou **Certificado**.
4. No canal de email, escolha essa credencial e o **Enviar através de**.

O token é mantido até cinco minutos antes de expirar; um segredo ou certificado alterado obtém um novo. Uma cloud nacional define
[`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) para o token e
[`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) para o Graph.

---

## Microsoft Graph

O Graph envia com a permissão de aplicação `Mail.Send`, que deixa a aplicação enviar como qualquer caixa de correio,
salvo se o Exchange a limitar a algumas caixas de correio, como mostra o segundo passo:

1. **API permissions > Add a permission > Microsoft Graph > Application permissions > Mail.Send**, depois **Grant admin consent**.
2. Para limitar a aplicação à caixa de correio que envia, dê-lhe antes a permissão através do Exchange RBAC for Applications: remova
   `Mail.Send` do registo de aplicação e, no Exchange Online PowerShell:

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

O SMTP com OAuth2 precisa de uma permissão do Exchange, da aplicação registada no Exchange,
e do SMTP AUTH ligado para a caixa de correio que envia, em dois passos, no portal e no PowerShell:

1. No registo de aplicação, **API permissions > Add a permission > APIs my organization uses > Office 365 Exchange Online >
   Application permissions > SMTP.SendAsApp**, depois **Grant admin consent**: o SMTP não precisa de nenhuma permissão do Graph.
2. No Exchange Online PowerShell, registe a aplicação no Exchange, dê-lhe a caixa de correio, e ligue o SMTP AUTH para essa caixa:

```powershell
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "AnsibleForms mail"
Add-MailboxPermission -Identity noreply@contoso.com -User <enterprise-app-object-id> -AccessRights FullAccess
Set-CASMailbox -Identity noreply@contoso.com -SmtpClientAuthenticationDisabled $false
```

---

## Um certificado em vez de um segredo

Uma credencial Entra ID pode iniciar sessão com um certificado em vez do seu client secret, só para o email:

1. Crie um certificado e a sua chave, por exemplo:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -days 730 -subj "/CN=AnsibleForms mail" -keyout ansibleforms-mail.key -out ansibleforms-mail.pem
   ```

2. Carregue o certificado (`ansibleforms-mail.pem`) no registo de aplicação, em **Certificates & secrets > Certificates**.
3. Na credencial, defina **Iniciar sessão com** como **Certificado** e cole o **Certificado** e a sua chave privada (PEM, RSA, sem
   frase-passe). Ambos são verificados ao **Guardar**; a chave é guardada cifrada e nunca mais é mostrada.

Um fornecedor SSO inicia sempre sessão com o client secret, por isso uma credencial usada para o início de sessão e para o email também
mantém o seu segredo. No [config seed](../seed/), uma credencial `entraid` leva o certificado em `client_cert` e a sua chave em
`client_key`, e o canal de email aceita `send_through: graph` ou `send_through: smtp`.

---

## Quando a Microsoft recusa

**Enviar teste** no canal diz em palavras simples o que falta, nunca o segredo, a chave nem o token:

- a permissão `Mail.Send`, ou o seu consentimento de admin
- uma caixa de correio do remetente fora do âmbito da aplicação (Exchange RBAC for Applications), ou uma caixa de correio que não existe
- um client secret ou certificado errado ou expirado
- o SMTP AUTH desligado para a caixa de correio, com **SMTP (OAuth2)**
