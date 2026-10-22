---
layout: default
title: Monitoring
parent: Draaien in productie
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Monitoring
{: .no_toc }

Health probes voor een load balancer of Kubernetes, Prometheus-metrics, en de pagina Status
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Health probes

Twee endpoints vertellen een load balancer, een container-healthcheck of Kubernetes of een proces verkeer kan aannemen.
Geen van beide vereist een aanmelding, en geen van beide geeft iets prijs over de opzet:

| Endpoint | Antwoordt | Gebruik het voor |
|----------|---------|------------|
| `/api/v2/live` | `200` met `{"status":"live"}` zolang het proces draait | Een liveness probe: herstart het proces als het niet meer antwoordt |
| `/api/v2/ready` | `200` met `{"status":"ready"}`, of `503` met `{"status":"not ready","reason":"..."}` | Een readiness probe: stuur alleen verkeer naar processen die gereed zijn |

Een proces is gereed als al deze voorwaarden gelden:

* het wordt niet afgesloten (`stopping`)
* de database antwoordt (`database unreachable`)
* het schema bestaat (`schema not provisioned`) en is volledig, met elke tabel, kolom en index van deze versie
  (`schema not upgraded`); deze laatste controle wordt 30 seconden gecachet, zodat een probe om de paar seconden goedkoop blijft

Onder een [`BASE_URL`](../customization/server.html#env_BASE_URL) beginnen de paden daarmee, bijvoorbeeld
`/ansibleforms/api/v2/ready`. Een runtime-omgeving (RTE) beantwoordt dezelfde probes op `/live` en `/ready`, zonder de
controle op de volledigheid van het schema; ze is niet gereed terwijl ze bij het afsluiten haar jobs afbouwt, zodat er geen nieuwe job naartoe wordt gestuurd. Een uitgaande RTE
is ook niet gereed (`not connected to the app`) totdat haar socket naar de app open is.
Een proces dat met `AF_ROLE=worker` is gestart, heeft geen webinterface: het beantwoordt alleen `/api/v2/version` en `/health` voor zijn
container-healthcheck. Zie [Schalen](scaling.html) voor de rollen.

---

## Prometheus-metrics

Stel [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) in op een lange willekeurige string om Prometheus-metrics aan te bieden.
Een proces dat de webapplicatie bedient, antwoordt op `/api/v2/metrics`, een RTE op `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Zonder `METRICS_TOKEN` antwoorden de endpoints met `404`, alsof ze niet bestaan, en een verzoek zonder de juiste
header `Authorization: Bearer <token>` krijgt `401`. Elk proces rapporteert zijn eigen cijfers, dus scrape ze allemaal:

| Metric | Wat ze meet |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | Het proces: CPU, geheugen, vertraging van de event loop, garbage collection |
| `af_http_requests_total{route,method,status}` | De afgehandelde verzoeken |
| `af_http_request_duration_seconds{route}` | Hoe lang ze duurden |
| `af_jobs{status}` | Jobs die nu draaien (`running`) of op goedkeuring wachten (`approve`) |
| `af_jobs_ended_24h{status}` | Jobs die in de laatste 24 uur zijn geëindigd, per status |
| `af_nodes{role,alive}` | De processen die in de database zijn geregistreerd, per rol, levend of niet |
| `af_login_failures_total`, `af_login_lockouts_total` | Mislukte aanmeldingen en accountblokkeringen |
| `af_rte_running_jobs`, `af_rte_max_jobs` | Op een RTE: de playbooks die ze nu draait, en hoeveel ze er tegelijk mag draaien |
| `af_rte_socket_connected` | Op een RTE in socketmodus: `1` zolang haar socket naar de app open is, `0` als dat niet zo is |

De job- en nodecijfers worden bij elke scrape uit de database gelezen. Als de database niet antwoordt, worden ze weggelaten
en slaagt de scrape toch met de andere metrics.

---

## De pagina Status

De pagina **Status**, onder **Instellingen > Systeem**, laat gebruikers met de rolinstelling `showSettings` zien hoe het met de instantie gaat.
Ze leest alleen, dus het vernieuwen ervan verstuurt nooit mail en start nooit een job. Ze heeft twee tabbladen, en het aantal problemen staat op het label van het tabblad **Controles**.

### Controles

Elke controle is groen (gezond), oranjegeel (vraagt aandacht) of rood (een probleem), met de details als je de rij uitklapt:

| Controle | Waar ze naar kijkt |
|-------|------------------|
| Databaseverbinding | De database antwoordt |
| Databasegebruiker | Oranjegeel als de gebruiker rechten heeft op elke database, zoals `root`, in plaats van alleen op `AnsibleForms.*` |
| Databaseschema | Elke tabel, kolom en index van deze versie bestaat, en welke patch mislukte als dat niet zo is |
| Planner | Een worker voert de systeemtaken uit, en geen ervan is gestopt met plannen |
| Nodes | De processen in de database, oranjegeel als ze verschillende versies draaien |
| Jobs | Lopende jobs en jobs die op goedkeuring wachten, oranjegeel als een job langer dan 24 uur draait |
| Back-uptools | De dumpopdracht van [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) bestaat, en de versie ervan |
| Laatste back-up | Oranjegeel als er geen is of de nieuwste meer dan twee dagen oud is, rood als die geen bruikbare dump heeft |
| Designer-vergrendeling | Wie de designer-vergrendeling heeft, oranjegeel als die langer dan 8 uur wordt vastgehouden |
| Repositories | Rood als een repository is mislukt of geen werkboom op schijf heeft |
| Configuratie-seed | Het bestand van de [configuratie-seed](../seed/) is leesbaar en te parsen, en de laatste herlaadbeurt werkte |
| Secret stores | Elke secret store antwoordt, oranjegeel als het token van een HashiCorp Vault binnenkort verloopt |
| Runners | Elke runner antwoordt, oranjegeel als er geen is of geen standaard-RTE |
| Serverexpressies | Oranjegeel als [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) `legacy` is |
| Geheimen | Oranjegeel als `ENCRYPTION_SECRET` de openbare standaardwaarde is of `ACCESS_TOKEN_SECRET` niet is ingesteld |
| LDAP | De LDAP-server is bereikbaar en zijn TLS-certificaat is geldig, zonder erop aan te melden |
| Jobopslag | De grootte van de jobtabellen, oranjegeel boven 1 GB als er geen bewaartermijn voor jobs is ingesteld |
| Schrijfbare mappen | Naar elke geconfigureerde map kan worden geschreven |
| Schijfruimte | De schijf met de back-ups, oranjegeel vanaf 85% gebruikt en rood vanaf 95% |

### Informatie

Feiten over de instantie zonder oordeel, het eerste waar een supportgesprek om vraagt: de AnsibleForms-versie,
de basis-URL, de databaseversie en -host, de configuratiebron, de configuratie-seed, de instellingen voor de bewaartermijn,
de authenticatiemethoden, de server van het actieve [mailkanaal](../notification-channels.html), het logniveau
en -pad, de uptime, de tijdzone, de Node.js-versie en het platform.

De pagina leest `/api/v2/health`, waarvoor een aangemelde gebruiker met `showSettings` nodig is. Gebruik voor een monitoringsysteem in plaats daarvan
de probes en de metrics hierboven.
