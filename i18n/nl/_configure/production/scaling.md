---
layout: default
title: Schalen
parent: Draaien in productie
nav_order: 4
translated_from: 5b76f1bfb7520ff2b072919d714d2ab72b1e5d5e
---

# Schalen
{: .no_toc }

AnsibleForms verdeeld over meerdere app-nodes en een worker, naast een of meer RTE's
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rollen

Elke AnsibleForms-container draait dezelfde servercode, en [`AF_ROLE`](../customization/server.html#env_AF_ROLE) bepaalt wat hij doet:

| `AF_ROLE` | Image | Draait | Hoeveel |
|---|---|---|---|
| `all` (niet ingesteld) | `ansibleforms` | De webapp en de worker in één proces: de standaard | 1 |
| `app` | `ansibleforms` | De webinterface en de API | Zoveel als je wilt, achter een load balancer |
| `worker` | `ansibleforms` | Het achtergrondwerk: het databaseschema en de upgrades ervan, de configuratie-seed, de planningen, de nachtelijke back-up, de synchronisaties van repositories en de opschoningen | Eén aan het werk; meer wachten en nemen het over |
| `rte` | `ansibleforms-rte-full` (of `-rte-core`, `-rte-base`) | De playbooks | Zoveel als je wilt |

De kleinste installatie is één container zonder `AF_ROLE` naast één RTE: dat is wat het [Docker Compose-project](../installation/docker-compose.html)
en de [Helm-chart](../installation/kubernetes.html) draaien. Elke andere waarde van `AF_ROLE` stopt het proces bij de start.

---

## De RTE

De RTE, de runtime-omgeving die de playbooks draait, heeft een eigen sectie: [Runtime-omgevingen](../rte/). Daar staat hoe een RTE
een job draait, [de images](../rte/images.html), [hoe je er een draait](../rte/run.html), [meerdere RTE's](../rte/several.html) als runners of
replica's, en [een RTE in een ander datacenter](../rte/another-datacenter.html).

---

## Meerdere app-nodes

Om meer gebruikers te bedienen, of het verlies van één node te overleven, splits je de app op in `app`-nodes achter een load balancer en een `worker`.

### Wat de nodes delen
{: .no_toc }

De nodes stemmen met elkaar af via de database en een gedeeld volume:

* **De database** : de jobs, de workervergrendeling, de designer-vergrendeling, de lijst met nodes, de runnerleases (welke app-node de
  socket van elke RTE vasthoudt) en de wijzigingsberichten die de caches van elke node actueel houden. Een referentie, een runner of een planning die
  op één node is bewerkt, geldt binnen 5 seconden op alle nodes
* **Het persistente volume** (`/app/dist/persistent`) : formulieren, de configuratie, repositories, uploads, back-ups en de beheerde `.env`.
  Elke app-node en de worker koppelen hetzelfde volume, met lees- en schrijfrechten
* **De ssh-map** (`/home/node/.ssh`) : de sleutel en de known hosts voor git over ssh; de worker maakt de sleutel bij zijn eerste start aan
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : hetzelfde op elke app-node, anders wordt een token dat door
  de ene node is ondertekend door de volgende geweigerd. Een app-node weigert zonder dit geheim te starten
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : hetzelfde op elke app-node en worker, anders kan een
  referentie die door de ene is opgeslagen door de andere niet worden gelezen. Een RTE in socketmodus leest het nooit; alleen een verouderde RTE in databasemodus
  die zichzelf registreert, heeft het nodig

Geef elke container ook dezelfde databasegebruiker: een wachtende worker kan de sessie van een dode worker alleen beëindigen als het zijn eigen sessie is.

### De workervergrendeling
{: .no_toc }

Er werkt steeds maar één worker. Die houdt de databasevergrendeling `ansibleforms_worker` vast; als hij stopt, geeft de database de vergrendeling vrij en neemt een
wachtende worker haar binnen 10 seconden over. Als de host van de worker zonder afscheid uitvalt, zou de database de vergrendeling uren kunnen vasthouden,
dus beëindigt een wachtende worker die sessie zodra geen enkele worker twee minuten lang een heartbeat heeft geschreven, en neemt hij het over.

Een worker die de vergrendeling aan een andere verliest, stopt, en zijn container herstart als de wachtende. Een worker waarvan de start mislukt, stopt
ook, zodat hij de vergrendeling nooit vasthoudt zonder iets te doen. Galera en group replication delen de vergrendeling niet tussen databasenodes: laat elke
worker naar dezelfde databasenode wijzen.

### Jobs en nodes
{: .no_toc }

Elke container noemt zichzelf `<role>-<hostname>-<port>`, zonder dat je iets hoeft in te stellen, en de pagina **Status** toont ze allemaal met hun rol
en versie, welke de worker is, en een waarschuwing als ze verschillende versies draaien.

Een job die op een RTE draait, hoort bij die RTE, en loopt door als de app-node die hem startte wegvalt. Elke andere job (een templatejob
op AWX of een andere runner, een workflowjob, of de stappen van een verouderd multistep-formulier) hoort bij de app-node die hem startte. Een container die herstart, beëindigt zijn eigen onvoltooide jobs, en de
worker beëindigt de jobs van een container die twee minuten lang niet antwoordde, zoals een vervangen pod.

Een `SIGHUP` die naar een willekeurige node wordt gestuurd, past de [configuratie-seed](../seed/) opnieuw toe: een app-node vraagt de worker dat te doen.

### Upgraden
{: .no_toc }

Upgrade **eerst de worker**, daarna de app-nodes. De worker patcht het schema, en een app-node van de nieuwe versie wacht tot het
schema is gepatcht en logt waarop hij wacht. App-nodes die eerst zijn geüpgraded, blijven niet gereed totdat de worker volgt, terwijl de oude blijven
bedienen. RTE's kunnen op elk moment volgen, zolang ze hetzelfde contract spreken.

### Beperkingen
{: .no_toc }

Een paar dingen blijven bij één node:

* **De chat-assistent** bewaart zijn gesprekken in het geheugen van één app-node: gebruik sticky sessions op de load balancer (nginx
  `ip_hash`), of één enkele app-node
* **Logs** blijven in elke container. Zet [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) buiten het gedeelde volume, omdat meerdere
  processen die één bestand roteren regels verliezen. De logviewer toont het log van de node die antwoordt, dus verzamel de logs centraal
* **Instellingen** die op de instellingenpagina's worden gewijzigd, worden naar de beheerde `.env` op het gedeelde volume geschreven en gelden op elke node; de instellingen
  die een herstart vereisen, vereisen die op elke node

---

## Voorbeeldopzet

De app-repository heeft een compleet startpunt in [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale):

| Service | Image | Rol |
|---|---|---|
| `db` | `mariadb:11` | De database, met een gebruiker die alleen rechten heeft op het schema `AnsibleForms` |
| `app1`, `app2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=app`, achter de load balancer |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: de tweede wacht en neemt het over |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Draait de playbooks met `RTE_MODE=inbound` en `RTE_FILES=local`: de app belt haar |
| `lb` | `nginx:stable` | Handelt HTTPS af op poort 8443 en verdeelt de browsers over de app-nodes met `ip_hash` |

De runner `rte` van de RTE en de referentie waarmee hij zich aanmeldt (zijn adres `http://rte:8000` en `RTE_TOKEN`) worden gedeclareerd in de
[configuratie-seed](../seed/) `seed.yaml`, die de worker bij elke start toepast; de RTE stelt geen `RTE_URL` in en wordt niet op de host gepubliceerd.

De app-nodes en de workers delen één `.env`, met de databasegebruiker, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` achter de load balancer en een `LOG_PATH` buiten het gedeelde volume. De RTE heeft geen `env_file`: hij krijgt
alleen `RTE_TOKEN` uit `compose.yaml`, dus hij bevat geen databasewachtwoord. De app-nodes, de workers en de RTE koppelen dezelfde
persistente en ssh-volumes:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
