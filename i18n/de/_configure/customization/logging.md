---
layout: default
title: Protokollierung
parent: Umgebungsvariablen
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Protokollierung
{: .no_toc }

Protokollebenen, Dateien, Syslog und Konsolenfarben
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, um festzulegen, wie viel protokolliert wird, wohin die Protokolldateien gehen, oder um Zeitstempel in Ihrer eigenen Zeitzone anzuzeigen.

---

## Beispiel

In den Dateien mehr protokollieren als auf der Konsole und Protokoll- und Job-Zeitstempel in Amsterdamer Zeit anzeigen.
In der `.env` des Compose-Projekts:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Syslog-Server werden nicht mehr hier konfiguriert: Fügen Sie sie unter **Einstellungen > Verbindungen > Syslog** hinzu, siehe [Protokolle](../production/logs.html#syslog).
Die Variablen `LOG_SYSLOG_*` unten sind seit 7 veraltet. Der erste Start, der `LOG_SYSLOG_HOST` gesetzt vorfindet, importiert sie
einmal als Syslog-Server `syslog`, der das Serverprotokoll empfängt, und ignoriert sie danach.

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="logging" %}
