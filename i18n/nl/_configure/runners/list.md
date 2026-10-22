---
layout: default
title: De pagina Runners
parent: Runners
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# De pagina Runners
{: .no_toc }

De lijst met runners, er een toevoegen, er een in- of uitschakelen, en de standaard van elk type
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De lijst

De pagina onder **Verbindingen > Runners** toont elke runner met deze kolommen:

| Kolom | Betekenis |
|---|---|
| Ingeschakeld | Of hij jobs aanneemt. Een uitgeschakelde runner krijgt geen job, ook niet als standaard van zijn type. |
| Naam | Hoe formulieren ernaar verwijzen, met `runner: <name>`. |
| Type | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck of Jenkins. De standaardrunner van zijn type heeft een pilletje **Standaard** erachter. |
| Beschrijving | Waarvoor hij dient. |

**Kolommen** voegt er nog twee toe, standaard uit: **Modus**, de modus van een RTE (Uitgaand, Inkomend of Database (verouderd), zie
[Modi](../rte/modes.html)), en **Verbinding**, of een app-node een socket naar een RTE in een socketmodus vasthoudt: **Verbonden** of
**Niet verbonden**.

Vanaf 7.3.0 staan de runners die op goedkeuring wachten niet in de lijst maar in een melding erboven, zie [Een RTE goedkeuren](registration.html#approving-an-rte).
**Runner toevoegen** opent een dialoogvenster in stappen: **Runner** (naam en beschrijving), **Type** en **Referenties**, met voor een RTE een stap **Modus** na
**Type** (Uitgaand, de standaard voor een nieuwe, Inkomend of Database (verouderd)): vier stappen voor een RTE, drie voor de
andere. In de stap **Type** heeft elk product een hint: die van de RTE geeft de volledige naam, *Runtime-omgeving*. Een rij opent de eigen
pagina van de runner, en het menu ervan biedt:

| Actie | Wat ze doet |
|---|---|
| Bewerken | Opent de pagina |
| Verbinding testen | Controleert of hij antwoordt en zijn referentie accepteert, zie [Verbinding testen](runner-page.html#test-connection) |
| Inschakelen, Uitschakelen | Schakelt hem in of uit, wat hij nog niet is |
| Referenties wijzigen | Opent het tabblad Referenties van de pagina |
| Verwijderen | Verwijdert hem |

---

## Standaard en Ingeschakeld

De standaard van elk type is waar de formulieren van dat type draaien als ze geen runner noemen:

| Standaard voor | Waar deze formulieren draaien als ze geen runner noemen |
|---|---|
| Playbookformulieren | `ansible`-formulieren, op een RTE |
| AWX-, AAP- en Ascender-formulieren | `awx`-, `aap`- en `ascender`-formulieren, op een AWX-runner |
| Semaphore-formulieren | `semaphore`-formulieren |
| Rundeck-formulieren | `rundeck`-formulieren |
| Jenkins-formulieren | `jenkins`-formulieren |

De eerste runner van een type wordt de standaard, dus voor één runner per type is geen extra stap nodig. Om een andere runner de standaard te maken,
zet je de schakelaar **Standaard** op zijn pagina aan (zie [De pagina van een runner](runner-page.html)).

Een uitgeschakelde runner blijft met zijn instellingen in de lijst staan, maar er gaat geen job naartoe, ook niet als standaard van zijn type. Een job voor hem mislukt met
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Schakel hem in of uit met **Inschakelen** of **Uitschakelen** in het menu van zijn rij, of met de schakelaar **Ingeschakeld** op zijn pagina. Een nieuwe runner staat aan, en de
runners die vóór 7.3.0 bestonden, staan na de upgrade aan. De [configuratie-seed](../seed/example.html) kan er een uitschakelen met
`enabled: false`.
