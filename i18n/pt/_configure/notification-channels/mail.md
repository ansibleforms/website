---
layout: default
title: Email
parent: Canais de notificação
nav_order: 1
translated_from: 8348d14d37bdc4afc9b68869be9fe8021197597e
---

# Email
{: .no_toc }

Servidores de correio, o predefinido, e como iniciam sessão
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O canal de email

Um canal de email é o servidor através do qual a aplicação envia o seu email: um servidor SMTP, ou o Microsoft 365 a partir da 7.6.0.
Pode manter vários; o marcado como **Predefinido** é o servidor com que a aplicação envia o seu email quando um formulário não nomeia nenhum canal:

| Passo | Campo | Significado |
|---|---|---|
| Credenciais | Credencial | Uma credencial **smtp** de [Ligações > Credenciais](../credentials.html) (o servidor de correio, a sua porta e TLS, e o acesso), ou uma credencial **Microsoft Entra ID** para enviar através do [Microsoft 365](microsoft-365.html). Opcional a partir da 7.6.0: sem nenhuma, envia através do servidor de correio do próprio canal, ver abaixo. |
| Credenciais | Servidor de correio, Porta de correio, Usar TLS | Só sem credencial: o servidor através do qual o canal envia sem acesso (um relay). O **Servidor de correio** é então obrigatório. |
| Credenciais | Enviar através de | Só com uma credencial Microsoft Entra ID: **Microsoft Graph** (a predefinição) ou **SMTP (OAuth2)**, ver [Microsoft 365](microsoft-365.html). |
| Remetente | Remetente | O endereço do remetente que os destinatários veem. Com o Microsoft 365, a caixa de correio em nome da qual o email é enviado. |

---

## Um relay sem acesso

Um servidor de correio que aceita email sem acesso (um relay) pode ser usado de duas formas, e ambas enviam sem autenticação:

- **Uma credencial smtp só com o seu servidor**: o seu **Utilizador (opcional)** e a sua **Palavra-passe (opcional)** ficam vazios.
- **Nenhuma credencial** (a partir da 7.6.0): o passo **Credenciais** pede o **Servidor de correio**, a **Porta de correio** e **Usar TLS** do próprio canal.

Um canal que nomeia uma credencial com o seu próprio servidor esquece um servidor escrito antes no canal, que deixa de ser usado.

---

## O canal predefinido

O primeiro canal de email torna-se o predefinido, e **Tornar predefinido** no menu da linha muda-o para outro. O interruptor
**Predefinido** no separador **Detalhes** da página de um canal de email faz o mesmo.

A partir da 7.6.0, a aplicação não envia email nenhum enquanto nenhum canal de email for o predefinido, ou enquanto o predefinido estiver
desligado. Antes, recorria às definições de email da página de definições ou do config seed. A atualização para a 7.6.0 transforma essas
definições no canal de email predefinido `default` quando ainda não havia nenhum canal de email ativo: com um acesso, nomeia uma nova
credencial smtp `mail-login`; para um relay, tem o seu próprio servidor e nenhuma credencial.

No [config seed](../seed/), declare um canal de email em `notification_channels:` (ver [Exemplo](../seed/example.html)): as antigas
chaves `mail_*` em `settings:` continuam a funcionar, mas estão obsoletas e deixam de existir na 8.0.0.
