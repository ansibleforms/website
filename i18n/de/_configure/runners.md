---
layout: default
title: Runner
nav_order: 12
has_children: true
has_toc: false
permalink: /runners.html
translated_from: e6663cf2e7dc14a1559383c7f49fd968a4cbf635
---

# Runner
{: .no_toc }

Wo Jobs laufen: Laufzeitumgebungs-Container für Playbooks sowie AWX, AAP, Ascender, Semaphore, Rundeck oder Jenkins für Templates
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Fügen Sie die Runner hinzu, auf denen Ihre Jobs laufen, wählen Sie den Standard jedes Typs, geben Sie die RTEs frei, die um Beitritt bitten, und testen Sie sie.

---

## In diesem Abschnitt

| Seite | Inhalt |
|---|---|
| [Die Seite Runner](runners/list.html) | Die Liste der Runner, einen hinzufügen, einen ein- oder ausschalten, und der Standard jedes Typs |
| [Runner-Typen](runners/types.html) | Die Produkte, die ein Runner sein kann, ihre Adresse und Anmeldung |
| [Registrierung](runners/registration.html) | Wie eine RTE um Beitritt bittet und freigegeben wird, Beitrittstoken für unbeaufsichtigte Installationen und der Datenbankmodus |
| [Die Seite eines Runners](runners/runner-page.html) | Die Tabs eines Runners, Modus und Verbindung einer RTE und Verbindung testen |
| [Wer Runner verwaltet](runners/permissions.html) | Wer Runner hinzufügen, ändern und testen darf |


---

## Funktionsweise

Seit Version 7 führt die App selbst nichts aus: Jeder Job läuft auf einem **Runner**, angelegt unter **Verbindungen > Runner**.
Der Typ eines Formulars bestimmt, welchen Runner-Typ es braucht:

| Formulartyp | Läuft auf einem Runner vom Typ | Was läuft |
|---|---|---|
| `ansible` | RTE | Ein Playbook, in einem Laufzeitumgebungs-Container |
| `awx`, `aap`, `ascender` | AWX (die Varianten AWX, AAP und Ascender) | Ein Job- oder Workflow-Template |
| `semaphore` | Semaphore | Ein Semaphore UI-Template |
| `rundeck` | Rundeck | Ein Rundeck-Job |
| `jenkins` | Jenkins | Ein Jenkins-Job |

Ein Formular vom Typ `workflow` oder `subform` hat keinen eigenen Runner: Jeder Knoten eines [Workflows](workflows/) wählt seinen eigenen. Ein Knoten
mit `runner:` läuft auf diesem Runner (einer RTE oder einem Template oder Job auf AWX, Semaphore, Rundeck oder Jenkins), jeder andere auf
der Standard-RTE, sodass die Knoten eines Jobs auf verschiedenen Runnern laufen können. Das Formular `multistep`, seit 7 veraltet und
durch Workflows ersetzt, funktioniert genauso: Jeder seiner Schritte läuft auf dem Runner, den sein eigener Typ braucht.

Ein Formular wählt seinen Runner auf eine von zwei Arten:

- **Nach Namen**: `runner: <name>` am Formular, an einem Workflow-Knoten oder an einem Schritt eines veralteten Multistep (auch in den
  Formulareinstellungen des Designers). Der Runner muss den Typ haben, den das Formular braucht, sonst schlägt der Job fehl. Das ältere `awx: <name>`
  funktioniert weiterhin, protokolliert eine Veraltungswarnung und entfällt in 8.
- **Als Standard**: Ein Formular, das keinen Runner nennt, läuft auf dem Standard-Runner seines Typs. Gibt es keinen, schlägt der Job fehl,
  mit einer Meldung, die sagt, welcher Runner-Typ hinzuzufügen ist.

Ein unter **Verbindungen > Runner** ausgeschalteter Runner erhält keinen Job, weder nach Namen noch als Standard: Der Job schlägt fehl und sagt, man solle ihn aktivieren
oder einen anderen Runner nennen (siehe [Standard und Aktiviert](runners/list.html#default-and-enabled)).

