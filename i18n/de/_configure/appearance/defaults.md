---
layout: default
title: Standardwerte
parent: Erscheinungsbild
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Standardwerte
{: .no_toc }

Design, Sprache, Zeitzone und Datumsformat für Benutzer, die nichts gewählt haben
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Standardwerte

**Standardwerte** legt fest, wie die App für einen Benutzer aussieht, der in seinen
[Einstellungen](../profile/preferences.html) keine eigene Wahl getroffen hat; die eigene Wahl eines Benutzers hat immer Vorrang:

| Feld | Auswahl | Ohne Auswahl |
|---|---|---|
| **Standarddesign** | Dem Browser folgen, Hell, Dunkel oder Farbe, mit einer von 12 Farben für Farbe | Dem Browser folgen (bis 7.2 Hell) |
| **Standardsprache** | Die Sprachen der App, gespeichert in [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | Englisch |
| **Standard-Formularansicht** | Kacheln oder Liste, für die Formularseite | Kacheln |
| **Standard-Zeitzone** | UTC, der Browser jedes Benutzers oder eine beliebige Zone nach Namen | UTC |
| **Standard-Datumsformat** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` oder `DD.MM.YYYY`, jeweils mit dem heutigen Datum angezeigt | `YYYY-MM-DD` |

Die Sprache ist eine Umgebungsvariable und gilt ohne Neustart. Ist
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) auf `0` gesetzt, zeigt die Seite sie schreibgeschützt an.

Ab 7.3.0 ist die Seite wie die Einstellungen im Profil in zwei Tabs aufgeteilt, **Darstellung** (Design, Sprache und Formularansicht) und **Datum und
Uhrzeit** (Zeitzone und Datumsformat, mit einer Vorschau der aktuellen Uhrzeit), und ihr Suchfeld listet die Treffer unter dem Namen jedes Tabs auf.

---

## Dem Browser folgen

Ab 7.3.0 zeigt **Dem Browser folgen** jedem Benutzer das helle oder dunkle Design, das sein Browser verlangt, und wechselt mit ihm.

Es ist der Standard, wenn kein Standarddesign gewählt ist, daher folgt eine neue Installation dem Browser. Fährt man mit dem Mauszeiger über eine der Farben von
**Farbe**, zeigt das eine Vorschau der App in dieser Farbe; das bisherige Design kehrt zurück, sobald der Zeiger sie verlässt, und nichts wird vor **Speichern** übernommen.
