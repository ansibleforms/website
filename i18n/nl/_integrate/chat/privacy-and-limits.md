---
layout: default
title: Privacy en limieten
parent: Chat-assistent
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Privacy en limieten
{: .no_toc }

Wat het netwerk verlaat, en de limieten per gebruiker
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wat het netwerk verlaat

Voor de formulieren die meedoen, wordt het volgende naar de provider gestuurd:

- de namen en beschrijvingen van de formulieren, de veldlabels, helpteksten, keuzes en de waarden die
  worden ingevuld;
- het gesprek.

Het volgende wordt nooit naar de provider, de pagina of het log gestuurd:

- wachtwoorden (die voert de gebruiker in de browser in), opgeslagen referenties en de API-sleutel;
- de uitvoer van een job, en de opgeslagen extravars ervan (de assistent leest alleen de status van een job, en alleen
  als **De assistent zijn jobs laten volgen** aan staat in de instellingen).

Alles onder een sleutel die op een secret lijkt (`password`, `secret`, `token`, `api_key`, ...)
wordt gemaskeerd voordat het model of de pagina het ziet.

Om formuliergegevens binnenshuis te houden, gebruik je je eigen tenant (Azure OpenAI) of een lokaal model (Ollama), geen publieke API.

---

## Limieten

De volgende limieten worden op de instellingenpagina ingesteld:

- **Berichten per gesprek** (20) - waarna de gebruiker een nieuw gesprek moet beginnen.
- **Tool-rondes per bericht** (6) - hoe vaak het model een tool mag aanroepen voordat het antwoordt.
- **Timeout** (60 s) - per aanroep naar de provider.

De volgende limieten liggen vast: één bericht tegelijk per gesprek, hooguit 4000 tekens per bericht, 60 berichten per
gebruiker per uur, en 5 gesprekken per gebruiker. Een gesprek wordt na 2 uur zonder bericht weggegooid.

Een samenvattingskaart met een knop **Starten** kan één keer worden gebruikt, en verloopt na 15 minuten: Starten antwoordt dan dat de
samenvatting verlopen is, en de gebruiker vraagt de assistent om een nieuwe. Gesprekken en samenvattingen worden in het geheugen bewaard, dus na
een herstart moet de gebruiker een nieuw gesprek beginnen.
