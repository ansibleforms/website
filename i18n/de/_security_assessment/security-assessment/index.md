---
layout: default
title: Überblick
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Sicherheitsbewertung
{: .no_toc }

Für Sicherheitsprüfungen: Maßnahmen, Entwicklung und Advisories
{: .fs-6 .fw-300 }

---

## Kurz gesagt

AnsibleForms führt Playbooks aus und verwahrt deren Zugangsdaten, ist also Teil Ihrer Vertrauenskette:

* Es ist **selbst gehostet**: Es läuft auf Ihrer Infrastruktur, speichert seine Daten in Ihrer Datenbank und sendet nichts an seine Entwickler.
* Es ist **Open Source** (GPL-3.0): Der Code, seine Pipelines und jedes Advisory sind öffentlich.
* Jedes gespeicherte Secret ist **verschlüsselt**, jede Änderung wird **auditiert**, und **Rollen** werden bei jeder Anfrage geprüft.
* Schwachstellen werden **vertraulich gemeldet**, in jeder unterstützten Version behoben und **veröffentlicht**.

---

## In diesem Abschnitt

Die Seiten beantworten die Fragen einer Sicherheitsprüfung, vom Design bis zur CVE-Liste:

| Seite | Inhalt |
|---|---|
| [Sicherheitsmaßnahmen](measures.html) | Anmeldung, Berechtigungen, gespeicherte Secrets, der Audit-Trail, der Browser, der Server, Verbindungen und Container |
| [Sichere Entwicklung](development.html) | Wie eine Änderung geprüft und getestet wird, Code- und Abhängigkeitsanalyse, wie Images gebaut werden, unterstützte Versionen |
| [Eine Schwachstelle melden](reporting.html) | Wie Sie ein Problem vertraulich melden und was danach passiert |
| [Security Advisories](advisories.html) | Jede veröffentlichte Schwachstelle, mit CVE, Schweregrad und behobener Version |
| [FAQ zur Bewertung](faq.html) | Kurze Antworten auf die Fragen, die Sicherheitsfragebögen am häufigsten stellen |

Um eine Instanz abzusichern statt sie zu bewerten, siehe [Sicherheit](../security/) im Administratorhandbuch.
