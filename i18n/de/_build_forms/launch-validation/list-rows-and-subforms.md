---
layout: default
title: Listenzeilen
parent: Start-Validierung
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Listenzeilen
{: .no_toc }

Wie Zeilen von list-Feldern validiert werden
{: .fs-6 .fw-300 }

---

Ein `list`-Feld enthält Zeilen; jede Zeile ist eine Instanz seines Unterformulars, ausgefüllt über den Zeileneditor.
Ein `yaml`-Feld mit einem `subform` ist eine solche Zeile. Der Server behandelt sie genauso
wie der Zeileneditor des Browsers: Jede Zeile wird über ihr Unterformular aufgelöst, mit den Werten des Formulars
als `__parent__`, ihre Regeln werden geprüft und ihre berechneten Felder ausgewertet. Verschachtelte Listen funktionieren
genauso: In der eigenen Liste einer Zeile erreicht `$(__parent__.__parent__.x)` das Formular.

Zeilen werden wie folgt geprüft:

- **Eine Zeile, die der Benutzer** im Editor **hinzugefügt oder bearbeitet hat**, wird aufgelöst und validiert.
- **Eine Zeile, die niemand angefasst hat**, also eine, die der eigene Standardwert, Ausdruck oder die Abfrage der Liste erzeugt hat
  (etwa die vorhandenen Einträge einer ACL-Liste), geht **genau so durch, wie sie kam**, wie im
  Browser: Sie wird nicht erneut validiert, und es wird nichts hinzugefügt. Ein vorhandener Eintrag, der eine später
  geschriebene Regel verletzt, hält den Start nicht auf.
- **Eine als gelöscht markierte Zeile** (der `deleteMarker` der Liste) bleibt, wie sie ist, und wird nicht validiert.

Um diese Zeilen zu unterscheiden, ohne der Anfrage zu vertrauen, führt der Server die eigene
Quelle der Liste (ihren Standardwert, sonst ihren Ausdruck oder ihre Abfrage) unter der Start-Validierung erneut aus. Eine Zeile,
die nicht durch den Editor ging, geht **nur dann unverändert durch, wenn sie eine der Zeilen ist, die diese
Quelle erzeugt**. Jede andere Zeile, etwa eine von einem REST-Aufrufer erfundene, wird aufgelöst und
wie eine bearbeitete Zeile validiert. Eine einfache Zeile kann die Prüfungen also nicht umgehen, während die
unberührten Zeilen des Browsers weiterhin unverändert durchgehen.

Ein Browser-Benutzer bemerkt das nur in einem Fall: Die Daten der Quelle haben sich zwischen dem Öffnen des
Formulars und dem Start geändert (ein Eintrag wurde inzwischen geändert oder entfernt), **und** diese Zeile
verletzt eine Regel ihres Unterformulars. Die Zeile zählt dann nicht mehr als eine der Zeilen der Quelle, wird also
validiert, und der Start wird mit Nennung der Zeile abgelehnt, zum Beispiel
`acls[2].user_or_group (regex)`.

Fehlerhafte Zeilen erscheinen in `rowErrors` mit ihrem `index` (ein `yaml`-Feld hat keinen) und im Protokoll als
`disks[1].size (maxValue)`.

Ein Start darf über alle Verschachtelungsebenen hinweg höchstens **500 Zeilen** enthalten, da jede Zeile die Abfragen ihres Unterformulars ausführt.

---

## Zeilenmarker

Die Marker, die eine Liste auf ihre Zeilen setzt (`insertMarker`, `updateMarker` und `deleteMarker`; ohne
`insertMarker` erhalten neue Zeilen `__inserted__`, wenn die Liste `allowDelete: false`, einen `deleteMarker` oder einen `updateMarker` setzt),
erreichen das Playbook bei jeder Zeile, die einen trägt. Eine entfernte Zeile wird mit ihrem Lösch-Marker
gesendet, damit das Playbook sie entfernen kann. Vor 6.4.1 trug eine Listenzeile nur dann einen Marker, wenn ihr
Unterformular ihn als (verstecktes) Feld deklarierte.
