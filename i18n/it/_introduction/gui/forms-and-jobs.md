---
layout: default
title: Moduli e job
parent: Tour dell'interfaccia
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# Moduli e job
{: .no_toc }

L'accesso, la dashboard, la compilazione di un modulo e il monitoraggio dei suoi job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Accesso

La pagina di autenticazione degli utenti, con supporto per l'autenticazione locale, LDAP, Entra ID e OIDC.

![Accesso](../assets/screenshots/login.jpg)

---

## La dashboard

La dashboard principale mostra tutti i moduli disponibili organizzati per categoria.

![Dashboard](../assets/screenshots/dashboard.jpg)

---

## Un modulo

Un esempio di modulo con origini dati esterne e campi dinamici.

![Esempio di modulo](../assets/screenshots/form.jpg)

---

## Anteprima JSON del modulo

Visualizza in anteprima il payload JSON e le variabili extra passate ad Ansible prima di eseguire il job.

![Anteprima JSON del modulo](../assets/screenshots/form-json.jpg)

---

## Job in esecuzione

Esecuzione in tempo reale di un playbook Ansible con output dal vivo.

![Job in esecuzione](../assets/screenshots/run.jpg)

---

## Output del job

L'output completo di un playbook Ansible eseguito.

![Output del job](../assets/screenshots/job-output.jpg)

---

## Log dei job

Tutti i job con il loro stato e i loro orari, filtrati per stato dal menu a sinistra.

![Log dei job](../assets/screenshots/job-log.jpg)

---

## Multistep

Un job multistep, con l'output di ogni passo sotto il job principale. I moduli multistep sono deprecati dalla 7: un
[workflow](../workflows/) concatena invece playbook, template e approvazioni.

![Modulo multistep](../assets/screenshots/multistep.jpg)

---

## Pianificazioni

Pianifica l'esecuzione dei moduli a orari o intervalli precisi. Gli [esempi di cron](../faq.html#which-cron-expressions-can-i-use) elencano espressioni
comuni, e spiegano in quale fuso orario gira una pianificazione.

![Pianificazioni](../assets/screenshots/schedules.jpg)
