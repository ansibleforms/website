---
layout: default
title: Funcionalidades
parent: Variáveis de ambiente
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Funcionalidades
{: .no_toc }

O designer, MCP, chat, a validação no lançamento, a lista de tarefas, métricas, a API do AWX e o registo de consultas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas para ligar ou desligar partes opcionais da aplicação.

---

## Exemplo

Servir o servidor MCP para agentes de IA e impor as regras de validação dos formulários em cada lançamento. No `.env` do projeto compose:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` e `ENABLE_CHAT` aplicam-se sem reiniciar: são lidas em cada pedido, por isso pode ligá-las na
página de definições. Enquanto uma está desligada, o seu endpoint (`/api/v2/mcp` ou `/api/v2/chat`) responde `404`.

Corra primeiro `LAUNCH_VALIDATION=log` durante algum tempo: regista o que `enforce` recusaria sem o recusar. Consulte [MCP](../mcp/)
e [Registar e impor](../launch-validation/log-and-enforce.html).

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="features" %}
