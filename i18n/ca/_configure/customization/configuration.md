---
layout: default
title: Configuració
parent: Variables d'entorn
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
---

# Configuració
{: .no_toc }

La llavor de configuració, on es desa la configuració, git i ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables per decidir d'on surt la configuració: una llavor de configuració, la base de dades, git o plantilles ytt.

---

## Exemple

Aplica una llavor de configuració muntada, comprova-la cada cinc minuts i desa `config.yaml` a la base de dades. A `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Una llavor no vàlida impedeix que el servidor arrenqui. Vegeu [Llavor de configuració](../seed/) per al format del fitxer.

---

## D'on es llegeix config.yaml

Les categories, els rols i les constants surten de `config.yaml` al disc o de la seva còpia a la base de dades, decidit en aquest ordre:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), quan està definida, a l'entorn o a la
   pestanya **Configuració** de la pàgina de configuració: `1` llegeix la base de dades, `0` llegeix el fitxer.
2. Si no, l'origen de configuració desat a la base de dades (`file` o `database`), que les instàncies configurades
   abans de la 6.3.0 van triar a la pàgina de configuració.
3. Si no, el fitxer: el `config.yaml` del repositori amb **Utilitzar per a la configuració ?** activat, si no el d'un repositori amb
   **Utilitzar per als formularis ?** activat, i si no el de [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Un `ENABLE_CONFIG_IN_DATABASE` definit explícitament sempre guanya, fins i tot `0` davant d'un `database` desat. Es llegeix cada vegada que
es carrega la configuració, així que un canvi s'aplica sense reiniciar. La pàgina **Estat** mostra l'origen en ús a la seva pestanya **Informació**.

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="configuration" %}
