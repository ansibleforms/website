---
layout: default
title: Was ist AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# Was ist AnsibleForms
{: .no_toc }

Self-Service-Formulare vor Ansible und AWX, und wann Sie sie brauchen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Was es tut

AnsibleForms stellt ein Webformular vor ein Playbook, einen Workflow oder eine Vorlage oder einen Job auf AWX, AAP, Ascender, Semaphore, Rundeck
oder Jenkins, damit Menschen Automatisierung ohne Kommandozeile ausführen können.

Ein Formular sammelt die Eingaben, prüft sie, formt sie zu Extravars und startet den Job. Die Daten in einem Formular können aus Datenbanken,
REST-APIs, Dateien und anderen Feldern stammen, und jeder Start wird mit seiner Ausgabe in der Job-Historie aufgezeichnet.

---

## Typische Einsatzzwecke

Teams verwenden AnsibleForms, um Routine-Automatisierung den Menschen zu übergeben, die sie anfordern:

* **Self-Service-Anfragen** : eine virtuelle Maschine, ein Speicher-Volume, eine Freigabe oder ein Benutzerkonto, vom Anfragenden ausgefüllt
* **Abgesicherte Vorgänge** : Aktionen mit Genehmigungspunkten, sodass eine zweite Person zustimmt, bevor der Job läuft
* **Datengesteuerte Auswahl** : Auswahllisten, gefüllt aus einer CMDB, einer Datenbank oder einer REST-API, kaskadiert von einem Feld zum nächsten
* **Wiederkehrende Jobs** : Formulare, die später oder nach einem Cron-Zeitplan laufen, jedes Mal mit denselben validierten Eingaben
* **Automatisierung für Werkzeuge und Agenten** : die REST-API, der MCP-Server und der Chat-Assistent starten dieselben Formulare

---

## AnsibleForms oder AWX-Surveys?

AWX, AAP und Ascender haben eigene Surveys. Was passt, hängt davon ab, was die Menschen brauchen, die die Jobs starten.

Ein **Survey** reicht, wenn:

* die Fragen fest sind: Text, Zahlen, Passwörter und Auswahlen aus einer statischen Liste
* die Benutzer bereits in AWX, AAP oder Ascender arbeiten und dessen Berechtigungen zu ihnen passen
* Sie keine weitere Anwendung samt Datenbank betreiben und pflegen wollen

**AnsibleForms** hilft, wenn:

* die Auswahlen von anderswo kommen: aus einer Datenbank, einer REST-API, einer Datei oder einem anderen Feld (kaskadierende Auswahllisten)
* die Eingaben Validierung, Struktur (Listen, verschachtelte Objekte) oder berechnete Werte brauchen, bevor sie das Playbook erreichen
* die Jobs Genehmigungspunkte, Zeitplanung oder einen Workflow brauchen, der Playbooks, Vorlagen und Genehmigungen aus einem Formular verkettet
* die Benutzer AWX gar nicht sehen sollen, oder Sie auch Playbooks ohne AWX ausführen

AnsibleForms startet Vorlagen von AWX, AAP und Ascender, daher arbeiten beide zusammen: die Formulare sammeln und formen die Eingaben, und
AWX führt weiterhin die Jobs aus.

---

## Wie es weitergeht

Der Rest dieses Abschnitts erklärt die beweglichen Teile, bevor Sie installieren:

| Seite | Was sie behandelt |
|---|---|
| [Wie es funktioniert](how-it-works.html) | Die Architektur, die Schritte eines Starts und wo Daten aufbewahrt werden |
| [Rundgang durch die Oberfläche](gui/) | Screenshots jedes Bildschirms, von der Anmeldung bis zu den Administrationsseiten |
| [Konzepte](concepts.html) | Die in dieser Dokumentation verwendeten Begriffe |
| [Voraussetzungen](prerequisites.html) | Was Sie vor der Installation brauchen |
