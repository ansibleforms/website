---
layout: default
title: Status und Typen
parent: Jobs
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | Das Playbook wurde beendet, [erfordert aber Aufmerksamkeit](#a-job-that-needs-attention): Jemand muss es nachverfolgen. Oder ein Multistep wurde beendet, aber ein Schritt mit gesetztem `continue` schlug fehl | Auf der Job-Seite lesen, warum, es nachverfolgen, neu starten, löschen |
| `aborted` | Der Job wurde aus AnsibleForms abgebrochen, oder der AWX-/AAP-Job wurde abgebrochen | Ausgabe ansehen, neu starten, löschen |
| `rejected` | Ein Genehmiger hat den Job abgelehnt; er lief nie | Ausgabe ansehen, neu starten, löschen |
| `abandoned` | AnsibleForms hat aufgehört, den Job zu verfolgen (siehe [Verwaiste Jobs](cleanup.html#abandoned-jobs)) | Die verwalteten Hosts prüfen, neu starten, löschen |

`running` ist blau, `success` grün und lautet **Erfolgreich**, und `failed` rot. `approve` ist orange und lautet **Wartet auf Genehmigung**,
sodass sich ein Job, der auf eine Person wartet, von den gestoppten abhebt; `warning` lautet **Erfordert Aufmerksamkeit** und ist, wie `aborted` und `rejected`, bernsteinfarben. `abandoned` ist
grau: Niemand hat ihn gestoppt, was ihn ausführte, ist weg.

---

## Ein Job, der Aufmerksamkeit erfordert

Ab 7.8.0 kann ein Playbook, das wie vorgesehen beendet wurde, einem Operator aber noch Arbeit hinterlässt (eine Genehmigung an
anderer Stelle, ein manueller Schritt, eine teilweise Anwendung), seinen Job als **Erfordert Aufmerksamkeit** (`warning`) mit einer
Meldung beenden, statt mit einem `failed`, das nach kaputter Automatisierung aussieht, oder einem `success`, das verbirgt, was noch
offen ist. Das Playbook teilt das auf eine von zwei Arten mit:

* eine **Statusdatei** neben dem Playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (oder `.yaml`), auf einem RTE. Das
  RTE liest sie, sobald das Playbook endet, und entfernt sie dann
* **`set_stats`** mit dem Schlüssel `af_job_status`, auf einem RTE und auf AWX, AAP oder Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms übergibt `__jobid__` in den Extravars, sodass das Playbook den Pfad der Datei bilden kann. Tut ein Playbook beides,
gewinnt die Datei.

* Nur ein **erfolgreiches** Playbook kann als Erfordert Aufmerksamkeit enden: Ein fehlgeschlagener Job bleibt `failed` und ein
  abgebrochener `aborted`, egal was in der Datei steht
* Eine ungültige Datei (keine Meldung, ein anderer Status, fehlerhaftes YAML) wird ignoriert: Der Job bleibt erfolgreich, und
  seine Ausgabe nennt den Grund in einer `[WARNING]`-Zeile
* Die Meldung erscheint auf der Job-Seite in einem bernsteinfarbenen Kasten, mit dem Detail darunter als YAML eingeklappt, als
  Tooltip des Status in der Liste und in der letzten Ausgabezeile des Jobs. **Erfordert Aufmerksamkeit** unter **Vergangenheit**
  im Jobs-Menü listet diese Jobs auf
* [Benachrichtigungen](../forms/notifications.html) mit `onStatus: [warning]` werden für sie gesendet; die Mail und die Kanäle
  enthalten die Meldung, ein Webhook als [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* In einem Multistep gilt ein Schritt, der Aufmerksamkeit erfordert, als bestanden, und der nächste Schritt läuft; der Multistep
  erfordert dann ebenfalls Aufmerksamkeit. In einem [Workflow](../workflows/) zählt der Job für den nächsten Knoten als erfolgreich

Jobs von Semaphore, Rundeck und Jenkins können nicht als Erfordert Aufmerksamkeit enden.

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
