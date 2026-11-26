---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

Kategorien, Rollen und Konstanten für alle Formulare
{: .fs-6 .fw-300 }

---

Für Administratoren: die Datei config.yaml, die die Kategorien, Rollen und Konstanten enthält, die alle Formulare gemeinsam nutzen.

AnsibleForms verwendet eine Datei config.yaml, um Kategorien, Rollen und Konstanten zu konfigurieren. Wird keine Datei bereitgestellt, wird eine mit einer minimalen Konfiguration erzeugt. Die Konfiguration kann auch in die Datenbank importiert werden, wodurch keine Datei config.yaml mehr nötig ist, und jedes der drei kann in einem git-Repository aufbewahrt werden.

---

## Überblick

Die Datei config.yaml enthält die Konfiguration für die Kategorien, Rollen und Konstanten, die AnsibleForms verwendet.

**VIDEO**: [Ihr erstes Formular erstellen](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

Die folgende minimale config.yaml dient als Ausgangspunkt. Sie enthält nur die erforderliche Kategorie `Default` und die erforderlichen Rollen `admin` und `default`.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Ladereihenfolge der Konfiguration

Seit 7.8.0 werden die Kategorien, die Rollen und die Konstanten jeweils für sich gelesen, aus der ersten der folgenden Quellen, die sie enthält.

1. **AUS EINEM REPOSITORY** : das Repository mit dem Verwendungstyp **Kategorien**, **Rollen** oder **Konstanten**, aus seiner Datei mit
   `controller_categories:`, `controller_roles:` oder `controller_constants:`, mit beliebigem Namen in beliebigem Ordner (siehe
   [Konfiguration in git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **AUS DER config.yaml DES REPOSITORYS** : der einfache Schlüssel in der `config.yaml` dieses Repositorys, veraltet seit 7.8.0 und ab
   8.0 nicht mehr gelesen; das Serverprotokoll, die Pull-Ausgabe und die Seite des Repositorys weisen darauf hin
3. **AUS DER DATENBANK** : die in die Datenbank importierte Konfiguration, nur wenn `ENABLE_CONFIG_IN_DATABASE=1` gilt oder wenn diese
   Variable nicht gesetzt ist und die in der Datenbank gespeicherte Konfigurationsquelle `database` ist (eine leere Kopie fällt auf die Datei zurück)
4. **AUS DER LOKALEN DATEI** : die lokale Datei `config.yaml` (Umgebungsvariable CONFIG_PATH)

{: .warning }
> **Hinweis:** Den Schalter **Für Konfiguration verwenden** gibt es seit 7.8.0 nicht mehr. Ein Upgrade gibt **Rollen**, **Kategorien** und **Konstanten**
> dem Repository, das ihn hatte, und `use_for_config` im Config-Seed oder in der API ist ein veralteter Alias der drei.

---

## In diesem Abschnitt

Die Datei hat drei Attribute auf oberster Ebene, und jedes hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [Kategorien](categories.html) | Die Formulare auf dem Dashboard in einem Baum von Kategorien mit Symbolen gruppieren |
| [Rollen](roles.html) | Benutzer und Gruppen Rollen zuordnen und festlegen, was jede Rolle darf |
| [Konstanten](constants.html) | Freie Objekte, die jedes Formular wiederverwenden kann |
