---
layout: default
title: Ontwerper
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: 77ea52f327e41f36adaf3be7d2b50c1d1716bcb6
---

# Ontwerper
{: .no_toc }

Bewerk formulieren, playbooks, inventarissen en workflows in de browser
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor formulierauteurs: de secties van de ontwerper, en wat elk van hun tabbladen toont.

De ontwerper vereist de [roloptie](../config/roles.html#role-options) `showDesigner`. Hij bewerkt één item tegelijk, een
formulier, een playbook of een workflowbestand, met zijn secties in het linkermenu. Elk soort bestand vereist ook een eigen optie, die allemaal
standaard aanstaan: `allowPlaybookDesign` voor de **Playbooks**, `allowWorkflowDesign` voor de **Workflows**,
`allowInventoryDesign` voor de **Inventarissen** en `allowVarsFileDesign` voor de **Variabelenbestanden**. Zonder die optie is de sectie
alleen-lezen en weigert de server de bestanden op te slaan, aan te maken, te verwijderen of te pushen; formulieren en workflows kunnen ze nog wel kiezen. De
**Formulieren**, **Categorieën** en **Constanten** vereisen op dezelfde manier `allowFormDesign`: zonder die optie zijn ze alleen-lezen, en weigert de server
ze op te slaan, te pullen of te pushen. Er bewerkt maar één persoon tegelijk: zie [De vergrendeling van de ontwerper](lock.html).

---

## De secties

Elke sectie bewerkt één soort bestand, lokaal bewaard of in een [repository](../repositories/):

| Sectie | Wat ze bewerkt |
|---|---|
| **Formulieren** | De formulierbestanden |
| **Categorieën** | De categorieën van `config.yaml` |
| **Constanten** | De constanten van `config.yaml` |
| **Variabelenbestanden** | De variabelenbestanden die formulieren laden |
| **Playbooks** | De playbooks die formulieren en workflows uitvoeren |
| **Inventarissen** | De inventarissen: `inventory.yaml`, `group_vars` en `host_vars` |
| **Workflows** | De [workflow](../workflows/)bestanden |

De secties met bestanden tonen die in een bestandsverkenner en openen het eerste; een sectie die nog geen bestanden heeft, zegt dat. De
sectie **Formulieren** en elke bestandssectie hebben een knop **Nieuw bestand** als eerste in hun werkbalk: in Inventarissen maakt die een nieuwe
inventaris, in Workflows een nieuwe, lege workflow. Het vergrootglas van de verkenner opent een vak dat de bestanden op naam filtert.

Het zoekvak op de titelregel vindt een tekst in de YAML die open is: het markeert elke plek waar die voorkomt. Het werkt op het
tabblad **YAML**, zodra de vergrendeling van de ontwerper van jou is.

---

## De tabbladen

Elke sectie heeft dezelfde drie tabbladen, allemaal op dezelfde YAML: een wijziging in het ene is te zien in de andere, en **Opslaan** slaat haar op.

- **YAML** is het bestand zoals het geschreven is.
- **Visueel** bewerkt het met velden. Alleen de sleutels die een wijziging raakt, veranderen, dus commentaar en de rest blijven zoals ze geschreven zijn.
- **Voorbeeld** toont wat het doet, en bewerkt niets.

Wat de tabbladen Visueel en Voorbeeld tonen, per sectie:

| Sectie | Visueel | Voorbeeld |
|---|---|---|
| **Formulieren** | De instellingen en de velden van het formulier, met lijsten van de playbooks, inventarissen en workflows van de ontwerper | Het formulier zoals het nu is, niet-opgeslagen wijzigingen inbegrepen; verzenden voert niets uit |
| **Categorieën** | De categorieën als tabel, bewerkbaar | Het menu van de pagina Formulieren, daaruit opgebouwd |
| **Constanten** | De constanten als overzicht, bewerkbaar (een sleutel verplaats je met de pijltjestoetsen) | Elke constante met haar verwijzing, `$(NAME)`, om te kopiëren, en de formulieren die haar gebruiken |
| **Variabelenbestanden** | De variabelen, bewerkbaar | Elke variabele met haar verwijzing in een playbook, {% raw %}`{{ name }}`{% endraw %}, om te kopiëren, en de formulieren die het bestand laden |
| **Playbooks** | De plays: van elke play de naam, hosts, **Become**, **Facts verzamelen** en rollen, en de taken, elk met module en argumenten | Het overzicht van het playbook: de plays, met hun hosts, rollen en taken, en de playbooks die het importeert |
| **Inventarissen** | De groepen, hun subgroepen, hun hosts, en de variabelen die elk instelt | De inventaris als boom, met zijn `group_vars` en `host_vars` |
| **Workflows** | De graaf van de workflow, om [hem te bewerken](../workflows/designer.html) | Een [proefrun](../workflows/designer.html#trying-it-out): klik op een knooppunt om het te laten mislukken |

Kan de YAML niet worden gelezen, dan zeggen de tabbladen Visueel en Voorbeeld waarom, met **Tonen in YAML** om de YAML op de regel te openen.
