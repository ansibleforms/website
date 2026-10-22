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
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Zeitpläne
{: .no_toc }

Ein Formular später oder nach einem Cron-Zeitplan ausführen, und alle Zeitpläne verwalten
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
Planungsaktionen erstellen einen Eintrag auf der Seite **Zeitpläne**; **Speichern** erstellt einen Eintrag auf der Seite **Gespeicherte Jobs**. Die
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
in diesem Moment erzeugt hat, als YAML geschrieben; jeder Lauf verwendet diese Kopie, bearbeiten Sie sie also auf der Seite **Zeitpläne**, um zu ändern, was der Job erhält.

![Zeitpläne](../assets/screenshots/schedules.jpg)

---

## Die Seite Zeitpläne

Die Seite **Zeitpläne** listet jeden Zeitplan auf, ab 7.3.0 mit der Spalte **Aktiviert**, und braucht `allowScheduledJobs`. Das Menü jeder Zeile bietet:

| Aktion | Was sie macht |
|---|---|
| **Bearbeiten** | Ändert Name, Typ, Cron-Ausdruck oder Ausführungszeit, Formular und Extra-Variablen |
| **Jetzt ausführen** | Führt den Zeitplan jetzt aus, ohne auf seinen Cron-Ausdruck oder seine Ausführungszeit zu warten |
| **Aktivieren** oder **Deaktivieren** | Schaltet den Zeitplan ein oder aus, je nachdem, was zutrifft, wie seine Spalte **Aktiviert** zeigt (ab 7.3.0) |
| **Löschen** | Entfernt den Zeitplan; er läuft sofort nicht mehr |
| **Letzte Ausgabe** | Auf der Seite des Zeitplans, was der letzte Lauf gemeldet hat, etwa die Nummer des Jobs, den er gestartet hat |

Ein Zeitplan lässt sich hier auch von Grund auf erstellen. Wählen Sie das **Formular**, dann markieren Sie entweder **Einmaliger Lauf** und setzen
**Ausführen um**, oder Sie lassen es leer und setzen einen **Cron-Zeitplan**. **Extra-Variablen** ist YAML ohne Formular, das es füllt; fügen Sie die
Werte, die das Playbook braucht, also selbst hinzu, als Dictionary (Schlüssel-Wert-Paare).

Das Feld **Cron-Zeitplan** ist ein Cron-Editor: Er beschreibt den Ausdruck in Worten, bietet Vorlagen und zeigt eine Vorschau der nächsten
Läufe. Der Server lehnt einen Ausdruck ab, den er nicht ausführen kann oder der nie eintreten kann.

Ab 7.3.0 hat jeder Zeitplan einen Schalter **Aktiviert**, um ihn zu pausieren, ohne ihn zu löschen. Ein ausgeschalteter Zeitplan bleibt mit seinen Einstellungen
auf der Seite, läuft aber nicht von selbst: Ein wiederkehrender überspringt seine Cron-Zeitpunkte, und ein einmaliger wartet über sein
**Ausführen um** hinaus, bis er wieder eingeschaltet wird. **Jetzt ausführen** führt ihn weiterhin bei Bedarf aus. Ein neuer Zeitplan ist eingeschaltet, und die Zeitpläne,
die vor 7.3.0 existierten, sind nach dem Upgrade eingeschaltet.

---

## Cron-Ausdrücke und Zeitzone

Ein wiederkehrender Zeitplan nimmt einen Standard-Cron-Ausdruck mit 5 Feldern: Minute, Stunde, Tag des Monats, Monat und Wochentag.

| Ausdruck | Läuft |
|---|---|
| `*/15 * * * *` | Alle 15 Minuten |
| `0 2 * * *` | Jeden Tag um 02:00 |
| `30 7 * * 1-5` | Montag bis Freitag um 07:30 |
| `0 0 1 * *` | Um Mitternacht am ersten Tag jedes Monats |

