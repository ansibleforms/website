---
layout: default
title: Expressies
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Expressies
{: .no_toc }

Bereken veldwaarden met JavaScript, in de browser of op de server
{: .fs-6 .fw-300 }

---

Voor formulierauteurs: vul velden dynamisch met JavaScript, berekend in de browser of opgehaald op de server.

Met het attribuut `expression` van een formulierveld maak je dynamische formulieren met JavaScript-expressies.

---

## Inleiding

Het attribuut `expression` is beschikbaar op meerdere veldtypen:
- `enum`-veld - om de opties van een keuzelijst dynamisch te vullen
- `expression`-veld - om elke vorm van gegevens op te halen of te genereren
- `html`-veld - om de HTML-inhoud op te bouwen
- `yaml`- en `list`-velden - om hun gegevens te vullen

JavaScript-expressies worden geëvalueerd aan de **serverkant** (standaard) of aan de **clientkant**, zoals ingesteld met de veldeigenschap `runLocal`.
Een `html`-veld, en de veldtypen `local`, `local_out` en `credential`, voeren hun expressie altijd uit in de browser, wat
`runLocal` ook zegt.

- **Aan de serverkant** (`runLocal: false`, de standaard) - vooraf gedefinieerde functies die gegevens ophalen uit API's, bestanden en databases.
- **Aan de clientkant** (`runLocal: true`) - de code benut de volledige JavaScript-engine in de sandbox van de browser voor berekeningen, transformaties en bewerkingen.

---

## Beveiligingsaspecten

Omdat expressies worden geëvalueerd met de JavaScript-functie `eval`, is code-injectie een mogelijk risico:

- **Expressies aan de serverkant** gaan eerst door een sanitizer: elke aanroep moet een `fn.`- of `fnc.`-functie zijn, en meerdere regels,
  `;`, template literals, `process.env` en de uitwegen uit `eval` (`import`, `require`, `constructor`, ...) worden geweigerd.
- **Expressies aan de clientkant** worden geëvalueerd in de sandbox van de browser en kunnen als veilig worden beschouwd.

Hoe streng de sanitizer is, hangt af van
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER):

| Waarde | Expressies aan de serverkant |
|---|---|
| `strict` (standaard) | `fn.`- en `fnc.`-aanroepen, en methoden op hun resultaat, zoals `fn.fnTime().format('YYYY')` |
| `paranoid` | alleen directe `fn.`- en `fnc.`-aanroepen, geen methoden op hun resultaat |
| `off` | elke expressie aan de serverkant wordt geweigerd; alleen `runLocal`-expressies werken |
| `legacy` | de regels van 6.2.1, waarmee elke geauthenticeerde gebruiker code op de server kon uitvoeren; alleen voor een upgrade, en alleen in de echte omgeving (niet vanaf de instellingenpagina) |

Een lege of onbekende waarde betekent `strict`. Een wijziging geldt voor de volgende expressie, zonder herstart.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [Placeholders](placeholders.html) | Verwijs naar een ander veld, een constante of de gebruiker met `$(...)` |
| [Lokale expressies](local.html) | JavaScript dat in de sandbox van de browser draait |
| [Remote expressies](remote.html) | Functies aan de serverkant voor datums, netwerken, bestanden, SSH en genummerde namen |
| [REST API's](rest-apis.html) | REST API's aanroepen met basic-, token- of eigen authenticatie |
| [Inloggegevens](credentials.html) | Opgeslagen inloggegevens lezen |
| [Sorteren](sorting.html) | Arrays sorteren met een sorteerobject |
| [jq-query's](jq.html) | Gegevens omvormen met jq |
