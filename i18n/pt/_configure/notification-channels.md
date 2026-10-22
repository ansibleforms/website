---
layout: default
title: Canais de notificação
nav_order: 9
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1488a67f6f281b0236e4bad3a8b3d0c3bb32326c
---

# Canais de notificação
{: .no_toc }

Envie pedidos de aprovação e notificações de tarefas por email, para o Slack, o Microsoft Teams, o Telegram ou qualquer webhook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: adicione os servidores de correio e os canais de chat para onde os formulários enviam as suas notificações e aprovações.

---

## Nesta secção

| Página | O que abrange |
|---|---|
| [Email](notification-channels/mail.html) | Servidores SMTP, o predefinido, e o seu acesso |
| [Slack e Microsoft Teams](notification-channels/slack-and-teams.html) | Um webhook de canal do Slack ou do Teams |
| [Telegram](notification-channels/telegram.html) | Um bot que publica num chat do Telegram |
| [Webhook](notification-channels/webhook.html) | Um pedido JSON para qualquer endpoint HTTP |
| [Usar canais num formulário](notification-channels/in-a-form.html) | Nomear canais nas notificações e aprovações |
| [Testar um canal](notification-channels/testing.html) | Enviar teste, e o que prova |


---

## Como funciona

Um **canal de notificação** é um sítio para onde vão as notificações, adicionado em **Ligações > Notificações**. Cada canal tem
um destes tipos:

| Tipo | O que envia |
|---|---|
| Email | Email através de um servidor SMTP: pedidos de aprovação e notificações de tarefas. |
| Slack | Uma mensagem num canal do Slack, através do seu webhook de entrada, com um botão para a tarefa. |
| Microsoft Teams | Um cartão num canal do Teams, através de um webhook do Workflows, com um botão para a tarefa. |
| Telegram | Uma mensagem de um bot num chat do Telegram, com uma ligação para a tarefa. |
| Webhook | Um pedido JSON para qualquer endpoint HTTP, construído a partir de um template. |

Um formulário nomeia os seus canais nas suas [notificações](forms/notifications.html) e na sua [aprovação](forms/approval.html),
com `channels:`. Uma notificação que não pode ser enviada fica escrita no registo; nunca faz falhar a tarefa nem a aprovação.

---

## A página de notificações

A página em **Ligações > Notificações** lista todos os canais com estas colunas:

| Coluna | Significado |
|---|---|
| Ativado | Se lhe são enviadas notificações, consulte [Usar canais num formulário](notification-channels/in-a-form.html). |
| Nome | Como os formulários se referem a ele em `channels:`. |
| Tipo | Email, Slack, Microsoft Teams, Telegram ou Webhook. O canal de email predefinido mostra uma pílula **Predefinido** depois do seu tipo. |
| Descrição | Para que serve o canal. |

**Adicionar canal de notificação** abre uma caixa de diálogo: **Canal** (nome e descrição), **Tipo**, e depois os passos do tipo
escolhido. O tipo é definido quando o canal é criado e não muda. Uma linha abre a página própria do canal, com os mesmos passos como
separadores depois de **Detalhes**, e **Enviar teste**, **Eliminar** e **Guardar** no canto superior direito. O menu da linha oferece
**Editar**, **Ativar** ou **Desativar** (conforme o caso), **Tornar predefinido** (email), **Enviar teste** e **Eliminar**.

O separador **Detalhes** da página de um canal contém o interruptor **Ativado**, que é guardado de imediato, e no email o interruptor **Predefinido**,
que é guardado com **Guardar**.

Um utilizador que abre estas páginas com `showConnectionsSettings` mas sem a função admin não pode escolher uma credencial que só
um admin pode nomear, consulte [Quem pode alterar uma credencial](credentials.html#who-may-change-a-credential). Quando um utilizador destes altera
para onde um canal envia (o url de um webhook ou a sua verificação de certificado, o endereço da Bot API do Telegram), o canal perde a
credencial que nomeava, a menos que escolha uma na mesma alteração.

Um canal declarado no [config seed](seed/) é só de leitura nesta página, e continua a poder ser testado.

