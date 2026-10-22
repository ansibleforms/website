---
layout: default
title: Eventos em direto
parent: API REST
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Eventos em direto
{: .no_toc }

Saiba quando as tarefas e as definições mudam, em vez de fazer polling
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

O servidor informa os seus clientes do que muda, à medida que muda. Um script também pode ficar à escuta, em vez de ler uma tarefa a cada poucos segundos.

---

## O stream

`GET /api/v2/events` é um stream de [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
que se mantém aberto. Qualquer utilizador com sessão iniciada o pode abrir, com o bearer token habitual:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Quando algo muda, envia um evento `changed` com o nome do que mudou:

```text
event: changed
data: {"name":"jobs"}
```

---

## Nomes dos eventos

Um evento transporta apenas um nome, nunca dados, por isso não revela nada que o utilizador não possa ver. São enviados estes nomes:

| Nome | O que mudou |
|---|---|
| `jobs` | Uma tarefa: lançada, o seu estado ou saída, eliminada |
| `appearance` | As definições que o cabeçalho mostra: o tema, o nome, um anúncio, uma variável de ambiente |
| `designer` | Um bloqueio do designer, obtido ou libertado |
| `runners` | Um runner (a partir da 7.3.0): um RTE ligou-se ou desligou-se, pediu para aderir, foi aprovado ou rejeitado, ou alterou o seu modo ou as suas definições |

Ao receber um nome, volte a ler o que mostra através da API normal (por exemplo `GET /api/v2/job/42`), com as suas próprias
permissões. Um nome muito ativo é enviado no máximo uma vez por segundo.

---

## Mantê-lo aberto

O stream foi feito para sobreviver a proxies e balanceadores de carga, e um cliente volta a ligar-se sozinho:

* Ao ligar-se, o servidor envia um evento `hello`, e pede ao cliente que aguarde 3 segundos antes de voltar a ligar-se.
* A cada 15 segundos envia uma linha de comentário (`: ping`), para que uma ligação inativa não seja fechada. Ignore as linhas que começam por `:`.
* Os eventos de todos os nós da aplicação chegam a todos os streams, seja qual for o nó a que o cliente está ligado.
* Depois de voltar a ligar-se, volte a ler o que mostra: um evento enviado enquanto o stream estava em baixo não é enviado novamente.

---

## Saúde e métricas

As sondas de liveness e readiness (`/api/v2/live`, `/api/v2/ready`) e as métricas Prometheus (`/api/v2/metrics`) destinam-se
a ferramentas de monitorização e não a scripts que atuam como um utilizador. Consulte [Monitorização](../production/monitoring.html).
