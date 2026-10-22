---
layout: default
title: Designer
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: 77ea52f327e41f36adaf3be7d2b50c1d1716bcb6
---

# Designer
{: .no_toc }

Formulare, Playbooks, Inventare und Workflows im Browser bearbeiten
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Formularautoren: die Bereiche des Designers und was jeder ihrer Tabs zeigt.

Der Designer braucht die [Rollenoption](../config/roles.html#role-options) `showDesigner`. Er bearbeitet jeweils ein Element, ein
Formular, ein Playbook oder eine Workflow-Datei, mit seinen Bereichen im linken Menü. Jede Dateiart braucht außerdem eine eigene Option, alle
standardmäßig eingeschaltet: `allowPlaybookDesign` für die **Playbooks**, `allowWorkflowDesign` für die **Workflows**,
`allowInventoryDesign` für die **Inventare** und `allowVarsFileDesign` für die **Variablendateien**. Fehlt eine, ist ihr Bereich
schreibgeschützt, und der Server verweigert das Speichern, Erstellen, Entfernen und Pushen ihrer Dateien; Formulare und Workflows können sie trotzdem auswählen. Die
**Formulare**, **Kategorien** und **Konstanten** brauchen auf dieselbe Weise `allowFormDesign`: Ohne diese Option sind sie schreibgeschützt, und der Server
verweigert das Speichern, Pullen und Pushen. Es bearbeitet immer nur eine Person gleichzeitig: siehe [Die Designer-Sperre](lock.html).

---

## Seine Bereiche

Jeder Bereich bearbeitet eine Dateiart, lokal oder in einem [Repository](../repositories/) abgelegt:

| Bereich | Was er bearbeitet |
|---|---|
| **Formulare** | Die Formulardateien |
| **Kategorien** | Die Kategorien von `config.yaml` |
| **Konstanten** | Die Konstanten von `config.yaml` |
| **Variablendateien** | Die Variablendateien, die Formulare laden |
| **Playbooks** | Die Playbooks, die Formulare und Workflows ausführen |
| **Inventare** | Die Inventare: `inventory.yaml`, `group_vars` und `host_vars` |
| **Workflows** | Die [Workflow](../workflows/)-Dateien |

Die Bereiche mit Dateien listen sie in einem Datei-Explorer auf und öffnen die erste; ein Bereich ohne Dateien sagt das. Der
Bereich **Formulare** und jeder Dateibereich haben an erster Stelle ihrer Werkzeugleiste eine Schaltfläche **Neue Datei**: In den Inventaren erstellt sie ein neues
Inventar, in den Workflows einen neuen, leeren Workflow. Die Lupe des Explorers öffnet ein Feld, das seine Dateien nach Namen filtert.

Das Suchfeld in der Titelzeile findet einen Text im geöffneten YAML: Es markiert jede Stelle, an der er vorkommt. Es funktioniert im
Tab **YAML**, sobald Sie die Designer-Sperre haben.

---

## Seine Tabs

Jeder Bereich hat dieselben drei Tabs, alle auf demselben YAML: Eine Änderung in einem erscheint in den anderen, und **Speichern** speichert sie.

- **YAML** ist die Datei, wie sie geschrieben ist.
- **Visuell** bearbeitet sie mit Feldern. Nur die Schlüssel, die eine Änderung berührt, ändern sich, sodass Kommentare und der Rest so bleiben, wie sie geschrieben sind.
- **Vorschau** zeigt, was sie bewirkt, und bearbeitet nichts.

Was die Tabs Visuell und Vorschau zeigen, Bereich für Bereich:

| Bereich | Visuell | Vorschau |
|---|---|---|
| **Formulare** | Die Einstellungen des Formulars und seine Felder, mit Listen der Playbooks, Inventare und Workflows des Designers | Das Formular, wie es gerade ist, nicht gespeicherte Änderungen eingeschlossen; sein Absenden führt nichts aus |
| **Kategorien** | Die Kategorien als Tabelle, bearbeitbar | Das Menü der Seite Formulare, daraus aufgebaut |
| **Konstanten** | Die Konstanten als Gliederung, bearbeitbar (ein Schlüssel lässt sich mit den Pfeiltasten verschieben) | Jede Konstante mit ihrem Verweis, `$(NAME)`, zum Kopieren, und die Formulare, die sie verwenden |
| **Variablendateien** | Die Variablen, bearbeitbar | Jede Variable mit ihrem Verweis in einem Playbook, {% raw %}`{{ name }}`{% endraw %}, zum Kopieren, und die Formulare, die die Datei laden |
| **Playbooks** | Die Plays: Name, Hosts, **Become**, **Facts sammeln** und Rollen jedes Plays, und seine Tasks, jeder mit Modul und Argumenten | Die Gliederung des Playbooks: seine Plays, mit ihren Hosts, Rollen und Tasks, und die Playbooks, die es importiert |
| **Inventare** | Die Gruppen, ihre Untergruppen, ihre Hosts und die Variablen, die jede setzt | Das Inventar als Baum, mit seinen `group_vars` und `host_vars` |
| **Workflows** | Der Graph des Workflows, um [ihn zu bearbeiten](../workflows/designer.html) | Ein [Probelauf](../workflows/designer.html#trying-it-out): Klicken Sie auf einen Knoten, damit er fehlschlägt |

Wenn das YAML nicht gelesen werden kann, sagen die Tabs Visuell und Vorschau, warum, mit **In YAML zeigen**, um das YAML in der Zeile zu öffnen.
