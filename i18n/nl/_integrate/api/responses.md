---
layout: default
title: Antwoorden en fouten
parent: REST API
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Antwoorden en fouten
{: .no_toc }

De vorm van een antwoord, en de statuscodes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Antwoorden zijn gewone JSON, en de HTTP-statuscode vertelt of een aanroep is geslaagd.

---

## Antwoorden

Een geslaagde aanroep geeft het object zelf terug, of een lijst met de grootte ervan:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Een fout geeft een bericht terug, en details als die er zijn:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Statuscodes

De statuscode vertelt wat er misging:

| Code | Betekenis |
|---|---|
| `200` | De aanroep is geslaagd |
| `400` | Het verzoek is onjuist opgebouwd, bijvoorbeeld een tokenvernieuwing zonder refresh token, of een upload zonder bestand |
| `401` | Het token ontbreekt, is onjuist of is verlopen: meld je aan of vernieuw het |
| `403` | De rollen van de gebruiker staan de aanroep niet toe (inclusief het goedkeuren van je eigen job, tenzij de goedkeuring ervan `allowSelf: true` zet of je beheerder bent), of het account moet eerst iets doen (zie hieronder) |
| `404` | Het object bestaat niet |
| `409` | Het verzoek is onvolledig (een start zonder gegevens), of het object is niet in een toestand die de actie toestaat |
| `422` | [Startvalidatie](../launch-validation/) heeft de waarden van het formulier geweigerd; `details` vertelt waarom |
| `429` | Te veel verzoeken naar de endpoints voor aanmelden en tokens, of te veel mislukte aanmeldingen (zie [Authenticatie](authentication.html)) |
| `500` | De server is mislukt; het serverlog bevat de reden |

Bij een job betekent een `409` dat hij in de verkeerde toestand is voor de actie: een job afbreken die niet draait (of waarvan het afbreken al gevraagd is),
een job opnieuw starten die nog draait, of een job goedkeuren of afwijzen die niet meer op goedkeuring wacht.

---

## Een 403 met een code

Sommige `403`-antwoorden bevatten een `code`, voor iets wat de gebruiker eerst in de browser moet doen voordat een andere aanroep werkt:

```json
{ "error": "...", "code": "password_change_required" }
```

| Code | Wat te doen |
|---|---|
| `password_change_required` | De gebruiker heeft zich aangemeld met het openbare standaardwachtwoord: wijzig het eerst in het profiel |
| `disclaimer_required` | De disclaimer staat aan en de gebruiker heeft de huidige versie ervan nog niet geaccepteerd: accepteer hem in de browser |

Een langlevend API-token (zie [Authenticatie](authentication.html#long-lived-tokens)) wordt nooit tegengehouden door de disclaimer.
