---
layout: default
title: Erneut starten und Audit
parent: Chat-Assistent
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Erneut starten und Audit
{: .no_toc }

Erneut starten aus dem Chat, der Audit-Trail und die Einschränkungen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Erneut starten

Eine Anfrage wie „Starte Job 1234 erneut“ (der Benutzer muss die Job-ID eintippen) zeigt eine Vorschau des erneuten Starts
nach denselben Regeln wie `relaunch_job` des MCP-Servers, einschließlich der Passwortregel der
[Startvalidierung](../launch-validation), und zeigt eine Zusammenfassung **Erneut starten**; die Schaltfläche
startet ihn einmal. „Starte Job 1234 erneut mit Server web02“ ändert nur dieses Feld.

---

## Audit

Jeder Start aus dem Chat wird als **chat.launch** aufgezeichnet, mit dem Benutzer, dem Job, dem Formular,
dem Anbieter und dem Payload-Hash der genehmigten Zusammenfassung. Änderungen an den Chat-Einstellungen werden
wie jede andere Änderung der Einstellungen aufgezeichnet.

---

## Einschränkungen

Der Chat-Assistent kann noch nicht alles, was ein Browser kann:

- **Wizard-Formulare** können nicht teilnehmen (`enableForChat` wird für sie abgelehnt), ebenso wenig
  die Felder, die der Assistent nicht ausfüllt: Passwörter und Datei-Uploads.
- Antworten kommen in einem Stück; Streaming wird noch nicht unterstützt.
- Das Modell kann eine Anfrage missverstehen. Die Zusammenfassungskarte zeigt genau, was gesendet wird;
  prüfen Sie sie, bevor Sie auf **Starten** klicken.
