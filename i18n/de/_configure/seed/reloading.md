---
layout: default
title: Neuladen und Start
parent: Config-Seed
nav_order: 3
translated_from: d6cc2dfaf45589a284b52223737ed04ac4330e67
---

# Neuladen und Start
{: .no_toc }

Die Datei ohne Neustart ändern, und was beim Start passiert
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Datei ohne Neustart ändern

Der Seed wird alle `CONFIG_SEED_RELOAD_SECONDS` neu gelesen (standardmäßig 60, `0` schaltet es ab)
und erneut angewendet, wenn sich sein Inhalt geändert hat. Eine in Git committete Änderung erreicht daher
eine laufende Instanz automatisch: Auf Kubernetes wird eine `ConfigMap` innerhalb von etwa einer Minute unter dem Pod neu
eingehängt, und die nächste Prüfung übernimmt sie. Es gibt keinen Rollout und keinen Neustart, und kein
Hook muss etwas aufrufen.

Bei einer unveränderten Datei berechnet die Abfrage einen Hash und hört auf, sodass sie nie eine bereits
angewendete Zeile neu schreibt.

Um die Datei sofort anzuwenden, statt auf die nächste Prüfung zu warten, verwenden Sie eine dieser Möglichkeiten:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Beide **erzwingen** eine Anwendung, auch wenn sich die Datei nicht geändert hat. Eine erzwungene Anwendung setzt einen
verwalteten Datensatz, der direkt in der Datenbank bearbeitet wurde, erneut durch und klont ein deklariertes Repository erneut,
dessen Arbeitsverzeichnis fehlt.

{: .note }
> Ein Neuladen ist **nie fatal**, anders als die Anwendung beim Start. Eine Instanz, die bereits
> bedient, behält ihre aktuelle Konfiguration, der Grund wird protokolliert, und die Zeile *Konfigurations-Seed*
> auf der Seite Status wird rot und nennt ihn. Ein in Git gepushter Tippfehler darf keine laufende Instanz
> lahmlegen, ohne dass ein Betreiber etwas tut.
>
> Derselbe fehlerhafte Inhalt wird auch nicht bei jeder Prüfung erneut versucht; sonst würde eine einzige schlechte Änderung
> denselben Fehler endlos ins Protokoll schreiben. Korrigieren Sie die Datei oder rufen Sie den Endpunkt auf, um es
> sofort erneut zu versuchen.

---

## Ein fehlerhafter Seed verweigert den Start

Eine unlesbare Datei, ungültiges YAML, ein unbekanntes Feld, ein doppelter Name oder eine nicht aufgelöste
`${VARIABLE}` lassen den Server **beenden**, statt zu starten. Das gilt nur für den **Start**:
Was dieselbe Datei mit einer bereits laufenden Instanz macht, steht im Hinweis oben.

Das ist Absicht. Mit der vorherigen Konfiguration weiterzumachen, würde eine Instanz hinterlassen, deren
Verhalten nicht mehr dem Manifest entspricht, das sie beschreiben soll, ohne dass etwas
die Abweichung meldet. Der Grund wird sowohl auf die Standardfehlerausgabe als auch in die Protokolldatei geschrieben, sodass
`kubectl logs` und `docker logs` ihn zeigen.

Die Validierung ist streng: Unbekannte Felder werden abgewiesen statt ignoriert, und der Fehler nennt
den betroffenen Schlüssel:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Eine leere Datenbank richtet sich selbst ein

Mit eingeschaltetem `ALLOW_SCHEMA_CREATION` (dem Standard) erhält eine Datenbank, die **überhaupt keine
AnsibleForms-Tabellen** enthält, beim Start ihr Schema. Eine frische Bereitstellung startet daher,
ohne dass jemand den Endpunkt `/schema` von Hand aufrufen muss.

Die Vorbedingung ist absichtlich streng: Das Anlegen des Schemas **löscht zuerst jede Tabelle**, daher
läuft es nur gegen eine vollständig leere Datenbank. Eine Datenbank, der eine
Spalte fehlt oder die Tabellen, aber keine Benutzerkonten hat, ist *nicht* leer und bleibt unberührt;
die Schema-Patches behandeln diese Fälle.
