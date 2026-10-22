---
layout: default
title: Einen Workflow ausführen
parent: Workflows
nav_order: 3
translated_from: 1883c268cde716170bdb84c7f2df49e9122dc55d
---

# Einen Workflow ausführen
{: .no_toc }

Einen Workflow aus einem Formular starten und auf der Jobs-Seite verfolgen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Das Formular

Ein Formular vom [Typ `workflow`](../forms/workflow.html) startet einen Workflow, der mit `workflow:` benannt wird wie ein Playbook: über
seine **Datei** im Workflow-Ordner, mit ihren Unterordnern (`team/deploy-app.yml`), oder über den **Namen** des Workflows in
der Datei (`deploy-app`):

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

Die Felder des Formulars erreichen jeden Knoten als Extra-Vars, ebenso seine [`credentials`](../forms/workflow.html#workflow_credentials), unter den Namen,
die das Formular ihnen gibt, so wie die eines mehrstufigen Formulars dessen Schritte erreichen:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

Die eigenen Zugangsdaten eines Knotens, in der Workflow-Datei gesetzt, erreichen sein Playbook unter ihrem eigenen Namen und gewinnen bei einem Namen, den beide verwenden. Im Tab Visuell eines Formulars im Designer ist **Workflow** eine Liste der
Workflow-Dateien des Designers.

Ein bloßer Dateiname wird auch in einem Unterordner gefunden, wenn nur eine Datei ihn trägt. Zwei Workflows mit demselben Namen stoppen ein Formular, das
ihn über seinen Namen nennt, und der Designer warnt, wenn Sie den zweiten speichern: Benennen Sie einen um oder nennen Sie seine Datei. Ein Workflow, der nicht
gefunden wird, beendet den Job als fehlgeschlagen, mit dem Grund in seiner Ausgabe.

---

## Der Job

Ein Workflow-Job läuft auf dem AnsibleForms-Server, und jeder Playbook-Knoten läuft als eigener Job, ein Kind des Workflow-Jobs,
so wie die Schritte eines mehrstufigen Formulars: ein Playbook des Designers auf dem RTE oder, bei einem Knoten mit `runner:`, die Vorlage
oder der Job dieses Runners auf AWX, AAP, Ascender, Semaphore, Rundeck oder Jenkins (siehe [Wo ein Knoten läuft](designer.html#where-a-node-runs)).

Die Seite des Jobs zeichnet den Workflow live: jeden Knoten nach seinem Status eingefärbt, die Verbindungen, die ausgelöst haben, und die Knoten, die
nicht laufen werden. Die Angaben oben nennen den Workflow anstelle eines Playbooks.

- **Klicken Sie auf einen beendeten Knoten**, um seine Ausgabe in einem Dialog zu öffnen.
- **Die Ausgabe** enthält die Ausgabe jedes Knotens unter einem Banner `WORKFLOW NODE [identifier] (status)`, in der Reihenfolge, in der die Knoten
  beendet wurden.
- **Extra-Variablen anzeigen** und **Artefakte anzeigen**, im Kopf jedes Knotens in der Ausgabe und im Dialog, der aus dem Graph geöffnet wird,
  zeigen die eigenen Extravars und Artefakte dieses Knotens (`{}`, wenn er keine hat), als JSON oder YAML, mit einer Schaltfläche Kopieren.

Die Extravars eines Knotens enthalten, was die Knoten vor ihm weitergegeben haben, und seine Artefakte, was sein Playbook mit
`set_stats` gesammelt hat. Die beiden Schaltflächen folgen den [Rollenoptionen](../config/roles.html#role-options) `showExtravars` und
`showArtifacts`. Dieselben Daten liefert `GET /api/v2/job/{id}/node/{nodeId}`, für jeden, der den Job sehen darf.

Der Job schlägt fehl, wenn ein Knoten fehlgeschlagen ist und nichts das behandelt hat, nach der Regel von AWX; andernfalls ist er erfolgreich.

---

## Genehmigungen

Ein Genehmigungsknoten hält den Workflow-Job an, bis jemand darauf antwortet.

Erreicht der Workflow einen Genehmigungsknoten, wechselt der Status des Jobs zu **Wartet auf Genehmigung**: Das erscheint in der Glocke und auf der
Seite des Jobs, wie bei einem [Genehmigungspunkt](../forms/approval.html) eines Formulars. Der Name des Knotens ist der Titel der Genehmigung und seine Beschreibung
die Nachricht; der Rest kommt aus dem `approval` des Formulars:

- seine `roles` entscheiden, wer genehmigen oder ablehnen kann, und `allowSelf`, ob der Starter auch genehmigen darf;
- an seine `notifications` und `channels` wird die Anfrage gesendet.

Ein Workflow-Formular ohne `approval` hält den Job an einem Genehmigungsknoten trotzdem an, aber dann kann nur ein Admin genehmigen.

- **Genehmigt**: Der Knoten ist erfolgreich, und der Workflow geht entlang seiner Verbindungen *bei Erfolg* weiter.
- **Abgelehnt**: Der Knoten schlägt fehl, und der Workflow geht entlang seiner Verbindungen *bei Fehler* weiter.
- **Zeitüberschreitung**: Nach Ablauf des Zeitlimits des Knotens ohne Antwort schlägt der Knoten ebenfalls fehl.

---

## Abbrechen

**Abbrechen** bei einem laufenden Workflow-Job stoppt ihn: Die laufenden Knoten-Jobs werden abgebrochen, es startet nichts mehr, und eine Genehmigung, auf die
er wartet, wird storniert. Auch ein Workflow-Job, der auf eine Genehmigung wartet, kann abgebrochen werden.
