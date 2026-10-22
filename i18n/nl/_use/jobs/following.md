---
layout: default
title: Een job volgen
parent: Jobs
nav_order: 2
translated_from: 3beb53d60eeac0e108e31a8dabf2877ab15d2126
---

# Een job volgen
{: .no_toc }

Live uitvoer, extravars, filters en downloads
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Een job volgen

Klik je op een job, dan opent zijn pagina: het formulier van de job als titel, de acties in de kop en de uitvoer eronder.

![De uitvoer van een job](../assets/screenshots/job-output.jpg)

Vanaf 7.3.0 bestaat de pagina uit kaarten, en elke kaart klapt in onder haar kop:

| Kaart | Wat ze toont |
|---|---|
| **Overzicht** | De naam, status en het type van de job als kop, en de gegevens eronder in een raster van drie kolommen (twee, en dan één, op een smalle pagina) |
| **Workflow** | Bij een workflowjob, ook een workflowjob van AWX of AAP, de graaf en het aantal knooppunten (zie [De workflowgraaf](#the-workflow-graph)) |
| **Uitvoer** | De uitvoer van de job en de werkbalk ervan |

Een job die op AWX, AAP, Ascender, Jenkins, Semaphore of Rundeck draaide, toont daar zijn nummer als link naar zijn pagina in die tool, geopend
in een nieuw tabblad. De link wordt bij de job bewaard, dus hij blijft werken wanneer de runner later wordt hernoemd of verwijderd.

De pagina wordt live bijgewerkt: de server stuurt een gebeurtenis telkens als een job wordt gestart, van status verandert, uitvoer schrijft of wordt
verwijderd, en de pagina leest de job opnieuw, zodat de uitvoer groeit terwijl de job schrijft. De lijst met jobs wordt op dezelfde manier bijgewerkt.
**Vernieuwen** laadt de job handmatig opnieuw.

Zolang je aan het eind van de uitvoer staat, volgt de pagina die naar beneden terwijl er nieuwe regels binnenkomen. Scrol omhoog om een eerdere regel te lezen,
en de pagina blijft waar je bent: **Naar nieuwste** verschijnt dan onderaan over de uitvoer, en wordt **Nieuwe regels** zodra
er meer zijn binnengekomen. Klik erop, of scrol terug naar het eind, om de nieuwe regels weer te volgen. De uitvoer op de pagina van het formulier, na
**Verzenden**, en het [serverlog](../production/logs.html) volgen hun nieuwe regels op dezelfde manier.

De werkbalk van de uitvoer heeft:

| Knop | Wat het doet |
|---|---|
| **Toon extravars** | Toont de extravars waarmee de job draaide in een paneel over de uitvoer, met een schakelaar **JSON** / **YAML** en **Kopiëren** |
| **Toon artifacts** | Toont de artifacts van de job in hetzelfde paneel (zie hieronder) |
| **Parameters tonen** | Neemt bij een Jenkins-job de plaats in van **Toon extravars**: de waarden waarmee hij draaide, zijn buildparameters |
| **Payload tonen** | Neemt bij een Rundeck-job de plaats in van **Toon extravars**: de payload die hem werd gestuurd |
| **Hosts en taken** | Toont de hosts en taken van een playbook over de uitvoer (zie [Hosts en taken](#hosts-and-tasks)) |
| **Vernieuwen** | Laadt de uitvoer opnieuw |
| **Filter toepassen** | Verbergt de taken waarvan de naam overeenkomt met het uitvoerfilter; **Filter verwijderen** toont ze weer |
| **Uitvoer kopiëren** | Kopieert de uitvoer als platte tekst, met of zonder het filter |
| **Uitvoer downloaden** | Downloadt de uitvoer als `ansibleforms-job-<id>.txt` |

**Toon artifacts** wordt aangeboden bij elke job die geen sjabloonjob is, zoals een playbook op de RTE of een workflow (leeg wanneer
de playbooks geen artifacts met `set_stats` verzamelden), en bij een sjabloonjob die op AWX, AAP of Ascender draaide. Jobs van Semaphore, Rundeck
en Jenkins hebben geen artifacts, dus daar wordt het nooit aangeboden.

Links in de werkbalk klapt de knop **Alles samenvouwen** elke sectie van de uitvoer in (elke play en taak) en wordt dan
**Alles uitvouwen**, waarmee je ze weer uitklapt.

**Toon extravars** vereist de roloptie `showExtravars` en **Toon artifacts** de roloptie `showArtifacts` (zie
[rolopties](../config/roles.html#role-options)). Waarden van wachtwoordvelden en sleutels die overeenkomen met
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX), worden gemaskeerd.

Het filter wordt ingesteld met [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), standaard `\[low\]`.
Zet `[low]` in de naam van een taak die veel ruis geeft, en **Filter toepassen** verbergt die taak en haar regels.

De pagina van een multistep-job toont elke stap onder de hoofdjob, onder elkaar, elk onder een titelbalk zoals
**Stap 1 · Prepare the server (job-id 98)** met de status. Klik op een titel (of druk er op Enter of Spatie) om die uitvoer
in te klappen, en nog eens om hem uit te klappen. AWX/AAP-workflows tonen ook de status van hun knooppunten.

[Workflowjobs](../workflows/running.html#the-job) bewaren de uitvoer van elk knooppunt in hun eigen uitvoer, onder een banner `WORKFLOW NODE` per
knooppunt; ze tekenen hun graaf, live, en een klik op een knooppunt opent de uitvoer ervan.

---

## Tekst zoeken in de uitvoer

Vanaf 7.3.0 heeft de pagina van de job een zoekvak, **Zoeken in de uitvoer**, op de titelregel, links van de acties van de job.

Elke plek waar de tekst in de uitvoer staat, wordt gemarkeerd, ongeacht hoofdletters, en de pagina gaat naar de eerste. **Enter** gaat naar
de volgende, sterker gemarkeerd, en de werkbalk zegt welke van hoeveel het is (**2 van 4**), of **Niet gevonden**. Zoeken klapt eerst de uitvoer en
haar secties uit, en terwijl de job draait worden ook de nieuwe regels doorzocht, zonder dat de pagina verspringt.

---

## Door een lange uitvoer bewegen

Vanaf 7.3.0 heeft een lange uitvoer, op de pagina van de job en onder een formulier na **Verzenden**, deze manieren om erdoorheen te gaan:

| Element | Wat het doet |
|---|---|
| Vaste koppen | De kop van een sectie (een knooppunt van een workflow, het playbook van de job, een stap van een multistep-job) blijft bovenaan staan terwijl de regels voorbij scrollen |
| **2 mislukt** | Telt de mislukte taken, zonder de fouten die Ansible moest negeren; elke klik gaat naar de volgende, uitgeklapt en gemarkeerd. Zonder mislukte taken telt **1 fout** in plaats daarvan de foutregels |
| Regelnummers | Elk regelnummer linkt naar zijn regel, zoals `#L45` in het adres: wie dat adres opent, scrolt naar de regel en ziet hem gemarkeerd |
| Knoppen omhoog en omlaag | Verschijnen rechtsonder zodra de pagina is gescrold, om terug te gaan naar het begin of naar het eind |
| **Bezig** en **Afbreken** | Terwijl de job draait, blijft de balk van de pagina van het formulier onderaan het venster staan, en **Afbreken** daar stopt de job meteen |

---

## Resultaten van taken

Vanaf 7.3.0 opent een resultaatregel van een host in de uitvoer van een playbook dat resultaat in een dialoog **Resultaat van de taak**, zoals AWX dat doet.

De regel, de body van het resultaat erna (`=> { ... }`) en de fout die vóór een mislukt resultaat is afgedrukt, lichten bij hover op als één blok, en een
klik opent de dialoog. Het werkt op de pagina van de job en onder een formulier na **Verzenden**, voor een playbook dat op een RTE van 7.3.0 of
later draaide, omdat het resultaat uit dezelfde gebeurtenissen komt als [Hosts en taken](#hosts-and-tasks). De dialoog heeft deze tabbladen:

| Tabblad | Wat het toont |
|---|---|
| **Details** | De status, host, play, taak, module, loop-item, starttijd, duur, returncode en het bericht |
| **JSON** en **YAML** | Het volledige resultaat van de module, gekleurd en met genummerde regels |
| **Standaarduitvoer** en **Standaardfout** | De `stdout` en `stderr` van het resultaat, als het die heeft |

Het volledige resultaat, en daarmee de tabbladen **JSON**, **YAML** en de uitvoertabbladen, wordt alleen opgeslagen wanneer de job in verbose-modus draait, omdat de uitvoer
het dan ook toont; anders toont de dialoog alleen de details. Ook in verbose-modus worden de argumenten van de module (`invocation`) weggelaten,
worden waarden van sleutels die op een geheim lijken gemaskeerd, en wordt een resultaat afgekapt zodra het groter is dan 64 KB JSON.

---

## De workflowgraaf

Vanaf 7.3.0 schuift de graaf van een lopende workflow mee om het lopende knooppunt in beeld te houden.

Scrol je de graaf weg, dan blijft hij waar je hem neerzet, met een knop **Lopende node volgen** om weer te volgen. Beweeg je over een knooppunt,
dan verschijnt zijn kaart met de volledige naam en komen het knooppunt en zijn koppelingen op de voorgrond, met de rest van de graaf vervaagd. De graaf heeft de knoppen **Aanpassen
aan scherm** en **Volledig scherm**, en onder een formulier na **Verzenden** opent een klik op een knooppunt de uitvoer ervan, net als op de pagina van de job.

---

## Hosts en taken

Sinds 7.3.0 legt een playbookjob die op een RTE van 7.3.0 of later draaide, zijn gestructureerde gebeurtenissen vast naast zijn tekstuitvoer: elke play, taak
en elk hostresultaat, en de recap. **Hosts en taken**, in de werkbalk van de uitvoer, toont ze in een paneel over de uitvoer, op de pagina van de job en
onder een formulier na **Verzenden**. Het wordt aangeboden zodra de job gebeurtenissen heeft, en het paneel wordt om de paar seconden opnieuw gelezen terwijl de job draait:

| Weergave | Wat ze toont |
|---|---|
| **Raster** | De recap per host (ok, gewijzigd, mislukt, onbereikbaar, overgeslagen, gered, genegeerd), en daarna een raster van hosts tegen taken: elke cel is gekleurd naar het resultaat van de host voor die taak, met bericht en tijd bij hover, of *niet uitgevoerd* |
| **Tijdlijn** | Elke taak als balk, zo lang als de traagste host erover deed, met de tijd in seconden en het totaal |

De tekstuitvoer blijft zoals hij is. De gebeurtenissen worden geschreven door de eigen callback-plugin `af_events` van de RTE, dus het playbook hoeft niet te veranderen.
