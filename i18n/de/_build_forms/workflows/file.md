---
layout: default
title: Die Workflow-Datei
parent: Workflows
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# Die Workflow-Datei
{: .no_toc }

Die Workflow-Syntax, die Knotentypen und die Ausführungseinstellungen jedes Knotens
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wo Workflow-Dateien liegen

Workflow-Dateien sind YAML-Dateien im lokalen Workflow-Ordner und in jedem Repository, das für Workflows verwendet wird.

- **Der lokale Ordner** ist [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), standardmäßig `workflows` unter dem
  persistenten Ordner.
- **Ein Repository**, bei dem **Für Workflows verwenden?** eingeschaltet ist, wird als Ganzes gelesen, sodass seine Workflow-Dateien in jedem Ordner liegen können. Der
  Designer speichert sie zurück ins Repository, und **Push** sendet sie an das Remote.

Jede YAML-Datei, die `workflow_job_templates` enthält, wird gelesen, bis zu sechs Ordnerebenen tief, und eine Datei kann mehrere
Workflows enthalten. Ein Formular nennt einen Workflow über seinen `name`, halten Sie die Namen also eindeutig: Wenn zwei Workflows denselben Namen haben, schlägt ein Job, der
ihn ausführt, fehl und fordert auf, einen davon umzubenennen.

---

## Die Syntax

Eine Workflow-Datei wird in der Syntax eines AWX-Exports geschrieben, mit den Knoten unter `related.workflow_nodes`:

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

Die Struktur der Collection `awx.awx` wird ebenfalls gelesen: `workflow_nodes` direkt unter dem Workflow, und Namen als
einfache Zeichenketten (`inventory: staging`) statt als Maps (`inventory: {name: staging}`).

### Der Workflow

Ein Workflow-Eintrag hat neben seinen Knoten einige eigene Schlüssel:

| Schlüssel | Was er ist |
|---|---|
| `name` | Der Name des Workflows, den das `workflow:` eines Formulars nennt |
| `description` | Wofür er gedacht ist, im Designer angezeigt |
| `extra_vars` | Variablen, die jeder Knoten erhält; die Werte des Formulars haben Vorrang |
| `related.workflow_nodes` | Die Knoten |

### Ein Knoten

Jeder Knoten hat einen Bezeichner, das, was er ausführt, und seine Verbindungen:

