---
layout: default
title: Registo
parent: Variáveis de ambiente
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Registo
{: .no_toc }

Níveis de registo, ficheiros, syslog e cores da consola
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas para ajustar quanto se regista, para onde vão os ficheiros de registo, ou para mostrar as horas no seu próprio fuso horário.

---

## Exemplo

Registar mais nos ficheiros do que na consola, e mostrar as horas do registo e das tarefas na hora de Amesterdão.
No `.env` do projeto compose:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Os servidores syslog já não se configuram aqui: adicione-os em **Definições > Ligações > Syslog**, consulte [Registos](../production/logs.html#syslog).
As variáveis `LOG_SYSLOG_*` abaixo estão obsoletas desde a 7. O primeiro arranque que encontra `LOG_SYSLOG_HOST` definida importa-as
uma vez como o servidor syslog `syslog`, que recebe o registo do servidor, e a partir daí ignora-as.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="logging" %}
