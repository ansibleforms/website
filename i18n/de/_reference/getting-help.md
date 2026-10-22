---
layout: default
title: Hilfe erhalten
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Hilfe erhalten
{: .no_toc }

Wo Sie eine Frage stellen, einen Fehler oder ein Sicherheitsproblem melden und eine Verbesserung vorschlagen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Bevor Sie fragen

Die meisten Antworten sind bereits aufgeschrieben; ein kurzer Blick erspart oft eine Rückfrage:

1. Durchsuchen Sie diese Website mit dem Suchfeld oben auf jeder Seite.
2. Schlagen Sie die genaue Fehlermeldung unter [Fehlerbehebung](troubleshooting.html) nach und überfliegen Sie die [FAQ](faq.html).
3. Prüfen Sie das Serverprotokoll (**Einstellungen**, dann **Serverprotokoll**) und die Seite **Status**, die die meisten Konfigurationsprobleme melden.
4. Prüfen Sie das [Changelog](changelog.html): das Problem ist vielleicht in einer neueren Version bereits behoben.

---

## Wohin Sie sich wenden

Jede Art von Anliegen hat ihren eigenen Ort, alle auf GitHub:

| Sie möchten | Gehen Sie zu |
|---|---|
| Eine Frage stellen oder eine Idee teilen | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Einen Fehler melden | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Eine Funktion vorschlagen | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Ein Sicherheitsproblem melden | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), vertraulich |
| Diese Dokumentation korrigieren oder verbessern | **Edit this page on GitHub** unten auf jeder Seite, oder ein [Issue zur Website](https://github.com/ansibleforms/website/issues) |

---

## Einen Fehler melden

Ein Bericht, der sich reproduzieren lässt, wird am schnellsten behoben. Die Vorlage für Fehlerberichte fragt nach Folgendem:

* **Version** : angezeigt unter **Info** im Hilfemenü (**?**) der oberen Leiste
* **Bereitstellung** : Docker, Docker Compose, Kubernetes, der Installer (und seine Engine), eine native Installation oder aus dem Quellcode
* **Schritte zur Reproduktion** : was Sie getan haben, was Sie erwartet haben und was stattdessen passiert ist
* **Belege** : die relevanten Zeilen des Serverprotokolls und ein Screenshot, wenn das Problem sichtbar ist

Bei einem Problem mit einem Formular fügen Sie eine minimale Formulardefinition bei, die es zeigt. Entfernen Sie Passwörter, Tokens, Hostnamen und alle
anderen privaten Daten aus Protokollen und Formularen, bevor Sie sie veröffentlichen: Issues und Discussions sind öffentlich.

---

## Ein Sicherheitsproblem melden

**Eröffnen Sie dafür nie ein öffentliches Issue:** verwenden Sie [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), das nur die Maintainer sehen.

Die [Sicherheitsrichtlinie](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) listet die unterstützten Versionen auf und
beschreibt, was nach Ihrer Meldung passiert.
