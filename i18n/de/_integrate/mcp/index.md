---
layout: default
title: MCP-Server
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# MCP-Server
{: .no_toc }

KI-Agenten Ihre Formulare über das Model Context Protocol nutzen lassen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren und Integratoren: MCP-Clients Formulare auflisten, ausfüllen und starten lassen, als der Benutzer, dessen Token sie halten.

AnsibleForms kann einen
[Model-Context-Protocol](https://modelcontextprotocol.io)-Server bereitstellen, sodass ein MCP-Client, etwa
ein Chat-Backend oder ein IDE-Assistent, die Formulare auflisten kann, die ein Benutzer verwenden darf, ihre Felder ermitteln,
Jobs starten und deren Fortschritt verfolgen kann.

---

## Was er ist und was nicht

Der MCP-Server ist eine technische Schnittstelle zum selben Formularablauf, den der Browser verwendet. Er läuft
**als der Benutzer, dessen Token er erhält**: dieselben Formularrollen, dieselbe Sichtbarkeit der Jobs, dieselben
Prüfungen reservierter Extravars wie bei einer Übermittlung im Browser.

Er fügt keine eigene KI-Richtlinie hinzu. Ob ein Agent vor einem Start um Bestätigung bitten muss,
welche Formulare er verwenden darf oder wie viele Anfragen er stellen darf, liegt beim MCP-Client. Das
Start-Tool ist als destruktiv markiert, daher fragt ein gut erzogener Client zuerst nach einer Bestätigung,
aber der Server erzwingt das nicht.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Was sie behandelt |
|---|---|
| [Einrichtung](setup.html) | Den Server einschalten und den Client authentifizieren |
| [Tools](tools.html) | Die Tools, mit denen ein Agent Formulare ausfüllt, genehmigt und erneut startet |
| [Einschränkungen](limitations.html) | Ausdrücke laufen auf dem Server, und was der MCP-Server nicht tut |
