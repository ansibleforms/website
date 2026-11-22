---
layout: default
title: Systemaufgaben
parent: Umgebungsvariablen
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Systemaufgaben
{: .no_toc }

Wann die Bereinigungen, die nächtliche Sicherung und die Schleifen des Runner-Hubs laufen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, um die [Systemaufgaben](../jobs/system-tasks.html) auf andere Zeiten zu legen, oder die Schleifen des Runner-Hubs öfter oder seltener laufen zu lassen.

---

## Beispiel

Um 1:00 Uhr sichern, um 1:30 Uhr die Jobs bereinigen und die Jobs alle 5 Sekunden an die Runner zuteilen. In der `.env` des Compose-Projekts:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Eine `_CRON`-Variable nimmt einen Cron mit 5 Feldern (Minute, Stunde, Tag, Monat und Wochentag) in der Zeitzone des Servers,
[`LOG_TZ`](logging.html#env_LOG_TZ). Der Tab **Zeitplan** jeder Aufgabe, unter **Jobs > System**, schreibt ihre Variable und wendet sie
sofort auf allen Knoten an, ohne Neustart. Das Neuladen des Config-Seeds hat seine eigene,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), bei den Variablen des Config-Seeds.

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="system-tasks" %}
