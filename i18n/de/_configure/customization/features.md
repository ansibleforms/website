---
layout: default
title: Funktionen
parent: Umgebungsvariablen
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Funktionen
{: .no_toc }

Der Designer, MCP, Chat, Startvalidierung, die Jobliste, Metriken, die AWX-API und Abfrageprotokollierung
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, um optionale Teile der Anwendung ein- oder auszuschalten.

---

## Beispiel

Den MCP-Server für KI-Agenten bereitstellen und die Validierungsregeln der Formulare bei jedem Start erzwingen. In der `.env` des Compose-Projekts:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` und `ENABLE_CHAT` gelten ohne Neustart: Sie werden bei jeder Anfrage gelesen, daher können Sie sie auf der
Einstellungsseite umschalten. Solange eine davon aus ist, antwortet ihr Endpunkt (`/api/v2/mcp` oder `/api/v2/chat`) mit `404`.

Lassen Sie zunächst eine Weile `LAUNCH_VALIDATION=log` laufen: Es protokolliert, was `enforce` abweisen würde, ohne es abzuweisen. Siehe [MCP](../mcp/)
und [Protokollieren und erzwingen](../launch-validation/log-and-enforce.html).

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="features" %}
