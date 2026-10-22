---
layout: default
title: Configurazione
parent: Variabili d'ambiente
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
---

# Configurazione
{: .no_toc }

Il config seed, dove si conserva la configurazione, git e ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale per decidere da dove arriva la configurazione: un config seed, il database, git o template ytt.

---

## Esempio

Applica un config seed montato, controllalo ogni cinque minuti, e tieni `config.yaml` nel database. In `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Un seed non valido impedisce l'avvio del server. Vedi [Config seed](../seed/) per il formato del file.

---

## Da dove si legge config.yaml

Le categorie, i ruoli e le costanti arrivano da `config.yaml` su disco o dalla sua copia nel database, scelti in questo ordine:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), quando è impostata, nell'ambiente o nella scheda
   **Configurazione** della pagina delle impostazioni: `1` legge il database, `0` legge il file.
2. Altrimenti, l'origine della configurazione salvata nel database (`file` o `database`), che le istanze configurate
   prima della 6.3.0 sceglievano nella pagina delle impostazioni.
3. Altrimenti, il file: il `config.yaml` del repository con **Usare per configurazione** attivo, altrimenti di un repository con
   **Usare per moduli** attivo, altrimenti quello in [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Una `ENABLE_CONFIG_IN_DATABASE` impostata esplicitamente vince sempre, anche `0` su un `database` salvato. Viene letta ogni volta che
la configurazione si carica, quindi una modifica si applica senza riavvio. La pagina **Stato** mostra l'origine in uso nella sua scheda **Informazioni**.

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="configuration" %}
