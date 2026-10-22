---
layout: default
title: Workflows
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflows
{: .no_toc }

Playbooks, Genehmigungen und andere Workflows verketten, wie AWX es tut
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Formularautoren: was ein Workflow ist, wie seine Knoten laufen und wo Sie weiterlesen.

Ein Workflow ist ein Graph aus Knoten. Jeder Knoten führt etwas aus: eines der Playbooks des Designers, einen anderen Workflow, eine Genehmigung
oder einen Repository-Pull. Verbindungen zwischen den Knoten sagen, was als Nächstes läuft, bei Erfolg, bei Fehler oder immer. Ein Formular vom
[Typ `workflow`](../forms/workflow.html) startet ihn, und die Jobs-Seite zeichnet ihn live, während er läuft.

Workflows folgen der Syntax und den Regeln von AWX, sodass ein aus AWX exportierter Workflow in AnsibleForms gleich gelesen wird. Sie laufen auf
dem RTE, ohne AWX: Ein Playbook-Knoten ist ein eigener Job, mit Inventar, Zugangsdaten, Limit und Tags des Knotens.

---

## Wie ein Workflow läuft

Die Knoten laufen nach den Regeln von AWX, und Zweige, die nicht voneinander abhängen, laufen parallel.

- **Ein Knoten ohne Eltern startet sofort**, wenn der Workflow startet.
- **Eine Verbindung löst aus, wenn ihr Knoten beendet ist**: eine Verbindung *bei Erfolg* nach einem Erfolg, eine Verbindung *bei Fehler* nach einem Fehler,
  eine Verbindung *immer* nach beidem. Ein abgebrochener Knoten löst keine seiner Verbindungen aus.
- **Ein Knoten startet, sobald eine Verbindung in ihn hinein auslöst.** Mit eingeschaltetem **Alle Eltern müssen zusammenlaufen** wartet er, bis jede Verbindung
  in ihn hinein ausgelöst hat.
- **Ein Knoten, der nicht mehr starten kann, wird als *läuft nicht* markiert**, ebenso die Knoten, die nur er starten könnte.
- **Der Workflow schlägt fehl, wenn ein Knoten fehlgeschlagen ist und nichts das behandelt**: Dieser Knoten hat keine Verbindung *bei Fehler* und keine *immer*.
  Ein Fehler, den eine Verbindung behandelt, lässt den Workflow nicht fehlschlagen.

Ein Knoten mit einer nicht erfüllten Bedingung (`if_extra_var`) wird übersprungen. Was ihm folgt, läuft wie nach einem Erfolg. Ein Genehmigungsknoten
nimmt keine Bedingung: Er wartet immer auf eine Antwort.

---

## Daten zwischen Knoten weitergeben

Was das Playbook eines Knotens mit `set_stats` sammelt, erreicht die nachfolgenden Knoten als Extra-Vars, so wie AWX die Artefakte eines Jobs
weitergibt. Ein Knoten erhält die Daten jedes Elternknotens, dessen Verbindung in ihn hinein ausgelöst hat, zusammengeführt in der Reihenfolge, in der die Eltern
geschrieben sind, und gibt weiter, was er erhalten hat, plus die Daten seines eigenen Jobs, wobei seine eigenen bei einem Schlüssel gewinnen, den beide setzen.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Ein nachfolgender Knoten liest dann {% raw %}`{{ version }}` und `{{ build_id }}`{% endraw %} wie jede andere Extra-Var.

Die Extra-Vars eines Knotens kommen aus vier Quellen. Eine davon, `extra_data`, sind die eigenen Variablen des Knotens: der Name, den AWX dafür verwendet,
am Knoten in der [Workflow-Datei](file.html#run-settings) gesetzt. Wenn zwei denselben Schlüssel setzen, gilt die Rangfolge
von AWX, die niedrigste zuerst:

| Quelle | Gewinnt gegen |
|---|---|
| die eigenen Variablen des Knotens (`extra_data`) | nichts |
| die mit `set_stats` weitergegebenen Daten | das `extra_data` des Knotens |
| die `extra_vars` des Workflows | die weitergegebenen Daten |
| die Werte des Formulars | alles |

- Nur die Playbook-weiten Daten werden weitergegeben: `set_stats` mit `per_host: false`, seinem Standard.
- Ein Genehmigungsknoten, ein übersprungener Knoten und ein Projektknoten geben weiter, was bei ihnen angekommen ist.
- Die Ausgabe eines Knotens endet mit den Schlüsseln, die er weitergegeben hat, nur mit Namen, da ihre Werte geheim sein können.
- Der Job des Knotens behält seine Daten als seine Artefakte (**Artefakte anzeigen** auf seiner Seite), und der Workflow-Job behält die Daten aller seiner
  Knoten, sodass auch ein verschachtelter Workflow sie an die nachfolgenden Knoten weitergibt.
- Ein Knoten, der auf einem AWX-Runner läuft, gibt die Artefakte seines AWX-Jobs auf dieselbe Weise weiter.
---

## In diesem Abschnitt

Die folgenden Seiten beschreiben Workflows im Detail:

| Seite | Inhalt |
|---|---|
| [Die Workflow-Datei](file.html) | Die Syntax der Datei, die Knotentypen und die Ausführungseinstellungen jedes Knotens |
| [Im Designer bearbeiten](designer.html) | Der Bereich Workflows des Designers: der Graph, die Dialoge für Knoten und Verbindungen und der Probelauf |
| [Einen Workflow ausführen](running.html) | Das Formular, das ihn startet, die Job-Seite, Knotenausgaben, Genehmigungen und Abbruch |
