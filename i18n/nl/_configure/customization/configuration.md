---
layout: default
title: Configuratie
parent: Omgevingsvariabelen
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
---

# Configuratie
{: .no_toc }

De configuratie-seed, waar de configuratie wordt bewaard, git en ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze om te bepalen waar de configuratie vandaan komt: een configuratie-seed, de database, git of ytt-templates.

---

## Voorbeeld

Pas een gekoppelde configuratie-seed toe, controleer hem elke vijf minuten, en bewaar `config.yaml` in de database. In `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Een ongeldige seed verhindert dat de server start. Zie [Configuratie-seed](../seed/) voor het bestandsformaat.

---

## Waar config.yaml wordt gelezen

De categorieën, rollen en constanten komen uit `config.yaml` op schijf of uit de kopie ervan in de database, bepaald in deze volgorde:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), als die is ingesteld, in de omgeving of op het
   tabblad **Configuratie** van de instellingenpagina: `1` leest de database, `0` leest het bestand.
2. Anders de configuratiebron die in de database is opgeslagen (`file` of `database`), die instanties die
   vóór 6.3.0 zijn opgezet op de instellingenpagina kozen.
3. Anders het bestand: de `config.yaml` van de repository met **Gebruiken voor configuratie?** ingeschakeld, anders van een repository met
   **Gebruiken voor formulieren?** ingeschakeld, anders die op [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Een expliciet ingestelde `ENABLE_CONFIG_IN_DATABASE` wint altijd, zelfs `0` boven een opgeslagen `database`. Ze wordt gelezen elke keer dat de
configuratie laadt, dus een wijziging geldt zonder herstart. De pagina **Status** toont de gebruikte bron op het tabblad **Informatie**.

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="configuration" %}
