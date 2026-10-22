---
layout: default
title: Email
parent: Canais de notificação
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Email
{: .no_toc }

Servidores SMTP, o predefinido, e o seu acesso
{: .fs-6 .fw-300 }

Um canal de email é um servidor SMTP. Pode manter vários; o marcado como **Predefinido** é o servidor com que a aplicação envia o seu
email quando um formulário não nomeia nenhum canal de email. O primeiro canal de email torna-se o predefinido, e **Tornar predefinido** muda-o.

| Passo | Campo | Significado |
|---|---|---|
| Credenciais | Credencial | Obrigatória. Uma credencial **smtp** de [Ligações > Credenciais](../credentials.html): o servidor de correio, a sua porta e TLS, e o acesso. Para um relay sem acesso, uma credencial smtp sem utilizador. |
| Remetente | Remetente | O endereço do remetente que os destinatários veem. |

O interruptor **Predefinido** no separador **Detalhes** da página de um canal de email torna-o o predefinido, tal como **Tornar predefinido**.
As definições de email do config seed são usadas enquanto nenhum canal de email for o predefinido, ou enquanto o predefinido estiver desligado.
