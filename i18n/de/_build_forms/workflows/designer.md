---
layout: default
title: Im Designer bearbeiten
parent: Workflows
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Im Designer bearbeiten
{: .no_toc }

Einen Workflow zeichnen und ausprobieren, ohne etwas auszuführen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Der Bereich Workflows

**Designer > Workflows** listet die Workflow-Dateien in einem Datei-Explorer auf, mit den Tabs YAML, Visuell und Vorschau, die jeder
Bereich des [Designers](../designer/) hat.

- **Die Schaltfläche `+`** in der Werkzeugleiste erstellt eine Workflow-Datei mit einem leeren Workflow als Ausgangspunkt.
- **YAML** zeigt die Datei so, wie sie geschrieben ist. Kommentare und die Reihenfolge der Schlüssel bleiben auch in den anderen Tabs erhalten.
- **Visuell** zeichnet jeden Workflow der Datei als Graph, mit Name und Beschreibung darüber. Eine Datei mit zwei Workflows
  zeigt beide, einen unter dem anderen.
- **Vorschau** ist ein Probelauf des Workflows: siehe [Ausprobieren](#trying-it-out).

Probleme werden über dem Graph aufgelistet, jedes mit einem Link, der das YAML in der betreffenden Zeile öffnet: ein Link zu einem Knoten, den es nicht
gibt, eine Schleife, ein Playbook, Inventar, Zugangsdaten, ein Runner oder Repository, die der Designer nicht kennt.

---

## Der Graph

Der Graph liest sich von links nach rechts, von **START** bis zu den letzten Knoten. Jeder Knoten zeigt seinen Bezeichner und darunter, was
er ausführt; die Verbindungen sind danach eingefärbt, was sie auslöst, wie die Legende im Graph sagt: bei Erfolg, bei Fehler,
immer.

- **Klicken Sie auf START**, um einen ersten Knoten hinzuzufügen: einen Knoten ohne Eltern, der läuft, sobald der Workflow startet.
- **Klicken Sie auf einen Knoten**, um ihn zu bearbeiten.
- **Klicken Sie auf eine Verbindung**, um zu ändern, was sie auslöst, oder um sie zu entfernen.

---

## Einen Knoten hinzufügen

Ein neuer Knoten wird mit einem Wizard hinzugefügt: **Neuer Knoten bei Erfolg**, **Neuer Knoten bei Fehler** oder **Neuer Knoten immer** an einem vorhandenen
Knoten, oder START für einen ersten.

1. **Was er ausführt**: der Bezeichner des Knotens, **Führt aus** (welche Art von Knoten es ist und, bei einem Playbook-Knoten, wo er läuft)
   und was er ausführt: ein Playbook oder eine Vorlage oder einen Job, einen Workflow, Name und Zeitlimit einer Genehmigung oder ein Repository. Siehe
   [Wo ein Knoten läuft](#where-a-node-runs).
2. **Wie er läuft**: die Ausführungseinstellungen: das Inventar, die Zugangsdaten, das Limit, die Tags, die Ausführlichkeit,
   Check- und Diff-Modus, die Bedingung (**Läuft, wenn**) und **Werte aus** (siehe [die Workflow-Datei](file.html#run-settings)).
3. **Wohin er führt**: der Knoten, nach dem er läuft, und wann.

**Erstellen** fügt den Knoten in das YAML ein.

---

## Wo ein Knoten läuft

**Führt aus** sagt in einer einzigen Liste, was ein Knoten ausführt und wo: **Playbook auf dem RTE**, **Vorlage auf AWX**, **Vorlage auf
Semaphore**, **Job auf Rundeck**, **Job auf Jenkins**, dann **Workflow**, **Genehmigung** und **Repository-Pull**.

| Führt aus | Das Feld darunter | Runner |
|---|---|---|
| **Playbook auf dem RTE** | **Playbook**: ein Playbook des Designers | **Das Standard-RTE** oder ein RTE-Runner nach Namen |
| **Vorlage auf AWX** (AAP und Ascender eingeschlossen) | **Vorlage**: der Name der Vorlage, eingetippt | die AWX-Runner, jeder mit seiner Variante |
| **Vorlage auf Semaphore** | **Vorlage**: der Name der Vorlage, eingetippt | die Semaphore-Runner |
| **Job auf Rundeck** oder **Job auf Jenkins** | **Job**: der Name des Jobs, eingetippt | die Rundeck- oder Jenkins-Runner |

- **Playbook auf dem RTE** wird immer angeboten, die anderen nur, wenn die Instanz einen [Runner](../runners.html) dieses Typs hat.
- **Runner** listet nur die Runner dieses Typs auf, der Standard-Runner ist markiert und vorausgewählt (oder der erste nach Namen).
- Wenn Sie einen anderen Ort wählen, wird geleert, was der Knoten ausführt, sodass es neu gewählt wird.
- Ein Knoten, dessen Runner der Designer nicht kennt, zeigt **Vorlage oder Job auf** diesem Runner.

Die Workflow-Datei ändert sich nicht: Ein solcher Knoten ist ein `job_template`-Knoten mit einem `runner:` (siehe
[die Workflow-Datei](file.html#run-settings)).

---

## Einen Knoten bearbeiten

Ein Klick auf einen Knoten öffnet seinen Dialog, mit vier Tabs:

| Tab | Was er enthält |
|---|---|
| **Was er ausführt** | Den Bezeichner, **Führt aus**, was er ausführt und, bei einem Playbook-Knoten, den Runner |
| **Wie er läuft** | Die Ausführungseinstellungen; Zugangsdaten werden aus einer Liste gewählt, jede mit `+` hinzugefügt |
| **Läuft nach** | Die Verbindungen in den Knoten hinein, und **Alle Eltern müssen zusammenlaufen** |
| **Danach** | Die Verbindungen aus ihm heraus, mit **Mit einem vorhandenen Knoten verbinden:** und **Mit einem neuen Knoten verbinden:** |

**In YAML zeigen** öffnet das YAML am Knoten, und **Knoten entfernen** entfernt ihn mit seinen Verbindungen. Jede Änderung wird sofort ins
YAML geschrieben; **Speichern** speichert die Datei.

---

## Ausprobieren

Der Tab **Vorschau** spielt den Workflow durch, ohne etwas zu starten, nach den Regeln von AWX.

Jeder Knoten beginnt als Erfolg. Klicken Sie auf einen Knoten, damit er fehlschlägt, und erneut, damit er gelingt; der Graph zeigt dann,
welche Knoten laufen würden, welche nicht laufen würden und ob der Workflow fehlschlagen würde. **Zurücksetzen** lässt alle Knoten wieder gelingen.
