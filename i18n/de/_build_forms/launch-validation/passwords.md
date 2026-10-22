---
layout: default
title: Passwörter
parent: Start-Validierung
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Passwörter
{: .no_toc }

Wie Passwortfelder validiert, gespeichert und aus APIs herausgehalten werden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ein Passwortfeld wird wie jedes andere Feld validiert. Sein Wert bleibt jedoch auf dem Server und wird nie an
einen Client zurückgegeben.

---

## Wo ein Passwort aufbewahrt wird

Der Server speichert das Passwort mit dem Job, in seinen Extravars:

* Eine **Genehmigung** kann den Job dann mit dem Passwort fortsetzen, das der Benutzer eingegeben hat.
* Ein **Neustart wie gelaufen** kann es wiederverwenden, wenn die Start-Validierung nicht `enforce` ist.

Das gespeicherte Passwort wird nur auf dem Server verwendet.

---

## Was die APIs zurückgeben

Keine API gibt jemals ein Passwort zurück:

* Ein Job, der über die REST-API oder `get_job` des MCP-Servers gelesen wird, maskiert jedes `password`-Feld seines Formulars, auch in
  Listenzeilen und YAML-Unterformularen.
* `MASK_EXTRAVARS_REGEX` (Standard `password|secret|token`) maskiert zusätzlich jede Extravar, deren Name passt, für
  Secrets, die keine Passwortfelder sind.

---

## Was ein Neustart erhält

Um einen Neustart vorauszufüllen, erhält der Browser die Roh-Formulardaten des Jobs. Diese Daten enthalten nie ein Passwort, auch nicht in
Listenzeilen oder YAML-Unterformularen, sodass der Benutzer das Passwort erneut eingibt.

Ein Passwortfeld, das die Abhängigkeiten des Formulars ausblenden, wird nicht gebraucht und muss nicht erneut eingegeben werden.
