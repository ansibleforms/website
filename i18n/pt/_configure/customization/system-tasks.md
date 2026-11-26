---
layout: default
title: Processos do sistema
parent: Variáveis de ambiente
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Processos do sistema
{: .no_toc }

Quando correm as limpezas, a cópia noturna e os ciclos do hub de runners
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas para passar os [processos do sistema](../jobs/system-tasks.html) para outras horas, ou para correr os ciclos do hub de runners mais ou menos vezes.

---

## Exemplo

Fazer a cópia à 1:00, limpar as tarefas à 1:30, e enviar as tarefas aos runners a cada 5 segundos. No `.env` do projeto compose:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Uma variável `_CRON` aceita um cron de 5 campos (minuto, hora, dia, mês e dia da semana) no fuso horário do servidor,
[`LOG_TZ`](logging.html#env_LOG_TZ). O separador **Agendamento** de cada processo, em **Tarefas > Sistema**, escreve a sua variável e
aplica-a de imediato em todos os nós, sem reiniciar. A recarga do config seed tem a sua,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), com as variáveis do config seed.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="system-tasks" %}
