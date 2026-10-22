---
layout: default
title: Haftungsausschluss
nav_order: 7
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: a22b56db001904583c51e6bd28f1281737f32a32
---

# Haftungsausschluss
{: .no_toc }

Bedingungen, die jeder Benutzer einmal akzeptiert, bevor er die App verwendet, samt Aufzeichnung, wer welche Version wann akzeptiert hat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Lassen Sie jeden Benutzer Nutzungsbedingungen akzeptieren, unter **Einstellungen > Zugriff > Haftungsausschluss**, mit der Rollenoption `showSettings`.

Ab 7.3.0 listet die Seite jede Version des Haftungsausschlusses auf, und jede Version öffnet sich auf einer eigenen Seite mit ihren Zustimmungen.
Bis 7.2 hatte die Seite stattdessen drei Tabs (**Allgemein**, **Versionen** und **Zustimmungen**); das Upgrade behält jede Version.

---

## In diesem Abschnitt

| Seite | Inhalt |
|---|---|
| [Allgemein](disclaimer/general.html) | Die Liste der Versionen, eine hinzufügen und die aktivieren, die Benutzer akzeptieren |
| [Versionen](disclaimer/versions.html) | Die Seite einer Version und das Ändern ihres Textes als Korrektur oder erneut für alle |
| [Zustimmungen](disclaimer/acceptances.html) | Wer welche Version akzeptiert hat, und ausgewählte Benutzer erneut fragen |


---

## Was Benutzer sehen

Ist eine Version aktiviert, erhält jeder Benutzer, der sich anmeldet, sie vor allem anderen in einem Dialog, Admins eingeschlossen:

1. Er liest ihren Titel und ihren Text.
2. Er setzt das Häkchen im Kontrollkästchen und klickt dann auf **Akzeptieren**. **Ablehnen**, in Rot, meldet ihn stattdessen ab.

Ab 7.3.0 ist die Seite hinter dem Dialog unscharf, bis er antwortet.

Ein Benutzer akzeptiert jede Version einmal: Bei seiner nächsten Anmeldung wird er nicht erneut gefragt, sondern nur, wenn eine neue Version kommt, wenn
ein Admin einen geänderten Text mit [Alle erneut fragen](disclaimer/versions.html#changing-the-text) speichert oder wenn ein Admin
[Erneut anfragen](disclaimer/acceptances.html#asking-users-again) auf seine Zustimmung anwendet.

Bis er akzeptiert, beantwortet die API jeden Aufruf seiner Sitzung mit dem Status `403` und dem Code `disclaimer_required`,
außer den Aufrufen unter `/api/v2/disclaimer` und `/api/v2/profile` sowie den Live-Ereignissen, denen der Browser folgt.
Ein [API-Token](profile/api-token.html) wird nie gefragt, da bei einem Skript niemand klicken kann.

