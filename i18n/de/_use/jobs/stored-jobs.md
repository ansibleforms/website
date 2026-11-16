---
layout: default
title: Gespeicherte Jobs
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
---

# Gespeicherte Jobs
{: .no_toc }

Die Daten eines Formulars aufbewahren, um sie später wieder zu laden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Gespeicherte Jobs

Gespeicherte Jobs bewahren die Werte eines Formulars auf, damit Sie sie wieder laden können, statt jedes Mal dieselben Felder auszufüllen.

Zum Speichern füllen Sie das Formular aus, öffnen das Dropdown neben **Senden** und wählen **Speichern**. Geben Sie in **Formulardaten speichern**
einen **Namen** und eine optionale **Beschreibung** ein, legen Sie unter **Entfernt** fest, wann er entfernt wird (siehe [Wann er entfernt
wird](#when-it-is-removed)), und speichern Sie. Passwort- und Konstantenfelder werden nie gespeichert. Ein Unterformular hat dieselbe Aktion
**Speichern** neben seiner Schaltfläche **Speichern** und bewahrt unfertige Werte auf, ohne sie zu validieren.

Zum Laden wählen Sie oben im Formular **Aus Speicher laden**. **Gespeichertes Formular laden** listet Ihre gespeicherten Jobs für dieses Formular auf, mit
ihrem Erstellungs- und Ablaufdatum; wählen Sie einen aus, um das Formular mit seinen Werten zu füllen. Es läuft nichts, bis Sie absenden.

Gespeicherte Jobs liegen in der AnsibleForms-Datenbank (Tabelle `stored_jobs`), mit dem Formularnamen, Ihrem Benutzer als
`<type>/<username>` (zum Beispiel `local/admin`) und den Werten als JSON. Ein Name muss pro Benutzer und Formular eindeutig sein; das Speichern
eines zweiten mit demselben Namen schlägt mit „Ein gespeichertes Formular mit diesem Namen existiert bereits“ fehl.

---

## Gespeicherte Jobs verwalten

Die Seite **Gespeicherte Jobs** listet gespeicherte Jobs mit Formular, Benutzer, Erstellungs- und Ablaufdatum auf und braucht `allowStoredJobs`.

Ab 7.6.0 öffnet `allowStoredJobs` allein **Jobs > Gespeichert** und **Gespeicherter Job hinzufügen**, wofür vorher auch
`showSettings` oder `allowScheduledJobs` nötig war. Seine Liste **Formular** bietet die Formulare an, die Ihre Rollen öffnen;
Benutzer mit `showSettings` oder `allowScheduledJobs` erhalten jedes Formular.

Ab 7.7.0 hat die Liste eine sortierbare Spalte **Zuletzt verwendet**, die genutzte gespeicherte Jobs von verwaisten abhebt.

- **Bearbeiten** öffnet die eigene Seite des gespeicherten Jobs: seine **Details** (Name, Beschreibung, Formular, Benutzer, wann er erstellt und zuletzt
  verwendet wurde und wann er entfernt wird), seine **Werte**, die gespeicherten Feldwerte als YAML, die sich dort ändern und speichern lassen, und seine **Läufe**.
- **Im Formular öffnen** öffnet sein Formular mit den gespeicherten Werten ausgefüllt; es läuft nichts, bis Sie absenden.
- **Löschen** entfernt ihn. Sie können Ihre eigenen gespeicherten Jobs löschen; Benutzer mit `showSettings` können jeden löschen.

---

## Zuletzt verwendet und Läufe

Ab 7.7.0 merkt sich ein gespeicherter Job seine letzte Verwendung und die aus ihm gestarteten Jobs, so sehen Sie die noch genutzten.

Diese Starts zählen als Verwendung eines gespeicherten Jobs:

| Start | Wann er zählt |
|---|---|
| Das daraus geöffnete Formular (**Im Formular öffnen**) oder eines, das mit **Aus Speicher laden** gefüllt wurde | Wenn der Job gestartet wird |
| **Später ausführen** aus diesem Formular | Wenn der geplante Lauf startet, nicht wenn er geplant wird |
| Ein **Neustart** eines aus ihm gestarteten Jobs | Wenn der Neustart beginnt, mit denselben oder geänderten Werten |
| `launch_job` oder `plan_job` von MCP mit ihm | Wie oben |

Die Läufe eines Zeitplans zählen nie, auch nicht bei einem, der aus einem gespeicherten Job erstellt wurde: Ein Zeitplan hat seine eigene Kopie der
Werte. Ein Start zählt nur, wenn der Benutzer den gespeicherten Job sehen darf; einer, der inzwischen gelöscht oder verborgen ist, wird übersprungen,
und der Job läuft trotzdem.

Die Job-Seite nennt den gespeicherten Job, aus dem ein Job gestartet wurde, mit einem Link, wenn Sie ihn sehen dürfen. Der Reiter **Läufe** auf der
Seite des gespeicherten Jobs listet die aus ihm gestarteten Jobs auf, die Sie sehen dürfen, mit Status, Start, Ende und Dauer.

---

## Wann er entfernt wird

Jeder gespeicherte Job gibt an, wann er entfernt wird: nie, an einem Datum oder sobald er einige Tage unbenutzt war.

| Auswahl | Was sie bewirkt |
|---|---|
| **Nie** | Behält ihn, bis jemand ihn löscht. Nicht angeboten, solange `STORED_JOB_UNUSED_DAYS` gesetzt ist |
| **An einem Datum** | Entfernt ihn an diesem Datum |
| **Wenn unbenutzt seit N Tagen** | Entfernt ihn, sobald so viele Tage lang kein Job aus ihm gestartet wurde |

Ein Admin kann [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS) setzen
(Einstellungen > Allgemein > Aufbewahrung). Dann entfernt es jeden gespeicherten Job, der so viele Tage unbenutzt blieb, die eigenen Tage eines
gespeicherten Jobs können nur weniger sein, der Speichern-Dialog beginnt mit ihnen, und einer mit Datum wird trotzdem entfernt, sobald er so lange
unbenutzt ist. Die Tage zählen ab der letzten Verwendung oder, bei einem nie verwendeten gespeicherten Job, ab dem Speichern. Der Standardwert 0
entfernt nie einen, weil er unbenutzt ist.

Gespeicherte Jobs werden jeden Tag um 04:00 (in `LOG_TZ`) entfernt, je nachdem, was zuerst eintritt: ihr Datum oder ihre Tage.
