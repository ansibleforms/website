---
layout: default
title: Formulieren en jobs
parent: Rondleiding door de interface
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

# Formulieren en jobs
{: .no_toc }

Aanmelden, het dashboard, een formulier invullen en de jobs ervan volgen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Aanmelden

De aanmeldpagina, met ondersteuning voor lokale authenticatie, LDAP, Entra ID en OIDC.

![Aanmelden](../assets/screenshots/login.jpg)

---

## Het dashboard

Het hoofddashboard toont alle beschikbare formulieren, geordend per categorie.

![Dashboard](../assets/screenshots/dashboard.jpg)

---

## Een formulier

Een voorbeeld van een formulier met externe gegevensbronnen en dynamische velden.

![Voorbeeld van een formulier](../assets/screenshots/form.jpg)

---

## JSON-voorbeeld van een formulier

Bekijk de JSON-payload en de extra variabelen die aan Ansible worden doorgegeven voordat je de job uitvoert.

![JSON-voorbeeld van een formulier](../assets/screenshots/form-json.jpg)

---

## Lopende job

Uitvoering van een Ansible-playbook in real time, met live uitvoer.

![Lopende job](../assets/screenshots/run.jpg)

---

## Uitvoer van een job

De volledige uitvoer van een uitgevoerd Ansible-playbook.

![Uitvoer van een job](../assets/screenshots/job-output.jpg)

---

## Joblogs

Alle jobs met hun status en tijden, gefilterd op status via het linkermenu.

![Joblogs](../assets/screenshots/job-log.jpg)

---

## Multistep

Een multistep-job, met de uitvoer van elke stap onder de hoofdjob. Multistep-formulieren zijn verouderd sinds 7: een
[workflow](../workflows/) rijgt in plaats daarvan playbooks, templates en goedkeuringen aan elkaar.

![Multistep-formulier](../assets/screenshots/multistep.jpg)

---

## Planningen

Plan formulieren om op specifieke tijden of met intervallen te draaien. De [cron-voorbeelden](../faq.html#which-cron-expressions-can-i-use) tonen gangbare
expressies, en leggen uit in welke tijdzone een planning draait.

![Planningen](../assets/screenshots/schedules.jpg)
