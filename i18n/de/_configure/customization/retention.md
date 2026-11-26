---
layout: default
title: Backups und Aufbewahrung
parent: Umgebungsvariablen
nav_order: 3
translated_from: 1cac64b6467ce96bce3aac71718f07d7ecd10d89
---

# Backups und Aufbewahrung
{: .no_toc }

Die Backup-Befehle und wie lange Backups, Jobs und Audit-Einträge aufbewahrt werden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, um zu steuern, wie viel Verlauf die Datenbank behält und wie viele Backups auf der Festplatte bleiben.

---

## Beispiel

Abgeschlossene Jobs 90 Tage und den Audit-Verlauf zwei Jahre lang aufbewahren. In der `.env` des Compose-Projekts:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Eine tägliche Aufgabe entfernt um 2:30 Uhr abgeschlossene Jobs, die älter sind, und um 3:30 Uhr Audit-Einträge. Ein laufender Job oder einer, der auf
Freigabe wartet, wird nie entfernt. Ab 7.7.0 entfernt `STORED_JOB_UNUSED_DAYS` außerdem um 4:00 Uhr die [gespeicherten
Jobs](../jobs/stored-jobs.html#when-it-is-removed), aus denen so viele Tage lang kein Job gestartet wurde. Diese Variablen
gelten ohne Neustart, wenn sie auf der Einstellungsseite geändert werden.

Diese Zeiten sind die Standards. Seit 7.8.0 ist jede Bereinigung, und die nächtliche Sicherung, eine [Systemaufgabe](../jobs/system-tasks.html) unter
**Jobs > System**, wo ein Administrator ändert, wann sie läuft, und ihre Läufe sieht; die Variablen ihrer Zeiten stehen unter
[Systemaufgaben](system-tasks.html).

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="retention" %}
