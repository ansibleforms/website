---
layout: default
title: Einführung
parent: Start-Validierung
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Einführung
{: .no_toc }

Eine Instanz auf Enforce umstellen, und die bekannten Einschränkungen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Schrittweise einführen

`enforce` ist der Standard. Auf einer Instanz mit Skripten oder anderen Systemen, die Formulare über
REST starten, erreichen Sie ihn schrittweise und beobachten das Protokoll, bevor Sie etwas ablehnen:

1. Setzen Sie `LAUNCH_VALIDATION=log` für die ganze Instanz (vor dem Upgrade, bei einem Upgrade).
2. Lassen Sie die Instanz eine Weile in diesem Modus laufen und prüfen Sie das Protokoll: Warnungen `would refuse` zeigen Starts,
   die die Regeln verletzen; Warnungen `extravars differ` zeigen Formulare, die auf dem Server etwas
   anders berechnen (einen Zeitstempel, externe Daten). Entscheiden Sie für jedes Formular, ob das
   eine Rolle spielt.
3. Stellen Sie diese Formulare auf `launchValidation: enforce` um. Aufrufer, die ungültige Werte oder
   erfundene Extravars gesendet haben, erhalten jetzt ein `422` mit dem Grund.
4. Wenn sich jedes Formular wie erwartet verhält, entfernen Sie `LAUNCH_VALIDATION` (oder setzen Sie es auf `enforce`) für die ganze Instanz.

---

## Einschränkungen

Die Start-Validierung deckt noch nicht alles ab:

- **Wizard-Formulare** können nicht mit Änderungen neu gestartet werden, und ein Wizard-Job, der vor 7.0 gestartet wurde,
  kann unter `enforce` nicht neu gestartet werden (er hat seine Schrittwerte nicht gespeichert). Der MCP-Server
  kann keine Wizard-Formulare starten.
- Die **Auflösung von Platzhaltern** im Browser verwendet noch eine eigene Kopie des Servercodes; in
  seltenen Grenzfällen (`__undefined__`, Anführungszeichen in Ausdrücken) könnten beide einen
  Platzhalter unterschiedlich auflösen. `log` zeigt solche Unterschiede.
- **`runLocal`**-Ausdrücke laufen im Browser in dessen JavaScript-Engine und auf dem Server in einer
  Sandbox; derselbe Code liefert dasselbe Ergebnis, außer wo er von
  Zeitzone oder Sprache des Browsers abhängt.

---

## Wizard-Formulare

Ein [Wizard](../forms/wizard.html) wird Schritt für Schritt geprüft: Der Browser sendet die Werte
jedes Schritts, und der Server prüft jeden Schritt, den der Benutzer absenden würde, gegen dessen eigenes Unterformular.

- Ein Schritt wird ausgelassen, wenn er `optional` ist und der Benutzer ihn übersprungen hat, oder wenn sein `when` false ist.
- Ein Schritt liest die früheren Schritte über `$(__parent__.<step>.<field>)`, mit ihren geprüften Werten.
- Fehler nennen den Schritt und das Feld, als `<step>.<field>`.
- Unter `enforce` werden die Extravars auf dem Server aufgebaut, jeder Schritt unter seinem `defaultModel`.
- Dateifelder werden in einem Wizard nicht unterstützt.
