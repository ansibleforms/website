---
layout: default
title: Installer
parent: Installation
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# Der Installer
{: .no_toc }

AnsibleForms auf einem Linux-Server installieren, aktualisieren und pflegen, mit einem Befehl
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: der schnellste Weg zu einer funktionierenden Instanz oder zu einem Runner für ein anderswo installiertes AnsibleForms. Seit 7.3.0.

---

## Was er installiert

Der Installer stellt in einem Vollbild-Assistenten einige Fragen, zeigt jede Antwort zur Prüfung an und ändert erst dann den Server.
Er installiert eine von zwei Rollen, auf einer von vier Engines:

| Rolle | Was sie ist |
|---|---|
| Controller | Die vollständige Anwendung: die Weboberfläche, ihre Datenbank und ihr eigener Runner. Wählen Sie dies für eine Erstinstallation |
| Runner | Eine RTE, die die Playbooks eines anderswo installierten AnsibleForms ausführt, etwa in einem anderen Netzwerk, einer DMZ oder einem anderen Rechenzentrum. Sie spricht mit AnsibleForms über einen einzigen WebSocket und hält keine Datenbank-Anmeldedaten |

Die Engines, auf denen er sie installiert:

| Engine | Wie sie läuft |
|---|---|
| Docker | Das [Docker-Compose-Projekt](docker-compose.html), auf Docker Engine mit dem Compose-Plugin. Die Container starten zusammen mit Docker neu |
| Podman | Dasselbe Projekt auf Podman, rootless oder als root, mit podman-compose. Eine systemd-Unit startet die Container beim Booten |
| Kubernetes | Das [Helm-Chart](kubernetes.html), auf dem Cluster, den `kubectl` erreicht. Ein Controller wird hinter einem Ingress bereitgestellt; ein Runner nutzt den Runner-Modus des Charts |
| Direkt auf diesem Server | Keine Container: Node.js, MariaDB und Ansible auf dem Server und AnsibleForms als systemd-Dienste. Siehe [Native Installation](native.html) |

