---
layout: default
title: Cópias de segurança e retenção
parent: Variáveis de ambiente
nav_order: 3
translated_from: ce6a769abd4e2fa8cb270d1280019cb15953de25
---

# Cópias de segurança e retenção
{: .no_toc }

Os comandos de cópia de segurança, e durante quanto tempo se mantêm as cópias de segurança, as tarefas e os registos de auditoria
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas para controlar quanto histórico a base de dados mantém, e quantas cópias de segurança ficam em disco.

---

## Exemplo

Manter as tarefas terminadas durante 90 dias e o registo de auditoria durante dois anos. No `.env` do projeto compose:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Uma tarefa diária remove as tarefas terminadas mais antigas do que isto às 2:30 e as entradas de auditoria às 3:30. Uma tarefa em execução, ou uma que aguarda
aprovação, nunca é removida. A partir da 7.7.0, `STORED_JOB_UNUSED_DAYS` também remove, às 4:00, as [tarefas
guardadas](../jobs/stored-jobs.html#when-it-is-removed) a partir das quais nenhuma tarefa foi lançada durante esses dias. Estas variáveis
aplicam-se sem reiniciar quando são alteradas na página de definições.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="retention" %}
