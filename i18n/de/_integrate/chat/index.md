---
layout: default
title: Chat-Assistent
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Chat-Assistent
{: .no_toc }

Formulare in einem Gespräch ausfüllen und starten
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren, die ihn einschalten, und für die Benutzer, die mit ihm chatten: Formulare in einem Gespräch ausfüllen und starten.

Eine Chat-Schaltfläche auf jeder Seite öffnet einen
Assistenten, der das passende Formular findet, nach fehlenden Angaben fragt, die Auswahlmöglichkeiten des Formulars
als Schaltflächen anbietet und eine Zusammenfassung mit einer Schaltfläche **Starten** zeigt. Ein Job startet erst, wenn der Benutzer darauf klickt.

---

## Wie es funktioniert

Der Assistent kommuniziert über den Server mit dem KI-Modell, und der Server beantwortet die Anfragen des Modells mit derselben Formular-Engine wie der Browser:

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **Modellaufrufe kommen vom Server**, nie vom Browser, daher bleibt der API-Schlüssel auf dem Server
  (siehe [Anbieter](providers.html)).
- **Das Modell kann nichts starten.** Es bereitet eine einmalige Zusammenfassung vor; Starten prüft sie vor der Ausführung erneut.
- **Der Benutzer wählt die Ziele.** Auswahlen und erforderliche Namen kommen vom Benutzer, nie vom Modell.
- **„Ja“ oder „starten“ zu tippen bewirkt nichts.** Nur die Schaltfläche startet einen Job.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Was sie behandelt |
|---|---|
| [Einschalten](switching-it-on.html) | Den Assistenten aktivieren und Formulare darin anbieten |
| [Anbieter](providers.html) | Das Sprachmodell hinter dem Assistenten, und Proxys |
| [Datenschutz und Grenzen](privacy-and-limits.html) | Was das Netzwerk verlässt, und die Grenzen pro Benutzer |
| [Erneut starten und Audit](relaunching-and-audit.html) | Erneut starten aus dem Chat, der Audit-Trail und die Einschränkungen |
