---
layout: default
title: Bewerken en audit
parent: Configuratie-seed
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Bewerken en audit
{: .no_toc }

De instellingenpagina's vergrendelen, en wat het auditlogboek vastlegt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het bewerken van de omgeving uitschakelen

`ALLOW_ENV_EDIT=0` maakt de instellingenpagina's alleen-lezen. Elke variabele wordt nog steeds getoond met
de geldende waarde en de reden waarom ze niet kan worden gewijzigd, en het endpoint voor opslaan antwoordt met
403.

Gebruik het wanneer de omgeving elders wordt gedeclareerd. Anders schrijft de instellingenpagina
`persistent/.env`, dat op een vluchtig volume bij de volgende herstart ongemerkt verloren gaat, en op
een duurzaam volume afdrijft van het manifest dat leidend hoort te zijn.

{: .note }
> Back-ups bevatten `persistent/.env` als `managed.env`, zodat een herbouw de database- en
> padinstellingen terugkrijgt. **`ENCRYPTION_SECRET` en `ACCESS_TOKEN_SECRET` worden eruit gehaald**:
> de dump ernaast bevat elke opgeslagen referentie als AES-versleutelde tekst, en de sleutel die
> die ontsleutelt in dezelfde map schrijven zou een gekopieerde back-up genoeg maken om ze allemaal te lezen. Stel
> die twee in plaats daarvan op de doelhost in; een opmerking in het bestand vermeldt dat.
>
> Wat overblijft, kan nog referenties bevatten (`DB_PASSWORD`, `METRICS_TOKEN`, een oud `VAULT_TOKEN`), dus het bestand wordt
> geschreven met `0600`. Het terugzetten ervan is een aparte stap waarvoor je bewust kiest, en geen onderdeel van een gewone terugzetting,
> omdat de databasehost en de paden erin de machine beschrijven waar de back-up vandaan kwam. Het
> dialoogvenster voor terugzetten toont het bestand en biedt een eigen knop *Omgeving herstellen*
> (`POST /api/v2/backup/:folder/restore-env`), die het vorige bestand bewaart als `.env.bak`.

---

## Wat er wordt vastgelegd

Elke toepassing die iets wijzigt, schrijft één regel `seed.apply` in het auditlogboek, met
de objecten die zijn aangemaakt, bijgewerkt, vrijgegeven en opgeschoond. Waarden worden nooit vastgelegd, omdat de meeste
ervan geheimen zijn. Een toepassing die niets wijzigt, schrijft niets, zodat het trail betekenisvol blijft. Een
controle die het bestand ongewijzigd vindt, wijzigt niets, dus het trail krijgt er niet elke minuut een rij bij.

Een toepassing die via het endpoint is aangevraagd, wordt bewust twee keer vastgelegd, en de twee rijen
leggen verschillende dingen vast: `config-seed.apply.create` is **wie** erom vroeg, `seed.apply` is
**wat** ze wijzigde.

De pagina Status meldt de seed twee keer: een **controle** dat het bestand nog leesbaar en te parsen is,
en dat de laatste herlaadbeurt is geslaagd, en een **informatie**rij die zegt hoeveel records hij
momenteel bezit. De controle is de enige plek die meldt wanneer het bestand op schijf en de geldende configuratie
uit elkaar zijn gelopen, omdat een mislukte herlaadbeurt de instantie laat doordraaien.
