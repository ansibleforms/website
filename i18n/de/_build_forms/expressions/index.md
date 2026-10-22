---
layout: default
title: Ausdrücke
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Ausdrücke
{: .no_toc }

Feldwerte mit JavaScript berechnen, im Browser oder auf dem Server
{: .fs-6 .fw-300 }

---

Für Formularautoren: Felder dynamisch mit JavaScript füllen, im Browser berechnet oder auf dem Server abgerufen.

Mit dem Attribut `expression` eines Formularfelds erstellen Sie dynamische Formulare mit JavaScript-Ausdrücken.

---

## Einführung

Das Attribut `expression` gibt es bei mehreren Feldtypen:
- Feld `enum`: um die Optionen der Dropdown-Liste dynamisch zu füllen
- Feld `expression`: um beliebige Daten abzurufen oder zu erzeugen
- Feld `html`: um seinen HTML-Inhalt aufzubauen
- Felder `yaml` und `list`: um ihre Daten zu füllen

JavaScript-Ausdrücke werden entweder auf der **Serverseite** (Standard) oder auf der **Clientseite** ausgewertet, je nach der Feldeigenschaft `runLocal`.
Ein `html`-Feld sowie die Feldtypen `local`, `local_out` und `credential` führen ihren Ausdruck immer im Browser aus, egal was
`runLocal` sagt.

- **Auf der Serverseite** (`runLocal: false`, der Standard): vordefinierte Funktionen, die Daten aus APIs, Dateien und Datenbanken abrufen.
- **Auf der Clientseite** (`runLocal: true`): Der Code nutzt die volle JavaScript-Engine in der Sandbox des Browsers für Berechnungen, Umformungen und Bearbeitungen.

---

## Sicherheitsaspekte

Da Ausdrücke mit der JavaScript-Funktion `eval` ausgewertet werden, ist Code-Injection ein mögliches Risiko:

- **Serverseitige Ausdrücke** durchlaufen zuerst einen Sanitizer: Jeder Aufruf muss eine `fn.`- oder `fnc.`-Funktion sein, und mehrere Zeilen,
  `;`, Template-Literale, `process.env` und die Wege aus `eval` heraus (`import`, `require`, `constructor`, ...) werden abgelehnt.
- **Clientseitige Ausdrücke** werden in der Sandbox des Browsers ausgewertet und können als sicher gelten.

Wie streng der Sanitizer ist, hängt von
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) ab:

| Wert | Serverseitige Ausdrücke |
|---|---|
| `strict` (Standard) | `fn.`- und `fnc.`-Aufrufe sowie Methoden auf ihrem Ergebnis, etwa `fn.fnTime().format('YYYY')` |
| `paranoid` | nur direkte `fn.`- und `fnc.`-Aufrufe, keine Methoden auf ihrem Ergebnis |
| `off` | jeder serverseitige Ausdruck wird abgelehnt; nur `runLocal`-Ausdrücke funktionieren |
| `legacy` | die Regeln von 6.2.1, die jeden angemeldeten Benutzer Code auf dem Server ausführen lassen; nur für ein Upgrade, und nur in der echten Umgebung (nicht über die Einstellungsseite) |

Ein leerer oder unbekannter Wert bedeutet `strict`. Eine Änderung gilt ab dem nächsten Ausdruck, ohne Neustart.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [Platzhalter](placeholders.html) | Mit `$(...)` auf ein anderes Feld, eine Konstante oder den Benutzer verweisen |
| [Lokale Ausdrücke](local.html) | JavaScript, das in der Sandbox des Browsers läuft |
| [Remote-Ausdrücke](remote.html) | Serverseitige Funktionen für Datumswerte, Netzwerke, Dateien, SSH und nummerierte Namen |
| [REST-APIs](rest-apis.html) | REST-APIs mit Basic-, Token- oder eigener Authentifizierung aufrufen |
| [Anmeldedaten](credentials.html) | Gespeicherte Anmeldedaten lesen |
| [Sortierung](sorting.html) | Arrays mit einem Sortierobjekt sortieren |
| [jq-Abfragen](jq.html) | Daten mit jq umformen |
