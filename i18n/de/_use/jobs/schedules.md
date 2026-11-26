---
layout: default
title: Zeitpläne
parent: Jobs
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Zeitpläne
{: .no_toc }

Ein Formular später, nach einem Cron oder einer rrule ausführen, und alle Zeitpläne verwalten
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Formularaktionen

Ein Formular kann mehr als sofort ausgeführt werden: Das Dropdown neben seiner Schaltfläche **Senden** enthält drei weitere Aktionen.

| Aktion | Was sie macht | Rollenoption |
|---|---|---|
| **Planen (wiederkehrend)** | Erstellt einen Zeitplan, der das Formular nach einem Cron-Ausdruck ausführt | `allowScheduledJobs` |
| **Später ausführen (einmalig)** | Erstellt einen Zeitplan, der das Formular einmal ausführt, zu einem Datum und einer Uhrzeit Ihrer Wahl | `allowPlannedJobs` |
| **Speichern** | Speichert die Feldwerte, um sie später wieder ins Formular zu laden | `allowStoredJobs` |

Eine Aktion, deren Rollenoption aus ist, wird nicht angezeigt. Das Formular wird vor jeder von ihnen validiert, wie bei **Senden**. Beide
Planungsaktionen erstellen einen Eintrag unter **Jobs > Geplant**; **Speichern** erstellt einen Eintrag auf der Seite **Gespeicherte Jobs**. Die
Seitenleiste der Seite [Jobs](./) öffnet sie unter **Zukunft**, als **Geplant** und **Gespeichert**. Die Rollenoptionen sind
unter [Rollenoptionen](../config/roles.html#role-options) beschrieben.

{: .warning }
> Behandeln Sie `allowScheduledJobs` als Option auf Admin-Ebene. Ihre Zeitpläne gehören nicht dem Benutzer, der sie erstellt hat: Jeder Benutzer
> mit der Option sieht alle Zeitpläne und kann sie ändern. Ein solcher Zeitplan läuft außerdem mit Admin-Rechten, für jedes Formular, unabhängig vom
> eigenen Zugriff seines Erstellers. Gewähren Sie sie nur Rollen, denen Sie wie Admins vertrauen würden.

{: .note }
> **Später ausführen (einmalig)** braucht nur `allowPlannedJobs`. Für einen Benutzer ohne `allowScheduledJobs` plant es einen Lauf **als dieser
> Benutzer**: Der Server prüft, ob der Benutzer das Formular ausführen darf, und der Job läuft als er, in seinem Besitz, wenn seine Zeit gekommen ist
> (siehe [Geplante Läufe](#planned-runs)).

---

## Ein Formular planen

Füllen Sie das Formular aus, öffnen Sie dann das Dropdown neben **Senden** und wählen Sie eine der Planungsaktionen.

- **Planen (wiederkehrend)** öffnet **Zeitplan erstellen**: Geben Sie einen **Namen** und einen **Cron-Ausdruck** ein (der Standard, `0 0 * * *`,
  läuft täglich um Mitternacht), und wählen Sie dann **Zeitplan erstellen**.
- **Später ausführen (einmalig)** öffnet **Später ausführen**: Geben Sie einen **Namen** ein und wählen Sie Datum und Uhrzeit unter **Ausführen um**, dann
  **Job planen**.

Der Name muss über alle Zeitpläne hinweg eindeutig sein. Der Zeitplan behält den Namen des Formulars und eine Kopie der Extravars, die das Formular
in diesem Moment erzeugt hat, als YAML geschrieben; jeder Lauf verwendet diese Kopie, bearbeiten Sie sie also auf der Seite des Zeitplans, um zu ändern,
was der Job erhält. Um ihn stattdessen mit einer rrule zu steuern oder ihm ein Ende zu geben, öffnen Sie seine Seite und ändern Sie seinen Tab **Zeitplan**.

![Zeitpläne](../assets/screenshots/schedules.jpg)

---

## Die Liste der Zeitpläne

**Jobs > Geplant** listet jeden Zeitplan auf und braucht `allowScheduledJobs`; eine Zeile öffnet die eigene Seite des Zeitplans.

| Spalte | Zeigt |
|---|---|
| **Aktiviert** | Ob der Zeitplan nach seiner eigenen Zeitsteuerung läuft |
| **Name** und **Formular** | Den Zeitplan und das Formular, das er ausführt |
| **Zeitplan** | Seine Zeitsteuerung in Klartext, etwa *At 02:00 AM*; fahren Sie mit der Maus darüber, um den Cron oder die Regel selbst zu sehen |
| **Letzter Lauf** | Wann er zuletzt lief |
| **Nächster Lauf** | Wann er als Nächstes läuft, ein Strich, wenn kein Lauf mehr ansteht |
| **Status** | Sein letzter Start: ob er einen Job gestartet hat, oder **Startet…**, während er einen startet |

Die Spalte **Zeitplan** zeigt einen einmaligen Zeitplan als **Einmaliger Lauf**. Eine rrule, die sich nicht in Klartext beschreiben
lässt, wird unverändert angezeigt. Das Menü jeder Zeile bietet:

| Aktion | Was sie macht |
|---|---|
| **Bearbeiten** | Öffnet die Seite des Zeitplans |
| **Jetzt ausführen** | Führt den Zeitplan jetzt aus, ohne auf seine Zeitsteuerung zu warten |
| **Aktivieren** oder **Deaktivieren** | Schaltet den Zeitplan ein oder aus, je nachdem, was zutrifft, wie seine Spalte **Aktiviert** zeigt |
| **Löschen** | Entfernt den Zeitplan; er läuft sofort nicht mehr |

**Neuer Zeitplan** erstellt einen von Grund auf, in drei Schritten: **Details** (sein **Name**, seine **Beschreibung** und sein **Formular**),
**Zeitplan** (seine Zeitsteuerung und sein Ende) und **Extra-Variablen**. **Extra-Variablen** ist YAML ohne Formular, das es füllt; fügen Sie die
Werte, die das Playbook braucht, also selbst hinzu, als Dictionary (Schlüssel-Wert-Paare).

---

## Die Seite eines Zeitplans

Die Seite eines Zeitplans zeigt die Schritte seines Dialogs als Tabs, mit **Jetzt ausführen**, **Löschen** und **Speichern** oben rechts.

| Tab | Was er enthält |
|---|---|
| **Details** | Seine Quelle, **Name**, **Beschreibung**, **Formular**, dann **Letzter Start**, **Gestarteter Job**, **Letzter Lauf**, **Nächster Lauf** und **Aktiviert** |
| **Zeitplan** | Wie er gesteuert wird (siehe [Einen Zeitplan steuern](#timing-a-schedule)) und wie er endet (siehe [Das Ende eines Zeitplans](#the-end-of-a-schedule)) |
| **Extra-Variablen** | Das YAML, das der Job erhält; bei einem in git gehaltenen Zeitplan auch die Prompts seiner Datei |
| **Läufe** | Die Jobs, die er gestartet hat, der neueste zuerst; eine Zeile öffnet den Job |

**Letzter Start** sagt als Status, wie sein letzter Start verlief: Bei einem fehlgeschlagenen steht beim Darüberfahren der Grund. **Gestarteter Job**
verlinkt auf den Job, den er gestartet hat, sodass Sie ihn öffnen und sehen können, wie er endete. Der Tab **Läufe** listet die Jobs auf, die Sie sehen dürfen,
mit dem Benutzer, als der sie liefen, ihrem Start, Ende, ihrer Dauer und ihrem Status; ihre Anzahl steht im Titel des Tabs.

Der Schalter **Aktiviert** pausiert einen Zeitplan, ohne ihn zu löschen, und wird mit **Speichern** gespeichert, wie jedes Feld der Seite. Ein
ausgeschalteter Zeitplan bleibt mit seinen Einstellungen in der Liste, läuft aber nicht von selbst: Ein wiederkehrender überspringt seine Läufe, und ein
einmaliger wartet über seinen Zeitpunkt hinaus, bis er wieder eingeschaltet wird. **Jetzt ausführen** führt ihn weiterhin bei Bedarf aus. Ein neuer Zeitplan ist eingeschaltet.

---

## Einen Zeitplan steuern

Ein Zeitplan wird auf eine von drei Arten gesteuert, gewählt unter **Zeitsteuerung** in seinem Tab **Zeitplan**; die rrule ist neu in 7.8.0.

| Zeitsteuerung | Läuft | Siehe |
|---|---|---|
| **Cron** | Wiederkehrend, nach einem Cron-Ausdruck in der Zeitzone des Servers | [Cron-Ausdrücke und Zeitzone](#cron-expressions-and-time-zone) |
| **Wiederholungsregel (rrule)** | Wiederkehrend, nach einer iCal-Regel in ihrer eigenen Zeitzone | [Wiederholungsregeln](#recurrence-rules) |
| **Einmaliger Lauf** | Einmal, zu einem Datum und einer Uhrzeit | [Wie ein Zeitplan läuft](#how-a-schedule-runs) |

Bei einem Cron oder einer rrule zeigt der Editor die nächsten drei Läufe an und beendet sie am Ende des Zeitplans. Ein Wechsel der Zeitsteuerung
behält nur die gewählte: Ein Zeitplan, der von einem Cron auf eine rrule umgestellt wird, verliert seinen Cron.

---

## Cron-Ausdrücke und Zeitzone

Ein wiederkehrender Zeitplan kann einen Standard-Cron-Ausdruck mit 5 Feldern nehmen: Minute, Stunde, Tag des Monats, Monat und Wochentag.

| Ausdruck | Läuft |
|---|---|
| `*/15 * * * *` | Alle 15 Minuten |
| `0 2 * * *` | Jeden Tag um 02:00 |
| `30 7 * * 1-5` | Montag bis Freitag um 07:30 |
| `0 0 1 * *` | Um Mitternacht am ersten Tag jedes Monats |

Der Cron-Editor beschreibt den Ausdruck in Worten, bietet Vorlagen und zeigt eine Vorschau der nächsten Läufe. Der Server lehnt einen Ausdruck ab,
den er nicht ausführen kann oder der nie eintreten kann. Weitere Beispiele und die Cron-Funktionen, die der Editor nicht akzeptiert, stehen in der FAQ
unter [Welche Cron-Ausdrücke kann ich verwenden?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Cron-Zeitpläne laufen in der Zeitzone des Servers, gesetzt mit [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (Standard `UTC`),
> nicht in der Zeitzone Ihres Profils oder Ihres Browsers. Der Cron-Editor zeigt die nächsten Läufe in derselben Zone an.

---

## Wiederholungsregeln

Ab 7.8.0 kann ein wiederkehrender Zeitplan stattdessen eine iCal-Wiederholungsregel (rrule) nehmen, die in einer eigenen Zeitzone läuft.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

Die erste läuft jeden Tag um 02:00 in Brüssel, die zweite jeden Montag um 06:00 UTC, die dritte am letzten Werktag jedes Monats
um 07:30 in New York. Eine Regel ist eine Zeile, ihre Teile durch Leerzeichen getrennt:

| Teil | Was er sagt |
|---|---|
| `DTSTART` | Der erste Lauf, mit einer `TZID` (eine IANA-Zone wie `Europe/Brussels` oder ein Offset wie `UTC+5` oder `GMT-3`), oder in UTC mit `Z` am Ende |
| `RRULE` | Wann er sich wiederholt: `FREQ` mit einem `INTERVAL` von mindestens 1, und `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … nach Bedarf; eine oder mehrere |
| `EXRULE` | Optional: eine Regel für Läufe, die ausgelassen werden |

Der Server lehnt eine Regel ab, die er nicht ausführen kann, und sagt, warum:

- kein `DTSTART`, mehr als eines oder eines ohne Zeitzone, sowie `EXDATE` oder `RDATE`;
- eine Regel ohne `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` mit einer Zahl (`5MO`) oder `COUNT` zusammen mit `UNTIL`;
- `COUNT` über 999, eine `BYxxx`-Zahl außerhalb ihres Bereichs (`BYHOUR` 0 bis 23, `BYSETPOS` 1 bis 366 oder -366 bis -1 …), ein `WKST`,
  das kein Wochentag ist, ein `DTSTART` oder `UNTIL`, das kein echtes Datum ist (`20300230`), oder ein Teil, der in einer Regel zweimal vorkommt;
- eine Regel, die nie auslöst: kein Lauf in den 50 Jahren nach ihrem `DTSTART`, etwa `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` ab
  Mitternacht, das nur gerade Stunden trifft.

Der Editor ist ein Textfeld: Eine neue rrule beginnt als jeden Tag um Mitternacht in der Zeitzone Ihres Browsers. Er sagt sofort, warum eine Regel
abgelehnt würde, und zeigt sonst ihre nächsten drei Läufe in der eigenen Zeitzone der Regel, oder **Diese rrule hat keinen kommenden Lauf.**, wenn ihr
`UNTIL` oder `COUNT` vorbei ist. Eine Uhrzeit, die eine Sommerzeitumstellung überspringt, läuft, wenn die Uhr sie erreicht (02:30 läuft um 03:30 in der
Nacht, in der die Uhr von 02:00 auf 03:00 springt), wie bei einem Cron; eine Uhrzeit, die die Uhr zweimal zeigt, läuft einmal, beim ersten Mal.

---

## Das Ende eines Zeitplans

Ab 7.8.0 kann ein Zeitplan, der von einem Cron oder einer rrule gesteuert wird, enden; wählen Sie unter **Endet** in seinem Tab **Zeitplan** eine Option.

| Endet | Der Zeitplan endet |
|---|---|
| **Nie** | Nie: der Standard, und jeder Zeitplan von vor 7.8.0 |
| **An einem Datum** | Zum gewählten Datum und zur gewählten Uhrzeit: kein Lauf danach |
| **Nach** … **Läufen** | Sobald er insgesamt so viele Jobs gestartet hat, die sein Tab **Läufe** auflistet; das Feld zeigt, wie viele es bisher sind |

**Wenn er endet**, wird er ausgeschaltet (**Deaktivieren**, der Standard) oder gelöscht (**Entfernen**). Die Systemaufgabe
**Zeitplanenden** wendet die Enden jede Minute an, und ein Zeitplan, der seine Anzahl an Läufen erreicht, endet direkt nach seinem letzten. Das
eigene `UNTIL` oder `COUNT` einer rrule gilt weiterhin; das Ende kommt noch hinzu.

Ein einmaliger Zeitplan hat kein Ende: Er endet mit seinem Lauf. Sein Schalter **Nach dem Lauf entfernen**, standardmäßig an, löscht ihn nach
seinem Lauf; ausgeschaltet wird der Zeitplan nach seinem Lauf deaktiviert und mit seinem Ergebnis behalten.

---

## Wie ein Zeitplan läuft

Wenn ein Zeitplan fällig ist, wird er in die Warteschlange gestellt, und der Server startet Zeitpläne aus der Warteschlange einzeln nacheinander und prüft die Warteschlange alle 10 Sekunden.

- **Wiederkehrende** Zeitpläne überspringen einen Lauf, solange der vorherige Lauf noch in der Warteschlange steht oder läuft, sodass sich Läufe nie überschneiden.
- **Einmalige** Zeitpläne laufen innerhalb einer Minute nach ihrem Zeitpunkt und werden dann gelöscht (oder ausgeschaltet behalten, wenn **Nach dem Lauf
  entfernen** aus ist), auch wenn sie mit **Jetzt ausführen** gestartet wurden.
- **Status** ist `success`, wenn der Job gestartet wurde, und `failed`, wenn er nicht gestartet werden konnte. Ein `success` sagt nur, dass der Job
  gestartet wurde: Öffnen Sie den Job, um zu sehen, wie er endete.

Ein mit `allowScheduledJobs` erstellter Zeitplan läuft als integrierter Benutzer `Schedule Service` (Typ `schedule`) mit der
Rolle `admin`. Er kann jedes Formular ausführen, unabhängig vom Zugriff der Person, die den Zeitplan erstellt hat, und `ansibleforms_user` in
seinen Extravars beschreibt diesen Benutzer. Ein [geplanter Lauf](#planned-runs) läuft stattdessen als der Benutzer, der ihn geplant hat.

Der Job erhält außerdem ein Objekt `schedule`, sodass ein Playbook weiß, dass ein Zeitplan es gestartet hat:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

Sein `one_time_run` ist der Zeitpunkt des Laufs eines einmaligen Zeitplans, `null` bei einem wiederkehrenden. Es enthält auch die übrigen Einstellungen
des Zeitplans, etwa `enabled` und `repository`, und `run_at`: denselben Zeitpunkt unter seinem Namen von vor 7.8.0 (veraltet, wird in 8 entfernt).

---

## Geplante Läufe

**Später ausführen (einmalig)** durch einen Benutzer ohne `allowScheduledJobs` erstellt einen geplanten Lauf: einen einmaligen Zeitplan, der an diesen Benutzer gebunden ist.

- **Beim Planen** prüft der Server, ob der Benutzer das Formular ausführen darf (seine `roles`), und der Verbose-Modus braucht
  `allowVerboseMode`. Ein geplanter Lauf ist immer einmalig; ein Cron-Ausdruck oder eine rrule wird abgelehnt.
- **Unter der Start-Validierung `enforce`** werden die Feldwerte beim Planen geprüft, sodass ein Lauf, der abgelehnt würde,
  abgelehnt wird, während der Benutzer noch hinsieht.
- **Beim Ausführen** läuft der Job als dieser Benutzer, in seinem Besitz, mit denselben Prüfungen wie ein Start aus dem Browser: die
  Rollen des Formulars, wie sie dann sind, die entfernten reservierten Extravars und die Start-Validierung. `ansibleforms_user` beschreibt ihn.

Der Planende sieht **Jobs > Geplant** nicht, das `allowScheduledJobs` braucht; der Job erscheint in seinem eigenen Jobverlauf. Ein
geplanter Lauf wird nach seinem Lauf immer entfernt.

---

## Wenn sich das Formular ändert

Ein Zeitplan verweist über den Namen auf sein Formular und führt es so aus, wie es zum Zeitpunkt jedes Laufs definiert ist.

- **Das Formular wird bearbeitet**: Der nächste Lauf verwendet die neue Definition (Playbook, Vorlage, Inventar) mit den im
  Zeitplan gespeicherten Extravars. Das Formular wird nicht gerendert, sodass kein Feld neu berechnet wird; passen Sie die Extra-Variablen des Zeitplans entsprechend an.
- **Das Formular wird umbenannt oder entfernt**: Der Lauf schlägt fehl, **Status** wird `failed`, und **Letzter Start** zeigt beim Darüberfahren
  `Failed to launch : No such form '<name>'`. Bearbeiten Sie den Zeitplan und wählen Sie das richtige Formular, oder löschen Sie ihn.

---

## Geplante Jobs im Jobverlauf

Jeder Lauf eines Zeitplans erstellt einen gewöhnlichen Job, der auf der Seite [Jobs](./) mit `Schedule Service` als Benutzer aufgeführt wird, oder,
bei einem geplanten Lauf, mit dem Benutzer, der ihn geplant hat.

Ein Job von `Schedule Service` gehört nicht der Person, die den Zeitplan erstellt hat, daher ist er nur für Admins und für
Benutzer mit `showAllJobLogs` sichtbar; der Job eines geplanten Laufs ist auch für seinen Benutzer sichtbar. Der Tab **Läufe** des Zeitplans listet die
Jobs auf, die er gestartet hat, und sein **Gestarteter Job** verlinkt auf den letzten.

---

## Zeitpläne in einem git-Repository

Ab 7.8.0 können Zeitpläne auch in einem git-Repository gehalten werden, als Einträge einer Liste `controller_schedules:` in seinen YAML-Dateien.

Höchstens ein Repository hat die Verwendung **Zeitpläne**: Seine Einträge werden bei jedem Pull in **Jobs > Geplant** eingelesen, gesteuert durch einen
`cron`, eine `rrule` oder einen `one_time_run`, und ein in der App erstellter oder geänderter Zeitplan wird in seine Datei zurückgeschrieben und wartet auf
den Push des Repositorys. Ein solcher Zeitplan zeigt seine Datei auf seiner Seite, und sein Ende schaltet ihn immer nur aus. Siehe
[Git-Repositories](../repositories/).

---

## In der API

Ab 7.8.0 hat ein Zeitplan der API drei Felder für die Zeitsteuerung, von denen genau eines gesetzt ist: `cron`, `rrule` oder `one_time_run`.

| Feld | Enthält |
|---|---|
| `cron` | Einen Cron-Ausdruck |
| `rrule` | Eine Wiederholungsregel, in einer Zeile |
| `one_time_run` | Den Zeitpunkt seines einzigen Laufs, eine ISO-8601-Zeit mit Offset oder `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | Sein Ende: `never`, `date` oder `count`, sein Datum, seine Anzahl an Läufen, und `disable` oder `remove` |
| `remove_after_run` | Ein einmaliger Zeitplan: `false` behält ihn nach seinem Lauf, ausgeschaltet |

{: .warning }
> Das Paar, das die API vor 7.8.0 nahm, `one_time_run: true` mit `run_at`, ist seit 7.8.0 veraltet und wird in 8 entfernt. Es wird
> weiterhin als `one_time_run` zu diesem Zeitpunkt gelesen, mit einer Warnung im Server-Log; `one_time_run: false` mit einem Cron wird als
> dieser Cron gelesen.
