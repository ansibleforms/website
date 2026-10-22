---
layout: default
title: Beperkingen
parent: MCP-server
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Beperkingen
{: .no_toc }

Expressies draaien op de server, en wat de MCP-server niet doet
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## runLocal-expressies

`runLocal`-expressies, velden `local` / `credential` / `html` en standaardwaarden met `evalDefault` worden
op de server geëvalueerd, in een aparte V8-context: geen `process`, `require`, netwerk of
timers, geen strings die tot code worden gecompileerd, een tijdslimiet van 2 seconden, en alleen de hulpfuncties
die de browser biedt (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Dit beschermt tegen foutieve of op hol geslagen expressies. Het is geen sandbox voor kwaadwillende code,
en dat hoeft ook niet: de code komt uit de formulierdefinitie, nooit van de MCP-
aanroeper, en elke waarde die een aanroeper stuurt wordt ingevuld als JavaScript-literal.

Een expressie die een browser-API gebruikt (`window`, `document`, `fetch`) kan hier niet draaien en
geeft `status: error` terug.

Expressies aan de serverkant (zonder `runLocal`) doorlopen dezelfde
[`EXPRESSION_SANITIZER`](../customization)-regels als voor de browser.

---

## Beperkingen

Sommige formulieren en velden kunnen nog niet via de MCP-server worden gebruikt:

- **Wizardformulieren** kunnen nog niet worden gestart. Hun stappen kunnen wel met `subform` worden opgelost.
- **Bestandsvelden** kunnen niet worden ingevuld; een formulier waarvan het bestandsveld een waarde heeft, wordt geweigerd.
- **Lijstrijen** (en een veld `yaml` met een subform, wat zo'n rij is): elke rij die je
  stuurt, behalve een rij met de `deleteMarker` van de lijst, wordt opgelost via zijn subform met
  de waarden van het formulier als `__parent__` en daarna gevalideerd. Dat geldt ook voor geneste lijsten, waar
  `__parent__.__parent__` het formulier bereikt. Stuur gewone rijen, dat wil zeggen de ruwe veldwaarden van het
  subform. Rijen die falen worden per lijstveld opgesomd in `rowErrors`
  (`vms[1].disks[0].size (missing)` in het bericht). Per aanroep worden hooguit 500 rijen geaccepteerd,
  over alle niveaus samen.
- Een enum die op `__auto__` blijft staan, wordt nooit met de eerste optie ingevuld; de aanroeper moet kiezen.
- Elk MCP-verzoek maakt één regel in het auditlogboek (actie "MCP-verzoek (AI-agent)"); de
  job zelf wordt onder de gebruiker vastgelegd, zoals bij elke andere start.
