---
layout: default
title: Opgeslagen jobs
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
---

# Opgeslagen jobs
{: .no_toc }

De gegevens van een formulier bewaren om ze later weer te laden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Opgeslagen jobs

Opgeslagen jobs bewaren de waarden van een formulier, zodat je ze opnieuw kunt laden in plaats van elke keer dezelfde velden in te vullen.

Om op te slaan vul je het formulier in, open je de keuzelijst naast **Verzenden** en kies je **Store**. Vul in **Formuliergegevens opslaan** een
**Naam** en een optionele **Beschrijving** in, kies bij **Verwijderd** wanneer hij verwijderd wordt (zie [Wanneer hij verwijderd
wordt](#when-it-is-removed)), en sla op. Wachtwoord- en constante velden worden nooit opgeslagen. Een subformulier heeft dezelfde actie **Store**
naast zijn knop **Opslaan**, en bewaart onvoltooide waarden zonder ze te valideren.

Om te laden kies je **Laden uit opslag** bovenaan het formulier. **Opgeslagen formulier laden** toont je opgeslagen jobs voor dat formulier, met
hun aanmaak- en vervaldatum; kies er een om het formulier met de waarden ervan te vullen. Er draait niets tot je verzendt.

Opgeslagen jobs worden bewaard in de database van AnsibleForms (tabel `stored_jobs`), met de naam van het formulier, je gebruiker als
`<type>/<username>` (bijvoorbeeld `local/admin`) en de waarden als JSON. Een naam moet uniek zijn per gebruiker en formulier; een tweede
met dezelfde naam opslaan mislukt met "Er bestaat al een opgeslagen formulier met deze naam".

---

## Opgeslagen jobs beheren

De pagina **Opgeslagen invoer** toont de opgeslagen jobs met hun formulier, gebruiker, aanmaak- en vervaldatum, en vereist `allowStoredJobs`.

Vanaf 7.6.0 opent `allowStoredJobs` alleen al **Jobs > Opgeslagen** en **Opgeslagen invoer toevoegen**, waarvoor eerder ook `showSettings` of
`allowScheduledJobs` nodig was. De lijst **Formulier** biedt de formulieren die je rollen mogen openen; gebruikers met `showSettings` of `allowScheduledJobs` krijgen
daar elk formulier te zien.

Vanaf 7.7.0 heeft de lijst een sorteerbare kolom **Laatst gebruikt**, die opgeslagen jobs in gebruik scheidt van vergeten jobs.

- **Bewerken** opent de eigen pagina van de opgeslagen job: de **Details** (naam, beschrijving, formulier, gebruiker, wanneer hij is aangemaakt en
  laatst gebruikt, en wanneer hij verwijderd wordt), de **Waarden**, de opgeslagen veldwaarden als YAML, die je daar kunt wijzigen en opslaan, en de **Uitvoeringen**.
- **Openen in formulier** opent het formulier met de opgeslagen waarden ingevuld; er draait niets tot je verzendt.
- **Verwijderen** verwijdert hem. Je kunt je eigen opgeslagen jobs verwijderen; gebruikers met `showSettings` kunnen er elke verwijderen.

---

## Laatst gebruikt en uitvoeringen

Vanaf 7.7.0 onthoudt een opgeslagen job zijn laatste gebruik en de ermee gestarte jobs, zodat je ziet welke nog gebruikt worden.

Deze starts tellen als gebruik van een opgeslagen job:

| Start | Wanneer het telt |
|---|---|
| Het formulier dat ermee geopend is (**Openen in formulier**), of gevuld met **Laden uit opslag** | Als de job gestart wordt |
| **Later uitvoeren** vanuit dat formulier | Als de geplande uitvoering afgaat, niet als die gepland wordt |
| Een **herstart** van een job die ermee gestart is | Als de herstart begint, met dezelfde of gewijzigde waarden |
| De MCP-tool `launch_job` of `plan_job` ermee | Zoals hierboven |

De uitvoeringen van een schema tellen nooit, ook niet van een schema dat van een opgeslagen job is gemaakt: een schema houdt een eigen kopie van de
waarden. Een start telt alleen als de gebruiker de opgeslagen job mag zien; een die intussen verwijderd of verborgen is, wordt overgeslagen en de
job draait toch.

De jobpagina noemt de opgeslagen job waarmee een job gestart is, met een link, als je die mag zien. Het tabblad **Uitvoeringen** van de pagina van
de opgeslagen job toont de jobs die ermee gestart zijn en die je mag zien, met hun status, start, einde en duur.

---

## Wanneer hij verwijderd wordt

Elke opgeslagen job zegt wanneer hij verwijderd wordt: nooit, op een datum, of zodra hij een aantal dagen ongebruikt is.

| Keuze | Wat het doet |
|---|---|
| **Nooit** | Bewaart hem tot iemand hem verwijdert. Niet aangeboden zolang `STORED_JOB_UNUSED_DAYS` is ingesteld |
| **Op een datum** | Verwijdert hem op die datum |
| **Indien ongebruikt N dagen** | Verwijdert hem zodra er zoveel dagen geen job mee gestart is |

Een admin kan [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS) instellen
(Instellingen > Algemeen > Bewaartermijn). Dan verwijdert die elke opgeslagen job die zoveel dagen ongebruikt bleef, de eigen dagen van een
opgeslagen job kunnen alleen minder zijn, het Store-venster begint ermee, en een job die op een datum verwijderd wordt, wordt ook verwijderd zodra hij
zo lang ongebruikt is. De dagen tellen vanaf het laatste gebruik of, voor een opgeslagen job die nooit gebruikt is, vanaf het opslaan. De
standaardwaarde, 0, verwijdert nooit een opgeslagen job alleen omdat hij ongebruikt is.

Opgeslagen jobs worden elke dag om 04:00 (in `LOG_TZ`) verwijderd, op wat het eerst komt: hun datum of hun dagen.
