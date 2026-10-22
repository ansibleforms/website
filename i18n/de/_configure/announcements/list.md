---
layout: default
title: Liste
parent: Ankündigungen
nav_order: 2
translated_from: 3bbe4ccb28f9305a450ac85b7d99531ce28a84cd
---

# Liste
{: .no_toc }

Die Ankündigungen, die noch nicht abgelaufen sind, ihre Spalten und die Seite einer Ankündigung
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Liste

**Einstellungen > Erscheinungsbild > Ankündigungen** listet jede Ankündigung auf, die noch nicht abgelaufen ist, mit diesen Spalten:

| Spalte | Bedeutung |
|---|---|
| **Aktiviert** | Ob sie von ihrem Beginn bis zu ihrem Ende unter der Kopfzeile erscheint (ab 7.3.0) |
| **Nachricht** | Der Text unter der Kopfzeile |
| **Typ** | Info, Warnung oder Gefahr |
| **Startdatum** | Wann sie zu erscheinen beginnt; `–`, wenn sie sofort erscheint |
| **Enddatum** | Wann sie endet; `–`, wenn sie bis zum Löschen erscheint |
| **Erstellt von** | Wer sie hinzugefügt hat |

Ein Klick auf eine Zeile oder **Bearbeiten** im Menü der Zeile öffnet die Seite der Ankündigung. Das Menü enthält außerdem **Aktivieren** oder **Deaktivieren** sowie **Löschen**.

Sobald ihr Enddatum verstrichen ist, wird eine Ankündigung gelöscht: Die Liste behält nur die kommenden und die gerade angezeigten.

---

## Die Seite einer Ankündigung

Ab 7.3.0 öffnet sich jede Ankündigung auf ihrer eigenen Seite, unter `/settings/announcements/<id>`, mit einem Tab, **Details**.

Sie enthält die Nachricht, den Typ, das Start- und das Enddatum sowie den Schalter **Aktiviert**, der sofort gespeichert wird; die übrigen Felder werden
mit **Speichern** gespeichert, und **Löschen** entfernt die Ankündigung. Der Seitentitel benennt sie nach den ersten Zeichen ihrer Nachricht.
