---
layout: default
title: Eine RTE betreiben
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# Eine RTE betreiben
{: .no_toc }

Die Einstellungen jedes Modus und wie man eine RTE startet
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Einstellungen

Was eine RTE braucht, hängt von ihrem Modus ab (siehe [Modi](modes.html)). Jede RTE liest diese:

| Variable | Bedeutung |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Seit 7.3.0: `outbound` (sie wählt sich bei der App ein), `inbound` (die App wählt sich bei ihr ein) oder `database` (veraltet, der Standard in ganz 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Das Token zwischen der App und der RTE, mindestens 16 Zeichen; ohne es verweigert die RTE den Start |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Wie viele Playbooks sie gleichzeitig ausführt, standardmäßig `10` (`0` setzt keine Grenze). Ein Job für eine volle RTE wartet, bis ein Playbook endet |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Wie lange sie beim Anhalten auf ihre laufenden Playbooks wartet, standardmäßig `25`; die dann noch laufenden enden als verwaist |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Von den App-Knoten und dem Worker gelesen, nicht von der RTE: wie lange ein Job auf eine volle oder anhaltende RTE wartet, standardmäßig `60` |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | Der Playbook-Ordner und die Ausgabegrenze: von der RTE gelesen, setzen Sie sie also in ihrer Umgebung |
| `LISTEN_HOST` | Seit 7.3.0: die Adresse, an die sich ihre Listener binden, standardmäßig jede Schnittstelle; `127.0.0.1`, wenn sich niemand von außen bei ihr einwählt (eine ausgehende RTE) |

Eine RTE in einem Socket-Modus, `outbound` oder `inbound`, liest außerdem diese, und kein `DB_*` und kein `ENCRYPTION_SECRET`:

| Variable | Bedeutung |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | Die Adresse der App, wie Benutzer sie öffnen, etwa `https://forms.example.com`. Ausgehend: die Adresse, bei der sie sich einwählt. Eingehend: die Adresse ihres einen Registrierungsaufrufs |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (Standard): Das Zertifikat der App muss gültig sein. `0` akzeptiert jedes, nur innerhalb eines vertrauenswürdigen Netzes |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Der Name ihres Runners, den Formulare mit `runner:` nennen. Nicht gesetzt: ihre Knoten-ID, `rte-<hostname>-<port>`, die sich mit dem Container ändert: Setzen Sie ihn in Produktion |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Optional, nur beim ersten Mal: ein über die API erstelltes Beitrittstoken, das ihren Runner sofort freigibt, statt auf einen Admin zu warten (siehe [Beitrittstoken](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Eingehend, wenn sie um Beitritt bittet: die Adresse, unter der sich die App einwählt, etwa `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (Standard): Die App sendet die Playbooks und Inventare mit dem Job. `local`: Sie arbeitet aus ihren eigenen eingehängten Ordnern |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Wo Ausgabe, Ereignisse und Ende jedes Jobs warten, bis die App sie gespeichert hat, standardmäßig `<persistent>/rte-spool`: Halten Sie es auf einem Volume |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Mit `transfer`: wo die von der App gesendeten Ordner aufbewahrt werden, standardmäßig `<persistent>/rte-files` |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Mit `transfer`: wie viel Platz diese Ordner belegen dürfen, standardmäßig `1024`; die am längsten nicht verwendeten gehen zuerst, und `0` behält keine |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | Von der App gelesen, nicht von der RTE: der größte Ordner, den sie mit `transfer` sendet, standardmäßig `512` |

Bei einer RTE in einem Socket-Modus lassen sich `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` und `RTE_CACHE_MB` auch auf ihrer Runner-Seite setzen,
im Tab RTE: Ein Wert dort gewinnt über die Variable, die dann nur ein leer gelassenes Feld füllt (siehe
[Die Einstellungen einer RTE](../runners/runner-page.html#an-rtes-settings)). Ein Wert außerhalb des Bereichs wird auf seine Grenze gesetzt, und die RTE meldet das
beim Start.

Eine RTE im Datenbankmodus (veraltet) liest stattdessen die Datenbankeinstellungen und registriert sich selbst:

| Variable | Bedeutung |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Die eigenen Werte der App: Die RTE liest ihre Jobs aus der Datenbank und schreibt deren Ausgabe dorthin |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Die Adresse, unter der die App die RTE aufruft, etwa `http://rte:8000`. Der Runner wird nach seinem Host benannt (`rte`), sodass Formulare `runner: rte` verwenden können |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | In 7.3.0 veraltet, zusammen mit dem Datenbankmodus: Eine RTE im Socket-Modus tritt stattdessen mit einem Beitrittstoken bei. `1` (Standard): Die RTE fügt sich bei ihrem Start selbst unter **Verbindungen > Runner** hinzu, und die erste wird zum Standard-Runner. `0`: Fügen Sie sie dort selbst hinzu oder im [Config-Seed](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Der eigene Wert der App, nur zum Selbstregistrieren nötig (das Token des Runners wird verschlüsselt gespeichert); lassen Sie es mit `RTE_REGISTER=0` weg |

Im Datenbankmodus registriert die RTE ohne `RTE_URL` ihre IP-Adresse und ihren Port unter dem Namen `rte-<hostname>-<port>`, die sich ändern, wenn
der Container neu erstellt wird: Setzen Sie `RTE_URL` in Produktion. Der Worker entfernt einen Runner, den die RTE selbst registriert hat, 10 Minuten nach dem
letzten Heartbeat der RTE.

---

## Starten

Die RTE führt die Playbooks aus, daher braucht sie ihren ssh-Ordner mit dem privaten Schlüssel und den `known_hosts`, die die Playbooks verwenden, sowie einen persistenten
Ordner für ihren Spool und die Dateien, die die App sendet. Wählen Sie den Modus:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Ausgehend</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Eingehend</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Datenbank (veraltet)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Starten Sie die RTE auf einem beliebigen Host, der die App erreicht, mit ihrem eigenen Token und dem Namen, den ihr Runner erhält:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Sie wählt sich bei der App ein und bittet um Beitritt: **Verbindungen > Runner** zeigt den Runner `rte-dmz` als wartend auf Freigabe, und ihr Protokoll zeigt
den Fingerabdruck ihres Tokens. Prüfen Sie, dass ihre Prüfansicht denselben Fingerabdruck zeigt, und geben Sie sie dann mit **Freigeben** frei (siehe
[Eine RTE freigeben](../runners/registration.html#approving-an-rte)): Ab dann erhält sie Jobs und meldet sich mit ihrem eigenen `RTE_TOKEN` an.
Für einen unbeaufsichtigten Start fügen Sie `-e RTE_JOIN_TOKEN=<a join token, afj_...>` hinzu, das sie sofort freigibt. Nichts muss diesen
Host erreichen: Veröffentlichen Sie keinen Port. Auf ihrem `PORT` lauschen nur `/live`, `/ready` und `/metrics`, für die Probes.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Starten Sie die RTE dort, wo die App sie erreicht. Diese läuft neben der App und führt die Playbooks aus deren Ordnern aus (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Geben Sie der App dann ihren Runner: im [Config-Seed](../seed/) RTE-Anmeldedaten und einen eingehenden Runner, der sich damit anmeldet:

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

Oder fügen Sie dieselben beiden von Hand hinzu: die Anmeldedaten unter **Verbindungen > Anmeldedaten**, Typ RTE, und den Runner unter
**Verbindungen > Runner**, Typ RTE, Modus **Eingehend**, mit diesen Anmeldedaten. Damit die RTE stattdessen um Beitritt bittet, starten Sie sie mit
`APP_URL` und `RTE_URL` und geben sie unter **Verbindungen > Runner** frei (siehe [Eingehend](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Seit 7.3.0 veraltet und in 8.0.0 entfernt. Die RTE führt die Playbooks von ihrer eigenen Festplatte aus, hängen Sie daher das persistente Volume der App
(Playbooks, Repositories, Uploads) und ihren ssh-Ordner ebenfalls bei ihr ein. Ein Docker-Beispiel, mit der App erreichbar als `ansibleforms` im
selben Netz:

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

Halten Sie eine eingehende RTE aus dem öffentlichen Netz heraus: Ihr Socket antwortet jedem Aufrufer, der das Token hat. `docker stop` wartet nur 10 Sekunden, bevor
es einen Container beendet, geben Sie der RTE daher ein längeres Stop-Timeout (`--stop-timeout` oder `stop_grace_period` in Compose) oder senken Sie
`RTE_DRAIN_SECONDS`. Kubernetes wartet standardmäßig 30 Sekunden.

Das [Installationsprogramm](../installation/installer.html) richtet eine ausgehende oder eingehende RTE auf einem eigenen Server ein, mit Docker, Podman oder
[ohne Container](../installation/native.html), und gibt den Fingerabdruck aus, anhand dessen Sie sie freigeben. Um eine RTE in einem anderen Rechenzentrum
von Hand zu betreiben, folgen Sie [Ein anderes Rechenzentrum](another-datacenter.html).
