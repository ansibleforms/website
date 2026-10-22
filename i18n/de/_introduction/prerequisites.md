---
layout: default
title: Voraussetzungen
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Voraussetzungen
{: .no_toc }

Was Sie vor der Installation von AnsibleForms brauchen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Laufzeit

AnsibleForms läuft als Container, als systemd-Dienste auf dem Server selbst oder, für diejenigen, die es selbst bauen, als Node.js-Anwendung:

| Installation | Sie brauchen |
|---|---|
| [Installer](installation/installer.html) | Linux auf amd64 oder arm64, `curl` oder `wget` und `sha256sum`, sowie die Anforderungen der Engine, auf der er installiert (unten) |
| [Nativ](installation/native.html) | Root, systemd und ein unterstütztes Linux (Ubuntu, Debian, RHEL und seine Nachbauten, SUSE); den Rest installiert der Installer |
| [Docker](installation/docker.html) | Docker oder Podman und einen eigenen MySQL-Server |
| [Docker Compose](installation/docker-compose.html) | Docker Compose oder podman-compose; das Projekt startet auch MySQL |
| [Kubernetes](installation/kubernetes.html) | Einen Cluster, Helm 3 und eine StorageClass (oder vorab angelegte PersistentVolumes) |
| [Aus dem Quellcode](installation/from-source.html) | Node.js 26 (mindestens 24) mit npm, Git und Ansible für den RTE-Prozess, der die Playbooks ausführt |

Das App-Image, `ghcr.io/ansibleforms/ansibleforms`, enthält Node.js und die Werkzeuge, die der Server aufruft (git, ssh, den mariadb-Client und
ytt), aber weder Python noch Ansible. Playbooks laufen auf einer RTE (Laufzeitumgebung), einem zweiten Container aus
`ghcr.io/ansibleforms/ansibleforms-rte-full` oder aus einem Image, das Sie auf `ansibleforms-rte-core` bauen (siehe [Skalierung](rte/)).
Formulare, die nur Vorlagen auf AWX, AAP, Ascender, Semaphore, Rundeck oder Jenkins starten, brauchen keine RTE.

---

## Datenbank

AnsibleForms speichert seine Jobs, Benutzer, Anmeldedaten und Verbindungen in MySQL 8 oder neuer oder in MariaDB.

Beim ersten Start legt es das Schema `AnsibleForms` selbst an. Geben Sie ihm einen eigenen Datenbankbenutzer, mit Rechten nur auf diesem Schema,
nicht root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Mehr braucht es nicht: es legt das Schema an und aktualisiert es, erstellt seine Backups und beendet, bei mehreren Workern, die Sitzung eines toten.
Die Seite **Status** und das Protokoll warnen, wenn der Benutzer Rechte auf jeder Datenbank hat. Die App-Knoten und die Worker verbinden sich mit diesem
Benutzer. Eine RTE in einem Socket-Modus (ausgehend oder eingehend, siehe [Modi](rte/modes.html)) hält keine Datenbank-Anmeldedaten: nur eine im Datenbankmodus,
seit 7.3.0 veraltet, verbindet sich ebenfalls. Um das Schema selbst anzulegen, setzen Sie [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) auf `0`.
Das Docker-Compose-Projekt und das Helm-Chart (das `mysql:8.4` verwendet) starten eine Datenbank für Sie.

---

## Dimensionierung

Es gibt keine gemessenen Anforderungen: die Last hängt vor allem davon ab, wie viele Jobs gleichzeitig laufen und wie viel Ausgabe sie schreiben.
Die Standardressourcen des Helm-Charts sind ein vernünftiger Ausgangspunkt für ein kleines Team:

| Komponente | Requests | Limits | Volume |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB Arbeitsspeicher | 4 CPU, 4 GiB Arbeitsspeicher | 10 GiB |
| MySQL | 0,5 CPU, 512 MiB Arbeitsspeicher | 2 CPU, 2 GiB Arbeitsspeicher | 10 GiB |

