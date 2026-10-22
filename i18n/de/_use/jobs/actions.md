---
layout: default
title: Job-Aktionen
parent: Jobs
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# Job-Aktionen
{: .no_toc }

Einen Job starten, abbrechen, neu starten, genehmigen oder ablehnen und löschen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Einen Job starten

Jeder Job beginnt mit einem Formular. Öffnen Sie es auf der Seite **Formulare**, füllen Sie die Felder aus und klicken Sie auf **Senden**:

1. Das Formular wird im Browser validiert, und die Feldwerte werden an den Server gesendet.
2. Der Server erstellt den Job und gibt seine Nummer zurück; die [`onSubmit`](../forms/job-status-action.html)-Aktionen des Formulars laufen.
3. Die Ausgabe des Jobs erscheint unter dem Formular und wird alle zwei Sekunden aktualisiert, bis der Job endet.

Der Job erscheint auch auf der Seite **Jobs**, wo Sie ihn später verfolgen können.

### Wer ein Formular starten kann

Ein Formular wird für Benutzer aufgelistet und kann von ihnen gestartet werden, die eine der [Rollen](../config/roles.html) in seiner Liste `roles` haben.
Die Rolle `default`, die jeder Benutzer hat, macht ein Formular für alle verfügbar, die sich anmelden können.

### Vor dem Senden

Die Leiste über den Feldern bietet einige Werkzeuge, jedes nur sichtbar, wenn Ihre Rolle es erlaubt:

| Schaltfläche | Was sie macht | Rollenoption |
|---|---|---|
| **Extra-Variablen anzeigen** | Zeigt eine Vorschau der Extravars, die der Job erhalten wird, während Sie die Felder ausfüllen | `showExtraVars` |
| **verbose** | Führt den Job im Verbose-Modus aus | `allowVerboseMode` |
| **Aus Speicher laden** | Füllt die Felder aus einem [gespeicherten Job](stored-jobs.html) | `allowStoredJobs` |
| **Dieses Formular neu laden** | Lädt das Formular erneut, mit seinen Standardwerten | keine |

### Auswahl beim Start

Ein Formular kann seine Benutzer beim Start einige Ansible-Optionen wählen lassen, indem es ein Feld mit einem reservierten Namen deklariert. Der
Wert des Felds überschreibt dann die eigene Einstellung des Formulars:

| Feldname | Überschreibt | Typischer Feldtyp |
|---|---|---|
| `__check__` | Check-Modus, ein Probelauf, der nichts ändert | `checkbox` |
| `__diff__` | Diff-Modus, der zeigt, was sich ändern würde | `checkbox` |
| `__limit__` | Die Hosts, auf denen das Playbook läuft | `text` oder `enum` |
| `__tags__` | Die auszuführenden Tags | `text` oder `enum` |
| `__inventory__` | Das Inventar | `enum` |
| `__playbook__`, `__template__` | Das Playbook oder die AWX-/AAP-Vorlage | `enum` |

Zum Beispiel ein Formular, das einen Probelauf und eine Host-Begrenzung anbietet:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

Der Server akzeptiert diese Namen nur von einem Formular, das sie als Felder deklariert, sodass ein Start über die API sie nicht
eigenmächtig hinzufügen kann. Die Eigenschaften, die sie überschreiben, sind bei [Ansible-Formulare](../forms/ansible.html) und [AWX-Formulare](../forms/awx.html) beschrieben.

### Was einen Start aufhalten kann

Ein Start wird nicht immer sofort zu einem laufenden Job:

* **Ungültige Felder** : Das Formular wird nicht abgesendet, und jedes Feld, das seine Validierung nicht besteht, zeigt den Grund.
* **Start-Validierung** : Mit der [Start-Validierung](../launch-validation/) auf `enforce` prüft der Server die Werte
  erneut und lehnt einen Start ab, der die Regeln des Formulars verletzt.
