---
layout: default
title: REST API
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# REST API
{: .no_toc }

Start formulieren en beheer AnsibleForms vanuit scripts
{: .fs-6 .fw-300 }

---

Voor ontwikkelaars en automation engineers: start formulieren en beheer AnsibleForms vanuit scripts.

Alles wat de webinterface doet, loopt via de REST API, dus scripts en andere tools kunnen hetzelfde.

---

## Overzicht

De API wordt aangeboden onder `/api/v2` op de AnsibleForms-server:

* **Volledige referentie** : deze pagina's behandelen wat scripts het meest gebruiken. Elk endpoint wordt beschreven, en kan worden uitgeprobeerd, op de
  ingebouwde Swagger-pagina van de server, `https://<your server>/api/v2/docs`.
* **Rechten** : een aanroep draait als de gebruiker wiens token hij meestuurt, met de rollen van die gebruiker, net als in de browser.
* **Startvalidatie** : jobs die via de API worden gestart, kunnen net zo worden gecontroleerd als starts vanuit de browser
  (zie [Startvalidatie](../launch-validation/)).
* **Rate limits** : alleen de endpoints voor aanmelden, afmelden, tokenvernieuwing en single sign-on, de wachtwoordwijziging
  (`PUT /api/v2/profile`) en de endpoints voor API-tokens (`POST` en `DELETE /api/v2/profile/tokens`) zijn beperkt (zie
  [Authenticatie](authentication.html)). Andere aanroepen hebben geen rate limit (de [chatassistent](../chat/) heeft eigen
  limieten), dus een script moet zelf zijn tempo bewaken, bijvoorbeeld als het een job volgt.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat het behandelt |
|---|---|
| [Authenticatie](authentication.html) | Aanmelden, het token vernieuwen, of een langlevend token gebruiken |
| [Jobs](jobs.html) | Een formulier starten, de job volgen, afbreken, opnieuw starten of goedkeuren |
| [Antwoorden en fouten](responses.html) | De vorm van een antwoord, en de statuscodes |
| [Live events](events.html) | Horen wanneer jobs en instellingen veranderen, in plaats van te pollen |
