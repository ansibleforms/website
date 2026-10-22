---
layout: default
title: Meerdere RTE's
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Meerdere RTE's
{: .no_toc }

Hoeveel playbooks één RTE draait, meer RTE's als runners of replica's, en wat er gebeurt als er een stopt of uitvalt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Meerdere jobs op één RTE

Eén RTE draait tot [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks naast elkaar, standaard
10 (`0` stelt geen limiet in). Een job voor een volle RTE wordt niet geclaimd. In een socketmodus verstuurt de app hem niet zolang het laatste
gezondheidsrapport van de RTE geen vrije plek toont, en een RTE die vol is of stopt, antwoordt `refused` als bezet; in databasemodus antwoordt de RTE
`503`. In beide gevallen schrijft de app één keer `Waiting for a free slot on RTE <name>` in de uitvoer en biedt de job elke 10 seconden opnieuw aan,
maximaal [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) lang (standaard 60). Daarna mislukt de job met
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Een job die tijdens het wachten wordt afgebroken, eindigt als `aborted` zonder ooit
de RTE te bereiken.

---

## Meerdere RTE's

De app verdeelt jobs niet zelf over runners: elke job gaat naar één runner, degene die het formulier noemt of de
standaard. Meer RTE-containers helpen op twee manieren:

* **Als eigen runners** : elke RTE heeft een eigen `RTE_NAME` en wordt lid als eigen runner: ze vraagt om lid te worden en een admin
  keurt haar goed, of ze presenteert een jointoken (zie [Registratie](../runners/registration.html)). Een formulier kiest er een met `runner: <name>`,
  bijvoorbeeld een RTE met de VMware-collecties, of een in een andere netwerkzone; de andere draaien op de standaard-RTE
* **Als replica's achter één adres** (alleen databasemodus) : meerdere RTE-containers met dezelfde `RTE_URL` en hetzelfde `RTE_TOKEN`,
  zoals de pods achter een Kubernetes Service, delen één runner, en het adres verdeelt de aanroepen over ze. Een volle replica antwoordt
  `503`, en de volgende poging kan op een andere uitkomen. De app volgt een job via de database, dus het maakt niet uit welke replica
  zijn statusaanroepen beantwoordt

In een socketmodus (zie [Modi](modes.html)) houdt een runner één socket naar één RTE vast, en een tweede RTE die zich met dezelfde
`RTE_NAME` aanmeldt, neemt de socket van de eerste over. Geef elke RTE een eigen naam en een eigen runner, en laat formulieren met
`runner:` tussen ze kiezen.

Elke RTE in databasemodus schrijft elke 10 seconden een heartbeat in de database, en een RTE die zichzelf registreert, controleert haar runnerrij elke
30 seconden. Voor een RTE in een socketmodus schrijft de app-node die haar socket vasthoudt de heartbeat elke 20 seconden voor haar, zolang de
socket open is. De pagina **Status** toont elke RTE met haar versie. De worker verwijdert een runner die een RTE in databasemodus zelf heeft geregistreerd
zodra die RTE 10 minuten lang geen heartbeat heeft geschreven, en als de standaardrunner zo'n rij is waarvan de RTE is gestopt, neemt de volgende RTE
die controleert de standaard over. Een runner uit de configuratie-seed, met de hand toegevoegd of via een socket lid geworden, wordt nooit op die manier verwijderd.

---

## Als een RTE stopt of uitvalt

**Als een RTE stopt.** Bij `SIGTERM` (`docker stop`, een rolling update, een scale down) neemt de RTE geen jobs meer aan: `/ready` antwoordt `503`,
en een nieuwe job wordt geweigerd als bezet (`503` in databasemodus), dus de app wacht, of in databasemodus stuurt het adres hem naar een andere
replica. De lopende playbooks krijgen [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) om af te ronden, standaard 25,
daarna sluit de RTE af.

**Als een RTE uitvalt.** Een afgeschoten container (geheugen vol, een verloren node, het einde van de stoptime-out) neemt zijn playbooks mee: niets
verplaatst ze naar een andere RTE, en niets draait ze opnieuw. Hun jobs worden beëindigd als `abandoned`, door de RTE zelf of door de app wanneer ze
terugkomt onder hetzelfde id, dat een herstarte container behoudt (`rte-<hostname>-<port>`), of door de worker, zodra de heartbeat van de RTE
twee minuten oud is. Controleer op de beheerde hosts wat het playbook deed voordat je het opnieuw start.

**Terwijl een RTE onbereikbaar is.** In een socketmodus wacht een nieuwe job voor haar op haar socket, tot `RTE_QUEUE_MINUTES` plus nog een minuut, en
mislukt dan met *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
In databasemodus mislukt hij meteen met *the RTE at ... is unreachable*, tenzij een andere replica op haar adres antwoordt.