Nach der Installation aktualisiert dasselbe Programm die Installation, sichert sie, zeigt ihren Status und entfernt sie. Es übernimmt auch ein
AnsibleForms, das es nicht installiert hat, etwa eines, das von Hand aus dem Docker-Compose-Projekt eingerichtet wurde (siehe [Eine bestehende Installation](#an-existing-installation)).

---

## Ausführen

Das Installationsskript lädt den Installer für diesen Server herunter und startet ihn:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Die üblichen Varianten: als root, um Docker oder Podman zu installieren, um direkt auf dem Server oder unter `/opt` zu installieren; mit einem Befehl oder
Flags (siehe [Flags](#flags)); und ein Installer einer bestimmten Version statt der neuesten:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

Das Skript:

1. Prüft, dass der Server Linux auf amd64 oder arm64 betreibt, und sucht `curl` oder `wget` sowie `sha256sum`
2. Lädt `ansibleforms-installer_linux_<arch>` aus der neuesten Version von
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases) herunter, oder aus der Version, die `AF_INSTALLER_VERSION` nennt
3. Prüft ihn gegen die `checksums.txt` der Version und verwendet keinen Download, dessen Prüfsumme abweicht
4. Behält ihn als `ansibleforms-installer`, in `/usr/local/bin` für root und sonst in `~/.local/bin`, für die späteren Aktualisierungen und Backups.
   Über sudo starten Sie ihn mit seinem vollständigen Pfad: der `secure_path` von sudo, etwa auf Red-Hat-Systemen, lässt `/usr/local/bin` oft weg
5. Startet ihn mit den angegebenen Flags und liest die Tastatur vom Terminal, obwohl das Skript über eine Pipe kam

Ohne Terminal, etwa in einem CI-Job, läuft der Installer unbeaufsichtigt (siehe [Unbeaufsichtigt](#unattended)).

---

## Der Assistent

Der Assistent stellt eine Frage nach der anderen, mit den Schritten links aufgelistet. **Esc** geht zum vorherigen Schritt zurück, dessen Antwort erhalten bleibt:

| Schritt | Was er fragt |
|---|---|
| Sprache | Die Sprache des Installers, standardmäßig aus der Locale dieses Servers: Katalanisch, Deutsch, Englisch, Spanisch, Französisch, Italienisch, Japanisch, Niederländisch, Polnisch, Portugiesisch oder Chinesisch. Wird zuerst gefragt, bevor der Installer etwas über eine gefundene Installation sagt |
| Release Notes | Was in der installierten Version neu ist, mit den inkompatiblen Änderungen, Entfernungen und Abkündigungen zuerst |
| Rolle | Controller oder Runner |
| Engine | Docker, Podman, Kubernetes oder direkt auf diesem Server |
| Ordner | Der Installationsordner und der Instanzname |
| Beitreten, App, Modus | Nur ein Runner: siehe [Ein Runner](#a-runner). Den Modus nicht auf Kubernetes |
| Netzwerk | Der Port der Weboberfläche oder des Runners. Nicht auf Kubernetes |
| HTTPS | Wie Browser sich mit einem Controller verbinden |
| Admin | Das Passwort des ersten Admins, zweimal eingegeben |
| Cluster, Ingress, Speicher | Nur Kubernetes: Namespace und Release, der Ingress (ein Controller), die Storage-Klasse |
| Prüfung | Jede Antwort: **Installieren** oder **Antworten ändern** |

**Engine.** Die Liste zeigt, was dieser Server hat. Eine fehlende Engine wird als *Docker (nicht installiert: der Installer installiert es)*
angeboten, ebenso für Podman: sobald Sie bestätigen, installiert der Installer Docker mit dem eigenen Skript von Docker (`get.docker.com`, mit
Compose-Plugin) oder Podman mit podman-compose aus den Paketen der Distribution. Das erfordert root. Kubernetes wird angeboten, wenn `kubectl` und
`helm` installiert sind und einen Cluster erreichen. *Direkt auf diesem Server* erfordert root und ein unterstütztes Linux und sagt, warum, wenn es ausgegraut ist.

**Ordner.** Die Standardwerte:

| | Controller | Runner |
|---|---|---|
| Ordner, als root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Ordner, als anderer Benutzer | `~/ansibleforms` | `~/ansibleforms-runner` |
| Instanzname, Docker oder Podman | `af` | `runner` |
| Instanzname, nativ | `ansibleforms` | `ansibleforms-runner` |

Bei Docker oder Podman enthält der Ordner die Compose-Datei und ihre `.env` mit den Secrets sowie alle Daten: Datenbank, Formulare, Playbooks
und Protokolle. Er muss leer sein. Der Instanzname, aus Kleinbuchstaben, Ziffern und `-`, ist das Präfix der Container (`af_app`, `af_db`, `af_rte`), sodass mehrere
Instanzen sich einen Server teilen können. Der Instanzname eines Runners ist auch der Name seines Runners unter **Verbindungen > Runner** (`RTE_NAME`).

**Netzwerk.** Die Weboberfläche eines Controllers lauscht auf `443` oder dem nächsten freien Port. **HTTPS** bietet dann an:

| Auswahl | Was sie bewirkt |
|---|---|
| HTTPS mit einem für diesen Server erstellten selbstsignierten Zertifikat | Ein Zertifikat für die Namen dieses Servers, zehn Jahre gültig. Browser bitten Sie einmal, es zu akzeptieren |
| HTTPS mit eigenem Zertifikat und Schlüssel | Ihr eigenes Zertifikat und Ihr eigener Schlüssel im PEM-Format, von Ihrer CA oder von Let's Encrypt |
| HTTP, HTTPS übernimmt ein vorgeschalteter Reverse Proxy | Reines HTTP auf dem Port, für nginx, Traefik oder einen Load Balancer, der HTTPS übernimmt |

**Admin.** Das Passwort des Benutzers `admin`, zweimal eingegeben, damit ein Tippfehler Sie nicht aussperrt. Bleibt es leer, erzeugt der Installer ein
starkes.

**Der Abschluss.** Der Installer erzeugt das Datenbankpasswort und die Secrets, startet AnsibleForms und wartet, bis es antwortet. Dann
zeigt er die zu öffnende Adresse, den Benutzer und das Passwort sowie den Ordner. Für ihn installierte Runner bitten um Beitritt, und ein Admin gibt sie
unter **Verbindungen > Runner** frei (siehe [Ein Runner](#a-runner)).

---

## Ein Runner

Ein Runner ist eine RTE für ein AnsibleForms, das anderswo läuft, ab Version 7.3.0. Er hält keine Datenbank-Anmeldedaten: er meldet sich
mit einem eigenen Token an, das AnsibleForms in RTE-Anmeldedaten aufbewahrt (siehe [Modi](../rte/modes.html)). Nach dem Ordner fragt der Assistent
drei weitere Dinge:

| Schritt | Was er fragt |
|---|---|
| App | Die Adresse des AnsibleForms, für das dieser Runner arbeitet, die Adresse, die man im Browser öffnet |
| Modus | **Ausgehend: der Runner verbindet sich mit AnsibleForms** (Standard) oder **Eingehend: AnsibleForms verbindet sich mit dem Runner** |
| Netzwerk | Der Port des Runners, standardmäßig `8000`. Ausgehend lauschen darauf nur die Health Checks, nur von diesem Server aus erreichbar. Eingehend zusätzlich die Adresse dieses Servers, wie AnsibleForms sie erreicht |

`--role runner` überspringt die Frage nach der Rolle, sodass dieser Befehl, auf dem Server des Runners ausgeführt, mit den Fragen eines Runners beginnt:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

Der Installer verbindet sich dann mit AnsibleForms. Bei einem selbstsignierten Zertifikat oder einem von einer privaten CA fragt er **Diesem Zertifikat vertrauen?**:
ja setzt [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) auf dem Runner. Er liest die Version, die AnsibleForms betreibt,
lehnt eine ältere als 7.3.0 ab und installiert den Runner mit genau dieser Version, unabhängig davon, welche Version der Installer selbst installieren würde.

Wählen Sie ausgehend für eine DMZ, NAT oder eine Zone, die keine eingehenden Verbindungen erlaubt: nur Verkehr von diesem Server zu AnsibleForms, auf dessen
Port. Wählen Sie eingehend für Netzwerke, in denen die zentrale Seite jede Verbindung öffnet.

Die Prüfung zeigt **Registrierung: bittet um Freigabe** oder **selbst, mit einem Beitritts-Token**, wenn `--join` eines angegeben hat. Am Ende zeigt der Installer
den Namen des Runners, seinen Modus, die App und, bei eingehend, seine Adresse, und sagt dann, dass er um Beitritt zu AnsibleForms gebeten hat: geben Sie ihn unter
**Verbindungen > Runner** frei, nachdem Sie geprüft haben, dass der dort angezeigte Fingerabdruck derjenige ist, den er ausgibt:

```
Fingerprint: abcd-ef12
```

Der Fingerabdruck sind die ersten 8 Hexadezimalziffern des SHA-256 des Tokens des Runners, `RTE_TOKEN`, das in der `.env`-Datei des Ordners
aufbewahrt wird (`rte.env` bei einer [nativen Installation](native.html)). Siehe [Eine RTE freigeben](../runners/registration.html#approving-an-rte). Mit `--join` wird der Runner sofort freigegeben:
er hat sich selbst registriert und erscheint unter **Verbindungen > Runner** als verbunden.

Ein eingehender Runner stellt seinen Socket über HTTPS bereit. Der Installer erstellt ein selbstsigniertes Zertifikat für die Adresse, unter der AnsibleForms
ihn erreicht, zehn Jahre gültig, im Ordner `data/certificates`, und setzt `RTE_URL` auf `https://<address>:<port>`.
Der Runner sendet das Zertifikat, wenn er um Beitritt bittet, und AnsibleForms pinnt es: es verbindet sich mit diesem Runner nur, wenn er genau
dieses Zertifikat vorlegt, daher ist keine CA nötig. Der Installer gibt den Fingerabdruck des Zertifikats unter dem des Tokens aus:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

Es sind die ersten 8 Hexadezimalziffern des SHA-256 der DER-Bytes des Zertifikats, als `xxxx-xxxx`. Bevor Sie den Runner freigeben,
prüfen Sie, dass der Freigabedialog denselben Zertifikat-Fingerabdruck zeigt. Ein mit `--join` registrierter Runner gibt ihn ebenfalls aus.

Auf Kubernetes ist ein Runner der Runner-Modus des Helm-Charts und immer ausgehend: der Assistent fragt weder nach Modus noch nach Netzwerk, da ihn
nichts von außen erreicht (siehe [Kubernetes](#kubernetes)).

---

## Kubernetes

Für einen Controller auf Kubernetes installiert der Installer das [Helm-Chart](kubernetes.html) auf dem Cluster, den `kubectl` erreicht:

| Frage | Standard |
|---|---|
| Namespace | `ansibleforms` |
| Name des Helm-Release | `ansibleforms` |
| Vom Ingress bereitgestellter Hostname | Keiner: Pflichtangabe, etwa `ansibleforms.example.com` |
| Ingress-Klasse | Eine des Clusters, standardmäßig `nginx` |
| Über HTTPS bereitstellen (mit dem Zertifikat des Ingress)? | Ja |
| Storage-Klasse für die Volumes | Der Standard des Clusters |

Das Admin-Passwort steht im Secret `<release>-secrets` dieses Namespace, unter dem Schlüssel `ADMIN_PASSWORD`. Der Installer bewahrt die
Chart-Values in einer Datei neben seiner Statusdatei auf, `<release>-values.yaml`, und wendet sie bei Aktualisierungen erneut an; `--values` fügt eine eigene Datei hinzu. Das Chart einer Version wird kurz nach ihr veröffentlicht.

Für einen Runner installiert der Installer dasselbe Chart in seinem [Runner-Modus](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`): eine RTE
allein, ohne App, ohne Datenbank und ohne Ingress, die sich mit AnsibleForms verbindet (ausgehend). Nach der Adresse der App fragt der Assistent:

| Frage | Standard |
|---|---|
| Namespace | `ansibleforms` |
| Name des Helm-Release | `ansibleforms-runner`, das ist auch der Name seines Runners unter **Verbindungen > Runner** |
| Storage-Klasse für die Volumes | Der Standard des Clusters |

Der Installer erzeugt das Token des Runners und setzt die Adresse der App, den Namen des Runners und, wenn Sie dem Zertifikat der App vertrauen,
`runner.appTlsVerify: false`. Mit `--join` gibt das Beitritts-Token den Runner sofort frei; ohne es bittet der Runner um Beitritt, und der
Installer gibt seinen Fingerabdruck aus, den Sie prüfen, bevor Sie ihn unter **Verbindungen > Runner** freigeben.

---

## Befehle

Der Installer nimmt einen Befehl, vor oder nach seinen Flags. Ohne Befehl installiert er:

| Befehl | Was er tut |
|---|---|
| `install` | AnsibleForms installieren, als Controller oder Runner (Standard). Auf einem Server, der bereits eine Installation hat, eine eigene oder eine gefundene, bietet er an, sie zu aktualisieren |
| `upgrade` | Auf eine neuere Version aktualisieren, mit vorheriger Anzeige ihrer Release Notes (siehe [Aktualisieren](#upgrade)) |
| `status` | Die Installation (ihre Rolle, Engine und Version) und ihre Container, Pods oder Dienste zeigen, und ob sie antwortet. Danach listet er jedes weitere AnsibleForms auf, das er auf dem Server findet |
| `backup` | Die Datenbank jetzt sichern, nach `installer-backups` im Installationsordner (auf Kubernetes nach `backups` neben der Statusdatei des Installers). Ein Runner hält keine zu sichernden Daten |
| `release-notes` | Die Release Notes einer Version zeigen, `--version` oder die dieses Installers, inkompatible Änderungen zuerst |
| `uninstall` | Die Installation entfernen, und mit `--purge` ihre Daten |
| `version` | Die Version des Installers ausgeben |

Der Installer merkt sich die Installation in `/etc/ansibleforms/installer.json` für root oder `~/.config/ansibleforms/installer.json`
für einen anderen Benutzer, sodass die Befehle nach `install` keine Flags brauchen und die Installation selbst finden. Dieser Ordner enthält kein Binary
und existiert erst, wenn der Installer ein AnsibleForms installiert oder übernommen hat:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` fragt **Auch die Daten löschen (Datenbank, Formulare, Playbooks, Logs)?**. Um sie zu löschen, geben Sie den Namen der Instanz ein (auf Kubernetes das Helm-Release);
andernfalls entfernt er die Container, Pods oder Dienste und behält die Daten.

---

## Flags

Jedes Flag beantwortet eine Frage, die der Assistent dann überspringt. `ansibleforms-installer --help` listet sie auf:

| Flag | Was es beantwortet |
|---|---|
| `--lang <code>` | Die Sprache: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` oder `zh` |
| `--version <version>` | Die AnsibleForms-Version, die installiert oder auf die aktualisiert wird; standardmäßig die dieses Installers |
| `--role <role>` | `controller` oder `runner` |
| `--mode <mode>` | `compose`, `kubernetes` oder `native` |
| `--runtime <runtime>` | `docker` oder `podman` (compose) |
| `--install-runtime` | Docker oder Podman installieren, wenn sie fehlen, ohne zu fragen |
| `--dir <folder>` | Der Installationsordner (compose) |
| `--name <name>` | Der Instanzname, das Präfix seiner Container (compose, standardmäßig `af`) |
| `--port <port>` | Der Port auf dem Host: die Weboberfläche bei einem Controller, die RTE bei einem Runner |
| `--tls <choice>` | `self`, `own` oder `off` (ein Compose-Controller) |
| `--cert <file>`, `--key <file>` | Die Zertifikats- und Schlüsseldateien, mit `--tls own` |
| `--admin-password <password>` | Das Passwort des ersten Admins; standardmäßig erzeugt |
| `--join <token>` | Ein über die API erstelltes Beitritts-Token (`afj_...`), das den Runner sofort freigibt (ein Runner, unbeaufsichtigt; siehe [Beitritts-Tokens](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | Die Adresse der App, etwa `https://forms.example.com` (ein Runner) |
| `--runner-mode <mode>` | `outbound` (die RTE verbindet sich mit der App) oder `inbound` (die App verbindet sich mit der RTE) (ein Runner) |
| `--host <address>` | Die Adresse dieses Servers, mit der sich die App verbindet (ein eingehender Runner) |
| `--namespace <namespace>` | Der Kubernetes-Namespace, standardmäßig `ansibleforms` |
| `--release <release>` | Das Helm-Release, standardmäßig `ansibleforms` |
| `--hostname <name>` | Der Hostname des Ingress (kubernetes) |
| `--ingress-class <class>` | Die Ingress-Klasse (kubernetes) |
| `--storage-class <class>` | Die Storage-Klasse (kubernetes) |
| `--values <file>` | Eine zusätzliche Helm-Values-Datei (kubernetes) |
| `--purge` | Mit `uninstall`: auch die Daten löschen |
| `--source <folder>` | Eine lokale Kopie des Repositorys [ansibleforms/docker](https://github.com/ansibleforms/docker), aus der installiert wird (air-gapped) |
| `--bundle <file>` | Ein Release-Bundle, `ansibleforms-<version>-linux-<arch>.tar.gz`, aus dem nativ installiert wird (siehe [Native Installation](native.html#air-gapped)) |
| `--yes` | Jede Frage mit ihrem Standard beantworten (unbeaufsichtigt) |
| `--verbose` | Jeden ausgeführten Befehl anzeigen |

---

## Unbeaufsichtigt

Mit `--yes` oder ohne Terminal fragt der Installer nichts: die Flags beantworten ihre Fragen, die Standardwerte den Rest. Er
überspringt die Sprache, die Release Notes, das Admin-Passwort (erzeugt, sofern `--admin-password` keines angibt) und die Prüfung und gibt
stattdessen den Link zu den Release Notes aus. Ein fehlendes Docker oder Podman installiert er nur mit `--install-runtime` oder `--yes`, und ein Runner
braucht `--app-url`. Ohne `--join` bittet der Runner um Beitritt und wartet auf die Freigabe durch einen Admin; mit dem Flag wird er sofort freigegeben.

Ein Controller auf Docker, der Docker installiert, wenn es fehlt:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Ein eingehender Runner auf Podman, mit dem sich die App unter `rte-dmz.example.com:8000` verbindet:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Eine bestehende Installation

Der Installer merkt sich in `installer.json`, was er installiert hat. Ohne diese Datei suchen `install`, `upgrade` und `status` zuerst nach einem
AnsibleForms, das bereits auf dem Server ist, egal womit es installiert wurde:

| Gefunden | Wie es gefunden wird | Übernommen, wenn |
|---|---|---|
| Docker oder Podman | Container des App- oder RTE-Images, nach Compose-Projekt gruppiert | Der Ordner enthält die Compose-Datei und die `.env` des Repositorys [ansibleforms/docker](https://github.com/ansibleforms/docker): die Dienste `mysqldb`, `app` und `rte`, in den Containern `<name>_db`, `<name>_app` und `<name>_rte` |
| Ein 7.2-Runner | Eine RTE allein in ihrem Compose-Projekt, mit den `DB_*` der App und ohne `RTE_MODE` (Datenbankmodus) | Seine Compose-Datei ist lesbar. Seine Aktualisierung stellt ihn auf einen Socket-Modus um (siehe [Ein 7.2-Runner](#a-72-runner)) |
| Kubernetes | Helm-Releases des Charts `ansibleforms` sowie Deployments und StatefulSets seiner Images | Es ist ein Release des Charts: seine aktuellen Values werden zu seiner Values-Datei |
| Nativ | systemd-Dienste, die AnsibleForms mit Node.js betreiben | Sie folgen dem Layout des Installers: `releases/`, `current`, `app.env` und `rte.env` (siehe [Native Installation](native.html#the-folder)) |
| Keine Engine | Die App oder eine RTE, die auf einem üblichen Port antwortet: 443, 3000, 3001, 8000, 8001, 8010 oder 8443 | Nie: es läuft aus dem Quellcode oder von Hand. Der Installer meldet es nur |

Nur die Images der App und der RTE zählen: ein nach AnsibleForms benannter MySQL-Container ist keine Installation. Der Installer listet auf, was
er gefunden hat, eine Zeile pro Fund, mit dem Grund und dem, was von Hand zu tun ist, wenn er eine nicht übernehmen kann: ihre Compose-Datei ist nicht die des Repositorys,
ihre Datenbank liegt außerhalb ihres Compose-Projekts, sie läuft auf Kubernetes ohne das Helm-Chart, sie wird von Argo CD verwaltet (aktualisieren Sie sie dort,
indem Sie die Chart-Version der Application ändern), oder ihre Version ist nicht lesbar.

Für eine Installation, die er übernehmen kann, bietet `install` drei Möglichkeiten an:

| Auswahl | Was sie bewirkt |
|---|---|
| Übernehmen und aktualisieren | Zeigt, was er sich merken wird, schreibt dann nach Ihrer Bestätigung `installer.json` und fährt mit der [Aktualisierung](#upgrade) fort |
| Trotzdem ein neues AnsibleForms daneben installieren | Eine zweite Installation, mit eigenem Ordner, eigenen Ports und eigener Datenbank, nach einer eigenen Bestätigung |
| Abbrechen | Es wird nichts geändert |

Für eine Installation, die bereits die Version betreibt, die der Installer installieren würde, heißt die erste Möglichkeit stattdessen **Übernehmen**: der Installer
merkt sich, wo sie liegt und wie sie läuft, für ihre Backups, ihren Status und die nächsten Aktualisierungen, und jetzt wird nichts geändert.

`upgrade` bietet dasselbe ohne die zweite Möglichkeit an und bricht ab, wenn nichts übernommen werden kann. Unbeaufsichtigt bricht `install` mit einer Meldung ab,
und `upgrade --yes` übernimmt eine Installation nur, wenn es genau eine findet, die es übernehmen kann. Die aktuellen Values eines Kubernetes-Release werden
neben `installer.json` gespeichert, und die Aktualisierungen wenden sie mit dem Chart der neuen Version erneut an.

---

## Aktualisieren

`ansibleforms-installer upgrade` bringt die Installation auf eine neuere Version derselben Hauptversion. Er listet die neueren Versionen auf,
die neueste zuerst (unbeaufsichtigt nimmt er die neueste), und zeigt die Release Notes jeder Version, die er überspringt, mit den inkompatiblen Änderungen
und Entfernungen zuerst. Enthalten sie inkompatible Änderungen, bittet er Sie zu bestätigen, dass Sie sie gelesen haben; unbeaufsichtigt geht es nur mit `--yes` weiter.

Der Installer sichert die Datenbank, bevor sich irgendetwas ändert. Antwortet die neue Version nicht, bietet er ein Zurücksetzen an: die vorherige
Version kommt zurück, und ihre Datenbank wird aus diesem Backup wiederhergestellt. Er führt kein Downgrade durch und überschreitet keine Hauptversion: folgen Sie
dafür der [Upgrade-Anleitung](../upgrade-7.html), zum Beispiel von 6.x auf 7.x, mit dem, was auf 6.5 vor der Aktualisierung zu tun ist.

Auf Docker oder Podman bringt die Aktualisierung eines Controllers auch seine Dateien auf den Stand der neuen Version des docker-Repositorys:

| Datei | Was die Aktualisierung tut |
|---|---|
| `docker-compose.yml` | Durch die der neuen Version ersetzt, nachdem eine Kopie in `installer-backups` gespeichert wurde |
| `.env` | Jede bestehende Zeile bleibt erhalten, und die Schlüssel, die die neue Version braucht, werden hinzugefügt, mit Secrets, die so erzeugt werden wie bei einer Neuinstallation. Vorher wird eine Kopie gespeichert |
| `data/seed.yaml` | Ersetzt, wenn es ein unveränderter Seed aus dem docker-Repository ist. Ein von Hand geänderter bleibt erhalten, und der neue wird daneben gespeichert |
| `data/` | Die neuen Dateien, die die Version mitbringt, etwa ein neues Playbook, werden hinzugefügt. Jede vorhandene Datei bleibt erhalten |

Eine fehlende Datenbankeinstellung (`MYSQLDB_USER` oder ein Passwort) lässt sich für eine bestehende Datenbank nicht erfinden, daher bricht die Aktualisierung dann vor
jeder Änderung ab. Ein Zurücksetzen stellt die Compose-Datei, die `.env` und den Seed wieder so her, wie sie waren.

Ein Runner betreibt dieselbe Version wie sein AnsibleForms: aktualisieren Sie zuerst AnsibleForms, dann seine Runner. Die Aktualisierung eines Runners schreibt seine
Compose-Datei für das neue RTE-Image neu und behält seine `.env` und seine Daten unverändert.

---

## Ein 7.2-Runner

Ein Runner aus 7.2 läuft im Datenbankmodus, der seit 7.3.0 veraltet ist: seine RTE hält die Datenbankeinstellungen von AnsibleForms. Der Installer findet
ihn (siehe [Eine bestehende Installation](#an-existing-installation)), und seine Aktualisierung stellt ihn unter demselben Runner auf einen Socket-Modus um:

1. Er liest den Namen des Runners (`RTE_NAME`) und das Token (`RTE_TOKEN`) aus dem alten RTE-Container. Hat sich die RTE nicht selbst registriert
   (`RTE_REGISTER=0`), geben Sie den Namen ein, den ihr Runner unter **Verbindungen > Runner** hat
2. Er fragt nach der Adresse der App und dem Modus, standardmäßig **ausgehend** oder eingehend, und bei eingehend nach dem Port und der Adresse dieses Servers
3. Er zeigt den Plan und sichert dann die alte Compose-Datei und die `.env` nach `installer-backups`
4. Er schreibt das Runner-Layout des Installers ohne die `DB_*`-Einstellungen. Er behält `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` und `METRICS_TOKEN`, die eine RTE im Socket-Modus weiterhin liest
5. Er startet die neue RTE neben der alten. Die neue RTE meldet sich mit dem eigenen Token des Runners an, und AnsibleForms stellt den Runner selbst auf den
   neuen Modus um, **ohne Freigabe**: seine Jobs und die Formulare, die ihn nennen, bleiben unverändert
6. Sobald die neue RTE verbunden ist, wird der alte Container gestoppt und entfernt

Ein eingehender Runner stellt HTTPS mit einem gepinnten Zertifikat bereit, wie ein neuer (siehe [Ein Runner](#a-runner)), und der Installer gibt seinen
Zertifikat-Fingerabdruck aus. Belegt die alte RTE den Port, den die neue braucht, wird sie zuerst gestoppt, sodass der Runner offline ist, bis sich die
neue verbindet. Die neue RTE eines ausgehenden Runners nimmt einen freien Port auf `127.0.0.1` und läuft ohne Unterbrechung neben der alten.

Wenn der Installer kein Token aus der alten RTE lesen kann, wählen Sie, wie sich die neue RTE anmeldet:

| Auswahl | Was folgt |
|---|---|
| Token des Runners eingeben | Das Passwort der RTE-Anmeldedaten des Runners unter **Verbindungen > Anmeldedaten**. Der Runner behält seinen Namen und seine Jobs |
| Als neuer Runner mit einem Beitritts-Token beitreten | Ein [Beitritts-Token](../runners/registration.html#join-tokens) fügt einen neuen Runner unter einem anderen Namen hinzu. Nehmen Sie den alten Runner von Hand außer Betrieb |

Verbindet sich die neue RTE nicht, bietet der Installer an, die alten Dateien zurückzulegen und den alten Container wieder zu starten; hatte AnsibleForms
den Runner bereits umgestellt, setzen Sie seinen Modus unter **Verbindungen > Runner** wieder auf Datenbank. Sobald die neue RTE verbunden ist, gibt es
kein Zurück: die alten Dateien bleiben in `installer-backups`.

Kennt AnsibleForms keinen Runner mit diesem Namen, bittet die neue RTE stattdessen um Beitritt und wartet auf eine Freigabe. Lehnen Sie diese Anfrage unter
**Verbindungen > Runner** ab und führen Sie die Aktualisierung dann erneut mit dem Namen aus, den der Runner dort hat.

---

## Versionen

Die Version des Installers folgt der der App: jede AnsibleForms-Version kommt mit einem Installer derselben Version, der mit ihr veröffentlicht wird, und
dieser Installer installiert standardmäßig diese Version. `--version` installiert eine andere. Jede Version auf der
[Releases-Seite des Installers](https://github.com/ansibleforms/installer/releases) hat Binaries für Linux auf amd64 und arm64, mit ihren
Prüfsummen.
