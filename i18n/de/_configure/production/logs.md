---
layout: default
title: Protokolle
parent: Betrieb in Produktion
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Protokolle
{: .no_toc }

Protokolldateien, Syslog, der Audit-Verlauf und wie lange Jobs und Audit-Einträge aufbewahrt werden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Protokolldateien

AnsibleForms schreibt zwei täglich rotierte Protokolle nach [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), komprimiert ältere Tage und bewahrt sie [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS) lang auf
(standardmäßig 30, `0` behält jede Datei; eine Änderung auf der Einstellungsseite gilt sofort):

* `ansibleforms.<date>.log` : alles ab [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) aufwärts
* `ansibleforms.errors.<date>.log` : nur Fehler

Die Konsole, gelesen mit `docker logs` oder `kubectl logs`, hat eine eigene Stufe,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Beide sind standardmäßig `notice`, was für
die Produktion richtig ist; verwenden Sie `info` oder `debug` nur bei der Fehlersuche, und lassen Sie
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) ausgeschaltet. Die Stufen lassen sich auf
den Einstellungsseiten ohne Neustart ändern, und die Seite **Serverprotokoll** zeigt das Protokoll Benutzern mit der Option `showLogs`.

---

## JSON-Zeilen

Für einen Log-Collector wie Loki, ELK oder Splunk setzen Sie [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) auf `json`. Jede
Zeile, auf der Konsole und in den Dateien, ist dann ein JSON-Objekt statt `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Feld | Inhalt |
|-------|---------|
| `time` | Die Uhrzeit, in ISO 8601 UTC |
| `level` | Die Protokollstufe |
| `message` | Die Meldung |
| `requestId` | Die Anfrage, zu der die Zeile gehört, wenn sie während deren Bearbeitung geschrieben wurde |
| `role` | Die Rolle des Prozesses, [`AF_ROLE`](scaling.html), oder `all`, wenn sie nicht gesetzt ist |
| `host` | Der Hostname der Maschine oder des Containers, in dem der Prozess läuft |

Jede Anfrage erhält eine ID: den Header `X-Request-Id`, den ein Reverse Proxy gesendet hat, oder eine neue. Sie wird im Header
`X-Request-Id` der Antwort zurückgegeben und von jeder Zeile getragen, die während der Bearbeitung der Anfrage geschrieben wird (als `[req <id>]` in Textzeilen),
sodass sich eine Anfrage durch das Protokoll verfolgen und mit der des Proxys abgleichen lässt. Eine Änderung auf der Einstellungsseite gilt sofort.

---

## Syslog

Syslog-Server werden unter **Einstellungen > Verbindungen > Syslog** verwaltet, sodass ein Syslog-Server oder SIEM das Protokoll erhält, während es geschrieben wird.
Sie können mehrere Server hinzufügen, und jeder hat eigene Einstellungen:

| Einstellung | Was sie tut |
|---------|--------------|
| Aktiviert | Nur aktivierte Server erhalten etwas, sodass sich ein Server pausieren lässt, ohne ihn zu löschen; **Aktivieren** und **Deaktivieren** im Menü seiner Zeile schalten ihn ebenfalls um |
| Protokoll | `udp4` (Standard), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` oder `unix-connect` |
| Host und Port | Der Zielserver, standardmäßig Port `514`; ein `unix`-Protokoll nimmt stattdessen einen Socket-Pfad |
| Empfängt | Das Serverprotokoll, die Audit-Einträge oder beides (der Standard für einen neuen Server) |
| Stufe | Die niedrigste Stufe des Serverprotokolls, die er erhält, standardmäßig `info`; Audit-Einträge werden immer gesendet |
| Format | `BSD` (RFC 3164, der Standard) oder `RFC 5424` |

Eine Änderung gilt auf jedem Knoten ohne Neustart, und die Seite des Servers hat eine Schaltfläche, die ihm eine Testmeldung sendet.
Ein nicht erreichbarer Server hält die Anwendung nie an: Der Fehler wird auf die Konsole geschrieben.

