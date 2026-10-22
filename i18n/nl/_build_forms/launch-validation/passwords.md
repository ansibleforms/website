---
layout: default
title: Wachtwoorden
parent: Launch-validatie
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Wachtwoorden
{: .no_toc }

Hoe wachtwoordvelden worden gevalideerd, opgeslagen en buiten API's worden gehouden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Een wachtwoordveld wordt gevalideerd zoals elk ander veld. De waarde ervan blijft echter op de server en wordt nooit teruggegeven aan
een client.

---

## Waar een wachtwoord wordt bewaard

De server slaat het wachtwoord op bij de job, in de extravars:

* Een **goedkeuring** kan de job dan voortzetten met het wachtwoord dat de gebruiker invoerde.
* Een **herstart zoals hij draaide** kan het opnieuw gebruiken, wanneer launch-validatie niet op `enforce` staat.

Het opgeslagen wachtwoord wordt alleen op de server gebruikt.

---

## Wat de API's teruggeven

Geen enkele API geeft ooit een wachtwoord terug:

* Een job die via de REST API of via `get_job` van de MCP-server wordt gelezen, maskeert elk `password`-veld van zijn formulier, ook binnen
  lijstrijen en YAML-subformulieren.
* `MASK_EXTRAVARS_REGEX` (standaard `password|secret|token`) maskeert daarnaast elke extravar waarvan de naam overeenkomt, voor
  geheimen die geen wachtwoordvelden zijn.

---

## Wat een herstart ontvangt

Om een herstart vooraf in te vullen, ontvangt de browser de ruwe formuliergegevens van de job. Die gegevens bevatten nooit een wachtwoord, ook niet binnen
lijstrijen of YAML-subformulieren, dus de gebruiker voert het wachtwoord opnieuw in.

Een wachtwoordveld dat door de afhankelijkheden van het formulier wordt verborgen, is niet nodig en hoeft niet opnieuw te worden ingevoerd.
