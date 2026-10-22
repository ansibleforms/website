---
layout: default
title: Konfiguration
parent: Umgebungsvariablen
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
---

# Konfiguration
{: .no_toc }

Der Config-Seed, wo die Konfiguration gespeichert wird, Git und ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, um festzulegen, woher die Konfiguration kommt: aus einem Config-Seed, der Datenbank, Git oder ytt-Templates.

---

## Beispiel

Einen eingehängten Config-Seed anwenden, ihn alle fünf Minuten prüfen und `config.yaml` in der Datenbank halten. In `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Ein ungültiger Seed verhindert den Start des Servers. Das Dateiformat finden Sie unter [Config-Seed](../seed/).

---

## Woher config.yaml gelesen wird

Die Kategorien, Rollen und Konstanten kommen aus `config.yaml` auf der Festplatte oder aus ihrer Kopie in der Datenbank, entschieden in dieser Reihenfolge:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), wenn sie gesetzt ist, in der Umgebung oder im
   Tab **Konfiguration** der Einstellungsseite: `1` liest die Datenbank, `0` liest die Datei.
2. Andernfalls die in der Datenbank gespeicherte Konfigurationsquelle (`file` oder `database`), die vor 6.3.0 eingerichtete
   Instanzen auf der Einstellungsseite gewählt haben.
3. Andernfalls die Datei: die `config.yaml` des Repositorys mit eingeschaltetem **Für Konfiguration verwenden**, sonst eines Repositorys mit
   eingeschaltetem **Für Formulare verwenden**, sonst die unter [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Ein explizit gesetztes `ENABLE_CONFIG_IN_DATABASE` gewinnt immer, sogar `0` gegenüber einem gespeicherten `database`. Es wird bei jedem Laden der
Konfiguration gelesen, daher gilt eine Änderung ohne Neustart. Die Seite **Status** zeigt die verwendete Quelle im Tab **Informationen**.

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="configuration" %}
