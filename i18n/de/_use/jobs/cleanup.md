---
layout: default
title: Bereinigung
parent: Jobs
nav_order: 6
translated_from: 48c1ec6d3d2ac80c86dd71d6799fbb1b59c5cb2f
---

# Bereinigung
{: .no_toc }

Durch einen Neustart abgeschnittene Jobs, und wie lange beendete Jobs aufbewahrt werden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Verwaiste Jobs

Ein laufender Job wird von dem AnsibleForms-Prozess verfolgt, der ihn gestartet hat. Endet diese Verfolgung, wird der Job als
`abandoned` markiert:

* **Beim Start** werden die Jobs, die dieser Prozess vor seinem Neustart verfolgt hat, und die Jobs aus der Zeit vor 7, die kein Prozess
  verfolgt, als verwaist markiert, wenn sie noch `running` sind oder abgebrochen werden; das Protokoll zeigt `Abandoned <n> jobs`. Ein Job, der
  auf einem RTE läuft, bleibt unberührt: Er läuft ohne den Prozess, der ihn gestartet hat, weiter.
* **Jede Minute** werden die Jobs, die ein anderer AnsibleForms-Prozess (oder ein RTE) verfolgt, der seit 2 Minuten nicht mehr antwortet,
  als verwaist markiert; das Protokoll zeigt `Abandoned <n> jobs followed by a node that stopped answering`.
* **Jede Stunde** werden Jobs, die vor mehr als einem Tag gestartet wurden, noch `running` sind und seit einem Tag keine Ausgabe geschrieben haben, als verwaist markiert.
  Ein Job, der auf einem RTE läuft, bleibt auch hier unberührt: Das RTE räumt seine eigenen Jobs auf, wenn es neu startet.

Ab 7.3.0 wird ein Vorlagen-Job auf AWX, AAP oder Ascender, den ein Neustart oder ein gestoppter Knoten verwaist hat, wieder aufgenommen, wenn er
innerhalb der letzten 24 Stunden gestartet wurde: Ein AnsibleForms-Prozess übernimmt ihn, verfolgt ihn wieder auf dem Runner, und der Job endet mit dem, was
dort tatsächlich passiert ist. Jobs auf den anderen Runnern, Playbooks, Workflows und Multistep-Jobs bleiben verwaist.

Ein verwaistes Playbook ist möglicherweise teilweise gelaufen. Prüfen Sie die verwalteten Hosts, bevor Sie es neu starten; siehe
[Ein Job zeigt den Status abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Aufbewahrung von Jobs

Jobs werden aufbewahrt, bis sie gelöscht werden, sofern der Administrator keine Aufbewahrungsfrist setzt.

Ist [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) gesetzt, löscht eine nächtliche Aufgabe (um 2:30)
die beendeten Jobs, mit ihrer Ausgabe und ihren Schritten, die vor mehr als so vielen Tagen geendet haben. Sie entfernt nur Jobs mit
Status `success`, `failed`, `warning`, `aborted`, `rejected` oder `abandoned`, sodass laufende Jobs und Jobs, die auf eine
Genehmigung warten, unabhängig von ihrem Alter erhalten bleiben. Der Standard, `0`, bewahrt jeden Job auf.
