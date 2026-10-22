---
layout: default
title: Lijstrijen
parent: Launch-validatie
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Lijstrijen
{: .no_toc }

Hoe rijen van lijstvelden worden gevalideerd
{: .fs-6 .fw-300 }

---

Een `list`-veld bevat rijen; elke rij is een instantie van zijn subformulier, ingevuld via de
rij-editor. Een `yaml`-veld met een `subform` is één zo'n rij. De server behandelt ze op dezelfde manier
als de rij-editor van de browser: elke rij wordt via haar subformulier opgelost, met de waarden van het formulier
als `__parent__`, haar regels gecontroleerd en haar berekende velden geëvalueerd. Geneste lijsten werken
net zo: in de eigen lijst van een rij bereikt `$(__parent__.__parent__.x)` het formulier.

Rijen worden als volgt gecontroleerd:

- **Een rij die de gebruiker in de editor heeft toegevoegd of bewerkt**, wordt opgelost en gevalideerd.
- **Een rij die niemand heeft aangeraakt**, een rij die uit de eigen default, expressie of query van de lijst komt
  (zoals de bestaande items van een ACL-lijst), gaat **precies zoals ze binnenkwam** door, net als in de
  browser: ze wordt niet opnieuw gevalideerd en er wordt niets toegevoegd. Een bestaand item dat een regel overtreedt
  die later is geschreven, houdt de start niet tegen.
- **Een rij die als verwijderd is gemarkeerd** (de `deleteMarker` van de lijst), blijft zoals ze is en wordt niet gevalideerd.

Om deze rijen te onderscheiden zonder het verzoek te vertrouwen, voert de server de eigen
bron van de lijst (haar default, anders haar expressie of query) onder launch-validatie opnieuw uit. Een rij
die niet door de editor is gegaan, gaat ongewijzigd door **alleen als ze een van de rijen is die
die bron oplevert**. Elke andere rij, zoals een rij die een REST-aanroeper heeft verzonnen, wordt opgelost en
gevalideerd als een bewerkte rij. Een gewone rij kan de controles dus niet omzeilen, terwijl de
onaangeraakte rijen van de browser nog steeds ongewijzigd doorgaan.

Een gebruiker in de browser merkt dit maar in één geval: de gegevens van de bron zijn veranderd tussen het openen van het
formulier en het starten ervan (een item is in de tussentijd gewijzigd of verwijderd), **en** die rij
overtreedt een regel van haar subformulier. De rij telt dan niet meer als een van de rijen van de bron, dus
wordt ze gevalideerd en wordt de start geweigerd met de rij erbij genoemd, bijvoorbeeld
`acls[2].user_or_group (regex)`.

Rijen die niet slagen, verschijnen in `rowErrors` met hun `index` (een `yaml`-veld heeft er geen) en in het log als
`disks[1].size (maxValue)`.

Een start mag over alle nestingniveaus samen hooguit **500 rijen** bevatten, omdat elke rij de query's van haar subformulier uitvoert.

---

## Rijmarkeringen

De markeringen die een lijst op haar rijen zet (`insertMarker`, `updateMarker` en `deleteMarker`; zonder
`insertMarker` krijgen nieuwe rijen `__inserted__` wanneer de lijst `allowDelete: false`, een `deleteMarker` of een `updateMarker` instelt)
komen bij het playbook aan op elke rij die er een draagt. Een verwijderde rij wordt verstuurd met haar verwijder-
markering, zodat het playbook haar kan verwijderen. Vóór 6.4.1 droeg een lijstrij alleen een markering als haar
subformulier die als (verborgen) veld declareerde.
