---
layout: default
title: Launch-validatie
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Launch-validatie
{: .no_toc }

Controleer elke start van een formulier op de server
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders en formulierauteurs: laat de server elke start controleren, met zijn regels en zijn extravars, wie hem ook verstuurt.

De controle geldt ongeacht wie of wat het formulier start: de browser, een script dat de REST API aanroept,
of een AI-agent via de MCP-server.

---

## Waarom het bestaat

De regels van een formulier (`required`, `regex`, `minValue`, `sameAs`, ...) werden altijd al
in de browser gecontroleerd. De browser stuurt daarna twee dingen naar `POST /api/v2/job`:

- `rawFormData`: de veldwaarden zoals de gebruiker ze heeft ingevuld;
- `extravars`: wat het playbook ontvangt, in de browser opgebouwd uit die waarden.

Zonder launch-validatie vertrouwt de server beide. Iedereen met een geldig token kan dat
endpoint rechtstreeks aanroepen en willekeurige extravars sturen, zonder dat er een regex, verplicht veld of lijstregel
wordt toegepast. Voor een formulier dat alleen ooit in de browser wordt gebruikt, kan dat acceptabel zijn; voor een
formulier dat andere systemen via REST starten, betekent het dat de regels van het formulier helemaal niet worden afgedwongen.

De server kan ook op geen enkele manier een verzoek uit de browser onderscheiden van een verzoek van een
script: beide gebruiken hetzelfde endpoint, hetzelfde token en dezelfde body, en gebruikers kunnen elk verzoek
aanpassen dat hun eigen browser verstuurt. Een controle is alleen op de server te vertrouwen, en launch-validatie
is die controle.

---

## De drie ingangen

Hoe een start wordt gevalideerd, hangt af van hoe hij binnenkomt en van de modus van launch-validatie:

| Gestart door | Gevalideerd | Extravars waarmee de job draait |
|---|---|---|
| **MCP-server** (AI-agent) | altijd, op de server | altijd door de server opgebouwd |
| **Browser** of **REST API**, launch-validatie `off` | alleen in de browser | die de browser (of de aanroeper) stuurde |
| **Browser** of **REST API**, launch-validatie `log` | op de server, weigeringen alleen gelogd | die zijn gestuurd; verschillen gelogd |
| **Browser** of **REST API**, launch-validatie `enforce` | op de server, geweigerd als ongeldig | **door de server opgebouwd** |

De browser, de MCP-server en launch-validatie gebruiken dezelfde code voor de regels (de
gedeelde formulierengine): dezelfde regels, in dezelfde volgorde, met dezelfde meldingen. Een fout die de
browser toont, weigert de server met dezelfde tekst.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [Inschakelen](switching-it-on.html) | Voor de hele instantie, of voor één formulier |
| [Log en enforce](log-and-enforce.html) | Wat elke modus doet met een start die de regels overtreedt |
| [Lijstrijen](list-rows-and-subforms.html) | Hoe rijen van lijstvelden worden gevalideerd |
| [Bestandsuploads](file-uploads.html) | Hoe bestandsvelden worden gevalideerd |
| [Wachtwoorden](passwords.html) | Hoe wachtwoordvelden worden gevalideerd en buiten API's worden gehouden |
| [Opnieuw starten](relaunching.html) | Hoe een opnieuw gestarte job wordt gevalideerd |
| [Uitrollen](rolling-it-out.html) | Een instantie naar enforce brengen, en de bekende beperkingen |
