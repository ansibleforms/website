---
layout: default
title: Jobs
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Jobs
{: .no_toc }

Volg, breek af, herstart, keur goed en verwijder de jobs die je formulieren starten
{: .fs-6 .fw-300 }

---

Voor iedereen die formulieren start: wat een job is, waar je hem vindt en wie hem kan zien.

---

## Wat een job is

Een job is één uitvoering van een formulier: AnsibleForms legt hem vast met zijn status, extravars en uitvoer zodra het formulier wordt verzonden.

Elke job bewaart:

* het **formulier** dat hij uitvoerde en de **gebruiker** die hem startte (met het type gebruiker, zoals `local` of `ldap`);
* zijn **jobtype** en **status**, en zijn **starttijd** en **eindtijd**;
* zijn **uitvoer**, de extravars en inloggegevens waarmee hij draaide, en de veldwaarden die in het formulier zijn ingevuld.

Een multistep-formulier maakt één job voor het formulier en één job per stap. De stappen zijn gekoppeld aan de hoofdjob en staan eronder.

Dezelfde jobs kun je ook starten, volgen en beheren via de [REST API](../api/jobs.html).

---

## De pagina Jobs

De link **Taken** in de kopbalk opent de lijst van alle jobs, de nieuwste eerst (`/jobs/all`). De pagina en de link worden getoond aan gebruikers
van wie de rol de [roloptie](../config/roles.html#role-options) `showJobs` instelt.

![De lijst met jobs](../assets/screenshots/job-log.jpg)

Het linkermenu ordent de jobs in de tijd, met het aantal jobs bij elk item; een statusitem filtert de lijst op die status:

| Sectie | Menu-item | Toont |
|---|---|---|
| **Verleden** | **Geslaagd** | Jobs met status `success` |
| | **Mislukt** | Jobs met status `failed` |
| | **Afgebroken** | Jobs met status `aborted` |
| | **Afgewezen** | Jobs met status `rejected` |
| | **Verlaten** | Jobs met status `abandoned` |
| **Heden** | **Bezig** | Jobs met status `running` |
| | **Wacht op goedkeuring** | Jobs met status `approve`; het aantal wordt oranje zodra er een wacht |
| **Toekomst** | **Gepland** | De pagina [Planner](schedules.html) (roloptie `allowScheduledJobs`) |
| | **Opgeslagen** | De pagina [Opgeslagen invoer](stored-jobs.html) (roloptie `allowStoredJobs`) |

Het menu heeft geen item voor alle jobs: de link **Taken** in de kopbalk toont ze allemaal, `warning`-jobs inbegrepen.

Boven de tabel, op de titelregel:

* het **zoekvak** houdt de jobs over waarvan de getoonde kolommen de tekst bevatten (niet hoofdlettergevoelig), of waarvan een stap die tekst als id
  of doel heeft;
* **Verwijderen** (met het aantal aangevinkte jobs) verwijdert de jobs die in de eerste kolom zijn aangevinkt in één keer;
* **Kolommen** toont of verbergt de kolommen `id`, `form`, `job type`, `status`, `start time`, `end time`, `duration` en `user`;
  de duur van een lopende job telt op;
* **Vernieuwen** laadt de lijst opnieuw.

De lijst laadt de nieuwste jobs, zoveel als de instelling [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) aangeeft
(**Instellingen > Systeem > Algemeen**, tabblad **Jobs**, standaard `1000`); de pagina's, het zoeken en de filters gelden voor die jobs.

Elke kolom is sorteerbaar en heeft een eigen filterveld. Een multistep-job heeft vlak voor zijn `form` een pijltje dat
de stappen uitklapt; een klik op de rest van een rij opent de job.

De bel in de kopbalk telt de jobs die op jouw goedkeuring wachten en opent de lijst op **Wacht op goedkeuring**. Voor gebruikers die
de runners kunnen zien, telt hij ook de [runners die op goedkeuring wachten](../runners/registration.html#approving-an-rte), RTE's die vroegen om toe te treden,
en opent hij **Verbindingen > Runners** wanneer alleen runners wachten. Wachten er beide, dan opent hij een menu, **Jobs die wachten op goedkeuring** en
**Runners die wachten op goedkeuring**, elk met het aantal.

---

## Wie welke jobs ziet

Welke jobs een gebruiker ziet, hangt af van zijn rollen:

| Gebruiker | Ziet |
|---|---|
| Admin (rol `admin`) | Elke job |
| Roloptie `showAllJobLogs` | Elke job |
| Roloptie `manageAllJobs` (vanaf 7.3.0) | Elke job, en mag hem afbreken, verwijderen en herstarten |
| Elke andere gebruiker | Zijn eigen jobs, en de jobs die wachten op een goedkeuring die een van zijn rollen noemt |

Tot en met 7.2 kon elke gebruiker elke job openen die op goedkeuring wachtte, extravars en uitvoer inbegrepen; vanaf 7.3.0 kunnen alleen de eigenaar en de
goedkeurders dat. Een job zien geeft niet elke actie erop: de job van een andere gebruiker afbreken, verwijderen en herstarten vereist een admin of
`manageAllJobs`, en `showAllJobLogs` toont de jobs alleen. Verwijderen vereist daarnaast `allowJobDeletion` en herstarten `allowJobRelaunch`.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [Statussen en typen](statuses.html) | Elke status die een job kan hebben, en de soorten jobs |
| [Een job volgen](following.html) | Live uitvoer, extravars, filters en downloads |
| [Jobacties](actions.html) | Een job starten, afbreken, herstarten, goedkeuren of afwijzen, en verwijderen |
| [Planningen](schedules.html) | Een formulier later of volgens een cron-schema uitvoeren, en elke planning beheren |
| [Opgeslagen jobs](stored-jobs.html) | De gegevens van een formulier bewaren om ze later weer te laden |
| [Opruimen](cleanup.html) | Jobs die door een herstart zijn afgebroken, en hoe lang afgeronde jobs bewaard blijven |
