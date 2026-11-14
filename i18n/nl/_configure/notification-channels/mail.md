---
layout: default
title: Mail
parent: Meldingskanalen
nav_order: 1
translated_from: 8348d14d37bdc4afc9b68869be9fe8021197597e
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
| Referenties | Inloggegevens | Een **smtp**-referentie uit [Verbindingen > Inloggegevens](../credentials.html) (de mailserver, de poort en TLS, en de aanmelding), of een **Microsoft Entra ID**-referentie om via [Microsoft 365](microsoft-365.html) te versturen. Optioneel vanaf 7.6.0: zonder referentie verstuurt het kanaal via zijn eigen mailserver, zie hieronder. |
| Referenties | Mail server, Mail poort, TLS gebruiken | Alleen zonder referentie: de server waarlangs het kanaal zonder aanmelding verstuurt (een relay). **Mail server** is dan verplicht. |
| Referenties | Verzenden via | Alleen met een Microsoft Entra ID-referentie: **Microsoft Graph** (de standaard) of **SMTP (OAuth2)**, zie [Microsoft 365](microsoft-365.html). |
| Afzender | Mail afzender | Het afzenderadres dat ontvangers zien. Met Microsoft 365 de mailbox waarnamens de mail wordt verstuurd. |

---

## Een relay zonder aanmelding

Een mailserver die mail zonder aanmelding aanneemt (een relay) kan op twee manieren dienen, beide zonder authenticatie:

- **Een smtp-referentie met alleen haar server**: haar **Gebruiker (optioneel)** en **Wachtwoord (optioneel)** blijven leeg.
- **Geen referentie** (vanaf 7.6.0): de stap **Referenties** vraagt de eigen **Mail server**, **Mail poort** en **TLS gebruiken** van het kanaal.

Een kanaal dat een referentie met een eigen server noemt, vergeet een server die eerder op het kanaal werd ingevuld.

---

## Het standaardkanaal

Het eerste mailkanaal wordt de standaard, en **Als standaard instellen** in het rijmenu verplaatst dat naar een ander kanaal. De schakelaar
**Standaard** op het tabblad **Details** van de pagina van een mailkanaal doet hetzelfde.

Vanaf 7.6.0 verstuurt de app helemaal geen mail zolang geen enkel mailkanaal de standaard is, of zolang het standaardkanaal is uitgeschakeld.
Daarvoor viel ze terug op de mailinstellingen van de instellingenpagina of de configuratie-seed. De upgrade naar 7.6.0 maakt van die instellingen
het standaardmailkanaal `default` als er nog geen mailkanaal actief was: met een aanmelding noemt het een nieuwe smtp-referentie `mail-login`;
voor een relay heeft het een eigen server en geen referentie. Declareer in de [configuratie-seed](../seed/) een mailkanaal onder
`notification_channels:` (zie [Voorbeeld](../seed/example.html)): de oude `mail_*`-sleutels onder `settings:` werken nog, maar zijn verouderd.
