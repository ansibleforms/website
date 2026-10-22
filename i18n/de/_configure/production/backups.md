---
layout: default
title: Backups
parent: Betrieb in Produktion
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Backups
{: .no_toc }

Nächtliche Backups, was sie enthalten, Wiederherstellungen und was sonst noch zu sichern ist
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nächtliche Backups

AnsibleForms sichert sich jede Nacht um Mitternacht selbst, in der Zeitzone von [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(standardmäßig UTC). Diese Einstellungen steuern das:

| Variable | Standard | Bedeutung |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Wohin Backups geschrieben werden, jeweils ein Ordner mit Zeitstempel |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Wie viele nächtliche Backups aufbewahrt werden, `0` behält alle |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | Der Befehl, der die Datenbank dumpt |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | Der Befehl, der bei der Wiederherstellung einen Dump einspielt |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Wie lange Dump und Wiederherstellung laufen dürfen |

Benutzer mit der Rollenoption `allowBackupOps` können auf der Seite **Backups** auch jederzeit ein Backup erstellen. Nur nächtliche
Backups werden von der Aufbewahrung entfernt, und nur Backups mit einem brauchbaren Dump zählen dazu, sodass eine Reihe fehlgeschlagener
Nächte nie das letzte gute Backup verdrängt.

Bevor ein Upgrade die Datenbank ändert, erstellt der Worker zuerst ein reguläres Backup, einmal pro Release, namens *Before the upgrade to
&lt;version&gt;*. Es erscheint auf der Seite **Backups** und wird nie von der nächtlichen Aufbewahrung entfernt. Schlägt es fehl (kein Dump-Werkzeug,
`BACKUP_PATH` nicht beschreibbar), hält das Upgrade an und nennt den Grund, sodass die App nie auf einer halb aktualisierten Datenbank startet.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` führt das Upgrade ohne Backup durch.

Die Befehle können Wrapper wie `docker exec <container> mysqldump` sein, sofern ihr erstes Wort lokal existiert. Ab 7.3.0 laufen sie
ohne Shell: Anführungszeichen und `$NAME` aus der Umgebung des Befehls funktionieren, aber `;`, `|`, `&&`, `>` und `<` werden abgewiesen.

---

## Datenbankrechte

Der Dump läuft als [`DB_USER`](../customization/server.html#env_DB_USER) und braucht keine weiteren Rechte als die Anwendung selbst:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Der Dump wird mit `--no-tablespaces` erstellt, daher ist das serverweite Recht `PROCESS` nicht nötig, und er überspringt die Tabellen,
die die laufenden Prozesse beschreiben (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). Die Wiederherstellung spielt ihn als derselbe Benutzer ein.
Die Seite **Status** zeigt bei ihrer Prüfung **Datenbankbenutzer** eine Warnung, wenn der Benutzer Rechte auf jede Datenbank hat, wie `root`.

---

## Was ein Backup enthält

Jedes Backup ist ein Ordner unter `BACKUP_PATH`, benannt nach seinem UTC-Zeitstempel (`YYYYMMDDHHmmss`), und enthält:

| Datei | Inhalt |
|------|---------|
| `ansibleforms.sql` | Den Dump der Datenbank `AnsibleForms`: Benutzer, Gruppen, Anmeldedaten, Jobs, Einstellungen, den Audit-Verlauf |
| `config.yaml` | Die Datei unter [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | Den Ordner unter [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | Die Umgebungsdatei, die die Einstellungsseiten schreiben, ohne `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` und `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | Die Beschreibung des Backups |

Ein Backup, dessen Dump fehlschlägt, wird wieder entfernt und als Fehler protokolliert. Die Seite **Status** warnt, wenn es kein Backup gibt,
wenn das neueste älter als zwei Tage ist oder wenn es keinen brauchbaren Dump hat, und sie prüft, ob das Dump-Werkzeug existiert.

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) bestimmt dagegen, wie lange die Wiederherstellungspunkte des Designers aufbewahrt werden (standardmäßig 60 Tage).

---

## Ein Backup wiederherstellen

Stellen Sie über die [Seite **Backups**](../gui/administration.html#restore) wieder her, mit angehaktem **Vor dem Wiederherstellen ein neues Backup erstellen**. Eine Wiederherstellung:

* spielt `ansibleforms.sql` ein, was die gesamte Datenbank ersetzt; ab 7.3.0 wird ein Backup eines älteren Release danach erneut
  aktualisiert, wie beim Start eines neuen Release, und ein fehlschlagender Patch wird gemeldet
* kopiert `config.yaml` zurück und ersetzt den Ordner `forms/` durch den des Backups: Ab 7.3.0 werden Formulare, die nicht im Backup sind,
  entfernt statt behalten, die Links und der Modus des Ordners bleiben, und eine fehlgeschlagene Kopie setzt den Ordner zurück
* stellt `managed.env` **nicht** wieder her, da sie den Host beschreibt, von dem das Backup stammt. Die Schaltfläche **Umgebung wiederherstellen**
  stellt sie auf Anfrage wieder her, behält die aktuelle Datei als `.env.bak` und erfordert einen Neustart.

Ein Backup ohne brauchbaren Dump wird abgewiesen; beheben Sie nach einer unterbrochenen Wiederherstellung die Ursache und stellen Sie erneut wieder her.

Setzen Sie auf einem neuen Host vor der Wiederherstellung dasselbe `ENCRYPTION_SECRET`, sonst lassen sich die gespeicherten Anmeldedaten nicht entschlüsseln.

---

## Was sonst noch zu sichern ist

Das nächtliche Backup umfasst die Datenbank, die Konfiguration und die Formulare, aber nichts anderes im persistenten Ordner:

* **`ENCRYPTION_SECRET` und `ACCESS_TOKEN_SECRET`** : absichtlich nie in einem Backup. Bewahren Sie sie in Ihrem Secret Manager auf;
  ohne das Verschlüsselungsgeheimnis ist ein Datenbank-Dump für die Anmeldedaten nutzlos.
* **die Backups selbst** : Sie liegen auf demselben Volume wie die Instanz. Kopieren Sie `BACKUP_PATH` auf einen anderen Host.
* **der Rest des persistenten Ordners** : Playbooks, Uploads, Variablendateien, geklonte Repositories, Zertifikate und Protokolle.
  Sichern Sie beim docker-compose-Projekt den gesamten Ordner `data/`, der außerdem den SSH-Schlüssel, die eigenen
  Funktionen sowie die Ansible-Rollen und -Collections enthält.

Inhalte, die aus Git stammen (Repositories, Formulare in einem Repository), lassen sich erneut klonen, daher ist ihr Backup weniger wichtig.
