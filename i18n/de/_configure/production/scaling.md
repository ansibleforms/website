---
layout: default
title: Skalierung
parent: Betrieb in Produktion
nav_order: 4
translated_from: d18732c9af35c09cfbe63654540f98a730463f43
---

# Skalierung
{: .no_toc }

AnsibleForms aufgeteilt auf mehrere Controller-Knoten und einen Worker, neben einer oder mehreren RTEs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rollen

Jeder AnsibleForms-Container führt denselben Servercode aus, und [`AF_ROLE`](../customization/server.html#env_AF_ROLE) entscheidet, was er tut:

| `AF_ROLE` | Image | Führt aus | Wie viele |
|---|---|---|---|
| `all` (nicht gesetzt) | `ansibleforms` | Die Weboberfläche und die API des Controllers sowie den Worker in einem Prozess: der Standard | 1 |
| `controller` | `ansibleforms` | Die Weboberfläche und die API | Beliebig viele, hinter einem Load Balancer |
| `worker` | `ansibleforms` | Die Hintergrundarbeit: das Datenbankschema und seine Upgrades, den Config-Seed, die Zeitpläne, das nächtliche Backup, die Synchronisierung der Repositories und die Bereinigungen | Einer arbeitet; weitere warten und übernehmen |
| `rte` | `ansibleforms-rte-full` (oder `-rte-core`, `-rte-base`) | Die Playbooks | Beliebig viele |

Die kleinste Installation ist ein Container ohne `AF_ROLE` neben einer RTE: Das ist es, was das [Docker Compose-Projekt](../installation/docker-compose.html)
und das [Helm-Chart](../installation/kubernetes.html) ausführen. Jeder andere Wert von `AF_ROLE` beendet den Prozess bei seinem Start.

Bis 7.7 hieß die Rolle `controller` `app`. Ab 7.8.0 ist `AF_ROLE=app` veraltet und wird in 8.0 entfernt: Es läuft weiterhin als
`controller`, mit einer Warnung im Protokoll beim Start, und der Knoten behält seinen Namen `app-`, sodass er nach dem Upgrade seine eigenen Jobs wiederfindet.

---

## Die RTE

Die RTE, die Laufzeitumgebung, die die Playbooks ausführt, hat einen eigenen Abschnitt: [Laufzeitumgebungen](../rte/). Er behandelt, wie eine RTE
einen Job ausführt, [ihre Images](../rte/images.html), [wie man eine betreibt](../rte/run.html), [mehrere RTEs](../rte/several.html) als Runner oder
Replikate und [eine RTE in einem anderen Rechenzentrum](../rte/another-datacenter.html).

---

## Mehrere Controller-Knoten

Um mehr Benutzer zu bedienen oder den Ausfall eines Knotens zu überstehen, teilen Sie AnsibleForms in `controller`-Knoten hinter einem Load Balancer und einen `worker` auf.

### Was die Knoten teilen
{: .no_toc }

Die Knoten stimmen sich über die Datenbank und ein gemeinsames Volume miteinander ab:

* **Die Datenbank** : die Jobs, die Worker-Sperre, die Designer-Sperre, die Liste der Knoten, die Runner-Leases (welcher Controller-Knoten den
  Socket jeder RTE hält) und die Änderungsmeldungen, die die Caches jedes Knotens aktuell halten. Anmeldedaten, ein Runner oder ein Zeitplan, auf
  einem Knoten bearbeitet, gelten innerhalb von 5 Sekunden auf allen
* **Das persistente Volume** (`/app/dist/persistent`) : Formulare, die Konfiguration, Repositories, Uploads, Backups und die verwaltete `.env`.
  Jeder Controller-Knoten und der Worker hängen dasselbe ein, mit Lese- und Schreibzugriff
* **Der ssh-Ordner** (`/home/node/.ssh`) : der Schlüssel und die bekannten Hosts für Git über SSH; der Worker erzeugt den Schlüssel bei seinem ersten Start
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : auf jedem Controller-Knoten gleich, sonst wird ein von einem
  Knoten signiertes Token vom nächsten abgewiesen. Ein Controller-Knoten verweigert ohne es den Start
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : auf jedem Controller-Knoten und Worker gleich, sonst können
  von einem gespeicherte Anmeldedaten von einem anderen nicht gelesen werden. Eine RTE im Socket-Modus liest es nie; nur eine veraltete RTE im Datenbankmodus,
  die sich selbst registriert, braucht es

Geben Sie außerdem jedem Container denselben Datenbankbenutzer: Ein wartender Worker kann die Sitzung eines toten nur beenden, wenn es seine eigene ist.

### Die Worker-Sperre
{: .no_toc }

Es arbeitet immer nur ein Worker. Er hält die Datenbanksperre `ansibleforms_worker`; hält er an, gibt die Datenbank die Sperre frei, und ein
wartender Worker übernimmt sie innerhalb von 10 Sekunden. Stirbt der Host des Workers ohne Abschied, könnte die Datenbank die Sperre stundenlang behalten,
daher beendet ein wartender Worker diese Sitzung, sobald zwei Minuten lang kein Worker einen Heartbeat geschrieben hat, und übernimmt.

Ein Worker, der die Sperre an einen anderen verliert, hält an, und sein Container startet als der wartende neu. Ein Worker, dessen Start fehlschlägt, hält
ebenfalls an, damit er nie die Sperre hält, ohne etwas zu tun. Galera und Group Replication teilen die Sperre nicht zwischen Datenbankknoten: Richten Sie jeden
Worker auf denselben Datenbankknoten.

### Jobs und Knoten
{: .no_toc }

Jeder Container benennt sich selbst als `<role>-<hostname>-<port>`, ohne dass etwas zu setzen ist, und die Seite **Status** listet sie alle mit ihrer Rolle
und Version auf, welcher der Worker ist, und eine Warnung, wenn sie unterschiedliche Versionen ausführen.

Ein Job, der auf einer RTE läuft, gehört dieser RTE und läuft weiter, wenn der Controller-Knoten, der ihn gestartet hat, wegfällt. Jeder andere Job (ein Template-Job
auf AWX oder einem anderen Runner, ein Workflow-Job oder die Schritte eines veralteten mehrstufigen Formulars) gehört dem Controller-Knoten, der ihn gestartet hat. Ein Container, der neu startet, beendet seine eigenen unvollendeten Jobs, und der
Worker beendet die Jobs eines Containers, der zwei Minuten lang nicht mehr geantwortet hat, etwa eines ersetzten Pods.

Ein an einen beliebigen Knoten gesendetes `SIGHUP` wendet den [Config-Seed](../seed/) erneut an: Ein Controller-Knoten bittet den Worker darum.

### Upgrade
{: .no_toc }

Aktualisieren Sie **zuerst den Worker**, dann die Controller-Knoten. Der Worker patcht das Schema, und ein Controller-Knoten der neuen Version wartet, bis das
Schema gepatcht ist, und protokolliert, worauf er wartet. Zuerst aktualisierte Controller-Knoten bleiben nicht bereit, bis der Worker nachzieht, während die alten weiter
bedienen. RTEs können jederzeit folgen, solange sie denselben Vertrag sprechen.

### Grenzen
{: .no_toc }

Einige Dinge bleiben bei einem Knoten:

* **Der Chat-Assistent** hält seine Unterhaltungen im Speicher eines Controller-Knotens: Verwenden Sie Sticky Sessions am Load Balancer (nginx
  `ip_hash`) oder einen einzigen Controller-Knoten
* **Protokolle** bleiben in jedem Container. Legen Sie [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) außerhalb des gemeinsamen Volumes ab, da mehrere
  Prozesse, die eine Datei rotieren, Zeilen verlieren. Der Protokoll-Viewer zeigt das Protokoll des antwortenden Knotens, sammeln Sie die Protokolle also zentral
* **Einstellungen**, die auf den Einstellungsseiten geändert werden, werden in die verwaltete `.env` auf dem gemeinsamen Volume geschrieben und gelten auf jedem Knoten; die,
  die einen Neustart brauchen, brauchen ihn auf jedem Knoten

---

## Beispielaufbau

Das Docker-Repository hat einen vollständigen Ausgangspunkt in [scale](https://github.com/ansibleforms/docker/tree/main/scale):

| Dienst | Image | Rolle |
|---|---|---|
| `db` | `mariadb:11` | Die Datenbank, mit einem Benutzer, der nur Rechte auf das Schema `AnsibleForms` hat |
| `controller1`, `controller2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=controller`, hinter dem Load Balancer |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: der zweite wartet und übernimmt |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Führt die Playbooks mit `RTE_MODE=inbound` und `RTE_FILES=local` aus: der Controller wählt sich bei ihr ein |
| `lb` | `nginx:stable` | Terminiert HTTPS auf Port 8443 und verteilt die Browser mit `ip_hash` auf die Controller-Knoten |

Der Runner `rte` der RTE und die Anmeldedaten, mit denen er sich anmeldet (ihre Adresse `http://rte:8000` und `RTE_TOKEN`), sind im
[Config-Seed](../seed/) `seed.yaml` deklariert, den der Worker bei jedem Start anwendet; die RTE setzt kein `RTE_URL` und wird auf dem Host nicht veröffentlicht.

Die Controller-Knoten und die Worker teilen eine `.env`, mit dem Datenbankbenutzer, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` hinter dem Load Balancer und einem `LOG_PATH` außerhalb des gemeinsamen Volumes. Die RTE hat keine `env_file`: Sie erhält
nur `RTE_TOKEN` aus `compose.yaml` und enthält daher kein Datenbankpasswort. Die Controller-Knoten, die Worker und die RTE hängen dieselben
persistenten und ssh-Volumes ein:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
