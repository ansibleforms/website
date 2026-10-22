---
layout: default
title: Cópias de segurança e retenção
parent: Variáveis de ambiente
nav_order: 3
translated_from: 76f81cfa15eaa98199a3d5963f7adc9a6f8b01dc
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
```

Uma tarefa diária remove as tarefas terminadas mais antigas do que isto às 2:30 e as entradas de auditoria às 3:30. Uma tarefa em execução, ou uma que aguarda
aprovação, nunca é removida. Ambas as variáveis se aplicam sem reiniciar quando são alteradas na página de definições.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="retention" %}
