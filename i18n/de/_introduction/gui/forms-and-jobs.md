---
layout: default
title: Formulare und Jobs
parent: Rundgang durch die Oberfläche
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# Formulare und Jobs
{: .no_toc }

Die Anmeldung, das Dashboard, das Ausfüllen eines Formulars und das Verfolgen seiner Jobs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Anmeldung

Die Seite zur Benutzerauthentifizierung, mit Unterstützung für lokale, LDAP-, Entra-ID- und OIDC-Authentifizierung.

![Anmeldung](../assets/screenshots/login.jpg)

---

## Das Dashboard

Das Haupt-Dashboard zeigt alle verfügbaren Formulare, nach Kategorie geordnet.

![Dashboard](../assets/screenshots/dashboard.jpg)

---

## Ein Formular

Ein Beispiel für ein Formular mit externen Datenquellen und dynamischen Feldern.

![Beispielformular](../assets/screenshots/form.jpg)

---

## JSON-Vorschau des Formulars

Zeigen Sie vor dem Ausführen des Jobs eine Vorschau der JSON-Payload und der Extra-Variablen an, die an Ansible übergeben werden.

![JSON-Vorschau des Formulars](../assets/screenshots/form-json.jpg)

---

## Laufender Job

Ausführung eines Ansible-Playbooks in Echtzeit mit Live-Ausgabe.

![Laufender Job](../assets/screenshots/run.jpg)

---

## Job-Ausgabe

Die vollständige Ausgabe eines ausgeführten Ansible-Playbooks.

![Job-Ausgabe](../assets/screenshots/job-output.jpg)

---

## Job-Protokolle

Alle Jobs mit ihrem Status und ihren Zeiten, über das linke Menü nach Status gefiltert.

![Job-Protokolle](../assets/screenshots/job-log.jpg)

---

## Multistep

Ein Multistep-Job, mit der Ausgabe jedes Schritts unter dem Hauptjob. Multistep-Formulare sind seit 7 veraltet: ein
[Workflow](../workflows/) verkettet stattdessen Playbooks, Vorlagen und Genehmigungen.

![Multistep-Formular](../assets/screenshots/multistep.jpg)

---

## Zeitpläne

Planen Sie Formulare zu bestimmten Zeiten oder in Intervallen ein. Die [Cron-Beispiele](../faq.html#which-cron-expressions-can-i-use) listen gängige
Ausdrücke auf und erklären, in welcher Zeitzone ein Zeitplan läuft.

![Zeitpläne](../assets/screenshots/schedules.jpg)
