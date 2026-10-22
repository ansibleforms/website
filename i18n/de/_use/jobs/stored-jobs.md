---
layout: default
title: Gespeicherte Jobs
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c4e55de429d31936d8735965a2f487c070b9140d
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

Zum Speichern füllen Sie das Formular aus, öffnen das Dropdown neben **Senden** und wählen **Speichern**. Geben Sie in **Formulardaten speichern** einen
**Namen**, eine optionale **Beschreibung** und ein Datum unter **Ablaufdatum (optional)** ein und speichern Sie. Passwort- und Konstantenfelder werden
nie gespeichert. Ein Unterformular hat dieselbe Aktion **Speichern** neben seiner Schaltfläche **Speichern** und bewahrt unfertige Werte auf, ohne
sie zu validieren.

Zum Laden wählen Sie oben im Formular **Aus Speicher laden**. **Gespeichertes Formular laden** listet Ihre gespeicherten Jobs für dieses Formular auf, mit
ihrem Erstellungs- und Ablaufdatum; wählen Sie einen aus, um das Formular mit seinen Werten zu füllen. Es läuft nichts, bis Sie absenden.

Gespeicherte Jobs liegen in der AnsibleForms-Datenbank (Tabelle `stored_jobs`), mit dem Formularnamen, Ihrem Benutzer als
`<type>/<username>` (zum Beispiel `local/admin`) und den Werten als JSON. Ein Name muss pro Benutzer und Formular eindeutig sein; das Speichern
eines zweiten mit demselben Namen schlägt mit „Ein gespeichertes Formular mit diesem Namen existiert bereits“ fehl.

---

## Gespeicherte Jobs verwalten

Die Seite **Gespeicherte Jobs** listet gespeicherte Jobs mit Formular, Benutzer, Erstellungs- und Ablaufdatum auf und braucht `allowStoredJobs`.

- **Bearbeiten** öffnet die eigene Seite des gespeicherten Jobs: seine **Details** (Name, Formular, Ablauf) und seine **Werte**, die gespeicherten
  Feldwerte als YAML, die sich dort ändern und speichern lassen.
- **Im Formular öffnen** öffnet sein Formular mit den gespeicherten Werten ausgefüllt; es läuft nichts, bis Sie absenden.
- **Löschen** entfernt ihn. Sie können Ihre eigenen gespeicherten Jobs löschen; Benutzer mit `showSettings` können jeden löschen.
- Gespeicherte Jobs, deren **Ablaufdatum** in der Vergangenheit liegt, werden jeden Tag um 04:00 (in `LOG_TZ`) automatisch gelöscht.