Der App-Container führt kein Playbook aus. Jedes Playbook ist ein `ansible-playbook`-Prozess, mit seinen Forks, auf einer RTE: dimensionieren Sie CPU und
Arbeitsspeicher jeder RTE für die Playbooks, die sie gleichzeitig ausführt, höchstens [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (standardmäßig `10`), und betreiben Sie mehr
RTEs, um mehr auszuführen. Jobs, die auf AWX, AAP, Ascender oder den anderen Vorlagen-Runnern laufen, kosten AnsibleForms wenig.

Die Job-Ausgabe wird standardmäßig für immer in der Datenbank aufbewahrt. Setzen Sie [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
auf einer ausgelasteten Instanz, damit die Datenbank nicht unbegrenzt wächst.

---

## Netzwerk

Die App und jede RTE lauschen auf einem eigenen Port und öffnen ausgehende Verbindungen zu den Systemen, die Ihre Formulare und Einstellungen verwenden.

### Eingehend
{: .no_toc }

Der Server lauscht auf Port `8000` ([`PORT`](customization/server.html#env_PORT)), über HTTP oder, mit
[`HTTPS`](customization/server.html#env_HTTPS) auf `1` gesetzt, über HTTPS. Das Docker-Compose-Projekt veröffentlicht ihn auf Port 443,
und das Helm-Chart stellt ihn über einen Service oder einen Ingress bereit. Eine RTE lauscht ebenfalls auf ihrem eigenen `PORT`, aber nur die App ruft sie auf:
halten Sie sie aus dem öffentlichen Netzwerk heraus. Eine ausgehende RTE braucht überhaupt keinen eingehenden Port: sie verbindet sich auf dem Port der App mit der App.

### Ausgehend
{: .no_toc }

Öffnen Sie die Verbindungen von AnsibleForms zu den Systemen, die Sie verwenden:

| Ziel | Verwendet für |
|---|---|
| MySQL / MariaDB | Die AnsibleForms-Datenbank (`DB_HOST`, `DB_PORT`, Standard `3306`) |
| Die RTE | Die Verbindung zu einer eingehenden RTE unter der Adresse ihres Runners über einen WebSocket, oder der Aufruf einer RTE im Datenbankmodus unter ihrer [`RTE_URL`](customization/server.html#env_RTE_URL), die sich dann selbst mit MySQL verbindet; eine ausgehende RTE verbindet sich stattdessen mit der App (siehe [Modi](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Starten und Verfolgen von Vorlagen und Jobs auf [Runnern](runners.html), über ihre HTTP(S)-API |
| Die verwalteten Hosts | Playbooks verbinden sich von der RTE aus mit ihnen, zum Beispiel über SSH oder WinRM |
| LDAP, Entra ID, OIDC | Anmeldung mit Verzeichnis- oder Single-Sign-On-Konten |
| Git-Server | Klonen und Pullen von Repositories, über HTTPS oder SSH |
| REST-APIs und Datenbanken | Die Datenquellen der Ausdrücke und Abfragen in Ihren Formularen |
| HashiCorp Vault, CyberArk | Lesen von Anmeldedaten aus einem [Secret Store](secret-stores/) |
| Mailserver, Slack, Teams, Telegram, Webhooks | Job-Benachrichtigungen und Genehmigungsanfragen, über die [Benachrichtigungskanäle](notification-channels.html) |
| Modellanbieter | Der [Chat-Assistent](chat/), nur wenn er eingeschaltet ist |

Um einzuschränken, welche Hosts die REST-Funktionen von Ausdrücken aufrufen dürfen, siehe
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) und
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Browser

Die Webanwendung ist für aktuelle Browser gebaut: Chrome oder Edge 111, Firefox 114, Safari 16.4 oder neuer.
Ältere Browser werden nicht unterstützt.

---

## Skalierung

Standardmäßig betreibt ein AnsibleForms-Container die Web-App und die Hintergrundarbeit gemeinsam, neben einer RTE.

Um mehr Benutzer zu bedienen, betreiben Sie mehrere App-Knoten hinter einem Load Balancer (`AF_ROLE=app`) neben einem Worker (`AF_ROLE=worker`), der die
Zeitpläne, die Backups und die andere Hintergrundarbeit ausführt; nur ein Worker arbeitet gleichzeitig, und ein zweiter wartet darauf, zu übernehmen. Sie teilen
die Datenbank, den persistenten Ordner, `ACCESS_TOKEN_SECRET` und `ENCRYPTION_SECRET`. Siehe [Skalierung](production/scaling.html). Betreiben Sie mehr
RTEs, um mehr Playbooks gleichzeitig auszuführen: siehe [Mehrere RTEs](rte/several.html).
