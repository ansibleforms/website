---
layout: default
title: Mail
parent: Meldingskanalen
nav_order: 1
translated_from: 912c390487fa6b9e65cd83eb1e626c18c44f981a
---

# Mail
{: .no_toc }

Mailservers, de standaardserver, en hoe ze zich aanmelden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het mailkanaal

Een mailkanaal is de server waarlangs de app haar mail verstuurt: een SMTP-server, of vanaf 7.6.0 Microsoft 365. Je kunt er meerdere hebben;
degene die als **Standaard** is gemarkeerd, is de server waarmee de app haar mail verstuurt als een formulier geen mailkanaal noemt:

| Stap | Veld | Betekenis |
|---|---|---|
| Referenties | Inloggegevens | Een **smtp**-referentie uit [Verbindingen > Inloggegevens](../credentials.html) (de mailserver, de poort en TLS, en de aanmelding, of **Geen aanmelding** voor een relay), of een **Microsoft Entra ID**-referentie om via [Microsoft 365](microsoft-365.html) te versturen. Verplicht voor een nieuw kanaal; de stap vraagt verder niets over de server. |
| Referenties | Mail server, Mail poort, TLS gebruiken | Niet in het dialoogvenster. Alleen op de pagina van een kanaal zonder referentie, of waarvan de smtp-referentie geen server heeft, zie hieronder. |
| Referenties | Verzenden via | Alleen met een Microsoft Entra ID-referentie: **Microsoft Graph** (de standaard) of **SMTP (OAuth2)**, zie [Microsoft 365](microsoft-365.html). |
| Afzender | Mail afzender | Het afzenderadres dat ontvangers zien. Met Microsoft 365 de mailbox waarnamens de mail wordt verstuurd. |

---

## Een relay zonder aanmelding

Een mailserver die mail zonder aanmelding aanneemt (een relay) kan op twee manieren dienen, beide zonder authenticatie:

- **Een smtp-referentie met Geen aanmelding** (vanaf 7.6.0): ze bevat alleen **Mail server**, **Mail poort** en **TLS gebruiken**, geen gebruiker of wachtwoord.
- **Geen referentie**: een kanaal zonder (van vroeger, of de relay van de upgrade, zie hieronder) houdt zijn eigen **Mail server**, **Mail poort** en **TLS gebruiken** op zijn pagina.

Een kanaal waarvan de smtp-referentie geen server heeft (gemaakt voordat referenties er een bevatten) houdt ook zijn eigen server, poort en
TLS op zijn pagina, waar de aanmelding van zijn referentie zich aanmeldt. Een kanaal dat een referentie met een eigen server noemt, vergeet een eerder ingevulde server.

---

## Het standaardkanaal

Het eerste mailkanaal wordt de standaard, en **Als standaard instellen** in het rijmenu verplaatst dat naar een ander kanaal. De schakelaar
**Standaard** op het tabblad **Details** van de pagina van een mailkanaal doet hetzelfde.

Vanaf 7.6.0 verstuurt de app helemaal geen mail zolang geen enkel mailkanaal de standaard is, of zolang het standaardkanaal is uitgeschakeld.
Daarvoor viel ze terug op de mailinstellingen van de instellingenpagina of de configuratie-seed. De upgrade naar 7.6.0 maakt van die instellingen
het standaardmailkanaal `default` als er nog geen mailkanaal actief was: met een aanmelding noemt het een nieuwe smtp-referentie `mail-login`;
voor een relay heeft het een eigen server en geen referentie. Declareer in de [configuratie-seed](../seed/) een mailkanaal onder
`notification_channels:` (zie [Voorbeeld](../seed/example.html)): de oude `mail_*`-sleutels onder `settings:` werken nog, maar zijn verouderd.
