---
layout: default
title: Versionen
parent: Haftungsausschluss
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Versionen
{: .no_toc }

Die Seite einer Version und das Ändern ihres Textes als Korrektur oder erneut für alle
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Seite einer Version

Ab 7.3.0 hat jede Version eine eigene Seite, unter `/settings/disclaimer/<version>`, mit zwei Tabs:

| Tab | Was er enthält |
|---|---|
| **Details** | Titel, Text und Text des Kontrollkästchens sowie den Schalter **Aktiviert**, der sofort gespeichert wird |
| **Zustimmungen** | Wer diese Version akzeptiert hat, siehe [Zustimmungen](acceptances.html) |

**Vorschau** zeigt den Dialog so, wie Benutzer ihn sehen werden, und **Löschen** entfernt die Version samt ihren Zustimmungen. Das Suchfeld über den
Tabs durchsucht beide gleichzeitig: die passenden Felder unter **Details** und die passenden Zeilen unter **Zustimmungen**.

---

## Den Text ändern

**Speichern** bei einem geänderten Titel, Text oder Text des Kontrollkästchens, den Benutzer bereits akzeptiert haben, fragt **Alle erneut fragen?**:

| Antwort | Was passiert |
|---|---|
| **Alle erneut fragen** | Die Zustimmungen zu dieser Version werden gelöscht, und jeder Benutzer akzeptiert sie bei seiner nächsten Anfrage erneut |
| **Als Korrektur behalten** | Der Text wird überschrieben, etwa wegen eines Tippfehlers, und die Zustimmungen zählen weiterhin: Niemand wird erneut gefragt |

Eine Version, die noch niemand akzeptiert hat, wird ohne Nachfrage gespeichert. Um den vereinbarten Text zu behalten, [fügen Sie eine neue Version hinzu](general.html#adding-a-version) und aktivieren Sie sie.
