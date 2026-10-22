---
layout: default
title: Berechtigungen
parent: Ihr Profil
nav_order: 4
translated_from: 08770187a1159539d1d450cf7dddf80c6943cfed
---

# Berechtigungen
{: .no_toc }

Was Ihre Rollen Ihnen erlauben
{: .fs-6 .fw-300 }

---

Die Rollenoptionen sind in Tabs gruppiert, jeder mit der Anzahl seiner Optionen, die Sie haben, etwa `5/8`:

| Tab | Optionen zu |
|---|---|
| **Zugang und Integrationen** | Anmeldung, Chat-Assistent, MCP-Server, Datei-Uploads und API-Tokens |
| **Designer** | Den Designer öffnen und Formulare, Playbooks, Workflows, Inventare und Variablendateien bearbeiten |
| **Jobs** | Jobs und ihre Extravars oder Artefakte sehen, Jobs neu starten, löschen, planen und speichern |
| **Einstellungen** | Die Einstellungsseiten, die Protokolle, das Audit-Protokoll und Backups |
| **Sonstiges** | Eine von Hand in einer Rolle gesetzte Option, die in keinem anderen Tab steht; immer der letzte Tab |

Die anderen Tabs stehen in alphabetischer Reihenfolge. Jeder Tab ist eine Tabelle mit den Spalten **Einstellung** (die Option), **Beschreibung**
(was sie bewirkt) und **Ihr Zugriff**: **Erlaubt** oder **Nicht erlaubt**. Eine Option, die wegen einer anderen gilt, sagt das
unter ihrer Beschreibung: **In** einer Option **enthalten**, die Sie haben, schaltet sie ein, und **Benötigt** eine Option, die Ihnen fehlt, hält sie aus.

Optionen kommen aus den `options` Ihrer Rollen in `config.yaml`; die Seite [Rollen](../config/roles.html) erklärt, wie
sie sich kombinieren.
