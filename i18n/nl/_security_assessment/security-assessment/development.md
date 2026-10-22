---
layout: default
title: Veilige ontwikkeling
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Veilige ontwikkeling
{: .no_toc }

Hoe wijzigingen worden gecontroleerd en uitgebracht, en wat wordt ondersteund
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De broncode

AnsibleForms is open source, dus alles op deze pagina kun je in de repository zelf controleren:

* De code, de geschiedenis en de build-pipelines zijn openbaar op [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* De [licentie](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) is GPL-3.0.
* De [changelog](../changelog.html) noemt elke wijziging van elke release, inclusief beveiligingsoplossingen.

---

## Hoe een wijziging wordt gemerged

Elke wijziging komt via een pull request in `main`, onder een ruleset die niemand kan omzeilen:

| Regel | Wat het betekent |
|---|---|
| Pull request verplicht | Er wordt niets rechtstreeks naar `main` gepusht |
| Verplichte checks | De pull request wordt pas gemerged als elke check hieronder slaagt |
| Geen force push, geen verwijdering | De geschiedenis van `main` kan niet worden herschreven of verwijderd |
| Lineaire geschiedenis | Elke pull request wordt één commit, zodat elke wijziging afzonderlijk te traceren en terug te draaien is |

De checks waaraan een pull request moet voldoen:

| Check | Wat het doet |
|---|---|
| Client, Server | De unittests van de webinterface en van de server |
| CodeQL | De statische analyse van GitHub op de JavaScript- en TypeScript-code, op injectie, cross-site scripting en andere zwakheden |
| Public schema is up to date | Het databaseschema dat de code verwacht, komt overeen met het schema dat wordt meegeleverd |
| Title, Branch | De pull request volgt de naamgevingsregels, zodat de changelog klopt |

Nog twee draaien op elke pull request en rapporteren daarover:

* **Database** test de server op MySQL en MariaDB, en **Browser** bedient de interface in een browser.
* **Dependency review** blokkeert een nieuwe afhankelijkheid met een bekende kwetsbaarheid van hoge of kritieke ernst.

---

## Codeanalyse en afhankelijkheden

De code en waarvan die afhangt, worden na het mergen opnieuw gecontroleerd:

* **CodeQL** analyseert ook elke push naar `main` en naar de releasebranches, en elke week de hele codebase:
  een nieuwe CodeQL-regel controleert dan ook de code die eerder is gemerged.
* **Dependabot** opent een pull request voor elke nieuwe versie van een afhankelijkheid: de npm-pakketten van de server en de
  interface, de Python-pakketten van de runtime-omgeving en de GitHub Actions van de pipelines elke week, en
  de basisimages van de containers elke dag.
* De basisimages zijn vastgepind op digest (`node:26-trixie-slim@sha256:...`), zodat een build precies de gereviewde image gebruikt.
  Dependabot verplaatst de digest wanneer de image upstream opnieuw wordt gebouwd.

---

## Releases en images

Een release wordt uitsluitend door GitHub Actions gebouwd en gepubliceerd, nooit vanaf de machine van een ontwikkelaar:

* Een release wordt gemaakt vanaf `main` (of `release/6.x`), met een changelog die uit de pull requests wordt opgebouwd.
* De images worden gebouwd door de [Publish-workflow](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  en gepusht naar de GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, met de images van de runtime-omgeving
  ernaast. De workflow en zijn logs zijn openbaar, dus iedereen kan zien wat er in een image is gegaan.
* De images van de applicatie en de runtime-omgeving draaien als de niet-geprivilegieerde gebruiker `node` (uid 1000), nooit als root.

---

## Ondersteunde versies

Beveiligingsoplossingen komen in de nieuwste release van elke ondersteunde lijn:

| Versie | Krijgt beveiligingsoplossingen |
|---|---|
| 7.x | Ja |
| 6.5.x | Ja |
| Ouder dan 6.5 | Nee: upgraden is de oplossing |

De [upgradehandleiding](../upgrading/) behandelt de overstap naar een nieuwere release, en [Upgraden naar v7](../upgrade-7.html) de overstap vanaf 6.5.
