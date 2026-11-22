---
layout: default
title: Back-ups en bewaartermijn
parent: Omgevingsvariabelen
nav_order: 3
translated_from: 1cac64b6467ce96bce3aac71718f07d7ecd10d89
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

Deze tijden zijn de standaard. Sinds 7.8.0 is elke opschoontaak, en de nachtelijke back-up, een [systeemtaak](../jobs/system-tasks.html) onder
**Jobs > Systeem**, waar een beheerder wijzigt wanneer ze draait en haar runs ziet; de variabelen van hun tijden staan in
[Systeemtaken](system-tasks.html).

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="retention" %}
