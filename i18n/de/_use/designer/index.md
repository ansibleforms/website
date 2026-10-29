---
layout: default
title: Designer
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: bf0bdf119ae004ec2da8640d18a254483027098c
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
Eine Rolle kann außerdem die Formulare, Playbooks und Workflows anderer Teams ausblenden: siehe [Eingeschränkte Designer](#limited-designers).

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

---

## Eingeschränkte Designer

Ab 7.5.0 begrenzen drei Rollenoptionen, welche Formulare, Playbooks und Workflows der Designer zeigt, damit jedes Team seine eigenen gestaltet.
Alle drei sind standardmäßig eingeschaltet und für Admins immer eingeschaltet:

| Option | Ausgeschaltet zeigt der Designer nur |
|---|---|
| `designAllForms` (**Alle Formulare bearbeiten**) | Die Formulare, deren `roles` eine der Rollen des Benutzers enthalten, und die Unterformulare, die kein ausgeblendetes Formular verwendet |
| `designAllPlaybooks` (**Alle Playbooks bearbeiten**) | Die Playbooks, die die Formulare des Benutzers ausführen, und die, die noch kein Formular verwendet |
| `designAllWorkflows` (**Alle Workflows bearbeiten**) | Die Workflow-Dateien, die die Formulare des Benutzers ausführen, verschachtelte eingeschlossen, und die, die noch kein Formular verwendet |

Ein Formular führt ein Playbook über sein `playbook`, seine Ansible-Schritte und die Workflows aus, die es ausführt. Was ein eingeschränkter Designer nicht kann:

- **Eine ausgeblendete Datei sehen.** Sie wird nie aufgelistet oder genannt: Wer eine öffnet, erhält die Antwort einer fehlenden Datei, und eine
  neue Datei mit ihrem Namen die Antwort einer Datei, die es schon gibt.
- **Auf eine verweisen.** Ein Formular, das ein ausgeblendetes Formular als Unterformular nennt, zeigt nichts davon, und ein Formular oder eine
  Workflow-Datei, die ein ausgeblendetes Playbook oder einen ausgeblendeten Workflow nennt, wird abgelehnt.
- **Ein geteiltes Unterformular ändern.** Ein Unterformular, das auch ein ausgeblendetes Formular verwendet, ist schreibgeschützt, und ein
  gespeichertes Formular muss eine der Rollen des Benutzers behalten.
- **Die ausgeblendeten Formulare einer Datei anfassen.** Eine Datei mit mehreren Formularen behält die ausgeblendeten beim Speichern unverändert,
  und das Wiederherstellen einer Sicherung der Formulare wird abgelehnt.
- **Code hinzufügen, den der Server ausführt.** Ein gespeichertes Formular darf keinen Ausdruck und keine Abfrage hinzugewinnen, die der Server
  ausführt, und die Vorschau eines noch nicht gespeicherten Formulars führt keinen eigenen Ausdruck aus.
- **Dateinamen in der Git-Ausgabe lesen.** Die Ausgabe eines Pulls oder Pushs lässt die Zeilen weg, die Dateien nennen.

`allowFormDesign`, `allowPlaybookDesign` und `allowWorkflowDesign` entscheiden weiterhin, ob die gezeigten Dateien geändert werden können.
Inventare, Variablendateien, Kategorien und Konstanten bleiben für jeden Designer sichtbar. Ein Benutzer mit nur einem Teil der Einstellungen
sieht auf den Tabs **Formulare** der Einstellungsseiten und auf dem Tab **Verwendet von** einer Anmeldeinformation nur seine eigenen Formulare
und Workflow-Dateien.
