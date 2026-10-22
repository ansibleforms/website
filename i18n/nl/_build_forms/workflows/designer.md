---
layout: default
title: Bewerken in de ontwerper
parent: Workflows
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Bewerken in de ontwerper
{: .no_toc }

Teken een workflow en probeer hem uit zonder iets te starten
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De sectie Workflows

**Ontwerper > Workflows** toont de workflowbestanden in een bestandsverkenner, met de tabbladen YAML, Visueel en Voorbeeld die elke
sectie van de [ontwerper](../designer/) heeft.

- **De knop `+`** in de werkbalk maakt een workflowbestand aan, met een lege workflow om mee te beginnen.
- **YAML** toont het bestand zoals het geschreven is. Commentaar en de volgorde van de sleutels blijven ook in de andere tabbladen behouden.
- **Visueel** tekent elke workflow van het bestand als een graaf, met de naam en beschrijving erboven. Een bestand met twee workflows
  toont ze allebei, onder elkaar.
- **Voorbeeld** is een proefrun van de workflow: zie [Uitproberen](#trying-it-out).

Problemen staan boven de graaf, elk met een link die de YAML op de juiste regel opent: een koppeling naar een knooppunt dat niet
bestaat, een lus, een playbook, inventaris, referentie, runner of repository die de ontwerper niet kent.

---

## De graaf

De graaf lees je van links naar rechts, van **START** tot de laatste knooppunten. Elk knooppunt toont zijn identifier en daaronder wat
het uitvoert; de koppelingen zijn gekleurd naar wat ze laat afgaan, zoals de legenda in de graaf aangeeft: bij succes, bij fout,
altijd.

- **Klik op START** om een eerste knooppunt toe te voegen: een knooppunt zonder ouder, dat draait zodra de workflow start.
- **Klik op een knooppunt** om het te bewerken.
- **Klik op een koppeling** om te wijzigen wat haar laat afgaan, of om haar te verwijderen.

---

## Een knooppunt toevoegen

Een nieuw knooppunt voeg je toe met een wizard: **Nieuw knooppunt bij succes**, **Nieuw knooppunt bij fout** of **Nieuw knooppunt altijd** op een bestaand
knooppunt, of START voor een eerste.

1. **Wat het uitvoert**: de identifier van het knooppunt, **Voert uit** (wat voor knooppunt het is en, bij een playbookknooppunt, waar het draait)
   en wat het uitvoert: een playbook of een sjabloon of job, een workflow, de naam en time-out van een goedkeuring, of een repository. Zie
   [Waar een knooppunt draait](#where-a-node-runs).
2. **Hoe het draait**: de uitvoeringsinstellingen: de inventaris, de referenties, de limiet, de tags, de uitgebreidheid,
   check- en diff-modus, de voorwaarde (**Draait als**) en **Waarden uit** (zie [het workflowbestand](file.html#run-settings)).
3. **Waar het heen gaat**: het knooppunt waarna het draait, en wanneer.

**Aanmaken** voegt het knooppunt toe aan de YAML.

---

## Waar een knooppunt draait

**Voert uit** zegt wat een knooppunt uitvoert en waar, in één lijst: **Playbook op de RTE**, **Sjabloon op AWX**, **Sjabloon op
Semaphore**, **Job op Rundeck**, **Job op Jenkins**, en daarna **Workflow**, **Goedkeuring** en **Repository-pull**.

| Voert uit | Het veld eronder | Runner |
|---|---|---|
| **Playbook op de RTE** | **Playbook**: een playbook uit de ontwerper | **De standaard RTE**, of een RTE-runner op naam |
| **Sjabloon op AWX** (inclusief AAP en Ascender) | **Sjabloon**: de naam van de sjabloon, getypt | de AWX-runners, elk met zijn variant |
| **Sjabloon op Semaphore** | **Sjabloon**: de naam van de sjabloon, getypt | de Semaphore-runners |
| **Job op Rundeck** of **Job op Jenkins** | **Job**: de naam van de job, getypt | de Rundeck- of Jenkins-runners |

- **Playbook op de RTE** wordt altijd aangeboden; de andere alleen wanneer de instantie een [runner](../runners.html) van dat type heeft.
- **Runner** toont alleen de runners van dat type, met de standaardrunner gemarkeerd en vooraf geselecteerd (of anders de eerste op naam).
- Kies je een andere plek, dan wordt gewist wat het knooppunt uitvoert, zodat je dat opnieuw kiest.
- Een knooppunt waarvan de ontwerper de runner niet kent, toont **Sjabloon of job op** die runner.

Het workflowbestand verandert niet: zo'n knooppunt is een `job_template`-knooppunt met een `runner:` (zie
[het workflowbestand](file.html#run-settings)).

---

## Een knooppunt bewerken

Klik je op een knooppunt, dan opent zijn dialoog, met vier tabbladen:

| Tabblad | Wat erin staat |
|---|---|
| **Wat het uitvoert** | De identifier, **Voert uit**, wat het uitvoert en, bij een playbookknooppunt, de runner |
| **Hoe het draait** | De uitvoeringsinstellingen; referenties kies je uit een lijst, elk toegevoegd met `+` |
| **Draait na** | De koppelingen naar het knooppunt toe, en **Alle ouders moeten samenkomen** |
| **Daarna** | De koppelingen vanuit het knooppunt, met **Koppelen aan een bestaand knooppunt:** en **Koppelen aan een nieuw knooppunt:** |

**Tonen in YAML** opent de YAML op het knooppunt, en **Knooppunt verwijderen** verwijdert het samen met zijn koppelingen. Elke wijziging wordt meteen naar de
YAML geschreven; **Opslaan** slaat het bestand op.

---

## Uitproberen

Het tabblad **Voorbeeld** speelt de workflow door zonder iets te starten, volgens de regels van AWX.

Elk knooppunt begint als een succes. Klik op een knooppunt om het te laten mislukken, en klik nog eens om het weer te laten slagen; de graaf toont dan
welke knooppunten zouden draaien, welke niet zouden draaien en of de workflow zou mislukken. **Herstellen** laat elk knooppunt weer slagen.
