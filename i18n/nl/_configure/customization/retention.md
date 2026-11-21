---
layout: default
title: Back-ups en bewaartermijn
parent: Omgevingsvariabelen
nav_order: 3
translated_from: ce6a769abd4e2fa8cb270d1280019cb15953de25
---

# Back-ups en bewaartermijn
{: .no_toc }

De back-upopdrachten, en hoe lang back-ups, jobs en auditrecords worden bewaard
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze om te bepalen hoeveel geschiedenis de database bewaart, en hoeveel back-ups op schijf blijven staan.

---

## Voorbeeld

Bewaar voltooide jobs 90 dagen en het audittrail twee jaar. In de `.env` van het compose-project:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Een dagelijkse taak verwijdert om 2:30 uur voltooide jobs die ouder zijn dan dit en om 3:30 uur auditregels. Een lopende job, of een die op
goedkeuring wacht, wordt nooit verwijderd. Vanaf 7.7.0 verwijdert `STORED_JOB_UNUSED_DAYS` ook, om 4:00 uur, de [opgeslagen
jobs](../jobs/stored-jobs.html#when-it-is-removed) waarmee zoveel dagen geen job gestart is. Deze variabelen
gelden zonder herstart als ze op de instellingenpagina worden gewijzigd.

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="retention" %}
