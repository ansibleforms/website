---
layout: default
title: Systeemtaken
parent: Jobs
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Systeemtaken
{: .no_toc }

De onderhoudstaken die AnsibleForms zelf uitvoert, en wanneer ze draaien
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: de opschoontaken, de nachtelijke back-up en het andere achtergrondwerk van de server, sinds 7.8.0 te zien onder **Jobs**.

---

## De taken

De server voert deze taken zelf uit, elk op een cron in de tijdzone van de server, ingesteld met [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Taak | Draait standaard | Wat ze doet |
|---|---|---|
| **Verlaten jobs** | Elk uur | Beëindigt de jobs die een dag zonder uitvoer liepen en die geen runner oppakte (zie [Verlaten jobs](cleanup.html#abandoned-jobs)) |
| **Gestopte nodes** | Elke minuut | Geeft de jobs, claims en runners vrij van AnsibleForms-nodes en RTE's die niet meer antwoorden |
| **Einde van planningen** | Elke minuut | Schakelt de [planningen](schedules.html) die hun einde bereikten uit of verwijdert ze |
| **Planningen hersynchroniseren** | Elke 5 minuten | Leest de planningen en de repository-pulls opnieuw uit de database, voor het geval een wijzigingsmelding werd gemist |
| **Verlopen tokens** | Elke dag om 03:00 | Verwijdert de verlopen aanmeldtokens, tokenintrekkingen en API-tokens |
| **Auditlog opschonen** | Elke dag om 03:30 | Verwijdert de auditregels die ouder zijn dan `AUDIT_RETENTION_DAYS` |
| **Jobs opschonen** | Elke dag om 02:30 | Verwijdert de voltooide jobs die ouder zijn dan `JOB_RETENTION_DAYS`, met hun uitvoer |
| **Nachtelijke back-up** | Elke dag om middernacht | Maakt een back-up van de database en verwijdert de oudste nachtelijke back-ups boven `NIGHTLY_BACKUP_RETENTION` |
| **Opgeslagen jobs opschonen** | Elke dag om 04:00 | Verwijdert de opgeslagen jobs voorbij hun vervaldatum of `STORED_JOB_UNUSED_DAYS` ongebruikt, en vergeet de nodes die een dag weg zijn |
| **Config seed herladen** | Elke minuut | Past de [configuratie-seed](../seed/reloading.html) opnieuw toe als het bestand is gewijzigd |

De bewaarinstellingen staan in [Back-ups en bewaartermijn](../customization/retention.html), en de back-ups in
[Back-ups](../production/backups.html). **Config seed herladen** staat uit zonder [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

Deze taken draaien op de node die het achtergrondwerk doet: het proces zonder `AF_ROLE`, of de `worker` die het worker-slot heeft
wanneer de app over meerdere nodes is verdeeld (zie [Schalen](../production/scaling.html#roles)).

---

## De lussen van de runner-hub

De runner-hub geeft de jobs aan de RTE's, en drie eigen lussen draaien om de paar seconden in plaats van op een cron:

| Lus | Draait standaard | Wat ze doet |
|---|---|---|
| **Runner-toewijzing** | Elke 2 seconden | Geeft de wachtende jobs en de annuleringen aan hun runners; een op een andere node gestarte bereikt zijn runner bij de volgende ronde |
| **Inbound runners verbinden** | Elke 10 seconden | Belt de [inbound](../rte/modes.html#inbound) runners die deze node mag houden, opnieuw voor een die zijn socket verloor |
| **Beëindigde jobs opruimen** | Elke 60 seconden | Laat los wat deze node bewaarde van jobs die op een andere node eindigden |

De lussen draaien op elke node die de webapp draait, dus met meerdere app-nodes heeft elke node de zijne. Een minuut, de kleinste
stap van een cron, is te grof voor ze: elke lus draait om de zoveel seconden.

---

## De lijst Systeem

De pagina [Jobs](./) toont de taken onder **Toekomst**, als **Systeem**, met het aantal taken, voor beheerders (roloptie `showSettings`).

De lijst heeft één rij per taak en lus, en wordt elke minuut opnieuw gelezen:

| Kolom | Toont |
|---|---|
| **Naam** | De naam van de taak |
| **Planning** | Wanneer ze draait, in woorden (*Elk uur*, *Elke 2 seconden*), de cron bij aanwijzen, of **Uit** voor een taak die niet draait |
| **Laatste uitvoering** | Wanneer de laatste run startte, of een streepje als ze nooit draaide |
| **Volgende run** | Wanneer ze de volgende keer draait |
| **Status** | Hoe de laatste run afliep: `success` of `failed` |

**Kolommen** biedt ook **Beschrijving**, wat elke taak doet. Een klik op een rij opent de pagina van de taak. De taken zijn van de
app zelf: ze kunnen niet worden toegevoegd of verwijderd.

---

## De pagina van een taak

De pagina van een taak heeft drie tabbladen, met **Nu uitvoeren** en **Opslaan** erboven, en een zoekvak dat alle tabbladen tegelijk filtert.

| Tabblad | Wat het toont |
|---|---|
| **Details** | De **Naam** en **Beschrijving**, de **Laatste start** (de fout bij aanwijzen als ze mislukte), het **Resultaat** van de laatste run, **Laatste uitvoering**, **Volgende run**, de **Node** die antwoordde voor een lus, en de **Toegepaste instelling** |
| **Planning** | Wanneer ze draait: een cron voor een taak, een **Interval** in seconden voor een lus |
| **Runs** | Elke vastgelegde run, de nieuwste eerst |

**Toegepaste instelling** noemt de variabele en haar waarde, zoals `JOB_RETENTION_DAYS` 90, met **Wijzig hem in Instellingen** om
het instellingentabblad te openen dat haar wijzigt. Een taak zonder zo'n instelling toont een streepje.

### Het tabblad Planning
{: .no_toc }

De cron van een taak wordt bewerkt in dezelfde editor als die van een planning: voorinstellingen, de expressie in woorden en de
volgende drie runs, in de tijdzone van de server. Hij neemt 5 velden (minuut, uur, dag, maand en weekdag) en moet opnieuw draaien.
Een lus neemt een geheel aantal seconden, binnen haar grenzen, die de regel onder het veld geeft.

**Opslaan** schrijft de waarde naar het beheerde instellingenbestand, zoals de instellingenpagina's doen, en past haar meteen toe op
elke node, zonder herstart. Een waarde die in de procesomgeving is ingesteld, of elke waarde met [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
is alleen-lezen, met de regel *Ingesteld door de omgevingsvariabele* en haar naam.

### Het tabblad Runs
{: .no_toc }

Elke run van een taak is een rij, met deze kolommen:

| Kolom | Toont |
|---|---|
| **Gestart door** | De gebruiker die **Nu uitvoeren** koos, als `admin (local)`, of **Planning** voor een run op de cron |
| **Starttijd**, **Eindtijd** en **Duur** | Wanneer de run startte en eindigde, en hoe lang hij duurde |
| **Status** | `success` of `failed` |
| **Resultaat** | Wat de run deed, zoals *Removed 120 jobs*, of de fout |
| **Node** | De node die hem uitvoerde |

De runs van de laatste 30 dagen blijven bewaard, tot 1000 per taak: voor een taak die elke minuut draait, ongeveer haar laatste 16 uur.

Een lus draait veel te vaak voor een rij per ronde. Haar tabblad **Runs** toont in plaats daarvan, per node:

* een samenvatting van elk uur, zoals *1,800 passes, 0 failed*, `failed` als een ronde van dat uur mislukte;
* een rij voor elke **Nu uitvoeren**, met *Run now: done* of de fout;
* een rij `failed` als een ronde op haar timer mislukt, hooguit eens per minuut voor dezelfde fout.

### Nu uitvoeren
{: .no_toc }

**Nu uitvoeren** voert de taak meteen uit, op de node die de taken draait, en legt de run vast met jouw naam. De knop is uitgeschakeld
zolang een run van de taak bezig is, en voor een taak die **Uit** staat. Een lange run, zoals de nachtelijke back-up, gaat door nadat de pagina antwoordt.

**Nu uitvoeren** van een lus voert één ronde uit op de node die de pagina serveert, en wordt geweigerd waar de runner-hub niet draait.
Elke **Nu uitvoeren** wordt in het auditlog geschreven als `system.task.run`.

---

## Wijzigen wanneer een taak draait

Elke taak en lus heeft een omgevingsvariabele voor haar timing, die haar tabblad **Planning** schrijft. Ze gelden allemaal zonder herstart.

| Variabele | Standaard | Taak |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Verlaten jobs |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Gestopte nodes |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Einde van planningen |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Planningen hersynchroniseren |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Verlopen tokens |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Auditlog opschonen |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Jobs opschonen |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Nachtelijke back-up |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Opgeslagen jobs opschonen |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Config seed herladen |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (1 tot 60) | Runner-toewijzing |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (2 tot 300) | Inbound runners verbinden |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (10 tot 3600) | Beëindigde jobs opruimen |

Een waarde die geen geldige cron is, of seconden buiten de grenzen, met de hand in de omgeving gezet, wordt genegeerd voor de standaard.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Vóór 7.8.0 werd de configuratie-seed elke [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS) gecontroleerd.
Die variabele is sinds 7.8.0 verouderd, ten gunste van `CONFIG_SEED_RELOAD_CRON`, en verdwijnt in 8.0. Zolang
`CONFIG_SEED_RELOAD_CRON` niet is ingesteld, wordt ze nog gelezen als een cron, met een waarschuwing in het log bij de start:

| `CONFIG_SEED_RELOAD_SECONDS` | Gelezen als |
|---|---|
| `60` | `* * * * *`, elke minuut |
| Een veelvoud van 60 tot `3600` | Om de zoveel minuten, zoals `*/5 * * * *` voor `300` (`3600` wordt `0 * * * *`) |
| Een getal onder 60 waarop 60 deelbaar is | Om de zoveel seconden |
| `0` | Het herladen staat uit |
| Elk ander getal | Het dichtstbijzijnde hiervan, wat het log vermeldt |

Het tabblad **Planning** van de taak toont die cron met de regel *Uit de verouderde CONFIG_SEED_RELOAD_SECONDS; een hier opgeslagen
cron vervangt die.* **Opslaan** schrijft `CONFIG_SEED_RELOAD_CRON`, dat vanaf dan voorrang heeft op de oude variabele.
