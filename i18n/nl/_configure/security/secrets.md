---
layout: default
title: Geheimen en versleuteling
parent: Beveiliging
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Geheimen en versleuteling
{: .no_toc }

De twee hoofdgeheimen, wat ze beschermen, en hoe lang sessies en tokens geldig zijn
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De twee hoofdgeheimen

Twee geheimen beschermen al het andere. Stel beide in voordat de instantie echte gegevens bevat, bewaar ze buiten de instantie,
en wijzig ze nooit zomaar:

| Geheim | Wat het beschermt | Als het niet is ingesteld | Als het verloren gaat of wordt gewijzigd |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Elk wachtwoord en token dat in de database is opgeslagen: referenties, het LDAP-bindwachtwoord, runnertokens, SSO-clientgeheimen, webhookadressen van Slack en Teams, de API-sleutel van de chat | Er wordt een standaardsleutel gebruikt, die openbaar in de broncode staat | Verloren: elk opgeslagen geheim moet opnieuw worden ingevoerd. Gewijzigd: vanaf 7.3.0 wordt elk opgeslagen geheim opnieuw versleuteld, zie [hieronder](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | De handtekening van access- en refresh-tokens, inclusief langlevende [API-tokens](../profile/api-token.html) | Bij elke start wordt een willekeurig geheim gegenereerd, dus elke herstart meldt iedereen af | Elke sessie en elk API-token wordt ongeldig |

Zolang ze ontbreken, worden beide bij het opstarten gelogd als waarschuwing `[SECURITY]`. De instellingenpagina's weigeren ze te bewerken,
de API geeft ze nooit terug, en back-ups laten ze bewust weg, dus een verloren `ENCRYPTION_SECRET` kan nergens vandaan worden
hersteld: bewaar een kopie in je secret manager. Het versleutelingsgeheim wordt gebruikt als sleutel van 32 tekens; een kortere of
langere waarde wordt aangevuld of ingekort.

Het wijzigen van `ACCESS_TOKEN_SECRET` beëindigt elke sessie en elk API-token in één keer. Gebruik de intrekkingen die onder [Tokens](#tokens)
worden beschreven om de tokens van één gebruiker of één sessie te beëindigen.

---

## Het versleutelingsgeheim wijzigen

Vanaf 7.3.0 gaan de opgeslagen geheimen niet meer verloren bij het instellen of wijzigen van `ENCRYPTION_SECRET`. Bij de volgende start versleutelt de worker
ze allemaal opnieuw met de nieuwe sleutel, in één databasetransactie, voordat iets anders een geheim schrijft:

| Situatie | Wat in te stellen |
|---|---|
| De instantie draaide zonder `ENCRYPTION_SECRET`, op de openbare standaardsleutel | Alleen `ENCRYPTION_SECRET`: de geheimen worden opnieuw versleuteld vanaf de standaardsleutel |
| De instantie draaide met een eigen sleutel | `ENCRYPTION_SECRET` op de nieuwe sleutel en [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) op de oude, voor die ene start |

Als de opgeslagen geheimen zijn versleuteld met een sleutel die geen van beide is, wordt er niets gewijzigd en weigert de app te starten totdat
`ENCRYPTION_SECRET_PREVIOUS` die sleutel noemt. Verwijder `ENCRYPTION_SECRET_PREVIOUS` zodra de start ze opnieuw heeft versleuteld, en stel de
nieuwe `ENCRYPTION_SECRET` in op elke app-node, de worker en elke RTE in databasemodus die zichzelf registreert. Die
zelfregistratie (`RTE_REGISTER`) is in 7.3.0 verouderd: een RTE die in socketmodus lid wordt met een jointoken (`RTE_JOIN_TOKEN`)
heeft geen `ENCRYPTION_SECRET` nodig, zie [RTE-modi](../rte/modes.html).

---

## Tokens

Een aanmelding geeft een kortlevend access-token en een langer refresh-token terug, waarmee de browser een nieuw paar ophaalt:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : standaard `30m`. Korter
  beperkt het gebruik van een onderschept token.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : standaard
  `24h`. Zo lang blijft een inactieve browser aangemeld.
* De rolinstelling `allowApiTokens` laat een gebruiker een API-token aanvragen dat een aantal dagen geldig is, en
  `extendedTokenExpiration` voegt er een toe dat nooit verloopt. Geef ze alleen aan rollen die vanuit scripts API-toegang nodig hebben.
  Op de [profielpagina](../profile/api-token.html) wordt een token gemaakt vanuit een browsersessie die zich maximaal 10 minuten geleden heeft aangemeld,
  en nooit vanuit een ander API-token. Een token dat nooit verloopt, leeft 50 jaar, en de gebeurtenissen hieronder beëindigen het nog steeds.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : standaard `90`. Het langste dat een API-token
  leeft: een langere aanvraag wordt daarop ingekort.

Een token is een ondertekende JWT, maar de server houdt ook een lijst met ingetrokken tokens bij, gedeeld door elke app-node, zodat een token
kan eindigen voordat het verloopt:

| Gebeurtenis | Wat er eindigt |
|-------|-----------|
| Afmelden | Elk token van die aanmelding: het access-token, het refresh-token, en een API-token als het afmelden daarmee gebeurt |
| Een wachtwoordwijziging, door de gebruiker of door een admin | Elk token van de gebruiker dat vóór de wijziging is uitgegeven, API-tokens inbegrepen, op elk apparaat |
| De schakelaar **Aanmelden toestaan** van een gebruiker uitgezet (lokale, LDAP- of SSO-gebruiker), of een lokale gebruiker verwijderd | Elk token van de gebruiker |
| **Sessies beëindigen** op de pagina van een LDAP- of SSO-gebruiker | Elk token van de gebruiker; hij kan zich opnieuw aanmelden, tenzij hij geblokkeerd is |
| **Intrekken** op een API-token, op de profielpagina of op het tabblad **API-tokens** van de gebruiker | Dat ene API-token, meteen |

Een script beëindigt zijn eigen API-token door zich ermee af te melden: `POST /api/v2/auth/logout` met het token in de
header `Authorization`.
