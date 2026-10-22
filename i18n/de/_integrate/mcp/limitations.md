---
layout: default
title: Einschränkungen
parent: MCP-Server
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Einschränkungen
{: .no_toc }

Ausdrücke laufen auf dem Server, und was der MCP-Server nicht tut
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## runLocal-Ausdrücke

`runLocal`-Ausdrücke, Felder vom Typ `local` / `credential` / `html` und `evalDefault`-Standardwerte werden
auf dem Server ausgewertet, in einem separaten V8-Kontext: kein `process`, `require`, kein Netzwerk und keine
Timer, kein Kompilieren von Strings zu Code, ein Zeitlimit von 2 Sekunden und nur die Hilfsfunktionen,
die der Browser anbietet (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Das schützt vor fehlerhaften oder außer Kontrolle geratenen Ausdrücken. Es ist keine Sandbox für feindseligen Code,
und muss es auch nicht sein: der Code stammt aus der Formulardefinition, nie vom MCP-
Aufrufer, und jeder Wert, den ein Aufrufer sendet, wird als JavaScript-Literal eingesetzt.

Ein Ausdruck, der eine Browser-API verwendet (`window`, `document`, `fetch`), kann hier nicht laufen und
gibt `status: error` zurück.

Serverseitige Ausdrücke (ohne `runLocal`) durchlaufen dieselben
[`EXPRESSION_SANITIZER`](../customization)-Regeln wie für den Browser.

---

## Einschränkungen

Einige Formulare und Felder lassen sich noch nicht über den MCP-Server verwenden:

- **Wizard-Formulare** lassen sich noch nicht starten. Ihre Schritte lassen sich mit `subform` auflösen.
- **Dateifelder** lassen sich nicht ausfüllen; ein Formular, dessen Dateifeld einen Wert hat, wird abgelehnt.
- **Listenzeilen** (und ein `yaml`-Feld mit einem Subform, das eine solche Zeile ist): jede Zeile, die Sie
  senden, außer einer, die den `deleteMarker` der Liste trägt, wird über ihr Subform aufgelöst, mit
  den Werten des Formulars als `__parent__`, und dann validiert. Das schließt verschachtelte Listen ein, bei denen
  `__parent__.__parent__` das Formular erreicht. Senden Sie einfache Zeilen, also die rohen Feldwerte des Subforms.
  Fehlerhafte Zeilen werden pro Listenfeld in `rowErrors` aufgeführt
  (`vms[1].disks[0].size (missing)` in der Meldung). Höchstens 500 Zeilen werden pro Aufruf akzeptiert,
  über alle Ebenen hinweg.
- Ein Enum, das auf `__auto__` belassen wird, wird nie mit seiner ersten Option gefüllt; der Aufrufer muss wählen.
- Jede MCP-Anfrage erzeugt einen Eintrag im Audit-Protokoll (Aktion „MCP-Anfrage (KI-Agent)“); der
  Job selbst wird unter dem Benutzer aufgezeichnet, wie bei jedem anderen Start.
