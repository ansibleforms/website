---
layout: default
title: Start-Validierung
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Start-Validierung
{: .no_toc }

Jeden Start eines Formulars auf dem Server prüfen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren und Formularautoren: Lassen Sie den Server jeden Start prüfen, seine Regeln und seine Extravars, egal wer ihn sendet.

Die Prüfung gilt unabhängig davon, wer oder was das Formular startet: der Browser, ein Skript, das die REST-API aufruft,
oder ein KI-Agent über den MCP-Server.

---

## Warum es sie gibt

Die Regeln eines Formulars (`required`, `regex`, `minValue`, `sameAs`, ...) wurden schon immer
im Browser geprüft. Der Browser sendet dann zwei Dinge an `POST /api/v2/job`:

- `rawFormData`: die Feldwerte, wie der Benutzer sie ausgefüllt hat;
- `extravars`: was das Playbook erhält, im Browser aus diesen Werten aufgebaut.

Ohne Start-Validierung vertraut der Server beidem. Jeder mit einem gültigen Token kann diesen
Endpunkt direkt aufrufen und beliebige Extravars senden, ohne dass eine Regex, ein Pflichtfeld oder eine Listenregel
angewendet wird. Für ein Formular, das nur im Browser verwendet wird, mag das akzeptabel sein; für ein
Formular, das andere Systeme über REST starten, heißt das, dass die Regeln des Formulars überhaupt nicht durchgesetzt werden.

Der Server kann außerdem eine Anfrage aus dem Browser nicht von einer unterscheiden, die ein
Skript sendet: Beide verwenden denselben Endpunkt, dasselbe Token und denselben Body, und Benutzer können
jede Anfrage verändern, die ihr eigener Browser sendet. Einer Prüfung kann man nur auf dem Server vertrauen, und die Start-Validierung
ist diese Prüfung.

---

## Die drei Wege hinein

Wie ein Start validiert wird, hängt davon ab, wie er ankommt, und vom Modus der Start-Validierung:

| Gestartet von | Validiert | Extravars, mit denen der Job läuft |
|---|---|---|
| **MCP-Server** (KI-Agent) | immer, auf dem Server | immer vom Server aufgebaut |
| **Browser** oder **REST-API**, Start-Validierung `off` | nur im Browser | die, die der Browser (oder Aufrufer) gesendet hat |
| **Browser** oder **REST-API**, Start-Validierung `log` | auf dem Server, Ablehnungen nur protokolliert | die gesendeten; Unterschiede werden protokolliert |
| **Browser** oder **REST-API**, Start-Validierung `enforce` | auf dem Server, bei Ungültigkeit abgelehnt | **vom Server aufgebaut** |

Der Browser, der MCP-Server und die Start-Validierung verwenden denselben Code für die Regeln (die
gemeinsame Formular-Engine): dieselben Regeln, in derselben Reihenfolge, mit denselben Meldungen. Einen Fehler, den der
Browser anzeigt, lehnt der Server mit demselben Text ab.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [Einschalten](switching-it-on.html) | Für die ganze Instanz oder für ein Formular |
| [Log und Enforce](log-and-enforce.html) | Was jeder Modus mit einem Start macht, der die Regeln verletzt |
| [Listenzeilen](list-rows-and-subforms.html) | Wie Zeilen von list-Feldern validiert werden |
| [Datei-Uploads](file-uploads.html) | Wie Dateifelder validiert werden |
| [Passwörter](passwords.html) | Wie Passwortfelder validiert und aus APIs herausgehalten werden |
| [Neustarten](relaunching.html) | Wie ein neu gestarteter Job validiert wird |
| [Einführung](rolling-it-out.html) | Eine Instanz auf Enforce umstellen, und die bekannten Einschränkungen |
