---
layout: default
title: Voorkeuren
parent: Je profiel
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Voorkeuren
{: .no_toc }

Taal, thema, tijdzone, datumnotatie en bureaubladmeldingen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De voorkeuren

De weergave Voorkeuren verandert hoe AnsibleForms er voor jou uitziet. Elke keuze wordt bewaard in de browser
waarin je haar maakt, dus een andere browser of computer begint met de standaardwaarden.

| Instelling | Keuzes | Ook in te stellen via |
|---|---|---|
| Taal | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (Japans), 简体中文 (vereenvoudigd Chinees) | de vlag in de kopbalk |
| Thema | Browser volgen, Licht, Donker, of Kleur (een kopbalk in een kleur naar keuze) | het zonicoon in de kopbalk |
| Weergave formulieren | Tegels of Lijst | de knop op de pagina Formulieren |
| Tijdzone | UTC, de zone van deze browser, of elke zone op naam | alleen hier |
| Datumnotatie | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` of `DD.MM.YYYY` | alleen hier |
| Bureaubladmeldingen | Aan of uit | alleen hier |

Vanaf 7.3.0 bestaat de weergave uit tabbladen, elk met een eigen adres (`/profile/preferences/<tab>`): **Weergave** (taal, thema en weergave
formulieren), **Datum en tijd** (tijdzone en datumnotatie) en **Meldingen**. Het zoekvak erboven toont de instellingen die overeenkomen,
onder de naam van hun tabblad. Een keuze is een concept tot **Opslaan**, en wie de weergave verlaat met een niet-opgeslagen wijziging, krijgt eerst een vraag.

**Browser volgen** wordt licht of donker zoals de browser, en verandert mee. Het is vanaf 7.3.0 het standaardthema, tenzij je
beheerder een ander kiest. Beweeg je over een kleur van het thema **Kleur**, hier of in het themamenu van de kopbalk, dan zie je de app vooraf in die
kleur, en het vorige thema komt terug wanneer de aanwijzer het palet verlaat; er verandert niets tot je klikt.

---

## Bureaubladmeldingen

Vanaf 7.3.0 zet het tabblad **Meldingen** bureaubladmeldingen in deze browser aan, voor gebruikers van wie de rol `showJobs` instelt.

De browser vraagt de eerste keer om toestemming. Blokkeert hij meldingen voor de site, dan blijft de schakelaar uit en staat erbij hoe je ze
toestaat, en een site op gewone `http` kan ze helemaal niet tonen. Staat het aan, dan komt er een melding:

| Wanneer | Wat ze zegt | Een klik erop |
|---|---|---|
| Een job die je startte, eindigt | Het formulier en de uitkomst, zoals *Patch Linux servers: Geslaagd*, met het jobnummer en de duur | Brengt het tabblad naar voren op die job |
| Een job wacht op jouw goedkeuring | Het formulier, het jobnummer en wie hem startte, met de knoppen **Goedkeuren** en **Afwijzen** | Opent de jobs die op goedkeuring wachten |

De knoppen **Goedkeuren** en **Afwijzen** verschijnen in Chrome en Edge; Firefox en Safari tonen de melding zonder die knoppen, en dat geldt ook voor een
site met een zelfondertekend certificaat, omdat de knoppen een service worker nodig hebben. Meldingen komen alleen zolang er een tabblad van AnsibleForms open is,
ook op de achtergrond: zodra elk tabblad is gesloten, wordt er niets meer gestuurd. Elke melding verschijnt één keer, hoeveel tabbladen er ook open zijn, en de stappen van een
multistep-job en de job die je aan het bekijken bent, blijven stil.

---

## Tijdzone

Datums en tijden in heel AnsibleForms worden getoond in de tijdzone die je kiest. Dat geldt ook voor de start-
en eindtijden van jobs, het auditlogboek, de statuspagina, back-ups, opgeslagen jobs en het verlopen van een API-token.
Een andere tijdzone kiezen werkt elke pagina meteen bij, zonder herladen.

Tot je er een kiest, geldt de tijdzone die je beheerder voor iedereen heeft ingesteld (**Instellingen > Uiterlijk > Standaardwaarden**, zie
[Uiterlijk](../appearance.html)), **UTC** tenzij gewijzigd. **Deze browser** volgt de tijdzone van je computer, en de
lijst bevat elke zone op naam, zoals `Europe/Madrid`. De kaart toont de huidige tijd in de gekozen zone en notatie.

---

## Datumnotatie

De datumnotatie bepaalt hoe het datumdeel van elke datum wordt getoond, elke keuze met de datum van vandaag als voorbeeld: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` of `DD.MM.YYYY`. Tot je er een kiest, geldt de standaard datumnotatie van je beheerder,
`YYYY-MM-DD` tenzij gewijzigd. Net als de andere keuzes wordt die in deze browser bewaard.

---

## Wat de tijden van de server houdt

Twee uitzonderingen houden de eigen tijden van de server:

- **Het serverlog en de joboutput** zijn tekst met de tijden die de server erin schreef.
- **Tijden die je invoert**, zoals wanneer een geplande job moet draaien, en cron-schema's, werken zoals
  voorheen.
