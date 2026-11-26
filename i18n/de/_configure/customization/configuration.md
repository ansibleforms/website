---
layout: default
title: Konfiguration
parent: Umgebungsvariablen
nav_order: 5
translated_from: c15df1be69f79cf42094233023cb5766d2f56452
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
      - "CONFIG_SEED_RELOAD_CRON=*/5 * * * *"
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
3. Andernfalls die Datei unter [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Seit 7.8.0 wird ein Schlüssel, den ein Repository enthält, über diese Basis gelegt: Das Repository mit dem Verwendungstyp **Rollen**, **Kategorien** oder
**Konstanten** liefert diesen Schlüssel aus seiner Datei mit `controller_roles:`, `controller_categories:` oder
`controller_constants:`, sonst aus seiner `config.yaml` (veraltet). Siehe [Konfiguration in git](../repositories/config-as-code.html#roles-categories-and-constants).

Ein explizit gesetztes `ENABLE_CONFIG_IN_DATABASE` gewinnt immer, sogar `0` gegenüber einem gespeicherten `database`. Es wird bei jedem Laden der
Konfiguration gelesen, daher gilt eine Änderung ohne Neustart. Die Seite **Status** zeigt die verwendete Quelle im Tab **Informationen**.

Die Kopie in der Datenbank ist die Spalte `config_yaml` der Tabelle `settings`, vor 7.6.0 `forms_yaml` genannt: Das Upgrade benennt
sie um und behält ihren Inhalt. `GET /api/v2/settings/config` gibt sie als `config_yaml` zurück, und zusätzlich als veraltetes `forms_yaml`.

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="configuration" %}
