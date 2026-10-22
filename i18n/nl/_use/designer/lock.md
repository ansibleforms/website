---
layout: default
title: De vergrendeling van de ontwerper
parent: Ontwerper
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# De vergrendeling van de ontwerper
{: .no_toc }

Er bewerkt maar één persoon tegelijk
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De vergrendeling nemen

De ontwerper staat uit tot je hem aanzet, met de schakelaar rechtsboven in de ontwerper. Door hem aan te zetten neem je de
vergrendeling: vanaf dat moment ben jij de enige die kan opslaan, tot je hem weer uitzet.

Zonder de vergrendeling toont de ontwerper **Designer is niet actief**, en kan er niets worden bewerkt.

Opslagacties overlappen nooit: vanaf 7.3.0 wordt, terwijl een opslag, een push of een laadactie loopt, een tweede **Opslaan** (een dubbelklik, of Ctrl+S ingedrukt gehouden)
genegeerd, zodat die geen tweede back-up of tweede commit kan schrijven die met de eerste concurreert.

---

## Als iemand anders hem heeft

Zolang een andere gebruiker de vergrendeling heeft, toont de ontwerper **De designer wordt gebruikt door** die gebruiker, en verder niets: geen secties,
geen bestanden.

De schakelaar staat aan maar is grijs, met **Vergrendeld door** en de naam van de gebruiker ernaast. Je kunt de vergrendeling nemen zodra die gebruiker
de ontwerper uitzet. Elke geopende ontwerper ziet het meteen wanneer de vergrendeling wordt genomen of vrijgegeven, zonder herladen.

Zetten twee gebruikers de ontwerper op hetzelfde moment aan, dan krijgt een van hen de vergrendeling. Vanaf 7.3.0 ziet de ander wie hem heeft,
en blijft elke editor alleen-lezen, zodat er niets kan worden getypt dat niet kan worden opgeslagen.

---

## De vergrendeling van iemand anders vrijgeven

Een admin kan een vergrendeling vrijgeven die iemand anders heeft, bijvoorbeeld als die naar huis is gegaan met de ontwerper open.

**Vrijgeven**, naast **Vergrendeld door**, is alleen zichtbaar voor admins. Het vraagt eerst om bevestiging: de wijzigingen van de gebruiker die nog niet waren opgeslagen, gaan verloren.

Vanaf 7.3.0 krijgt de gebruiker van wie de vergrendeling is vrijgegeven, te horen dat dat is gebeurd, en door wie: **Uw designervergrendeling is vrijgegeven door** de naam van de admin,
met **Niet-opgeslagen wijzigingen kunnen niet meer worden opgeslagen.** Zijn ontwerper neemt de vergrendeling niet vanzelf terug; hij zet hem weer aan
wanneer hij verder wil.

---

## Een vergeten vergrendeling

Een vergrendeling die niemand gebruikt, komt vanzelf vrij, zodat niemand wacht op een ontwerper die niemand open heeft.

De geopende ontwerper van de houder laat de server steeds weten dat hij er nog is. Heeft de server
5 minuten niets van hem gehoord, omdat de browser is gesloten, de computer is uitgezet of het netwerk wegviel, dan is de vergrendeling weer vrij. Komt
de houder terug in de ontwerper, dan neemt die de vergrendeling opnieuw als niemand anders dat heeft gedaan. Het vrijgeven door een admin is de uitzondering: daarna
wordt de vergrendeling niet teruggenomen.
