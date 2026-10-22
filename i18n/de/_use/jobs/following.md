---
layout: default
title: Einen Job verfolgen
parent: Jobs
nav_order: 2
translated_from: 3beb53d60eeac0e108e31a8dabf2877ab15d2126
---

# Einen Job verfolgen
{: .no_toc }

Live-Ausgabe, Extravars, Filter und Downloads
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Einen Job verfolgen

Ein Klick auf einen Job öffnet seine Seite: das Formular des Jobs als Titel, seine Aktionen im Kopfbereich und darunter seine Ausgabe.

![Die Ausgabe eines Jobs](../assets/screenshots/job-output.jpg)

Ab 7.3.0 besteht die Seite aus Karten, und jede lässt sich unter ihrem Kopf einklappen:

| Karte | Was sie zeigt |
|---|---|
| **Zusammenfassung** | Name, Status und Typ des Jobs als Kopf, und darunter seine Angaben in einem Raster mit drei Spalten (zwei, dann eine, auf einer schmalen Seite) |
| **Workflow** | Bei einem Workflow-Job, auch einem Workflow-Job von AWX oder AAP, seinen Graph und seine Anzahl Knoten (siehe [Der Workflow-Graph](#the-workflow-graph)) |
| **Ausgabe** | Die Ausgabe des Jobs und ihre Werkzeugleiste |

Ein Job, der auf AWX, AAP, Ascender, Jenkins, Semaphore oder Rundeck lief, zeigt dort seine Nummer als Link zu seiner Seite in diesem Tool, geöffnet
in einem neuen Tab. Der Link wird am Job gespeichert, sodass er auch funktioniert, wenn der Runner später umbenannt oder entfernt wird.

Die Seite aktualisiert sich live: Der Server sendet jedes Mal ein Ereignis, wenn ein Job gestartet wird, seinen Status ändert, Ausgabe schreibt oder
gelöscht wird, und die Seite liest den Job erneut, sodass die Ausgabe wächst, während der Job sie schreibt. Die Jobliste aktualisiert sich auf dieselbe Weise.
**Aktualisieren** lädt den Job von Hand neu.

Solange Sie am Ende der Ausgabe sind, folgt die Seite ihr nach unten, wenn neue Zeilen hinzukommen. Scrollen Sie nach oben, um eine frühere Zeile zu lesen,
bleibt die Seite, wo Sie sind: **Zum Neuesten springen** erscheint dann über dem unteren Rand der Ausgabe und wird zu **Neue Zeilen**, sobald
weitere hinzugekommen sind. Klicken Sie darauf oder scrollen Sie zurück ans Ende, um den neuen Zeilen wieder zu folgen. Die Ausgabe auf der Seite des Formulars nach
**Senden** und das [Serverprotokoll](../production/logs.html) folgen ihren neuen Zeilen auf dieselbe Weise.

Die Werkzeugleiste der Ausgabe enthält:

| Schaltfläche | Was sie macht |
|---|---|
| **Extra-Variablen anzeigen** | Zeigt die Extravars, mit denen der Job lief, in einem Bereich über der Ausgabe, mit einem Umschalter **JSON** / **YAML** und **Kopieren** |
| **Artefakte anzeigen** | Zeigt die Artefakte des Jobs im selben Bereich (siehe unten) |
| **Parameter anzeigen** | Ersetzt bei einem Jenkins-Job **Extra-Variablen anzeigen**: die Werte, mit denen er lief, seine Build-Parameter |
| **Payload anzeigen** | Ersetzt bei einem Rundeck-Job **Extra-Variablen anzeigen**: die Payload, die ihm gesendet wurde |
| **Hosts und Tasks** | Zeigt die Hosts und Tasks eines Playbooks über seiner Ausgabe (siehe [Hosts und Tasks](#hosts-and-tasks)) |
| **Aktualisieren** | Lädt die Ausgabe neu |
| **Filter anwenden** | Blendet die Tasks aus, deren Name auf den Ausgabefilter passt; **Filter entfernen** zeigt sie wieder |
| **Ausgabe kopieren** | Kopiert die Ausgabe als reinen Text, mit oder ohne angewendeten Filter |
| **Ausgabe herunterladen** | Lädt die Ausgabe als `ansibleforms-job-<id>.txt` herunter |

**Artefakte anzeigen** wird für jeden Job angeboten, der kein Vorlagen-Job ist, etwa ein Playbook auf dem RTE oder ein Workflow (leer, wenn
seine Playbooks keine Artefakte mit `set_stats` gesammelt haben), und für einen Vorlagen-Job, der auf AWX, AAP oder Ascender lief. Jobs von Semaphore, Rundeck
und Jenkins haben keine Artefakte, daher wird es für sie nie angeboten.

Links in der Werkzeugleiste klappt die Schaltfläche **Alle einklappen** jeden Abschnitt der Ausgabe (jedes Play und jeden Task) ein und wird zu
**Alle ausklappen**, das sie wieder aufklappt.

**Extra-Variablen anzeigen** setzt die Rollenoption `showExtravars` voraus und **Artefakte anzeigen** die Rollenoption `showArtifacts` (siehe
[Rollenoptionen](../config/roles.html#role-options)). Werte von Passwortfeldern und von Schlüsseln, die auf
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) passen, werden maskiert.

Der Filter wird über [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) gesetzt, standardmäßig `\[low\]`.
Setzen Sie `[low]` in den Namen eines geschwätzigen Tasks, und **Filter anwenden** blendet diesen Task und seine Zeilen aus.

Die Seite eines Multistep-Jobs zeigt jeden Schritt unter dem Hauptjob, einen unter dem anderen, jeden unter einer Titelleiste wie
**Schritt 1 · Prepare the server (Job-ID 98)** mit seinem Status. Klicken Sie auf einen Titel (oder drücken Sie darauf Enter oder Leertaste), um diese Ausgabe
einzuklappen, und erneut, um sie aufzuklappen. AWX/AAP-Workflows zeigen auch den Status ihrer Knoten.

[Workflow](../workflows/running.html#the-job)-Jobs enthalten die Ausgabe jedes Knotens in ihrer eigenen, unter einem Banner `WORKFLOW NODE` pro
Knoten; sie zeichnen ihren Graph live, und ein Klick auf einen Knoten öffnet seine Ausgabe.

---

## Einen Text in der Ausgabe finden

Ab 7.3.0 hat die Seite des Jobs in ihrer Titelzeile, links von den Aktionen des Jobs, ein Suchfeld, **In der Ausgabe suchen**.

Jede Stelle, an der der Text in der Ausgabe vorkommt, wird hervorgehoben, unabhängig von Groß- und Kleinschreibung, und die Seite springt zur ersten. **Enter** geht zur
nächsten, die stärker hervorgehoben wird, und die Werkzeugleiste zeigt, welche von wie vielen (**2 von 4**), oder **Nicht gefunden**. Die Suche klappt zuerst die Ausgabe und
ihre Abschnitte auf, und während der Job läuft, werden auch die neuen Zeilen durchsucht, ohne dass die Seite springt.

---

## Durch eine lange Ausgabe navigieren

Ab 7.3.0 bietet eine lange Ausgabe, auf der Seite des Jobs und unter einem Formular nach **Senden**, folgende Wege hindurch:

| Element | Was es macht |
|---|---|
| Fixierte Köpfe | Der Kopf eines Abschnitts (ein Workflow-Knoten, das Playbook des Jobs, ein Schritt eines Multistep-Jobs) bleibt oben, während seine Zeilen vorbeiscrollen |
| **2 fehlgeschlagen** | Zählt die fehlgeschlagenen Tasks, ohne die Fehler, die Ansible ignorieren sollte; jeder Klick springt zum nächsten, aufgeklappt und hervorgehoben. Ohne fehlgeschlagene Tasks zählt **1 Fehler** stattdessen die Fehlerzeilen |
| Zeilennummern | Jede Zeilennummer verlinkt auf ihre Zeile, etwa `#L45` in der Adresse: Das Öffnen dieser Adresse scrollt zur Zeile und hebt sie hervor |
| Schaltflächen nach oben und unten | Erscheinen unten rechts, sobald die Seite gescrollt ist, um zum Anfang oder ans Ende zu gelangen |
| **Läuft** und **Abbrechen** | Während der Job läuft, bleibt die Leiste auf der Seite des Formulars am unteren Fensterrand, und **Abbrechen** dort stoppt den Job sofort |

---

## Task-Ergebnisse

Ab 7.3.0 öffnet die Ergebniszeile eines Hosts in der Ausgabe eines Playbooks dieses Ergebnis in einem Dialog **Ergebnis der Aufgabe**, wie in AWX.

Die Zeile, der Ergebnisinhalt danach (`=> { ... }`) und der vor einem fehlgeschlagenen Ergebnis ausgegebene Fehler werden beim Darüberfahren als ein Block hervorgehoben, und ein
Klick öffnet den Dialog. Das funktioniert auf der Seite des Jobs und unter einem Formular nach **Senden**, für ein Playbook, das auf einem RTE ab 7.3.0
lief, da das Ergebnis aus denselben Ereignissen stammt wie [Hosts und Tasks](#hosts-and-tasks). Der Dialog hat folgende Tabs:

| Tab | Was er zeigt |
|---|---|
| **Details** | Status, Host, Play, Aufgabe, Modul, Schleifenelement, Startzeit, Dauer, Rückgabecode und Meldung |
| **JSON** und **YAML** | Das gesamte Ergebnis des Moduls, farbig und mit nummerierten Zeilen |
| **Standardausgabe** und **Standardfehler** | `stdout` und `stderr` des Ergebnisses, sofern vorhanden |

Das gesamte Ergebnis, und damit die Tabs **JSON**, **YAML** und die Ausgabe-Tabs, wird nur gespeichert, wenn der Job im Verbose-Modus läuft, da die Ausgabe
es dann ebenfalls zeigt; andernfalls zeigt der Dialog nur die Details. Auch im Verbose-Modus werden die Argumente des Moduls (`invocation`)
weggelassen, Werte von Schlüsseln, die nach einem Secret aussehen, maskiert, und ein Ergebnis wird abgeschnitten, sobald es größer als 64 KB JSON ist.

---

## Der Workflow-Graph

Ab 7.3.0 verschiebt sich der Graph eines laufenden Workflows, um den laufenden Knoten im Blick zu behalten.

Scrollen Sie den Graph weg, bleibt er, wo Sie ihn hingesetzt haben, mit einer Schaltfläche **Dem laufenden Knoten folgen**, um ihm wieder zu folgen. Das Darüberfahren über einen Knoten
zeigt seine Karte mit dem vollständigen Namen und rückt den Knoten und seine Verbindungen in den Fokus, der Rest des Graphs wird abgeblendet. Der Graph hat die Schaltflächen **An
Bildschirm anpassen** und **Vollbild**, und unter einem Formular nach **Senden** öffnet ein Klick auf einen Knoten seine Ausgabe wie auf der Seite des Jobs.

---

## Hosts und Tasks

Seit 7.3.0 zeichnet ein Playbook-Job, der auf einem RTE ab 7.3.0 lief, neben seiner Textausgabe seine strukturierten Ereignisse auf: jedes Play, jeden Task
und jedes Host-Ergebnis sowie das Recap. **Hosts und Tasks** in der Werkzeugleiste der Ausgabe zeigt sie in einem Bereich über der Ausgabe, auf der Seite des Jobs und
unter einem Formular nach **Senden**. Es wird angeboten, sobald der Job Ereignisse hat, und der Bereich wird alle paar Sekunden neu gelesen, während der Job läuft:

| Ansicht | Was sie zeigt |
|---|---|
| **Raster** | Das Recap pro Host (ok, geändert, fehlgeschlagen, nicht erreichbar, übersprungen, gerettet, ignoriert), dann ein Raster aus Hosts und Tasks: Jede Zelle ist nach dem Ergebnis des Hosts für diesen Task eingefärbt, mit Meldung und Zeit beim Darüberfahren, oder *nicht ausgeführt* |
| **Zeitleiste** | Jeden Task als Balken, so lang wie sein langsamster Host gebraucht hat, mit seiner Zeit in Sekunden und der Gesamtzeit |

Die Textausgabe bleibt, wie sie ist. Die Ereignisse schreibt das eigene Callback-Plugin `af_events` des RTE, sodass das Playbook keine Änderung braucht.
