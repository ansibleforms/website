---
layout: default
title: Omgevingsvariabelen
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# Omgevingsvariabelen
{: .no_toc }

AnsibleForms configureren met omgevingsvariabelen
{: .fs-6 .fw-300 }

---

Voor beheerders die AnsibleForms uitrollen: de omgevingsvariabelen die de server leest, gegroepeerd per onderwerp.

AnsibleForms wordt afgesteld met omgevingsvariabelen, of het nu draait met Docker Compose, op Kubernetes of vanuit de broncode.

---

## Waar de waarden vandaan komen

De server leest elke variabele uit de eerste van deze bronnen die haar instelt, dus een waarde hoger in de lijst wint altijd:

1. **De procesomgeving**: `environment:` en `env_file:` in docker-compose (de `.env` van het project wordt zo doorgegeven),
   `env` en `envFrom` op Kubernetes, of de shell die `node` start.
2. **`persistent/.env`**, het bestand dat de instellingenpagina's schrijven (`data/.env` in het docker-compose-project, een ander pad met
   `MANAGED_ENV_PATH`). Het wordt bij elke start gelezen, ook in productie, en overschrijft nooit een variabele die al is ingesteld.
3. **`server/.env.<NODE_ENV>`**, bijvoorbeeld `.env.development`. Alleen gelezen als `NODE_ENV` niet `production` is (of met
   `FORCE_DOTENV=1`), in de praktijk wanneer je [vanuit de broncode](../installation/from-source.html) in ontwikkelmodus draait.
4. **De ingebouwde standaardwaarde**, getoond in de tabellen van elke groep.

De instellingenpagina's, onder **Instellingen > Algemeen**, tonen de geldende waarde en slaan wijzigingen op in `persistent/.env`. Veel variabelen
gelden zodra ze zijn opgeslagen; de andere worden opgeslagen maar vereisen een herstart, en de pagina toont ze na het opslaan. Een variabele die in
de procesomgeving is ingesteld, kan daar niet worden gewijzigd: de pagina toont haar als *Ingesteld in de omgeving en hier niet aanpasbaar.*
Een paar variabelen, zoals `ENCRYPTION_SECRET` en `ACCESS_TOKEN_SECRET`, kunnen nooit vanaf de pagina worden gewijzigd.

De variabelen die een RTE leest, zoals `AF_ROLE`, `RTE_MODE`, `APP_URL` of `RTE_MAX_JOBS`, staan helemaal niet op de instellingenpagina's: de
app gebruikt ze niet, dus stel ze in in de omgeving waar de RTE draait. De `RTE_*`-variabelen die de app zelf leest,
`RTE_QUEUE_MINUTES` en `RTE_FILES_MAX_MB`, zijn de uitzondering en blijven op de pagina's. Vier RTE-variabelen, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` en `RTE_DRAIN_SECONDS`, kunnen in plaats daarvan per RTE op de runnerpagina worden ingesteld, waar een waarde voorgaat op de
variabele (zie [De instellingen van een RTE](../runners/runner-page.html#an-rtes-settings)).

Met [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` tonen de pagina's alleen de waarden en wordt het opslaan geweigerd. Gebruik dit
wanneer de omgeving in een manifest is gedeclareerd, zoals beschreven in [Bewerken en audit](../seed/environment-and-audit.html).

De [configuratie-seed](../seed/) stelt geen omgevingsvariabelen in. Hij declareert objecten die in de database worden opgeslagen, en de
verwijzingen `${ENV_VAR}` erin worden opgelost uit de omgeving van de draaiende server.

Een paar variabelen worden alleen uit de omgeving gelezen en staan niet in de tabellen: `MANAGED_ENV_PATH` en `FORCE_DOTENV`, hierboven
beschreven, en de proxyvariabelen van het systeem `HTTPS_PROXY` en `NO_PROXY` (ook in kleine letters gelezen). Een uitgaande RTE belt de app via
`HTTPS_PROXY`, en een inkomende RTE stuurt zijn registratieaanroep erdoorheen, tenzij de host van de app in `NO_PROXY` staat (hostnamen,
achtervoegsels `.domain`, of `*` voor elke host).

Variabelen gemarkeerd met <span class="af-badge af-badge-secret">Geheim</span> bevatten een wachtwoord, token of sleutel: houd ze buiten
versiebeheer, bijvoorbeeld in een Kubernetes Secret of een `.env`-bestand dat niet wordt gecommit.

---

## In deze sectie

De variabelen zijn gegroepeerd per onderwerp, met één pagina per groep:

| Pagina | Wat er aan bod komt |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Overige variabelen

De volgende variabelen zijn nog niet aan een groep toegewezen:

{{ other }}
{% endif %}