Ab 7.3.0 brauchen die Syslog-Server die vollen Einstellungsrechte, die Rollenoption [`showSettings`](../config/roles.html#role-options):
Der Zugriff auf die Verbindungs-Einstellungen allein genügt nicht, da ein Syslog-Server das Serverprotokoll und die Audit-Einträge erhält.

Die Variablen `LOG_SYSLOG_*` früherer Versionen sind seit 7 veraltet. Der erste Start, der
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) gesetzt vorfindet, importiert sie einmal als Server `syslog`,
der wie bisher das Serverprotokoll empfängt, und ignoriert sie danach. Entfernen Sie sie nach diesem ersten
Start aus der Umgebung und verwalten Sie den Server auf der Einstellungsseite.

---

## Audit-Verlauf

Die Seite **Audit-Protokoll** (unter **Einstellungen > Protokolle**) hält fest, wer was geändert hat, was die Protokolldateien nicht gut beantworten.
Sie erfasst:

* jede über die API vorgenommene Änderung (`POST`, `PUT`, `PATCH`, `DELETE`), einschließlich mit 401 oder 403 abgewiesener Versuche
* Anmeldungen, mit dem versuchten Benutzernamen
* Ereignisse der Anwendung selbst, etwa nächtliche Backups, entfernte Backups, bereinigte Jobs und Anwendungen des Config-Seeds

Jeder Eintrag hat seine Uhrzeit, den Akteur (ein Benutzer oder die Anwendung selbst für ihre eigenen Aufgaben), die Client-IP-Adresse,
die Aktion, ihr Ziel und ihr Ergebnis: `success`, `failure` oder `denied`. Die Seite filtert nach Akteur, Aktion und
Ergebnis, und Benutzer mit der Rollenoption `showSettings` können sie öffnen.

Die IP-Adresse ist die, die AnsibleForms sieht, also die des Proxys, wenn es hinter einem läuft. Setzen Sie
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) auf die Anzahl oder die Adressen Ihrer Proxys, dann erfasst AnsibleForms
stattdessen die Client-Adresse, die der Proxy in `X-Forwarded-For` meldet; siehe [Reverse Proxy](reverse-proxy.html).

Um den Audit-Verlauf außerhalb der Instanz aufzubewahren, für ein SIEM, fügen Sie einen Syslog-Server hinzu, der die Audit-Einträge empfängt (siehe
[Syslog](#syslog)). Jeder Eintrag wird sofort gesendet, als eine Zeile `audit {...}` mit dem Eintrag als JSON, unabhängig von der
Stufe des Servers. Die Syslog-Kopie wird weder von der Aufbewahrung unten entfernt noch durch eine Wiederherstellung der Datenbank ersetzt.

---

## Aufbewahrung

Zwei tägliche Aufgaben mit einer Einstellung verhindern, dass die Datenbank unbegrenzt wächst:

| Variable | Standard | Läuft um | Entfernt |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Audit-Einträge, die älter sind |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (alle behalten) | 2:30 | Abgeschlossene Jobs, die älter sind, samt ihrer Ausgabe |

`0` behält bei beiden alles. Zwei weitere tägliche Aufgaben haben keine Einstellung: Um 3:00 werden die gespeicherten Refresh-Token, die älter als 30 Tage sind, und
die abgelaufenen Token-Sperren entfernt, und um 4:00 die [gespeicherten Jobs](../jobs/stored-jobs.html), deren Ablauf verstrichen ist.
Die Zeiten gelten in der Zeitzone von [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), und der Worker führt sie aus.

Die Jobausgabe ist meist die am schnellsten wachsende Tabelle: Die Seite **Status** meldet ihre Größe
und warnt, wenn sie 1 GB überschreitet, ohne dass eine Aufbewahrung gesetzt ist. Laufende Jobs und Jobs, die auf Genehmigung warten, werden nie entfernt.
Legen Sie eine Job-Aufbewahrung fest, die Ihren Audit-Anforderungen entspricht, und bewahren Sie den Audit-Verlauf mindestens ebenso lange auf.
