---
layout: default
title: Einstellungen
parent: Ihr Profil
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Einstellungen
{: .no_toc }

Sprache, Design, Zeitzone, Datumsformat und Desktop-Benachrichtigungen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Einstellungen

Die Ansicht Einstellungen ändert, wie AnsibleForms für Sie aussieht. Jede Auswahl wird in dem Browser gespeichert,
in dem Sie sie treffen, sodass ein anderer Browser oder Computer mit den Standardwerten beginnt.

| Einstellung | Auswahl | Auch einstellbar über |
|---|---|---|
| Sprache | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (Japanisch), 简体中文 (vereinfachtes Chinesisch) | die Flagge in der Kopfzeile |
| Design | Dem Browser folgen, Hell, Dunkel oder Farbe (eine Kopfzeile in einer Farbe Ihrer Wahl) | das Sonnensymbol in der Kopfzeile |
| Formularansicht | Kacheln oder Liste | die Schaltfläche auf der Seite Formulare |
| Zeitzone | UTC, die Zone dieses Browsers oder jede Zone nach Namen | nur hier |
| Datumsformat | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` oder `DD.MM.YYYY` | nur hier |
| Desktop-Benachrichtigungen | Ein oder aus | nur hier |

Ab 7.3.0 ist die Ansicht in Tabs gegliedert, jeder unter seiner eigenen Adresse (`/profile/preferences/<tab>`): **Darstellung** (Sprache, Design und Formularansicht),
**Datum und Uhrzeit** (Zeitzone und Datumsformat) und **Benachrichtigungen**. Das Suchfeld darüber listet die passenden Einstellungen
unter dem Namen ihres Tabs auf. Eine Auswahl ist ein Entwurf bis **Speichern**, und wer die Ansicht mit einer ungespeicherten Änderung verlässt, wird zuerst gefragt.

**Dem Browser folgen** wechselt zwischen hell und dunkel wie der Browser und ändert sich mit ihm. Es ist ab 7.3.0 das Standarddesign, sofern Ihr
Administrator kein anderes wählt. Das Darüberfahren über eine Farbe des Designs **Farbe**, hier oder im Designmenü der Kopfzeile, zeigt die App in dieser
Farbe als Vorschau, und das vorherige Design kehrt zurück, wenn der Zeiger die Palette verlässt; es ändert sich nichts bis zu einem Klick.

---

## Desktop-Benachrichtigungen

Ab 7.3.0 schaltet der Tab **Benachrichtigungen** Desktop-Benachrichtigungen in diesem Browser ein, für Benutzer, deren Rolle `showJobs` setzt.

Der Browser fragt beim ersten Mal nach seiner Erlaubnis. Blockiert er Benachrichtigungen für die Website, bleibt der Schalter aus und sagt, wie man
sie erlaubt, und eine Website über reines `http` kann sie gar nicht anzeigen. Einmal eingeschaltet, kommt eine Benachrichtigung:

| Wann | Sie sagt | Ein Klick darauf |
|---|---|---|
| Ein Job, den Sie gestartet haben, endet | Das Formular und sein Ergebnis, etwa *Patch Linux servers: Erfolgreich*, mit Jobnummer und Dauer | Holt den Tab mit diesem Job in den Vordergrund |
| Ein Job wartet auf Ihre Genehmigung | Das Formular, die Jobnummer und wer ihn gestartet hat, mit den Schaltflächen **Freigeben** und **Ablehnen** | Öffnet die Jobs, die auf Genehmigung warten |

Die Schaltflächen **Freigeben** und **Ablehnen** erscheinen in Chrome und Edge; Firefox und Safari zeigen die Benachrichtigung ohne sie, ebenso eine
Website mit selbstsigniertem Zertifikat, da die Schaltflächen einen Service Worker brauchen. Benachrichtigungen kommen nur, solange ein AnsibleForms-Tab geöffnet ist,
auch im Hintergrund: Sobald jeder Tab geschlossen ist, wird nichts mehr gesendet. Jede erscheint einmal, egal wie viele Tabs geöffnet sind, und die Schritte eines
Multistep-Jobs sowie der Job, den Sie gerade ansehen, bleiben still.

---

## Zeitzone

Datum und Uhrzeit werden in ganz AnsibleForms in der Zeitzone angezeigt, die Sie wählen. Das umfasst Start-
und Endzeiten von Jobs, das Audit-Protokoll, die Statusseite, Backups, gespeicherte Jobs und den Ablauf eines API-Tokens.
Eine Änderung der Zeitzone aktualisiert jede Seite sofort, ohne Neuladen.

Solange Sie keine wählen, gilt die Zeitzone, die Ihr Administrator für alle festgelegt hat (**Einstellungen > Erscheinungsbild > Standardwerte**, siehe
[Erscheinungsbild](../appearance.html)), **UTC**, sofern nicht geändert. **Dieser Browser** folgt der Zeitzone Ihres Computers, und die
Liste enthält jede Zone nach Namen, etwa `Europe/Madrid`. Die Karte zeigt die aktuelle Uhrzeit in der gewählten Zone und im gewählten Format.

---

## Datumsformat

Das Datumsformat legt fest, wie der Datumsteil jedes Datums aussieht, jede Auswahl mit dem heutigen Datum angezeigt: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` oder `DD.MM.YYYY`. Solange Sie keines wählen, gilt das Standard-Datumsformat Ihres Administrators,
`YYYY-MM-DD`, sofern nicht geändert. Wie die anderen Auswahlen wird es in diesem Browser gespeichert.

---

## Was die Zeiten des Servers behält

Zwei Ausnahmen behalten die eigenen Zeiten des Servers:

- **Das Serverprotokoll und die Jobausgabe** sind Text mit den Zeiten, die der Server hineingeschrieben hat.
- **Zeiten, die Sie eingeben**, etwa wann ein geplanter Job laufen soll, und Cron-Zeitpläne funktionieren wie
  bisher.
