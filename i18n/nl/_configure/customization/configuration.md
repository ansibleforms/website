---
layout: default
title: Configuratie
parent: Omgevingsvariabelen
nav_order: 5
translated_from: 71a26c1bda0006fdb0e0c0b3325e8a53a5c3a125
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
      - "CONFIG_SEED_RELOAD_CRON=*/5 * * * *"
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
3. Anders het bestand op [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Sinds 7.8.0 wordt een sleutel die een repository bevat over deze basis gelegd: de repository met het gebruikstype **Rollen**, **Categorieen** of
**Constanten** levert die sleutel uit haar bestand met `controller_roles:`, `controller_categories:` of
`controller_constants:`, anders uit haar `config.yaml` (verouderd). Zie [Configuratie in git](../repositories/config-as-code.html#roles-categories-and-constants).

Een expliciet ingestelde `ENABLE_CONFIG_IN_DATABASE` wint altijd, zelfs `0` boven een opgeslagen `database`. Ze wordt gelezen elke keer dat de
configuratie laadt, dus een wijziging geldt zonder herstart. De pagina **Status** toont de gebruikte bron op het tabblad **Informatie**.

De kopie in de database is de kolom `config_yaml` van de tabel `settings`, vóór 7.6.0 `forms_yaml` genoemd: de upgrade hernoemt haar
en behoudt de inhoud. `GET /api/v2/settings/config` geeft haar terug als `config_yaml`, en ook als `forms_yaml`, verouderd.

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="configuration" %}
