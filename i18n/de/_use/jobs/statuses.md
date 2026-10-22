---
layout: default
title: Status und Typen
parent: Jobs
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Status und Typen
{: .no_toc }

Jeder Status, den ein Job haben kann, und die Arten von Jobs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jobstatus

AnsibleForms setzt folgende Status auf einem Job. Die Liste zeigt jeden Status als farbiges Badge:

| Status | Bedeutung | Was Sie tun können |
|---|---|---|
| `running` | Der Job läuft, oder ein genehmigter Job wurde fortgesetzt | Seine Ausgabe verfolgen, ihn abbrechen |
| `approve` | Der Job wartet an einem [Genehmigungspunkt](../forms/approval.html), bevor er läuft (oder bevor ein Schritt eines Multistep läuft) | Ihn genehmigen oder ablehnen, wenn eine Ihrer Rollen ein Genehmiger ist |
| `success` | Das Playbook, die Vorlage oder jeder Schritt wurde ohne Fehler beendet | Ausgabe ansehen, neu starten, löschen |
| `failed` | Der Job endete mit einem Fehler, oder der Start selbst schlug fehl | Ausgabe ansehen, um den Grund zu sehen, neu starten, löschen |
| `warning` | Ein Multistep wurde beendet, aber ein Schritt mit gesetztem `continue` schlug fehl | Ausgabe ansehen, neu starten, löschen |
| `aborted` | Der Job wurde aus AnsibleForms abgebrochen, oder der AWX-/AAP-Job wurde abgebrochen | Ausgabe ansehen, neu starten, löschen |
| `rejected` | Ein Genehmiger hat den Job abgelehnt; er lief nie | Ausgabe ansehen, neu starten, löschen |
| `abandoned` | AnsibleForms hat aufgehört, den Job zu verfolgen (siehe [Verwaiste Jobs](cleanup.html#abandoned-jobs)) | Die verwalteten Hosts prüfen, neu starten, löschen |

`running` ist blau, `success` grün und lautet **Erfolgreich**, und `failed` rot. `approve` ist orange und lautet **Wartet auf Genehmigung**,
sodass sich ein Job, der auf eine Person wartet, von den gestoppten abhebt; `warning`, `aborted` und `rejected` sind bernsteinfarben. `abandoned` ist
grau: Niemand hat ihn gestoppt, was ihn ausführte, ist weg.

---

## Job-Typen

Der Job-Typ folgt dem `type` des Formulars, das den Job gestartet hat, wie die Liste und die Seite des Jobs ihn anzeigen:

| Angezeigter Typ | Was läuft |
|---|---|
| `ansible` | Ein Ansible-Playbook, auf einem RTE ausgeführt |
| `awx`, `aap`, `ascender` | Eine Job-Vorlage oder Workflow-Vorlage auf AWX, AAP oder Ascender |
| `semaphore` | Eine Vorlage auf Semaphore UI |
| `rundeck`, `jenkins` | Ein Job auf Rundeck oder Jenkins |
| `workflow` | Ein [Workflow](../workflows/), dessen Playbook-Knoten als eigene Jobs darunter laufen |
| `multistep` | Veraltet, verwenden Sie `workflow`: eine Folge von Schritten, jeder als eigener Job unter dem Hauptjob aufgezeichnet |

Ein Vorlagen-Job wird als `awx`-Job gespeichert (auch in der REST-API) und mit der Art des Runners angezeigt, auf dem er lief, egal wie das
Formular ihn nannte: Ein Formular vom Typ `awx`, das auf einem AAP-Runner läuft, zeigt `aap`.

Siehe [Ansible-Formulare](../forms/ansible.html), [AWX-Formulare](../forms/awx.html), [Workflow-Formulare](../forms/workflow.html) und
[Mehrstufige Formulare](../forms/multistep.html) für die Seite der Formulare.
