---
layout: default
title: Benachrichtigungskanäle
nav_order: 10
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1756db6ff7b9197f88b34a0c089953a68493e008
---

# Benachrichtigungskanäle
{: .no_toc }

Genehmigungsanfragen und Job-Benachrichtigungen per Mail, an Slack, Microsoft Teams, Telegram oder einen beliebigen Webhook senden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Fügen Sie die Mailserver und Chat-Kanäle hinzu, an die Formulare ihre Benachrichtigungen und Genehmigungen senden.

---

## In diesem Abschnitt

| Seite | Inhalt |
|---|---|
| [Mail](notification-channels/mail.html) | SMTP-Server, der Standardserver und ihre Anmeldung |
| [Slack und Microsoft Teams](notification-channels/slack-and-teams.html) | Ein Kanal-Webhook von Slack oder Teams |
| [Telegram](notification-channels/telegram.html) | Ein Bot, der in einem Telegram-Chat postet |
| [Webhook](notification-channels/webhook.html) | Eine JSON-Anfrage an einen beliebigen HTTP-Endpunkt |
| [Kanäle in einem Formular verwenden](notification-channels/in-a-form.html) | Kanäle in Benachrichtigungen und Genehmigungen nennen |
| [Einen Kanal testen](notification-channels/testing.html) | Test senden und was er beweist |


---

## Funktionsweise

Ein **Benachrichtigungskanal** ist ein Ziel für Benachrichtigungen, angelegt unter **Verbindungen > Benachrichtigungen**. Jeder Kanal hat
einen dieser Typen:

| Typ | Was er sendet |
|---|---|
| Mail | Mail über einen SMTP-Server: Genehmigungsanfragen und Job-Benachrichtigungen. |
| Slack | Eine Nachricht in einem Slack-Kanal, über seinen eingehenden Webhook, mit einer Schaltfläche zum Job. |
| Microsoft Teams | Eine Karte in einem Teams-Kanal, über einen Workflows-Webhook, mit einer Schaltfläche zum Job. |
| Telegram | Eine Nachricht eines Bots in einem Telegram-Chat, mit einem Link zum Job. |
| Webhook | Eine JSON-Anfrage an einen beliebigen HTTP-Endpunkt, aus einem Template erzeugt. |

Ein Formular nennt seine Kanäle in seinen [Benachrichtigungen](forms/notifications.html) und seiner [Genehmigung](forms/approval.html),
mit `channels:`. Eine Benachrichtigung, die nicht gesendet werden kann, wird ins Protokoll geschrieben; sie lässt nie den Job oder die Genehmigung fehlschlagen.

---

## Die Seite Benachrichtigungen

Die Seite unter **Verbindungen > Benachrichtigungen** listet jeden Kanal mit diesen Spalten auf:

| Spalte | Bedeutung |
|---|---|
| Aktiviert | Ob Benachrichtigungen an ihn gesendet werden, siehe [Kanäle in einem Formular verwenden](notification-channels/in-a-form.html). |
| Name | Wie Formulare in `channels:` auf ihn verweisen. |
| Typ | Mail, Slack, Microsoft Teams, Telegram oder Webhook. Der Standard-Mail-Kanal zeigt nach seinem Typ eine Pille **Standard**. |
| Beschreibung | Wofür der Kanal ist. |

**Benachrichtigungskanal hinzufügen** öffnet einen Dialog: **Kanal** (Name und Beschreibung), **Typ**, dann die Schritte des gewählten
Typs. Der Typ wird beim Anlegen des Kanals festgelegt und bleibt so. Eine Zeile öffnet die eigene Seite des Kanals, mit denselben Schritten als
Tabs nach **Details**, und **Test senden**, **Löschen** und **Speichern** oben rechts. Das Menü der Zeile bietet
**Bearbeiten**, **Aktivieren** oder **Deaktivieren** (je nachdem, was zutrifft), **Als Standard festlegen** (Mail), **Test senden** und **Löschen**.

Der Tab **Details** der Seite eines Kanals enthält den Schalter **Aktiviert**, der sofort gespeichert wird, und bei Mail den Schalter **Standard**,
der mit **Speichern** gespeichert wird.

Ein Benutzer, der diese Seiten mit `showConnectionsSettings`, aber ohne die Rolle admin öffnet, kann keine Anmeldedaten wählen, die nur
ein Admin nennen darf, siehe [Wer Anmeldedaten ändern darf](credentials.html#who-may-change-a-credential). Ändert ein solcher Benutzer,
wohin ein Kanal sendet (die URL eines Webhooks oder seine Zertifikatsprüfung, eine Telegram-Bot-API-Adresse), verliert der Kanal die
Anmeldedaten, die er nannte, es sei denn, der Benutzer wählt in derselben Änderung neue.

Ein im [Config-Seed](seed/) deklarierter Kanal ist auf dieser Seite schreibgeschützt und lässt sich trotzdem testen.

