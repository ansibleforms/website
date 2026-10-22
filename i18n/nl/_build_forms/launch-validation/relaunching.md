---
layout: default
title: Opnieuw starten
parent: Launch-validatie
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# Opnieuw starten
{: .no_toc }

Hoe een opnieuw gestarte job wordt gevalideerd
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Een job kan op twee manieren opnieuw worden gestart. Hoe de herstart wordt gecontroleerd, hangt af van welke manier, en van de modus van
launch-validatie.

---

## Twee soorten herstart

De twee soorten verschillen in of de aanroeper nieuwe waarden stuurt:

* **Zoals hij draaide**: de knop Herstarten, `POST /api/v2/job/{id}/relaunch` zonder body, of `relaunch_job` zonder
  `values`.
* **Met wijzigingen**: dezelfde aanroepen met nieuwe waarden, over de opgeslagen veldwaarden van de job heen gelegd:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Hoe elk wordt gecontroleerd

De modus van launch-validatie bepaalt of een herstart opnieuw wordt afgespeeld of opnieuw wordt gecontroleerd:

| Herstart | `off` / `log` | `enforce` |
|---|---|---|
| **Zoals hij draaide** | speelt de opgeslagen extravars van de job opnieuw af, wachtwoorden inbegrepen | de volledige controle, vanuit de opgeslagen veldwaarden |
| **Met wijzigingen** | de volledige controle, op de opgeslagen waarden met de wijzigingen eroverheen | de volledige controle, op dezelfde manier |

Eén uitzondering onder `enforce`: een job die door een planning op adminniveau is gestart, heeft geen eigen veldwaarden, dus een herstart zoals hij draaide
speelt de opgeslagen extravars van de planning opnieuw af, voor een admin of een gebruiker met de roloptie `allowScheduledJobs`.

Een gecontroleerde herstart (zie [Log en enforce](log-and-enforce.html)) start een nieuwe job op naam van de aanroeper.

---

## Wachtwoordvelden

Opgeslagen veldwaarden bevatten geen wachtwoorden, dus een gecontroleerde herstart heeft er geen voor een **zichtbaar wachtwoordveld**:

* De herstart wordt geweigerd als `unsupported`, met de `passwordFields` die ontbreken.
* Start het formulier opnieuw en voer het wachtwoord in.
* Een wachtwoordveld dat de afhankelijkheden van het formulier **verbergen**, is niet nodig en blokkeert de herstart niet.

Onder `enforce` geldt dit ook voor de knop Herstarten.

---

## Wie opnieuw kan starten

Beide soorten herstart vereisen:

* dat het formulier herstarten toestaat (`allowRelaunch`, standaard true);
* de roloptie `allowJobRelaunch`;
* dat de gebruiker **de eigenaar van de job** is, een admin, of een gebruiker met de roloptie `manageAllJobs`.

Elke job kunnen zien (`showAllJobLogs`) is niet genoeg om de job van een andere gebruiker opnieuw te starten. Goedkeurders kunnen een job zien die op hun
goedkeuring wacht, maar kunnen hem ook niet opnieuw starten.