* **Genehmigung** : Ein Formular mit einem [Genehmigungspunkt](../forms/approval.html) erstellt den Job, der dann im Status
  `approve` wartet; siehe [Einen Job genehmigen oder ablehnen](#approve-or-reject-a-job).

Wenn der Job endet, senden die [Benachrichtigungen](../forms/notifications.html) des Formulars ihre Mails und Kanalnachrichten, und seine
Aktionen bei Jobstatus laufen.

### Andere Wege, einen Job zu starten

Ein Formular kann einen Job auch starten, ohne dass eine Person auf **Senden** klickt:

| Gestartet von | Wie | Seite |
|---|---|---|
| Später ausführen oder ein Cron-Zeitplan | **Später ausführen (einmalig)** oder **Planen (wiederkehrend)** neben **Senden** | [Zeitpläne](schedules.html) |
| Ein Skript oder eine Pipeline | `POST /api/v2/job` mit einem API-Token | [Jobs über die REST-API](../api/jobs.html) |
| Ein KI-Agent | Das Tool `launch_job` des MCP-Servers | [MCP-Tools](../mcp/tools.html) |
| Eine Unterhaltung | Der Chat-Assistent füllt das Formular aus und startet es | [Chat-Assistent](../chat/) |
| Ein früherer Job | **Neu starten**, siehe unten | [Einen Job neu starten](#relaunch-a-job) |

---

## Einen Job abbrechen

**Abbrechen** im Zeilenmenü (⋮) der Liste oder **Job abbrechen** auf der Seite des Jobs stoppt einen Job mit Status `running`. Nach Ihrer Bestätigung
markiert AnsibleForms den Job zum Abbruch:

* **`ansible`**: Das RTE stoppt den Playbook-Prozess (mit allen seinen Workern), und der Job endet als `aborted` mit
  `... was aborted by the operator`. Ein Job, der noch auf ein freies RTE wartet, wird abgebrochen, bevor er startet.
* **Ein Vorlagen-Job** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins): AnsibleForms bittet den Runner, den Job abzubrechen oder zu stoppen,
  und der Job endet als `aborted`. Lehnt der Runner ab, zeigt die Ausgabe `Abort request denied`, gefolgt von
  `reverting abort request`, und der Job läuft weiter. Ein Jenkins-Build, der noch in der Warteschlange steht, wird daraus entfernt.
* **`workflow`**: Die laufenden Knoten-Jobs werden abgebrochen, und es startet nichts mehr (siehe
  [Einen Workflow ausführen](../workflows/running.html#abort)).
* **`multistep`**: Die Schritte, die noch nicht gestartet sind, werden übersprungen (`skipping: [Abort is requested]`), und der Hauptjob
  endet als `aborted`. Ein Schritt, der bereits läuft, ist ein eigener Job: Öffnen Sie ihn und brechen Sie ihn ab, um auch ihn zu stoppen.

Sie können Ihre eigenen Jobs abbrechen; ein Admin oder ab 7.3.0 ein Benutzer, dessen Rolle `manageAllJobs` setzt, kann jeden Job abbrechen. `showAllJobLogs` lässt einen
Benutzer die Jobs anderer Benutzer sehen, aber nicht abbrechen.

---

## Einen Job neu starten

**Neu starten** im Zeilenmenü (⋮) der Liste oder **Job neu starten** auf der Seite des Jobs startet einen neuen Job aus einem beendeten. Es wird bei jedem
Job angeboten, der weder `running` ist noch auf eine Genehmigung wartet, für Benutzer, deren Rolle die Rollenoption `allowJobRelaunch` setzt.

Der Dialog bietet:

* **Neu starten**: Führt den Job erneut mit den Werten aus, mit denen er lief, als neuen Job unter Ihrem Namen.
* **Verbose-Modus**: Startet im Verbose-Modus neu; sichtbar mit der Rollenoption `allowVerboseMode`.
* **Werte vor dem Neustart bearbeiten**, dann **Bearbeiten und neu starten**: Öffnet das Formular mit den Werten des Jobs vorausgefüllt, sodass Sie
  sie vor dem Absenden ändern können.

Ein Neustart setzt außerdem voraus, dass das Formular ihn erlaubt (`allowRelaunch`, standardmäßig true) und dass der Job **Ihr eigener** ist, es sei denn,
Sie sind Admin oder haben ab 7.3.0 `manageAllJobs`; `showAllJobLogs`, womit sich bis 7.2 jeder Job neu starten ließ, reicht dafür nicht mehr. Wie ein Neustart gegen die Regeln des Formulars geprüft wird und warum ein Formular mit einem
Passwortfeld ihn ablehnen kann, ist unter [Neustarten](../launch-validation/relaunching.html) beschrieben.

### Mit vorausgefüllten Daten neu starten

**Bearbeiten und neu starten** öffnet das Formular mit dem URL-Parameter `prefillJobId`, den Sie auch in einem eigenen Link verwenden können:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

Das Formular lädt die mit Job `61` gespeicherten Feldwerte und zeigt `Formular mit den Daten des vorherigen Jobs #61 vorausgefüllt`.
Das Absenden startet einen neuen Job, der wie jeder andere Start geprüft wird. Das Vorausfüllen folgt denselben Regeln wie ein Neustart:

* **Passwortfelder werden nie gespeichert**, also auch nie vorausgefüllt: Geben Sie sie erneut ein. Konstanten werden ebenfalls nicht gespeichert.
* Die Rollenoption `allowJobRelaunch` ist erforderlich, und der Job muss Ihr eigener sein (oder Sie sind Admin oder haben `manageAllJobs`).
* Ein Formular mit `allowRelaunch: false` kann weder neu gestartet noch vorausgefüllt werden:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Ein Job aus der Zeit, bevor die Feldwerte gespeichert wurden, kann nicht vorausgefüllt werden, und das Formular zeigt stattdessen einen Fehler:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Einen Job genehmigen oder ablehnen

Ein Job mit einem [Genehmigungspunkt](../forms/approval.html) hält im Status `approve` an und wartet. Er wird auf der Jobs-Seite
seiner Genehmiger aufgelistet, der Benutzer mit einer der Rollen der Genehmigung, damit sie ihn finden; ab 7.3.0 sehen andere Benutzer ihn nicht mehr.

**Genehmigung prüfen** wird Admins und Benutzern angeboten, die eine der Rollen der Genehmigung haben: ein Klick auf die Zeile des Jobs,
**Genehmigung prüfen** im Zeilenmenü oder die Schaltfläche **Genehmigung prüfen** auf der Seite des Jobs. Der Dialog zeigt die Nachricht
der Genehmigung, mit den eingesetzten Werten des Jobs (oder eine allgemeine Zeile, wenn es keine gibt), sowie das Formular, die Job-ID, wer ihn gestartet hat und
wann, mit einem Link zum Job; **Ablehnen** und **Freigeben** beantworten sie:

* **Freigeben**: Der Job läuft weiter, und sein Status wechselt zurück zu `running`.
* **Ablehnen**: Der Job endet als `rejected`, und seine Ausgabe vermerkt `rejected by <username>`.

Ein Job, der auf eine Genehmigung wartet, kann auf der Jobs-Seite weder neu gestartet noch gelöscht werden; genehmigen oder lehnen Sie ihn zuerst ab.

Ab 7.3.0 kann der Benutzer, der einen Job gestartet hat, ihn nicht genehmigen, sodass immer eine zweite Person ihn ansieht; ablehnen kann er ihn aber weiterhin, um
ihn zurückzuziehen. Ein Admin kann immer genehmigen, auch die eigenen Jobs. Ein Formular, dessen Genehmigungspunkt
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) setzt, lässt auch den Starter seinen eigenen Job genehmigen.

---

## Einen Job löschen

**Löschen** im Zeilenmenü (⋮) der Liste oder **Job löschen** auf der Seite des Jobs löscht einen Job mit seiner Ausgabe nach Ihrer Bestätigung.
Das Löschen eines Multistep-Jobs löscht auch seine Schritte. Um mehrere Jobs auf einmal zu löschen, markieren Sie sie in der ersten Spalte der Liste und
klicken Sie darüber auf **Löschen (n)**.

Sie können Ihre eigenen Jobs löschen. Admins und ab 7.3.0 Benutzer mit der Rollenoption `manageAllJobs` können jeden Job löschen; `showAllJobLogs`
kann das nicht mehr. Eine Rolle, die `allowJobDeletion: false` setzt, löscht gar keinen Job, nicht einmal die eigenen, sodass der Jobverlauf vollständig bleibt. Auf der Seite
des Jobs ist die Schaltfläche ausgeblendet, solange der Job läuft oder abgebrochen wird (außer für Admins und `manageAllJobs`) und solange er auf eine Genehmigung wartet; in der Liste sind
Menüeintrag und Kontrollkästchen für einen Job, den Sie nicht löschen können, ausgegraut.
