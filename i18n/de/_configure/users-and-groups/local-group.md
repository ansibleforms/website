---
layout: default
title: Eine lokale Gruppe
parent: Benutzer und Gruppen
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Eine lokale Gruppe
{: .no_toc }

Die Seite einer lokalen Gruppe und ihre Tabs
{: .fs-6 .fw-300 }

Ab 7.8.0 öffnet **Gruppe hinzufügen** den Assistenten **Neue Gruppe** in drei Schritten: **Details** (der Name und die Beschreibung),
**Benutzer** (die lokalen Benutzer, die in die Gruppe kommen) und **Rollen** (die Rollen, die sie erhält, damit ihre Benutzer sie haben). Nur der
Name ist erforderlich. **Speichern** im letzten Schritt erstellt die Gruppe, fügt dann die Benutzer hinzu und vergibt die Rollen: Was dabei
fehlschlägt, wird in einer Meldung genannt, und die Gruppe bleibt bestehen.

Die Seite einer Gruppe, `/settings/groups/<id>`, hat diese Tabs:

| Tab | Was er zeigt |
|---|---|
| **Details** | Den Namen und die Beschreibung |
| **Benutzer** | Die Benutzer in der Gruppe; **Benutzer hinzufügen** fügt einen hinzu, das Menü einer Zeile oder die Kontrollkästchen entfernen einen |
| **Rollen** | Die Rollen, die die Gruppe nennen |
| **Formulare** | Die Formulare, die diese Rollen öffnen |

Eine Gruppe mit Benutzern kann nicht gelöscht werden: Entfernen Sie zuerst ihre Benutzer. Die Gruppe `admins` kann nie gelöscht oder umbenannt werden.
