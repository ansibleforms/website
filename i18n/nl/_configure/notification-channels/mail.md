---
layout: default
title: Mail
parent: Meldingskanalen
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Mail
{: .no_toc }

SMTP-servers, de standaardserver, en hun aanmelding
{: .fs-6 .fw-300 }

Een mailkanaal is een SMTP-server. Je kunt er meerdere hebben; degene die als **Standaard** is gemarkeerd, is de server waarmee de app haar
mail verstuurt als een formulier geen mailkanaal noemt. Het eerste mailkanaal wordt de standaard, en **Als standaard instellen** verplaatst dat.

| Stap | Veld | Betekenis |
|---|---|---|
| Referenties | Inloggegevens | Verplicht. Een **smtp**-referentie uit [Verbindingen > Inloggegevens](../credentials.html): de mailserver, de poort en TLS, en de aanmelding. Voor een relay zonder aanmelding een smtp-referentie zonder gebruiker. |
| Afzender | Mail afzender | Het afzenderadres dat ontvangers zien. |

De schakelaar **Standaard** op het tabblad **Details** van de pagina van een mailkanaal maakt het de standaard, zoals **Als standaard instellen** doet.
De mailinstellingen van de configuratie-seed worden gebruikt zolang geen enkel mailkanaal de standaard is, of zolang het standaardkanaal is uitgeschakeld.
