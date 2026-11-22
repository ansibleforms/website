---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

Categorie, ruoli e costanti per tutti i moduli
{: .fs-6 .fw-300 }

---

Per gli amministratori: il file config.yaml che contiene le categorie, i ruoli e le costanti condivisi da tutti i moduli.

AnsibleForms usa un file config.yaml per configurare categorie, ruoli e costanti. Se non viene fornito nessun file, ne viene generato uno con una configurazione minima. La configurazione si può anche importare nel database, il che rende superfluo un file config.yaml, e ognuno dei tre si può tenere in un repository git.

---

## Panoramica

Il file config.yaml contiene la configurazione delle categorie, dei ruoli e delle costanti usati da AnsibleForms.

**VIDEO**: [Crea il tuo primo modulo](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

Il seguente config.yaml minimo serve da punto di partenza. Contiene solo la categoria obbligatoria `Default` e i ruoli obbligatori `admin` e `default`.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Priorità di caricamento della configurazione

Dalla 7.8.0 le categorie, i ruoli e le costanti vengono letti ciascuno per conto suo, dalla prima sorgente qui sotto che lo contiene.

1. **DA UN REPOSITORY** : il repository con il tipo di utilizzo **Categorie**, **Ruoli** o **Costanti**, dal suo file che dà
   `controller_categories:`, `controller_roles:` o `controller_constants:`, con qualsiasi nome e in qualsiasi cartella (vedi
   [Configurazione in git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **DAL config.yaml DEL REPOSITORY** : la chiave semplice nel `config.yaml` di quel repository, deprecata dalla 7.8.0 e non più
   letta nella 8.0; il log del server, l'output del pull e la pagina del repository lo segnalano
3. **DAL DATABASE** : la configurazione importata nel database, solo quando `ENABLE_CONFIG_IN_DATABASE=1`, oppure quando quella
   variabile non è impostata e l'origine della configurazione salvata nel database è `database` (una copia vuota ripiega sul file)
4. **DA UN FILE LOCALE** : il file locale `config.yaml` (variabile d'ambiente CONFIG_PATH)

{: .warning }
> **Nota:** l'interruttore **Usare per configurazione** non esiste più dalla 7.8.0. Un aggiornamento dà **Ruoli**, **Categorie** e **Costanti** al
> repository che lo aveva, e `use_for_config` nel config seed o nell'API è un alias deprecato dei tre.

---

## In questa sezione

Il file ha tre attributi di primo livello, e ognuno ha una pagina propria:

| Pagina | Cosa tratta |
|---|---|
| [Categorie](categories.html) | Raggruppa i moduli nella dashboard in un albero di categorie con icone |
| [Ruoli](roles.html) | Associa utenti e gruppi ai ruoli, e stabilisci cosa può fare ogni ruolo |
| [Costanti](constants.html) | Oggetti liberi che ogni modulo può riutilizzare |
