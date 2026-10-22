---
layout: default
title: Modi
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# Wie eine RTE mit der App spricht
{: .no_toc }

Ausgehend, eingehend oder Datenbank: wer die Verbindung öffnet und was darüber läuft
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Seit 7.3.0 spricht eine RTE über einen WebSocket mit der App und hält keine Datenbank-Anmeldedaten. Wählen Sie den Modus,
der zum Netz zwischen beiden passt: wer zu wem eine Verbindung öffnen darf und durch welche Proxys und Firewalls sie läuft.

---

## Die drei Modi

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) auf der RTE sagt, wie sie die App erreicht; ihr Runner hat denselben **Modus**:

| Modus | Wer die Verbindung öffnet | Was die RTE hält | Für |
|---|---|---|---|
| `outbound` | Die RTE wählt sich unter [`APP_URL`](../customization/server.html#env_APP_URL) bei der App ein und hält einen WebSocket offen | Ihr `RTE_TOKEN`, keine Datenbank-Anmeldedaten | Eine DMZ, NAT oder eine Zone, die keine eingehenden Verbindungen erlaubt: Von außen erreicht nichts die RTE |
| `inbound` | Die App wählt sich unter der Adresse ihres Runners bei der RTE ein und hält einen WebSocket offen | Ihr `RTE_TOKEN`, keine Datenbank-Anmeldedaten | Ein Netz, in dem die zentrale Seite jede Verbindung öffnet, ein Compose-Projekt, ein Pod |
| `database` (veraltet) | Die App ruft die API der RTE über HTTP auf, und die RTE liest und schreibt selbst die Datenbank der App | Die Anmeldedaten der Datenbank (`DB_*`) und `ENCRYPTION_SECRET` | Das Verhalten von 7.0 bis 7.2, in 8.0.0 entfernt |

Eine RTE ohne `RTE_MODE` läuft die ganze Reihe 7.x hindurch im Datenbankmodus und protokolliert bei ihrem Start die Warnung `[DEPRECATED] This RTE runs in database mode`.
Ein vor 7.3.0 hinzugefügter Runner hat den Modus **Datenbank (veraltet)**; setzen Sie ihn auf den Modus, in dem seine RTE läuft, wenn Sie sie umstellen.

---

## Ausgehend

Die RTE öffnet die Verbindung, daher funktioniert sie aus einem Netz, das überhaupt keine eingehende Verbindung annimmt:

* **Der Socket** : Die RTE wählt `APP_URL` mit angehängtem `/api/v2/rte/socket` an, über `wss://` (`ws://` bei einer `http://`-Adresse), mit ihrem
  `RTE_TOKEN` und dem Namen ihres Runners, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Sie wählt sich erneut ein, wenn der Socket abreißt
* **Beim ersten Mal** : Sie bittet um Beitritt, und ihr Runner wartet unter **Verbindungen > Runner** auf die Freigabe eines Admins, verbunden,
  aber ohne Jobs (siehe [Um Beitritt bitten](../runners/registration.html#asking-to-join)). Ein Beitrittstoken,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), gibt sie sofort frei. Danach meldet sie sich mit ihrem eigenen Token an
* **Das Netz** : nur von der Zone der RTE zur App, auf dem Port der App, über einen Proxy, wenn `HTTPS_PROXY` das sagt. Ein Reverse
  Proxy vor der App muss den WebSocket auf diesem Pfad durchlassen (siehe [Runner-WebSockets](../production/reverse-proxy.html#runner-websockets))
* **Das Zertifikat** : Das Zertifikat der App wird geprüft. Nennen Sie eine private CA mit `NODE_EXTRA_CA_CERTS` oder schalten Sie die Prüfung, nur innerhalb eines
  vertrauenswürdigen Netzes, mit [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) ab
* **Der Runner** : Er braucht keine Adresse, daher enthalten seine RTE-Anmeldedaten nur das Token
* **Bereit** : `/ready` antwortet mit `503`, bis der Socket zur App offen ist

Mit mehreren App-Knoten hinter einem Load Balancer hält der Knoten, den die RTE erreicht, ihren Socket. Jeder Knoten kann einen Job starten: Der Knoten, der
den Socket hält, sendet ihn an die RTE, innerhalb von zwei Sekunden, wenn der Job auf einem anderen Knoten gestartet wurde.

---

## Eingehend

Die RTE lauscht auf ihrem `PORT`, und die App wählt sich unter der Adresse ihres Runners bei ihr ein, mit angehängtem `/rte/v1/socket` und dem Token der RTE. Bei
mehreren App-Knoten hält jeweils einer den Socket jedes eingehenden Runners; hält dieser Knoten an, übernimmt ein anderer und wählt sich erneut ein.

Die App braucht den Runner der RTE, bevor sie sich einwählen kann: Typ RTE, Modus **Eingehend** und RTE-Anmeldedaten mit der Adresse der RTE und ihrem
`RTE_TOKEN`. Er entsteht auf einem von zwei Wegen:

| Wie | Was zu setzen ist |
|---|---|
| Die RTE bittet um Beitritt | `APP_URL` und [`RTE_URL`](../customization/server.html#env_RTE_URL) (die Adresse, unter der die App sich einwählt). Die RTE macht einen Aufruf, `POST /api/v2/rte/register`, und ihr Runner wartet auf die Freigabe eines Admins: Die App wählt sich ein, sobald er freigegeben ist (siehe [Um Beitritt bitten](../runners/registration.html#asking-to-join)). Mit `RTE_JOIN_TOKEN` wird er sofort freigegeben. Eine eingehende RTE mit `APP_URL`, aber ohne `RTE_URL` verweigert den Start |
| Sie fügen den Runner hinzu | Kein `APP_URL`: Fügen Sie den Runner unter **Verbindungen > Runner** oder im [Config-Seed](../seed/) hinzu, wie in [Eine RTE betreiben](run.html#start-it) |

Das Docker Compose-Projekt, das Helm-Chart und der Controller des Installationsprogramms betreiben ihre eigene RTE auf diese Weise, eingehend, vom Seed deklariert.

**Über HTTPS.** Mit [`HTTPS=1`](../customization/server.html#env_HTTPS) stellt die RTE ihren Socket über TLS bereit, mit Schlüssel und Zertifikat
aus [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) und [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(standardmäßig `key.pem` und `cert.pem` in ihrem Ordner `certificates`). Eine RTE mit einer `https://`-`RTE_URL` sendet dieses Zertifikat, wenn sie
um Beitritt bittet, und die App pinnt es: Sie wählt sich nur bei der RTE ein, wenn diese dasselbe Zertifikat vorlegt, daher funktioniert ein selbstsigniertes ohne CA.
Die RTE protokolliert beim Start den Fingerabdruck des Zertifikats (die ersten 8 Hexadezimalziffern des SHA-256 seiner DER-Bytes, als `abcd-ef12`),
und der Freigabedialog zeigt den, den die App erhalten hat: Prüfen Sie, dass sie übereinstimmen, bevor Sie freigeben.
Das [Installationsprogramm](../installation/installer.html#a-runner) richtet seine eingehenden Runner so ein, mit einem Zertifikat für ihre eigene Adresse.

---

## Datenbank (veraltet)

Die RTE von 7.0 bis 7.2: Die App ruft ihre API über HTTP auf, und die RTE übernimmt den Job in der Datenbank, schreibt die Ausgabe dort und hält ihre
eigene Runner-Zeile aktuell, mit [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Datenbankmodus](./#database-mode-deprecated)
beschreibt, wie sich ihre Schritte unterscheiden. Sie funktioniert in 7.x weiterhin, mit einer Warnung bei jedem Start, und wird in 8.0.0 entfernt.

Um eine solche RTE in einen Socket-Modus zu überführen, behalten Sie ihren Runner und ihr Token:

1. Ein Runner des [Config-Seeds](../seed/): Setzen Sie zuerst im Seed `rte_mode: outbound` oder `rte_mode: inbound` für ihn (eingehend: mit
   der Adresse, unter der sich die App einwählt, in der `url` seiner Anmeldedaten). Die RTE kann einen Runner aus dem Seed nicht selbst umstellen
2. Setzen Sie auf der RTE `RTE_MODE=outbound` mit `APP_URL` oder `RTE_MODE=inbound` (mit `APP_URL` und `RTE_URL`, damit sie ihren einen
   Registrierungsaufruf macht), und setzen Sie [`RTE_NAME`](../customization/server.html#env_RTE_NAME) auf den Namen, den ihr Runner unter
   **Verbindungen > Runner** hat. Behalten Sie ihr `RTE_TOKEN`
3. Entfernen Sie `DB_*` und `ENCRYPTION_SECRET` aus ihrer Umgebung sowie `RTE_REGISTER`, das nur der Datenbankmodus liest, und starten Sie sie dann neu

Meldet sich die aktualisierte RTE mit dem Namen des Runners und dem eigenen Token des Runners an, stellt die App diesen Runner sofort
auf den Modus der RTE um, ohne Freigabe, und protokolliert *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. Der Runner ist dann keine Zeile mehr, die seine RTE registriert hat, daher entfernt ihn der Worker nie, wenn der alte Container nicht mehr antwortet. Ein
Runner des Config-Seeds, der noch im Datenbankmodus ist, wird stattdessen abgewiesen, mit *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. Verwenden Sie dafür kein Beitrittstoken: Ein
Beitrittstoken wird für einen bereits freigegebenen Runner abgewiesen. Eine eingehende RTE ohne `APP_URL` macht keinen Aufruf: Setzen Sie stattdessen den **Modus** ihres Runners unter
**Verbindungen > Runner** auf **Eingehend**, und die App wählt sich bei ihr ein. Das [Installationsprogramm](../installation/installer.html#a-72-runner)
aktualisiert einen Runner aus 7.2 auf diese Weise.

---

## Was über den Socket läuft

In beiden Socket-Modi sendet die App der RTE jeden Job mit allem, was die RTE früher in der Datenbank las, und speichert, was zurückkommt,
die Ausgabe, die Ereignisse, das Job-Protokoll und das Ende, genau einmal. Die App sendet auch die Benachrichtigungen zum Ende.

**Der Spool.** Jedes Ausgabebündel, Ereignisbündel, Protokoll, jeder Start und jedes Ende wird nummeriert und in die Spool-Datei des Jobs
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) geschrieben, bevor es gesendet wird, und aufbewahrt, bis die App meldet, dass sie es gespeichert hat.
Nach einer Neuverbindung, zum selben App-Knoten oder zu einem anderen, sendet die RTE erneut, was nicht bestätigt wurde, und die App überspringt, was sie bereits
gespeichert hat: Nichts geht verloren, und nichts wird doppelt gespeichert. Halten Sie den Spool auf einem Volume, damit eine neu gestartete RTE noch sendet, was sie nicht
ausgeliefert hatte. Ein Playbook, das lief, als die RTE neu startete, kann nicht weiterlaufen: Sein Job endet als verwaist.

**Kapazität.** Die RTE führt bis zu [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) Playbooks gleichzeitig aus, oder den Wert, der
auf ihrer [Runner-Seite](../runners/runner-page.html#an-rtes-settings) gesetzt ist, und meldet der App alle 20 Sekunden, wie viele laufen. Ein Job für eine volle
RTE wartet, wie unter [Mehrere RTEs](several.html#several-jobs-on-one-rte) beschrieben.

**Die Dateien des Jobs.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES) oder die Einstellung **Jobdateien** auf ihrer Runner-Seite sagt,
woher die RTE die Playbooks und Inventare bezieht:

| `RTE_FILES` | Woher die Dateien kommen |
|---|---|
| `transfer` (Standard) | Die App sendet den Playbook-Ordner und die Inventare mit dem Job, jeweils gepackt und nach einem Hash ihres Inhalts benannt. Die RTE bewahrt sie gepackt unter [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) auf, die zuletzt verwendeten bis zu [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (standardmäßig 1024 MB), und fragt nur nach einem Hash, den sie nicht hat: Ein unveränderter Ordner wird nie zweimal gesendet. Die RTE braucht keine gemeinsame Festplatte und keinen Zugriff auf die Repositories |
| `local` | Die RTE arbeitet aus ihren eigenen Ordnern, wie eine RTE im Datenbankmodus: Hängen Sie die Playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) und die Repositories ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) bei ihr ein |

Mit `transfer` entpackt jeder Job seine Dateien in einen eigenen privaten Ordner, der beim Ende des Jobs entfernt wird: Kein Job sieht, was ein anderer
geschrieben hat, und keine Inventar- oder Extravars-Datei bleibt entpackt auf der Festplatte der RTE. RTEs können sich ein `RTE_CACHE_PATH` teilen; jede hält ihre Jobs in
einem eigenen Ordner, und der Ordner einer RTE, die angehalten hat (mitten im Job beendet oder mit einem anderen Hostnamen neu erstellt), wird von den anderen
nach 10 Minuten entfernt. Ein Ordner, der größer ist als [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (standardmäßig 512, von
der App gelesen, ohne Neustart angewendet), wird nicht gesendet: Der Job schlägt fehl und sagt, dass der Ordner stattdessen bei der RTE eingehängt werden soll. Der ssh-Ordner wird nie gesendet: Die RTE behält ihren eigenen
privaten Schlüssel und ihre `known_hosts` in `/home/node/.ssh`.

**Hosts und Tasks.** Seit 7.3.0 erfasst eine RTE in jedem Modus die strukturierten Ereignisse eines Playbooks neben seiner Textausgabe: jedes Play, jeden Task und
jedes Host-Ergebnis sowie die Zusammenfassung, geschrieben von ihrem Callback-Plugin `af_events`. Die Jobseite zeigt sie unter **Hosts und Tasks** (siehe
[Einen Job verfolgen](../jobs/following.html#hosts-and-tasks)).

---

## Netzwerk

Was zwischen der App, der RTE und den verwalteten Hosts zu öffnen ist, pro Modus:

| Modus | Von | Nach | Port |
|---|---|---|---|
| Ausgehend | Die RTE | Die App, unter `APP_URL` | Der Port der App (`443` hinter den meisten Proxys) |
| Eingehend | Die App-Knoten | Die RTE, unter der Adresse ihres Runners | Der `PORT` der RTE (`8000`) |
| Datenbank (veraltet) | Die RTE sowie die App-Knoten und der Worker | Die Datenbank und die RTE | `3306` und der `PORT` der RTE |
| Jeder Modus | Die RTE | Die verwalteten Hosts | ssh (`22`), WinRM, ihre APIs |

In einem Socket-Modus verbindet sich die RTE nie mit der Datenbank. Ihre API beantwortet nur den Socket und die Probes: `/live`, `/ready`, `/metrics`.
