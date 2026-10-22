---
layout: default
title: Authenticatie
parent: REST API
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Authenticatie
{: .no_toc }

Aanmelden, het token vernieuwen, of een langlevend token gebruiken
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Elke aanroep heeft een access token nodig in de header `Authorization`. Je krijgt een token door je aan te melden, en houdt het vers met
het refresh token.

---

## Aanmelden

Meld je aan met basic authentication, met de naam en het wachtwoord van de gebruiker:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

Het antwoord bevat twee tokens, het access token en het refresh token:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## De API aanroepen

Stuur het access token bij elke aanroep mee als bearer token:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Het token vernieuwen

Het access token verloopt (`ACCESS_TOKEN_EXPIRATION`, standaard 30 minuten). Haal een nieuw op met het refresh token,
zonder het wachtwoord:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

Het antwoord bevat een nieuw paar, in dezelfde vorm als bij het aanmelden. Een refresh token werkt één keer: bewaar het nieuwe voor de volgende vernieuwing.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Langlevende tokens

Een script dat zonder toezicht draait, kan een token gebruiken dat langer meegaat. Vanaf 7.3.0 is daarvoor de rol-optie `allowApiTokens` nodig:

* Maak er een aan onder [Profiel > API-tokens](../profile/api-token.html).
* Of meld je aan met de queryparameter `expiryDays`, voor een token dat zoveel dagen geldig is:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` wordt alleen uit de URL gelezen, nooit uit de body. Voor een gebruiker zonder `allowApiTokens` in zijn rollen wordt het genegeerd,
en geeft de aanmelding een token met de gebruikelijke levensduur. `expiryDays=never` vereist ook `extendedTokenExpiration`. Voeg de queryparameter `name`
toe (`?expiryDays=90&name=nightly-backup`) om het token een naam te geven in de tokenlijst van de gebruiker.

Een langlevend token leeft hooguit [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) dagen, standaard
90: een langere `expiryDays` wordt daartoe ingekort, tenzij het `never` is. Vernieuwen geeft een gewoon token terug, dus meld je opnieuw aan als het verloopt.

### Tokens van de aangemelde gebruiker

De weergave **API-tokens** van het profiel gebruikt deze endpoints, die voor elk account werken, SSO inbegrepen, omdat ze geen wachtwoord nodig hebben:

| Aanroep | Wat hij doet |
|---|---|
| `GET /api/v2/profile/tokens` | Toont je API-tokens, met hun `sid`, `name`, aanmaakdatum, vervaldatum en laatste gebruik |
| `POST /api/v2/profile/tokens` | Maakt een token vanuit je sessie; de body bevat `expiryDays` (een getal, of `never`) en eventueel een `name` |
| `DELETE /api/v2/profile/tokens/{sid}` | Trekt een van je tokens in |

`POST` antwoordt `403` als het wordt aangeroepen met een API-token (een token kan geen ander token maken), zonder `allowApiTokens`, of als de
sessie zich meer dan 10 minuten geleden heeft aangemeld (code `sign_in_again`): meld je dan eerst opnieuw aan. Een levensduur boven het maximum antwoordt `400`.

---

## Als een token eerder vervalt

Een token, langlevend of niet, werkt niet meer vóór het verloopt als een van deze dingen gebeurt:

* **Afmelden van de sessie**: `POST /api/v2/auth/logout` met het token beëindigt de tokens van die aanmelding, en alleen die. Een
  afmelding in de browser beëindigt het token van een script niet.
* **Een wachtwoordwijziging**: de gebruiker wijzigt zijn wachtwoord, of een beheerder stelt het in. Elk eerder uitgegeven token wordt geweigerd.
* **De gebruiker wordt verwijderd of geblokkeerd**: een lokale gebruiker verwijderen, of een gebruiker blokkeren, beëindigt al zijn tokens. Een beheerder kan ook
  de sessies van een LDAP- of SSO-gebruiker beëindigen.

Een geweigerd token antwoordt `401`. Meld je opnieuw aan, met het nieuwe wachtwoord als het gewijzigd is.

---

## Scripts die zich bij elke run aanmelden

De endpoints voor aanmelden en tokens zijn beschermd tegen floods en het raden van wachtwoorden, dus een script dat zich bij elke run aanmeldt,
moet deze limieten kennen:

| Limiet | Standaard | Wat er gebeurt |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 verzoeken per minuut vanaf één adres | Aanmelden, afmelden, vernieuwen, de SSO-endpoints, `PUT /api/v2/profile` (wachtwoordwijziging) en `POST` of `DELETE /api/v2/profile/tokens` antwoorden `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 mislukte aanmeldingen op rij | Het account wordt vergrendeld voor [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), elke aanmelding antwoordt `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 mislukte aanmeldingen vanaf één adres | Elke aanmelding vanaf dat adres antwoordt `429` tot het venster afloopt |

Een `429` bevat een header `Retry-After` met het aantal seconden om te wachten: stop en wacht, probeer het niet meteen opnieuw. Een vergrendeld account
weigert zelfs het juiste wachtwoord tot de vergrendeling afloopt, dus een script met een verkeerd wachtwoord sluit zijn gebruiker voor iedereen buiten.
Een verkeerd huidig wachtwoord bij een wachtwoordwijziging (`PUT /api/v2/profile`) telt ook als mislukte aanmelding, en een vergrendeld account
kan zijn wachtwoord niet wijzigen. Een geslaagde aanmelding zet de teller van het account op nul, net als een beheerder die het wachtwoord instelt.

Om ver van deze limieten te blijven, meld je je één keer aan en hergebruik je het token, of gebruik je een langlevend token, in plaats van je voor
elke aanroep aan te melden. Achter een reverse proxy stel je [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) in zodat de server
het adres van de client ziet, anders telt elke client als één.