| Schlüssel | Was er ist |
|---|---|
| `identifier` | Die ID des Knotens: Buchstaben, Ziffern, Punkte, Bindestriche, Doppelpunkte und Unterstriche, eindeutig im Workflow |
| `unified_job_template.type` | Was der Knoten ausführt: siehe [Knotentypen](#node-types) |
| `unified_job_template.name` | Das Playbook, der Workflow, die Genehmigung oder das Repository, das er ausführt |
| `related.success_nodes` | Die Knoten, die laufen, wenn dieser erfolgreich ist |
| `related.failure_nodes` | Die Knoten, die laufen, wenn dieser fehlschlägt |
| `related.always_nodes` | Die Knoten, die laufen, wenn dieser beendet ist, egal wie |
| `all_parents_must_converge` | `true`: Der Knoten wartet, bis jede Verbindung in ihn hinein ausgelöst hat, nicht nur eine |

Verbindungen müssen vorwärts führen: Ein Workflow, dessen Verbindungen eine Schleife bilden, läuft nicht.

---

## Knotentypen

Ein Knoten führt eines von vier Dingen aus, benannt wie in AWX:

| Typ | Was der Knoten ausführt |
|---|---|
| `job_template` | Eines der Playbooks des Designers, als eigenen Job auf dem RTE; oder, mit `runner:`, die Vorlage oder den Job dieses Runners |
| `workflow_job_template` | Einen anderen Workflow, als untergeordneten Workflow-Job; Workflows lassen sich bis zu fünf Ebenen tief verschachteln |
| `workflow_approval_template` | Eine Genehmigung: Der Workflow-Job wartet, bis jemand genehmigt oder ablehnt |
| `project` | Einen Pull des genannten Repositorys (das Projekt-Update von AWX) |

Das `unified_job_template.timeout` eines Genehmigungsknotens ist in Sekunden angegeben. Läuft es ohne Antwort ab, schlägt der Knoten fehl; `0` oder kein
Zeitlimit wartet beliebig lange auf eine Antwort. Eine abgelehnte Genehmigung lässt den Knoten fehlschlagen, und der Workflow geht entlang seiner
Verbindungen weiter.

---

## Ausführungseinstellungen

Ein `job_template`-Knoten übernimmt die Einstellungen eines AWX-Knotens, direkt am Knoten:

| Schlüssel | Was er bewirkt |
|---|---|
| `inventory` | Das Inventar, gegen das das Playbook läuft, über seinen Namen, wie das `inventory:` eines Formulars |
| `related.credentials` | Die Zugangsdaten: Jeder Eintrag erreicht das Playbook unter seinem eigenen Namen, und der erste vom Typ *SSH* ist auch der Login, mit dem sich Ansible verbindet. Ein Vault-Eintrag öffnet nur die Vaults |
| `limit` | Läuft nur auf diesen Hosts (`--limit`) |
| `job_tags` | Führt nur die Tasks mit diesen Tags aus (`--tags`) |
| `skip_tags` | Überspringt die Tasks mit diesen Tags (`--skip-tags`) |
| `verbosity` | `0` bis `5`: die Anzahl der `-v` |
| `diff_mode` | `true`: zeigt die Änderungen (`--diff`) |
| `job_type` | `check`: ein Probelauf (`--check`); `run` oder nichts: ein echter Lauf |
| `extra_data` | Variablen, die dieser Knoten erhält, unter den `extra_vars` des Workflows und den Werten des Formulars |

Der Job des Knotens erhält die Werte des Formulars als Extra-Vars. Die Werte des Formulars haben Vorrang vor den `extra_vars` des Workflows, die wiederum Vorrang
vor dem `extra_data` des Knotens haben, so wie die Antworten eines Surveys in AWX.

---

## Eigene Schlüssel von AnsibleForms

Drei Schlüssel eines Knotens gehören AnsibleForms selbst, und AWX ignoriert sie, sodass ein Workflow das kann, was ein mehrstufiges Formular kann:

| Schlüssel | Was er bewirkt |
|---|---|
| `runner` | Führt auf einem `job_template`-Knoten die Vorlage oder den Job dieses Runners statt eines Playbooks des Designers aus: AWX, AAP, Ascender, Semaphore, Rundeck oder Jenkins. Ein RTE-Runner führt das Playbook des Knotens dort aus. Ein Workflow kann sie mischen. |
| `if_extra_var` | Der Knoten läuft nur, wenn diese Extra-Var `true` ist, wie `ifExtraVar` eines Multistep-Schritts. Ist sie nicht erfüllt, wird der Knoten übersprungen, und was ihm folgt, läuft wie nach einem Erfolg. Nicht auf einem Genehmigungsknoten, der immer läuft. |
| `extra_vars_key` | Der Knoten erhält nur diesen Schlüssel der Extra-Vars, mit dem Benutzer hineinkopiert, wie der `key` eines Multistep-Schritts |

Auf einem Vorlagen-Runner ist `unified_job_template.name` die auszuführende Vorlage bzw. der Job, und `limit`, `job_tags`, Check-Modus
und Diff-Modus des Knotens werden so übergeben, wie ein Formular vom Typ dieses Runners sie übergeben würde. Eine `verbosity` über `0` schaltet das
`verbose` des Formulars ein, und `skip_tags` wird nicht übergeben. Nur ein AWX-Runner (AWX, AAP oder Ascender) erhält das Inventar des Knotens und die
Zugangsdaten als seine AWX-Zugangsdaten; Semaphore, Rundeck und Jenkins erhalten die Zugangsdaten als `credentials` eines Formulars.
