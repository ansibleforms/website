---
layout: default
title: Systemaufgaben
parent: Jobs
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Systemaufgaben
{: .no_toc }

Die Wartungsaufgaben, die AnsibleForms selbst ausführt, und wann sie laufen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: die Bereinigungen, die nächtliche Sicherung und die übrige Hintergrundarbeit des Servers, seit 7.8.0 unter **Jobs** aufgelistet.

---

## Die Aufgaben

Der Server führt diese Aufgaben selbst aus, jede nach einem Cron in der Zeitzone des Servers, gesetzt mit [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Aufgabe | Läuft standardmäßig | Was sie tut |
|---|---|---|
| **Verwaiste Jobs** | Jede Stunde | Beendet die Jobs, die einen Tag ohne Ausgabe liefen und die kein Runner übernommen hat (siehe [Verwaiste Jobs](cleanup.html#abandoned-jobs)) |
| **Gestoppte Knoten** | Jede Minute | Gibt die Jobs, Ansprüche und Runner frei, die AnsibleForms-Knoten und RTEs hielten, die nicht mehr antworten |
| **Zeitplanenden** | Jede Minute | Schaltet die [Zeitpläne](schedules.html), die ihr Ende erreicht haben, ab oder entfernt sie |
| **Zeitpläne neu abgleichen** | Alle 5 Minuten | Liest die Zeitpläne und die Repository-Pulls erneut aus der Datenbank, falls eine Änderungsmeldung verpasst wurde |
| **Abgelaufene Tokens** | Täglich um 03:00 | Entfernt die abgelaufenen Anmelde-Tokens, Token-Sperren und API-Tokens |
| **Audit-Log-Bereinigung** | Täglich um 03:30 | Entfernt die Audit-Einträge, die älter als `AUDIT_RETENTION_DAYS` sind |
| **Job-Bereinigung** | Täglich um 02:30 | Entfernt die beendeten Jobs, die älter als `JOB_RETENTION_DAYS` sind, samt ihrer Ausgabe |
| **Nächtliche Sicherung** | Täglich um Mitternacht | Sichert die Datenbank und entfernt die ältesten nächtlichen Backups über `NIGHTLY_BACKUP_RETENTION` hinaus |
| **Bereinigung gespeicherter Jobs** | Täglich um 04:00 | Entfernt die gespeicherten Jobs, die abgelaufen oder `STORED_JOB_UNUSED_DAYS` lang unbenutzt sind, und vergisst Knoten, die seit einem Tag fehlen |
| **Config-Seed neu laden** | Jede Minute | Wendet den [Config-Seed](../seed/reloading.html) erneut an, wenn sich seine Datei geändert hat |

Die Aufbewahrungseinstellungen sind in [Backups und Aufbewahrung](../customization/retention.html) beschrieben, die Backups in
[Backups](../production/backups.html). **Config-Seed neu laden** ist ohne [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH) aus.

Diese Aufgaben laufen auf dem Knoten, der die Hintergrundarbeit erledigt: dem Prozess ohne `AF_ROLE`, oder dem `worker`, der die Worker-Sperre
hält, wenn die App auf mehrere Knoten verteilt ist (siehe [Skalierung](../production/scaling.html#roles)).

---

## Die Schleifen des Runner-Hubs

Der Runner-Hub übergibt die Jobs an die RTEs, und drei eigene Schleifen laufen alle paar Sekunden statt nach einem Cron:

| Schleife | Läuft standardmäßig | Was sie tut |
|---|---|---|
| **Runner-Zuteilung** | Alle 2 Sekunden | Übergibt die wartenden Jobs und die Abbrüche an ihre Runner; einer, der auf einem anderen Knoten gestartet wurde, erreicht seinen Runner beim nächsten Durchlauf |
| **Inbound-Runner anwählen** | Alle 10 Sekunden | Wählt die [Inbound](../rte/modes.html#inbound)-Runner an, die dieser Knoten halten darf, erneut für einen, der seinen Socket verlor |
| **Beendete Jobs freigeben** | Alle 60 Sekunden | Gibt frei, was dieser Knoten von Jobs behielt, die auf einem anderen Knoten endeten |

Die Schleifen laufen auf jedem Knoten, der die Web-App ausführt, sodass bei mehreren App-Knoten jeder seine eigenen hat. Eine Minute, der
kleinste Schritt eines Cron, ist für sie zu grob: Jede läuft alle so und so viele Sekunden.

---

## Die Liste System

Die Seite [Jobs](./) listet die Aufgaben unter **Zukunft** als **System**, mit der Anzahl der Aufgaben, für Administratoren (Rollenoption `showSettings`).

Die Liste hat eine Zeile pro Aufgabe und Schleife und wird jede Minute neu gelesen:

| Spalte | Zeigt |
|---|---|
| **Name** | Den Namen der Aufgabe |
| **Zeitplan** | Wann sie läuft, in Worten (*Jede Stunde*, *Alle 2 Sekunden*), ihren Cron beim Darüberfahren, oder **Aus** für eine Aufgabe, die nicht läuft |
| **Letzter Lauf** | Wann der letzte Lauf begann, oder einen Strich, wenn sie nie lief |
| **Nächster Lauf** | Wann sie als Nächstes läuft |
| **Status** | Wie der letzte Lauf ausging: `success` oder `failed` |

**Spalten** bietet außerdem **Beschreibung**, was jede Aufgabe tut. Ein Klick auf eine Zeile öffnet die Seite der Aufgabe. Die Aufgaben
gehören der App selbst: Sie können weder hinzugefügt noch gelöscht werden.

---

## Die Seite einer Aufgabe

Die Seite einer Aufgabe hat drei Tabs, darüber **Jetzt ausführen** und **Speichern**, und ein Suchfeld, das alle Tabs zugleich eingrenzt.

| Tab | Was er zeigt |
|---|---|
| **Details** | Ihren **Name** und ihre **Beschreibung**, ihren **Letzter Start** (beim Darüberfahren den Fehler, wenn er fehlschlug), das **Ergebnis** des letzten Laufs, **Letzter Lauf**, **Nächster Lauf**, für eine Schleife den **Knoten**, der antwortete, und die **Angewandte Einstellung** |
| **Zeitplan** | Wann sie läuft: ein Cron für eine Aufgabe, ein **Intervall** in Sekunden für eine Schleife |
| **Läufe** | Jeden aufgezeichneten Lauf, den neuesten zuerst |

**Angewandte Einstellung** nennt die Variable und ihren Wert, etwa `JOB_RETENTION_DAYS` 90, mit **In den Einstellungen ändern**, um
den Einstellungs-Tab zu öffnen, der sie ändert. Eine Aufgabe ohne eine solche Einstellung zeigt einen Strich.

### Der Tab Zeitplan
{: .no_toc }

Der Cron einer Aufgabe wird im selben Editor bearbeitet wie der eines Zeitplans: Vorlagen, der Ausdruck in Worten und die nächsten drei
Läufe, in der Zeitzone des Servers. Er nimmt 5 Felder (Minute, Stunde, Tag, Monat und Wochentag) und muss wieder laufen. Eine Schleife
nimmt eine ganze Zahl von Sekunden innerhalb ihrer Grenzen, die die Zeile unter dem Feld nennt.

**Speichern** schreibt den Wert in die verwaltete Einstellungsdatei, wie es die Einstellungsseiten tun, und wendet ihn sofort auf allen Knoten
an, ohne Neustart. Ein in der Prozessumgebung gesetzter Wert, oder jeder Wert mit [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
erscheint schreibgeschützt, mit der Zeile *Durch die Umgebungsvariable … festgelegt* und ihrem Namen.

### Der Tab Läufe
{: .no_toc }

Jeder Lauf einer Aufgabe ist eine Zeile, mit diesen Spalten:

| Spalte | Zeigt |
|---|---|
| **Gestartet von** | Den Benutzer, der **Jetzt ausführen** gewählt hat, etwa `admin (local)`, oder **Zeitplan** für einen Lauf nach ihrem Cron |
| **Startzeit**, **Endzeit** und **Dauer** | Wann der Lauf begann und endete, und wie lange er dauerte |
| **Status** | `success` oder `failed` |
| **Ergebnis** | Was der Lauf getan hat, etwa *Removed 120 jobs*, oder seinen Fehler |
| **Knoten** | Den Knoten, der ihn ausgeführt hat |

Die Läufe der letzten 30 Tage werden aufbewahrt, bis zu 1000 pro Aufgabe: bei einer Aufgabe, die jede Minute läuft, etwa die letzten 16 Stunden.

Eine Schleife läuft viel zu oft für eine Zeile pro Durchlauf. Ihr Tab **Läufe** zeigt stattdessen, pro Knoten:

* eine Zusammenfassung jeder Stunde, etwa *1,800 passes, 0 failed*, `failed`, wenn ein Durchlauf dieser Stunde fehlschlug;
* eine Zeile für jedes **Jetzt ausführen**, mit *Run now: done* oder dem Fehler;
* eine Zeile `failed`, wenn ein Durchlauf nach ihrem Timer fehlschlägt, höchstens einmal pro Minute für denselben Fehler.

### Jetzt ausführen
{: .no_toc }

**Jetzt ausführen** führt die Aufgabe sofort aus, auf dem Knoten, der die Aufgaben ausführt, und zeichnet den Lauf mit Ihrem Namen auf. Es ist
deaktiviert, solange ein Lauf der Aufgabe läuft, und für eine Aufgabe, die **Aus** ist. Ein langer Lauf, etwa die nächtliche Sicherung, läuft weiter, nachdem die Seite antwortet.

**Jetzt ausführen** einer Schleife führt einen Durchlauf auf dem Knoten aus, der die Seite liefert, und wird abgelehnt, wo der Runner-Hub nicht
läuft. Jedes **Jetzt ausführen** wird im Audit-Log als `system.task.run` geschrieben.

---

## Ändern, wann eine Aufgabe läuft

Jede Aufgabe und jede Schleife hat eine Umgebungsvariable für ihren Zeitplan, die ihr Tab **Zeitplan** schreibt. Alle gelten ohne Neustart.

| Variable | Standard | Aufgabe |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Verwaiste Jobs |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Gestoppte Knoten |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Zeitplanenden |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Zeitpläne neu abgleichen |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Abgelaufene Tokens |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Audit-Log-Bereinigung |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Job-Bereinigung |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Nächtliche Sicherung |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Bereinigung gespeicherter Jobs |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Config-Seed neu laden |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (1 bis 60) | Runner-Zuteilung |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (2 bis 300) | Inbound-Runner anwählen |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (10 bis 3600) | Beendete Jobs freigeben |

Ein Wert, der kein gültiger Cron ist, oder Sekunden außerhalb der Grenzen, von Hand in der Umgebung gesetzt, werden zugunsten des Standards übergangen.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Vor 7.8.0 wurde der Config-Seed alle [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS) geprüft.
Diese Variable ist seit 7.8.0 veraltet, zugunsten von `CONFIG_SEED_RELOAD_CRON`, und wird in 8.0 entfernt. Solange
`CONFIG_SEED_RELOAD_CRON` nicht gesetzt ist, wird sie weiterhin als Cron gelesen, mit einer Warnung im Protokoll beim Start:

| `CONFIG_SEED_RELOAD_SECONDS` | Wird gelesen als |
|---|---|
| `60` | `* * * * *`, jede Minute |
| Ein Vielfaches von 60 bis `3600` | Alle so und so viele Minuten, etwa `*/5 * * * *` für `300` (`3600` wird als `0 * * * *` gelesen) |
| Eine Zahl unter 60, die 60 teilt | Alle so und so viele Sekunden |
| `0` | Das Neuladen ist aus |
| Jede andere Zahl | Die nächstliegende davon, die das Protokoll nennt |

Der Tab **Zeitplan** der Aufgabe zeigt diesen Cron mit der Zeile *Aus der veralteten CONFIG_SEED_RELOAD_SECONDS; ein hier gespeicherter Cron
ersetzt sie.* **Speichern** schreibt `CONFIG_SEED_RELOAD_CRON`, das von da an Vorrang vor der alten Variable hat.
