---
layout: default
title: Live events
parent: REST API
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Live events
{: .no_toc }

Hoor wanneer jobs en instellingen veranderen, in plaats van te pollen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

De server vertelt zijn clients wat er verandert, op het moment dat het verandert. Een script kan ook meeluisteren, in plaats van om de paar seconden een job te lezen.

---

## De stream

`GET /api/v2/events` is een stream van [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
die open blijft. Elke aangemelde gebruiker mag hem openen, met het gebruikelijke bearer token:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Als er iets verandert, stuurt hij een event `changed` met de naam van wat er veranderd is:

```text
event: changed
data: {"name":"jobs"}
```

---

## Namen van events

Een event bevat alleen een naam, nooit gegevens, dus het verraadt niets wat de gebruiker niet mag zien. Deze namen worden verstuurd:

| Naam | Wat er veranderd is |
|---|---|
| `jobs` | Een job: gestart, de status of uitvoer ervan, verwijderd |
| `appearance` | De instellingen die de kopbalk toont: het thema, de naam, een aankondiging, een omgevingsvariabele |
| `designer` | Een vergrendeling van de designer, genomen of vrijgegeven |
| `runners` | Een runner (vanaf 7.3.0): een RTE heeft verbinding gemaakt of verbroken, gevraagd om aan te sluiten, is goedgekeurd of afgewezen, of heeft zijn modus of instellingen gewijzigd |

Als je een naam hoort, lees je wat je toont opnieuw via de normale API (bijvoorbeeld `GET /api/v2/job/42`), met je eigen
rechten. Een drukke naam wordt hooguit één keer per seconde verstuurd.

---

## Open houden

De stream is gebouwd om proxy's en load balancers te overleven, en een client maakt zelf opnieuw verbinding:

* Bij het verbinden stuurt de server een event `hello`, en vraagt de client 3 seconden te wachten voordat hij opnieuw verbinding maakt.
* Elke 15 seconden stuurt hij een commentaarregel (`: ping`), zodat een inactieve verbinding niet wordt gesloten. Negeer regels die met `:` beginnen.
* Events van elke app-node bereiken elke stream, met welke node de client ook verbonden is.
* Lees na het opnieuw verbinden opnieuw wat je toont: een event dat werd verstuurd terwijl de stream weg was, wordt niet opnieuw verstuurd.

---

## Health en metrics

De liveness- en readiness-probes (`/api/v2/live`, `/api/v2/ready`) en de Prometheus-metrics (`/api/v2/metrics`) zijn
bedoeld voor monitoringtools, niet voor scripts die als gebruiker handelen. Zie [Monitoring](../production/monitoring.html).
