---
layout: default
title: Logs
parent: Draaien in productie
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Logs
{: .no_toc }

Logbestanden, syslog, het audittrail, en hoe lang jobs en auditregels worden bewaard
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Logbestanden

AnsibleForms schrijft twee dagelijks geroteerde logs naar [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), comprimeert oudere dagen en bewaart ze [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS) dagen
(standaard 30, `0` bewaart elk bestand; een wijziging op de instellingenpagina geldt meteen):

* `ansibleforms.<date>.log` : alles op [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) en hoger
* `ansibleforms.errors.<date>.log` : alleen fouten

De console, gelezen met `docker logs` of `kubectl logs`, heeft een eigen niveau,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Beide staan standaard op `notice`, wat juist is voor
productie; gebruik `info` of `debug` alleen tijdens het oplossen van problemen, en laat
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) uit. De niveaus kunnen op
de instellingenpagina's zonder herstart worden gewijzigd, en de pagina **Serverlog** toont het log aan gebruikers met de instelling `showLogs`.

---

## JSON-regels

Stel voor een logcollector zoals Loki, ELK of Splunk [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) in op `json`. Elke
regel, op de console en in de bestanden, is dan één JSON-object in plaats van `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Veld | Inhoud |
|-------|---------|
| `time` | Het tijdstip, in ISO 8601 UTC |
| `level` | Het logniveau |
| `message` | Het bericht |
| `requestId` | Het verzoek waartoe de regel behoort, als hij werd geschreven tijdens het afhandelen ervan |
| `role` | De rol van het proces, [`AF_ROLE`](scaling.html), of `all` als die niet is ingesteld |
| `host` | De hostnaam van de machine of container waarin het proces draait |

Elk verzoek krijgt een id: de header `X-Request-Id` die een reverse proxy meestuurde, of een nieuwe. Die wordt teruggegeven in de header
`X-Request-Id` van het antwoord en meegenomen in elke regel die tijdens het afhandelen van het verzoek wordt geschreven (als `[req <id>]` in tekstregels),
zodat een verzoek door het log kan worden gevolgd en met dat van de proxy kan worden vergeleken. Een wijziging op de instellingenpagina geldt meteen.

---

## Syslog

Syslogservers worden beheerd onder **Instellingen > Verbindingen > Syslog**, zodat een syslogserver of SIEM het log krijgt zodra het wordt geschreven.
Je kunt meerdere servers toevoegen, en elke server heeft eigen instellingen:

| Instelling | Wat ze doet |
|---------|--------------|
| Ingeschakeld | Alleen ingeschakelde servers krijgen iets, zodat een server kan worden gepauzeerd zonder hem te verwijderen; **Inschakelen** en **Uitschakelen** in het rijmenu schakelen hem ook om |
| Protocol | `udp4` (standaard), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` of `unix-connect` |
| Host en poort | De server waarnaar wordt verstuurd, standaard poort `514`; een `unix`-protocol neemt in plaats daarvan een socketpad |
| Ontvangt | Het serverlog, de auditregels, of beide (de standaard voor een nieuwe server) |
| Niveau | Het laagste niveau van het serverlog dat hij krijgt, standaard `info`; auditregels worden altijd verstuurd |
| Formaat | `BSD` (RFC 3164, de standaard) of `RFC 5424` |

Een wijziging geldt op elke node zonder herstart, en de pagina van de server heeft een knop die er een testbericht naartoe stuurt.
Een server die onbereikbaar is, stopt nooit de applicatie: de fout wordt naar de console geschreven.

Vanaf 7.3.0 vereisen de syslogservers de volledige instellingenrechten, de rolinstelling [`showSettings`](../config/roles.html#role-options):
toegang tot alleen de verbindingsinstellingen is niet genoeg, omdat een syslogserver het serverlog en de auditregels ontvangt.

De variabelen `LOG_SYSLOG_*` van eerdere versies zijn sinds 7 verouderd. De eerste start die
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) ingesteld vindt, importeert ze eenmaal als de server `syslog`,
die zoals voorheen het serverlog ontvangt, en negeert ze vanaf dan. Verwijder ze na die eerste
start uit de omgeving, en beheer de server op de instellingenpagina.

---

## Audittrail

De pagina **Auditlogboek** (onder **Instellingen > Logboeken**) legt vast wie wat heeft gewijzigd, een vraag die de logbestanden slecht beantwoorden.
Ze legt vast:

* elke wijziging via de API (`POST`, `PUT`, `PATCH`, `DELETE`), inclusief pogingen die met 401 of 403 zijn geweigerd
* aanmeldingen, met de gebruikersnaam die werd geprobeerd
* gebeurtenissen van de applicatie zelf, zoals nachtelijke back-ups, verwijderde back-ups, opgeschoonde jobs en toepassingen van de configuratie-seed

Elke regel heeft een tijdstip, de actor (een gebruiker, of de applicatie zelf voor haar eigen taken), het IP-adres van de client,
de actie, het doel en de uitkomst: `success`, `failure` of `denied`. De pagina filtert op actor, actie en
uitkomst, en gebruikers met de rolinstelling `showSettings` kunnen haar openen.

Het IP-adres is het adres dat AnsibleForms ziet, en dat is dat van de proxy als het erachter draait. Stel
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) in op het aantal of de adressen van je proxy's, en AnsibleForms
legt dan het clientadres vast dat de proxy in `X-Forwarded-For` meldt; zie [Reverse proxy](reverse-proxy.html).

Om het audittrail buiten de instantie te bewaren, voor een SIEM, voeg je een syslogserver toe die de auditregels ontvangt (zie
[Syslog](#syslog)). Elke regel wordt verstuurd zodra hij ontstaat, als één regel `audit {...}` met de regel als JSON, ongeacht het
niveau van de server. De syslogkopie wordt niet verwijderd door de bewaartermijn hieronder, en ook niet vervangen door het terugzetten van de database.

---

## Bewaartermijn

Twee dagelijkse taken met een instelling voorkomen dat de database onbeperkt groeit:

| Variabele | Standaard | Draait om | Verwijdert |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Auditregels die ouder zijn dan dit |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (alles bewaren) | 2:30 | Voltooide jobs die ouder zijn dan dit, met hun uitvoer |

`0` bewaart bij beide alles. Nog twee dagelijkse taken hebben geen instelling: om 3:00 worden de opgeslagen refresh tokens die ouder zijn dan 30 dagen en
de verlopen tokenintrekkingen verwijderd, en om 4:00 de [opgeslagen jobs](../jobs/stored-jobs.html) waarvan de vervaldatum voorbij is.
De tijden zijn in de tijdzone van [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), en de worker voert ze uit.

De joboutput is meestal de snelst groeiende tabel: de pagina **Status** meldt de grootte ervan
en waarschuwt als die 1 GB overschrijdt zonder ingestelde bewaartermijn. Lopende jobs en jobs die op goedkeuring wachten, worden nooit verwijderd.
Kies een bewaartermijn voor jobs die past bij je auditvereisten, en bewaar het audittrail minstens zo lang.
