---
layout: default
title: Meldingskanalen
nav_order: 10
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1756db6ff7b9197f88b34a0c089953a68493e008
---

# Meldingskanalen
{: .no_toc }

Verstuur goedkeuringsaanvragen en jobmeldingen per mail, naar Slack, Microsoft Teams, Telegram of een willekeurige webhook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: voeg de mailservers en chatkanalen toe waarnaar formulieren hun meldingen en goedkeuringen sturen.

---

## In deze sectie

| Pagina | Wat er aan bod komt |
|---|---|
| [Mail](notification-channels/mail.html) | SMTP-servers, de standaardserver, en hun aanmelding |
| [Slack en Microsoft Teams](notification-channels/slack-and-teams.html) | Een kanaalwebhook van Slack of Teams |
| [Telegram](notification-channels/telegram.html) | Een bot die in een Telegram-chat post |
| [Webhook](notification-channels/webhook.html) | Een JSON-verzoek naar een willekeurig HTTP-endpoint |
| [Kanalen in een formulier gebruiken](notification-channels/in-a-form.html) | Kanalen noemen in meldingen en goedkeuringen |
| [Een kanaal testen](notification-channels/testing.html) | Test versturen, en wat het bewijst |


---

## Hoe het werkt

Een **meldingskanaal** is een plek waar meldingen naartoe gaan, toegevoegd onder **Verbindingen > Meldingen**. Elk kanaal heeft
een van deze typen:

| Type | Wat het verstuurt |
|---|---|
| Mail | Mail via een SMTP-server: goedkeuringsaanvragen en jobmeldingen. |
| Slack | Een bericht in een Slack-kanaal, via zijn inkomende webhook, met een knop naar de job. |
| Microsoft Teams | Een kaart in een Teams-kanaal, via een Workflows-webhook, met een knop naar de job. |
| Telegram | Een bericht van een bot in een Telegram-chat, met een link naar de job. |
| Webhook | Een JSON-verzoek naar een willekeurig HTTP-endpoint, opgebouwd uit een template. |

Een formulier noemt zijn kanalen in zijn [meldingen](forms/notifications.html) en zijn [goedkeuring](forms/approval.html),
met `channels:`. Een melding die niet kan worden verstuurd, wordt in het log geschreven; ze laat nooit de job of de goedkeuring mislukken.

---

## De pagina Meldingen

De pagina onder **Verbindingen > Meldingen** toont elk kanaal met deze kolommen:

| Kolom | Betekenis |
|---|---|
| Ingeschakeld | Of er meldingen naartoe worden gestuurd, zie [Kanalen in een formulier gebruiken](notification-channels/in-a-form.html). |
| Naam | Hoe formulieren ernaar verwijzen in `channels:`. |
| Type | Mail, Slack, Microsoft Teams, Telegram of Webhook. Het standaardmailkanaal toont een pilletje **Standaard** na het type. |
| Beschrijving | Waarvoor het kanaal dient. |

**Meldingskanaal toevoegen** opent een dialoogvenster: **Kanaal** (naam en beschrijving), **Type**, en daarna de stappen van het gekozen
type. Het type wordt ingesteld wanneer het kanaal wordt aangemaakt en blijft zo. Een rij opent de eigen pagina van het kanaal, met dezelfde stappen als
tabbladen na **Details**, en rechtsboven **Test versturen**, **Verwijderen** en **Opslaan**. Het rijmenu biedt
**Bewerken**, **Inschakelen** of **Uitschakelen** (afhankelijk van wat van toepassing is), **Als standaard instellen** (mail), **Test versturen** en **Verwijderen**.

Het tabblad **Details** van de pagina van een kanaal bevat de schakelaar **Ingeschakeld**, die meteen wordt opgeslagen, en voor mail de schakelaar **Standaard**,
die met **Opslaan** wordt opgeslagen.

Een gebruiker die deze pagina's opent met `showConnectionsSettings` maar zonder de rol admin, kan geen referentie kiezen die alleen
een admin mag noemen, zie [Wie een referentie mag wijzigen](credentials.html#who-may-change-a-credential). Als zo'n gebruiker wijzigt
waarheen een kanaal verstuurt (de url van een webhook of de certificaatcontrole ervan, het adres van een Telegram Bot API), verliest het kanaal de
referentie die het noemde, tenzij hij in dezelfde wijziging er een kiest.

Een kanaal dat in de [configuratie-seed](seed/) is gedeclareerd, is op deze pagina alleen-lezen, en kan nog steeds worden getest.

