---
layout: default
title: Een RTE draaien
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# Een RTE draaien
{: .no_toc }

De instellingen van elke modus, en hoe je een RTE start
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Instellingen

Wat een RTE nodig heeft, hangt af van haar modus (zie [Modi](modes.html)). Elke RTE leest deze:

| Variabele | Betekenis |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Sinds 7.3.0: `outbound` (ze belt de app), `inbound` (de app belt haar) of `database` (verouderd, de standaard in heel 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Het token tussen de app en de RTE, minstens 16 tekens; zonder token weigert de RTE te starten |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Hoeveel playbooks ze tegelijk draait, standaard `10` (`0` stelt geen limiet in). Een job voor een volle RTE wacht tot een playbook eindigt |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Bij een stop, hoe lang ze op haar lopende playbooks wacht, standaard `25`; de playbooks die dan nog draaien, eindigen als verlaten |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Gelezen door de app-nodes en de worker, niet door de RTE: hoe lang een job wacht op een volle of stoppende RTE, standaard `60` |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | De playbookmap en de uitvoerlimiet: gelezen door de RTE, dus stel ze in haar omgeving in |
| `LISTEN_HOST` | Sinds 7.3.0: het adres waaraan haar listeners binden, standaard elke interface; `127.0.0.1` als niets haar van buitenaf belt (een uitgaande RTE) |

Een RTE in een socketmodus, `outbound` of `inbound`, leest ook deze, en geen `DB_*` en geen `ENCRYPTION_SECRET`:

| Variabele | Betekenis |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | Het adres van de app zoals mensen hem openen, zoals `https://forms.example.com`. Uitgaand: het adres dat ze belt. Inkomend: het adres van haar ene registratieaanroep |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (standaard): het certificaat van de app moet geldig zijn. `0` accepteert elk certificaat, alleen binnen één vertrouwd netwerk |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | De naam van haar runner, die formulieren noemen met `runner:`. Niet ingesteld: haar node-id, `rte-<hostname>-<port>`, dat met de container verandert: stel het in productie in |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Optioneel, alleen de eerste keer: een jointoken, gemaakt via de API, dat haar runner meteen goedkeurt in plaats van op een admin te wachten (zie [Jointokens](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Inkomend, als ze vraagt om lid te worden: het adres dat de app belt, zoals `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (standaard): de app stuurt de playbooks en inventories met de job mee. `local`: ze draait vanuit haar eigen gekoppelde mappen |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Waar de uitvoer, de events en het einde van elke job wachten tot de app ze heeft opgeslagen, standaard `<persistent>/rte-spool`: houd het op een volume |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Met `transfer`: waar de mappen die de app stuurde worden bewaard, standaard `<persistent>/rte-files` |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Met `transfer`: hoeveel ruimte die mappen mogen innemen, standaard `1024`; de mappen die het langst geleden zijn gebruikt gaan eerst, en `0` bewaart er geen |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | Gelezen door de app, niet door de RTE: de grootste map die ze met `transfer` verstuurt, standaard `512` |

Op een RTE in een socketmodus kunnen `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` en `RTE_CACHE_MB` ook op haar runnerpagina worden ingesteld,
onder het tabblad RTE: een waarde daar wint van de variabele, die dan alleen een leeg gelaten veld invult (zie
[De instellingen van een RTE](../runners/runner-page.html#an-rtes-settings)). Een waarde buiten het bereik wordt op haar grens gebracht, en de RTE meldt dat
bij het starten.

Een RTE in databasemodus (verouderd) leest in plaats daarvan de database-instellingen, en registreert zichzelf:

| Variabele | Betekenis |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | De eigen waarden van de app: de RTE leest haar jobs uit de database en schrijft hun uitvoer daarheen |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Het adres waarop de app de RTE aanroept, zoals `http://rte:8000`. De runner krijgt de naam van zijn host (`rte`), zodat formulieren `runner: rte` kunnen gebruiken |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | Verouderd in 7.3.0, samen met de databasemodus: een RTE in socketmodus wordt in plaats daarvan lid met een jointoken. `1` (standaard): de RTE voegt zichzelf bij het starten toe onder **Verbindingen > Runners**, en de eerste wordt de standaardrunner. `0`: voeg haar daar zelf toe, of in de [configuratie-seed](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | De eigen waarde van de app, alleen nodig om zichzelf te registreren (het token van de runner wordt versleuteld opgeslagen); laat het weg met `RTE_REGISTER=0` |

In databasemodus registreert de RTE zonder `RTE_URL` haar IP-adres en poort onder de naam `rte-<hostname>-<port>`, die veranderen wanneer
de container opnieuw wordt aangemaakt: stel `RTE_URL` in productie in. De worker verwijdert een runner die de RTE zelf heeft geregistreerd 10 minuten na de
laatste heartbeat van de RTE.

---

## Haar starten

De RTE draait de playbooks, dus ze heeft haar ssh-map nodig, met de privésleutel en de `known_hosts` die de playbooks gebruiken, en een persistente
map voor haar spool en de bestanden die de app stuurt. Kies de modus:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Uitgaand</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Inkomend</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Database (verouderd)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Start de RTE op elke host die de app bereikt, met haar eigen token en de naam die haar runner krijgt:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Ze belt de app en vraagt om lid te worden: **Verbindingen > Runners** toont de runner `rte-dmz` als wachtend op goedkeuring, en haar log toont
de vingerafdruk van haar token. Controleer dat de beoordeling dezelfde vingerafdruk toont, en klik dan op **Goedkeuren** (zie
[Een RTE goedkeuren](../runners/registration.html#approving-an-rte)): vanaf dan krijgt ze jobs, en meldt ze zich aan met haar eigen `RTE_TOKEN`.
Voeg voor een onbeheerde start `-e RTE_JOIN_TOKEN=<a join token, afj_...>` toe, dat haar meteen goedkeurt. Niets hoeft deze
host te bereiken: publiceer geen poort. Alleen `/live`, `/ready` en `/metrics` luisteren op haar `PORT`, voor de probes.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Start de RTE waar de app haar bereikt. Deze draait naast de app en draait de playbooks vanuit haar mappen (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Geef de app daarna haar runner: in de [configuratie-seed](../seed/), een RTE-referentie en een inkomende runner die zich ermee aanmeldt:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

Of voeg dezelfde twee met de hand toe: de referentie onder **Verbindingen > Inloggegevens**, type RTE, en de runner onder
**Verbindingen > Runners**, type RTE, modus **Inkomend**, met die referentie. Om de RTE in plaats daarvan te laten vragen om lid te worden, start je haar met
`APP_URL` en `RTE_URL`, en keur je haar goed onder **Verbindingen > Runners** (zie [Inkomend](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Verouderd sinds 7.3.0 en verwijderd in 8.0.0. De RTE draait de playbooks vanaf haar eigen schijf, dus koppel ook het persistente volume van de app
(playbooks, repositories, uploads) en zijn ssh-map erop. Een Docker-voorbeeld, met de app bereikbaar als `ansibleforms` op
hetzelfde netwerk:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Houd een inkomende RTE buiten het openbare netwerk: haar socket antwoordt iedereen die het token heeft. `docker stop` wacht maar 10 seconden voordat
het een container afschiet, dus geef de RTE een langere stoptime-out (`--stop-timeout`, of `stop_grace_period` in compose) of verlaag
`RTE_DRAIN_SECONDS`. Kubernetes wacht standaard 30 seconden.

Het [installatieprogramma](../installation/installer.html) zet een uitgaande of inkomende RTE op een eigen server op, met Docker, Podman of
[zonder containers](../installation/native.html), en drukt de vingerafdruk af waarmee je haar goedkeurt. Volg [Een ander datacenter](another-datacenter.html)
om een RTE met de hand in een ander datacenter te draaien.
