---
layout: default
title: Fazer pull das alterações
parent: Repositórios git
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Fazer pull das alterações
{: .no_toc }

Pulls agendados, manuais e pela API, e alterações locais
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fazer pull das alterações

Faz-se pull de um repositório segundo o seu agendamento, no arranque, a partir da página ou através da API; não há nenhum endpoint de webhook.

| Gatilho | Como |
|---|---|
| Agendamento | **Ativar o pull agendado** e um **Agendamento do pull**, por exemplo `0 * * * *` para cada hora |
| Arranque | **Fazer pull ao iniciar a aplicação** clona o repositório, ou faz pull quando já está clonado |
| Página de definições | **Pull** no menu da linha, ou **Pull de todos** por cima da lista |
| Designer | **Carregar (repositório)**, que faz pull dos repositórios de formulários e recarrega o designer; obter o bloqueio do designer também faz primeiro pull de todos os repositórios de formulários |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` ou `showConnectionsSettings`) ou `POST /api/v2/forms-repos/pull/<name>` (ver abaixo) |

### Pull a partir de um pipeline ou de um webhook

O AnsibleForms não tem nenhum recetor de webhooks dedicado, mas uma tarefa de CI ou um webhook do servidor git pode chamar o endpoint de pull.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Crie o token como descrito em [Tokens de API](../profile/api-token.html), para um utilizador cuja função tenha `showSettings` ou
`showConnectionsSettings`. `/api/v2/forms-repos/pull/<name>` precisa antes de `showDesigner` e `allowFormDesign`, com o designer
ligado ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` devolve a
`head`, o `status` e o `output`, para que um pipeline possa verificar que commit a instância está a usar depois de um pull.

### Alterações locais

Um pull nunca substitui trabalho que ainda não foi enviado, por isso um pull agendado verifica a cópia de trabalho antes de correr.

Um pull agendado é saltado enquanto a cópia de trabalho tem alterações sem commit ou commits por enviar, e enquanto um designer
tem o bloqueio do designer. Um pull manual de uma cópia de trabalho com alterações em conflito falha com:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Envie as alterações, ou descarte-as com **Repor** no menu da linha, que elimina a cópia de trabalho e a clona de novo.
