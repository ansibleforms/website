---
layout: default
title: Beveiligingsvariabelen
parent: Omgevingsvariabelen
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Beveiligingsvariabelen
{: .no_toc }

Tokens, versleuteling, uitgaande REST-hosts, maskering en de oude VAULT_*-instellingen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze om je eigen geheimen voor tokens en versleuteling in te stellen, en om te beperken wat formulieren mogen aanroepen en tonen.

---

## Voorbeeld

Je eigen geheimen, REST-aanroepen beperkt tot één API en een intern netwerk, en één extra gemaskeerde sleutel. In de `.env` van het compose-project:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Stel `ENCRYPTION_SECRET` in voordat de eerste referentie wordt opgeslagen. Vanaf 7.3.0 versleutelt het instellen of wijzigen ervan bij de volgende start elk opgeslagen
geheim opnieuw, waarbij `ENCRYPTION_SECRET_PREVIOUS` de oude sleutel noemt als die van jezelf was, zie
[Het versleutelingsgeheim wijzigen](../security/secrets.html#changing-the-encryption-secret).

---

## REST-aanroepen en jq

Vanaf 7.3.0 controleren de REST-hulpfuncties (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) het
certificaat van het endpoint dat ze aanroepen, zoals elke andere verbinding; tot en met 7.2.0 deden ze dat nooit. Drie instellingen zijn erop van toepassing:

| Variabele | Standaard | Effect |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` slaat de certificaatcontrole over: alleen voor endpoints met een zelfondertekend certificaat |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Hoe lang een REST-aanroep op een antwoord wacht voordat hij met een time-out mislukt |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Hoe lang een jq-filter mag draaien voordat het wordt gestopt; de uitvoer van jq is ook begrensd op 64 MB |

Alle drie gelden zodra ze zijn opgeslagen, zonder herstart. Laat voor een endpoint waarvan het certificaat door een private CA is ondertekend de controle aan
en geef Node.js in plaats daarvan die CA: stel `NODE_EXTRA_CA_CERTS` in de omgeving van de app in op een PEM-bestand dat haar bevat, en herstart daarna de app.

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="security" %}