Weitere Beispiele und die Cron-Funktionen, die der Editor nicht akzeptiert, stehen in der FAQ unter
[Welche Cron-Ausdrücke kann ich verwenden?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Cron-Zeitpläne laufen in der Zeitzone des Servers, gesetzt mit [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (Standard `UTC`),
> nicht in der Zeitzone Ihres Profils oder Ihres Browsers. Der Cron-Editor zeigt die nächsten Läufe in derselben Zone an.

---

## Wie ein Zeitplan läuft

Wenn ein Zeitplan fällig ist, wird er in die Warteschlange gestellt, und der Server startet Zeitpläne aus der Warteschlange einzeln nacheinander und prüft die Warteschlange alle 10 Sekunden.

- **Wiederkehrende** Zeitpläne überspringen einen Zeitpunkt, solange der vorherige Lauf noch in der Warteschlange steht oder läuft, sodass sich Läufe nie überschneiden.
- **Einmalige** Zeitpläne laufen innerhalb einer Minute nach **Ausführen um** und werden dann gelöscht, auch wenn sie mit **Jetzt ausführen** gestartet wurden.
- **Status** ist `success`, wenn der Job gestartet wurde, und `failed`, wenn er nicht gestartet werden konnte. Ein `success` sagt nur, dass der Job
  gestartet wurde: Öffnen Sie den Job, um zu sehen, wie er endete.

Ein mit `allowScheduledJobs` erstellter Zeitplan läuft als integrierter Benutzer `Schedule Service` (Typ `schedule`) mit der
Rolle `admin`. Er kann jedes Formular ausführen, unabhängig vom Zugriff der Person, die den Zeitplan erstellt hat, und `ansibleforms_user` in
seinen Extravars beschreibt diesen Benutzer. Ein [geplanter Lauf](#planned-runs) läuft stattdessen als der Benutzer, der ihn geplant hat.

Der Job erhält außerdem ein Objekt `schedule` (mit `id`, `name` und `form`), sodass ein Playbook weiß, dass ein Zeitplan es gestartet hat:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Geplante Läufe

**Später ausführen (einmalig)** durch einen Benutzer ohne `allowScheduledJobs` erstellt einen geplanten Lauf: einen einmaligen Zeitplan, der an diesen Benutzer gebunden ist.

- **Beim Planen** prüft der Server, ob der Benutzer das Formular ausführen darf (seine `roles`), und der Verbose-Modus braucht
  `allowVerboseMode`. Ein geplanter Lauf ist immer einmalig; ein Cron-Ausdruck wird abgelehnt.
- **Unter der Start-Validierung `enforce`** werden die Feldwerte beim Planen geprüft, sodass ein Lauf, der abgelehnt würde,
  abgelehnt wird, während der Benutzer noch hinsieht.
- **Beim Ausführen** läuft der Job als dieser Benutzer, in seinem Besitz, mit denselben Prüfungen wie ein Start aus dem Browser: die
  Rollen des Formulars, wie sie dann sind, die entfernten reservierten Extravars und die Start-Validierung. `ansibleforms_user` beschreibt ihn.

Der Planende sieht die Seite **Zeitpläne** nicht, die `allowScheduledJobs` braucht; der Job erscheint in seinem eigenen Jobverlauf.

---

## Wenn sich das Formular ändert

Ein Zeitplan verweist über den Namen auf sein Formular und führt es so aus, wie es zum Zeitpunkt jedes Laufs definiert ist.

- **Das Formular wird bearbeitet**: Der nächste Lauf verwendet die neue Definition (Playbook, Vorlage, Inventar) mit den im
  Zeitplan gespeicherten Extravars. Das Formular wird nicht gerendert, sodass kein Feld neu berechnet wird; passen Sie die Extra-Variablen des Zeitplans entsprechend an.
- **Das Formular wird umbenannt oder entfernt**: Der Lauf schlägt fehl, **Status** wird `failed`, und **Letzte Ausgabe** lautet
  `Failed to launch : No such form '<name>'`. Bearbeiten Sie den Zeitplan und wählen Sie das richtige Formular, oder löschen Sie ihn.

---

## Geplante Jobs im Jobverlauf

Jeder Lauf eines Zeitplans erstellt einen gewöhnlichen Job, der auf der Seite [Jobs](./) mit `Schedule Service` als Benutzer aufgeführt wird, oder,
bei einem geplanten Lauf, mit dem Benutzer, der ihn geplant hat.

Ein Job von `Schedule Service` gehört nicht der Person, die den Zeitplan erstellt hat, daher ist er nur für Admins und für
Benutzer mit `showAllJobLogs` sichtbar; der Job eines geplanten Laufs ist auch für seinen Benutzer sichtbar. Die **Letzte Ausgabe** des Zeitplans nennt den Job, den er gestartet hat, sodass Sie ihn in der Liste finden.
