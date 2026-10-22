---
layout: default
title: Uitrollen
parent: Launch-validatie
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Uitrollen
{: .no_toc }

Een instantie naar enforce brengen, en de bekende beperkingen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Uitrollen

`enforce` is de standaard. Op een instantie met scripts of andere systemen die formulieren via
REST starten, bereik je die stap voor stap, waarbij je het log in de gaten houdt voordat er iets wordt geweigerd:

1. Stel `LAUNCH_VALIDATION=log` in voor de hele instantie (vóór het upgraden, bij een upgrade).
2. Draai een tijdje in deze modus en bekijk het log: waarschuwingen `would refuse` wijzen op starts
   die de regels overtreden; waarschuwingen `extravars differ` wijzen op formulieren die iets
   anders berekenen op de server (een tijdstempel, externe gegevens). Bepaal per formulier of dat
   ertoe doet.
3. Zet die formulieren op `launchValidation: enforce`. Aanroepers die ongeldige waarden of
   verzonnen extravars stuurden, krijgen nu een `422` met de reden.
4. Gedraagt elk formulier zich zoals verwacht, verwijder dan `LAUNCH_VALIDATION` (of zet het op `enforce`) voor de hele instantie.

---

## Beperkingen

Launch-validatie dekt nog niet alles:

- **Wizardformulieren** kunnen niet met wijzigingen opnieuw worden gestart, en een wizardjob die vóór 7.0 is gestart,
  kan onder `enforce` niet opnieuw worden gestart (hij sloeg zijn stapwaarden niet op). De MCP-server
  kan geen wizardformulieren starten.
- **Het oplossen van placeholders** in de browser gebruikt nog een eigen kopie van de code van de server; in
  zeldzame randgevallen (`__undefined__`, aanhalingstekens binnen expressies) kunnen de twee een
  placeholder verschillend oplossen. `log` brengt zulke verschillen aan het licht.
- **`runLocal`**-expressies draaien in de browser in de JavaScript-engine van de browser, en op de server in een
  sandbox; dezelfde code geeft hetzelfde resultaat, behalve waar die afhangt van
  de tijdzone of de locale van de browser.

---

## Wizardformulieren

Een [wizard](../forms/wizard.html) wordt stap voor stap gecontroleerd: de browser stuurt de waarden van
elke stap, en de server controleert elke stap die de gebruiker zou indienen tegen het eigen subformulier van die stap.

- Een stap wordt weggelaten wanneer hij `optional` is en de gebruiker hem oversloeg, of wanneer zijn `when` false is.
- Een stap leest de eerdere stappen via `$(__parent__.<step>.<field>)`, met hun gecontroleerde waarden.
- Fouten noemen de stap en het veld, als `<step>.<field>`.
- Onder `enforce` worden de extravars op de server opgebouwd, elke stap onder zijn `defaultModel`.
- Bestandsvelden worden in een wizard niet ondersteund.
