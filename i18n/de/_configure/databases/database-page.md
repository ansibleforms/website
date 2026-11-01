---
layout: default
title: Die Seite einer Datenbank
parent: Datenbanken
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# Die Seite einer Datenbank
{: .no_toc }

Die Tabs, die Formulare, die sie abfragen, Verbindung testen und Löschen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tabs

Die Seite einer Datenbank zeigt die Schritte ihres Dialogs als Tabs, dazu die Formulare, die sie abfragen:

| Tab | Was er enthält |
|---|---|
| Details | Den **Namen**, den die `dbConfig` eines Feldes angibt, und die **Beschreibung** |
| Anmeldedaten | Die **Anmeldedaten**, mit denen sie sich verbindet, Anmeldedaten aus Verbindungen > Anmeldedaten vom Typ **Datenbank**, die ihren Datenbanktyp, Host, Port, Datenbank, TLS und Anmeldung enthalten |
| Verwendet von | Die Formulare, die sie abfragen, mit der Anzahl auf dem Tab, siehe [Verwendet von](#used-by) |

Jeder Tab hat eine eigene Adresse, etwa `/settings/databases/<id>/used-by`, sodass ein Link oder ein Lesezeichen ihn öffnet. Die Suche in der
Titelzeile filtert alle Tabs gleichzeitig.

Im Tab **Anmeldedaten** legt **Anmeldedaten hinzufügen** neue Anmeldedaten vom Typ **Datenbank** an und wählt sie aus. Ein Passwort wird nach dem
Speichern nie wieder angezeigt: Ändern Sie es in den Anmeldedaten.

---

## Verwendet von

Der Tab **Verwendet von** listet die Formulare auf, deren Felder die Datenbank abfragen, wie die App sie aus den Formularen liest.

| Spalte | Was sie zeigt |
|---|---|
| Formular | Das Formular; eine Zeile öffnet es |
| Beschreibung | Die Beschreibung des Formulars |
| Feld | Die Felder dieses Formulars, deren `dbConfig` die Datenbank nennt |

Ein Feld zählt, wenn seine `dbConfig` die Datenbank nennt oder ihre Anmeldedaten, wie es ein Formular von vor 7.5.0 tut. Beide verbinden sich
mit denselben Anmeldedaten, daher werden beide aufgelistet. Gibt es keines, zeigt der Tab **Kein Formular fragt diese Datenbank ab.**

---

## Verbindung testen und Löschen

Die Schaltflächen oben rechts wirken auf die Datenbank, wie sie gespeichert ist.

**Verbindung testen** verbindet sich mit ihren Anmeldedaten, führt die kleinste Abfrage ihres Datenbanktyps aus und sagt das dann in einer Meldung,
**&lt;name&gt; connection ok**, oder warum es fehlschlug. Es ist derselbe Test wie **Verbindung testen** der Anmeldedaten selbst.

**Löschen** fragt zuerst nach, löscht dann die Datenbank und kehrt zur Liste zurück. Ihre Anmeldedaten bleiben unter **Verbindungen > Anmeldedaten**.
Daneben speichert **Speichern** die Tabs Details und Anmeldedaten.
