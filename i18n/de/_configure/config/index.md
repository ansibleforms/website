---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

Kategorien, Rollen und Konstanten für alle Formulare
{: .fs-6 .fw-300 }

---

Für Administratoren: die Datei config.yaml, die die Kategorien, Rollen und Konstanten enthält, die alle Formulare gemeinsam nutzen.

AnsibleForms verwendet eine Datei config.yaml, um Kategorien, Rollen und Konstanten zu konfigurieren. Wird keine Datei bereitgestellt, wird eine mit einer minimalen Konfiguration erzeugt. Die Konfiguration kann auch in die Datenbank importiert werden, wodurch keine Datei config.yaml mehr nötig ist.

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

AnsibleForms lädt die Datei config.yaml in der folgenden Reihenfolge (der erste Treffer gewinnt):

1. **AUS DER DATENBANK** : die in die Datenbank importierte Konfiguration, nur wenn `ENABLE_CONFIG_IN_DATABASE=1` gilt oder wenn diese
   Variable nicht gesetzt ist und die in der Datenbank gespeicherte Konfigurationsquelle `database` ist (eine leere Kopie fällt auf die Datei zurück)
2. **AUS EINEM REPOSITORY (use_for_config)** : das Repository mit eingeschaltetem Schalter „Für Konfiguration verwenden“ (neu in 6.1.0)
3. **AUS EINEM REPOSITORY (use_for_forms)** : das Repository mit eingeschaltetem Schalter „Für Formulare verwenden“ (Rückfall aus Gründen der Abwärtskompatibilität)
4. **AUS DER LOKALEN DATEI** : die lokale Datei `config.yaml` (Umgebungsvariable CONFIG_PATH)

{: .warning }
> **Hinweis:** Schalten Sie „Für Konfiguration verwenden“ nur bei einem Repository ein. Ist es bei mehreren eingeschaltet, wird eine Warnung protokolliert und das erste verwendet.

---

## In diesem Abschnitt

Die Datei hat drei Attribute auf oberster Ebene, und jedes hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [Kategorien](categories.html) | Die Formulare auf dem Dashboard in einem Baum von Kategorien mit Symbolen gruppieren |
| [Rollen](roles.html) | Benutzer und Gruppen Rollen zuordnen und festlegen, was jede Rolle darf |
| [Konstanten](constants.html) | Freie Objekte, die jedes Formular wiederverwenden kann |
