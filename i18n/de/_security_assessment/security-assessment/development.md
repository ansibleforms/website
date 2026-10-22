---
layout: default
title: Sichere Entwicklung
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Sichere Entwicklung
{: .no_toc }

Wie Änderungen geprüft und veröffentlicht werden, und was unterstützt wird
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Der Quellcode

AnsibleForms ist Open Source, daher lässt sich alles auf dieser Seite im Repository selbst überprüfen:

* Der Code, seine Historie und seine Build-Pipelines sind öffentlich auf [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* Die [Lizenz](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) ist GPL-3.0.
* Das [Changelog](../changelog.html) listet jede Änderung jedes Releases auf, Sicherheitskorrekturen eingeschlossen.

---

## Wie eine Änderung gemergt wird

Jede Änderung gelangt über einen Pull Request nach `main`, unter einem Ruleset, das niemand umgehen kann:

| Regel | Was sie bedeutet |
|---|---|
| Pull Request erforderlich | Nichts wird direkt nach `main` gepusht |
| Erforderliche Checks | Der Pull Request wird nur gemergt, wenn jeder der folgenden Checks besteht |
| Kein Force Push, kein Löschen | Die Historie von `main` kann weder umgeschrieben noch entfernt werden |
| Lineare Historie | Jeder Pull Request wird zu einem Commit, sodass jede Änderung einzeln nachverfolgt und rückgängig gemacht werden kann |

Die Checks, die ein Pull Request bestehen muss:

| Check | Was er macht |
|---|---|
| Client, Server | Die Unit-Tests der Weboberfläche und des Servers |
| CodeQL | Die statische Analyse von GitHub für den JavaScript- und TypeScript-Code, auf Injection, Cross-Site-Scripting und andere Schwächen |
| Public schema is up to date | Das Datenbankschema, das der Code erwartet, stimmt mit dem mitgelieferten überein |
| Title, Branch | Der Pull Request folgt den Namensregeln, damit das Changelog korrekt bleibt |

Zwei weitere laufen bei jedem Pull Request und berichten darüber:

* **Database** testet den Server auf MySQL und MariaDB, und **Browser** bedient die Oberfläche in einem Browser.
* **Dependency review** blockiert eine neue Abhängigkeit mit einer bekannten Schwachstelle der Stufe High oder Critical.

---

## Codeanalyse und Abhängigkeiten

Der Code und seine Abhängigkeiten werden nach dem Merge erneut geprüft:

* **CodeQL** analysiert außerdem jeden Push nach `main` und in die Release-Branches sowie jede Woche die gesamte Codebasis:
  Eine neue CodeQL-Regel prüft dann auch den Code, der vor ihr gemergt wurde.
* **Dependabot** öffnet für jede neue Version einer Abhängigkeit einen Pull Request: für die npm-Pakete des Servers und der
  Oberfläche, die Python-Pakete der Laufzeitumgebung und die GitHub Actions der Pipelines jede Woche, und für
  die Basis-Images der Container jeden Tag.
* Die Basis-Images sind per Digest fixiert (`node:26-trixie-slim@sha256:...`), sodass ein Build genau das geprüfte Image verwendet.
  Dependabot aktualisiert den Digest, wenn das Image upstream neu gebaut wird.

---

## Releases und Images

Ein Release wird ausschließlich von GitHub Actions gebaut und veröffentlicht, nie vom Rechner eines Entwicklers:

* Ein Release wird aus `main` (oder `release/6.x`) erstellt, mit einem Changelog, das aus seinen Pull Requests gebaut wird.
* Die Images werden vom [Publish-Workflow](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  gebaut und in die GitHub Container Registry `ghcr.io/ansibleforms/ansibleforms` gepusht, mit den Images der Laufzeitumgebung
  daneben. Der Workflow und seine Logs sind öffentlich, sodass jeder sehen kann, was in ein Image eingeflossen ist.
* Die Images der Anwendung und der Laufzeitumgebung laufen als unprivilegierter Benutzer `node` (uid 1000), nie als root.

---

## Unterstützte Versionen

Sicherheitskorrekturen kommen in das neueste Release jeder unterstützten Linie:

| Version | Erhält Sicherheitskorrekturen |
|---|---|
| 7.x | Ja |
| 6.5.x | Ja |
| Älter als 6.5 | Nein: Die Lösung ist ein Upgrade |

Die [Upgrade-Anleitung](../upgrading/) beschreibt den Wechsel auf ein neueres Release, und [Upgrade auf v7](../upgrade-7.html) den Wechsel von 6.5.
