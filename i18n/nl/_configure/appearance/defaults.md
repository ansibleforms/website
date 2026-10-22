---
layout: default
title: Standaardwaarden
parent: Uiterlijk
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Standaardwaarden
{: .no_toc }

Het thema, de taal, de tijdzone en de datumnotatie voor gebruikers die zelf niets hebben gekozen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De standaardwaarden

**Standaardwaarden** bepaalt hoe de app eruitziet voor een gebruiker die in zijn
[voorkeuren](../profile/preferences.html) zelf geen keuze heeft gemaakt; de eigen keuze van een gebruiker gaat altijd voor:

| Veld | Keuzes | Zonder keuze |
|---|---|---|
| **Standaardthema** | Browser volgen, Licht, Donker of Kleur, met een van 12 kleuren voor Kleur | Browser volgen (Licht tot en met 7.2) |
| **Standaardtaal** | De talen van de app, bewaard in [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | Engels |
| **Standaard formulierweergave** | Tegels of Lijst, voor de formulierenpagina | Tegels |
| **Standaard tijdzone** | UTC, de browser van elke gebruiker, of een willekeurige zone op naam | UTC |
| **Standaard datumnotatie** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` of `DD.MM.YYYY`, getoond met de datum van vandaag | `YYYY-MM-DD` |

De taal is een omgevingsvariabele en geldt zonder herstart. Met
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) op `0` toont de pagina haar alleen-lezen.

Vanaf 7.3.0 staat de pagina in de twee tabbladen van de profielvoorkeuren, **Weergave** (thema, taal en formulierweergave) en **Datum en
tijd** (tijdzone en datumnotatie, met een voorbeeld van de huidige tijd), en het zoekvak toont de treffers onder de naam van elk tabblad.

---

## De browser volgen

Vanaf 7.3.0 toont **Browser volgen** elke gebruiker het lichte of donkere thema waar zijn browser om vraagt, en wisselt mee.

Het is de standaard als er geen standaardthema is gekozen, dus een nieuwe installatie volgt de browser. Als je met de muis over een van de kleuren van
**Kleur** gaat, zie je een voorbeeld van de app in die kleur; het thema dat je had komt terug zodra de aanwijzer weggaat, en er wordt niets bewaard tot **Opslaan**.
