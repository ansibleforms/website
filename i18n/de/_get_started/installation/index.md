---
layout: default
title: Installation
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Installation
{: .no_toc }

Wählen Sie eine Installationsmethode für AnsibleForms
{: .fs-6 .fw-300 }

---

Für Administratoren, die eine neue Instanz einrichten: wählen Sie eine Installationsmethode und folgen Sie dann ihrer Seite.

---

## In diesem Abschnitt

AnsibleForms unterstützt mehrere Installationsmethoden, jede auf einer eigenen Seite beschrieben:

| Seite | Was sie behandelt |
|---|---|
| [Installer](installer.html) | Ein Befehl, der einen Controller oder einen Runner auf Docker, Podman, Kubernetes oder nativ installiert und ihn danach aktualisiert und sichert |
| [Nativ](native.html) | Die Installation des Installers ohne Container: Node.js, MariaDB und Ansible auf dem Server, AnsibleForms als systemd-Dienste |
| [Docker](docker.html) | MySQL installieren und das fertige Docker-Image mit den nötigen Umgebungsvariablen starten |
| [Docker Compose](docker-compose.html) | Das [docker-compose-Projekt](https://github.com/ansibleforms/docker) herunterladen und mit docker-compose sowohl MySQL als auch AnsibleForms starten |
| [Aus dem Quellcode](from-source.html) | Alle Abhängigkeiten von Hand installieren, dann den Code bauen und starten |
| [Kubernetes](kubernetes.html) | Das Helm-Chart installieren und AnsibleForms samt MySQL-Datenbank mit Kubernetes starten |

{: .note }
> **Empfehlung** Der Installer ist seit 7.3.0 der schnellste Weg zu einer funktionierenden Instanz: er richtet aus wenigen Fragen das Docker-Compose-Projekt auf
> Docker oder Podman oder eine der anderen Methoden ein. Die Docker-Images enthalten alle Abhängigkeiten.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Um eine bestehende Installation auf eine neuere Version zu bringen, siehe [Aktualisieren](../upgrading/).

Jede Methode betreibt neben der App eine RTE, den Container (oder Dienst), der die Playbooks ausführt. Um eine weitere hinzuzufügen, auf einem anderen Host oder in einem anderen
Rechenzentrum, installieren Sie einen Runner mit dem [Installer](installer.html#a-runner): er verbindet sich über einen WebSocket mit AnsibleForms (ausgehend, siehe
[Modi](../rte/modes.html)) und hält keine Datenbank-Anmeldedaten. Siehe auch [Laufzeitumgebungen](../rte/) und das Runbook
[Eine RTE in einem anderen Rechenzentrum](../rte/another-datacenter.html).

---

## Image-Tags

Das Image wird als `ghcr.io/ansibleforms/ansibleforms` in der GitHub Container Registry veröffentlicht, die zum
Projekt gehört und anonyme Pulls nicht drosselt. Jede Version ab 7.0.0 wird nur dort veröffentlicht, und die 6.x-Versionen
liegen ebenfalls dort.

Seit 7 laufen Playbooks auf einer RTE, die in drei Schichten neben der App veröffentlicht wird (siehe [Die RTE-Images](../rte/images.html)):

| Image | Was es ist |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | Die Webanwendung und die API, ohne python und ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Die RTE ohne python und ansible: die Basis für eine eigene |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | Die Basis mit python, ansible-core und einigen Bibliotheken: das Image, dem Sie Ihre Collections hinzufügen |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Das Core-Image mit dem Paket `ansible`, seinen Collections und Bibliotheken: die Standard-RTE |

Die vier Images werden im selben Lauf gebaut und tragen dieselben Tags, daher passt ein RTE-Tag immer zu dem der App.

Das alte Docker-Hub-Repository, `ansibleguy/ansibleforms`, wird nicht mehr aktualisiert. Es behält seine bisherigen
Versionen, erhält aber keine neuen Versionen mehr, in keiner der beiden Linien. Wenn Sie von dort ziehen, wechseln Sie
zu `ghcr.io/ansibleforms/ansibleforms` mit demselben Tag, um weiterhin Updates zu erhalten.

Auf jedem Image gibt es die folgenden Tags; die RTE-Images beginnen bei 7.0.0 und haben daher keine 6.x-Tags:

| Tag | Zeigt auf |
|---|---|
| `latest` | die neueste Version der neuesten Hauptversion |
| `7`, `6` | die neueste Version dieser Hauptversion |
| `7.0`, `6.5` | die neueste Version dieser Nebenversion |
| `7.0.0`, `6.5.5` | genau diese Version |
| `latest-rc` | den neuesten Release Candidate, oder die neueste Version, wenn diese neuer ist; jeder Kandidat hat zusätzlich ein eigenes Tag |

`latest` bewegt sich nur vorwärts: ein Patch für eine ältere Hauptversion (zum Beispiel ein 6.5.x, das
nach 7.0.0 erscheint) verschiebt `6` und `6.5`, aber nie `latest`.

Um bei einer Hauptversion zu bleiben, verwenden Sie ihre Nummer (`6`) statt `latest`.
