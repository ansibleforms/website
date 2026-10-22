---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

Categorie, ruoli e costanti per tutti i moduli
{: .fs-6 .fw-300 }

---

Per gli amministratori: il file config.yaml che contiene le categorie, i ruoli e le costanti condivisi da tutti i moduli.

AnsibleForms usa un file config.yaml per configurare categorie, ruoli e costanti. Se non viene fornito nessun file, ne viene generato uno con una configurazione minima. La configurazione si può anche importare nel database, il che rende superfluo un file config.yaml.

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

AnsibleForms carica il file config.yaml nel seguente ordine (vince la prima corrispondenza):

1. **DAL DATABASE** : la configurazione importata nel database, solo quando `ENABLE_CONFIG_IN_DATABASE=1`, oppure quando quella
   variabile non è impostata e l'origine della configurazione salvata nel database è `database` (una copia vuota ripiega sul file)
2. **DA UN REPOSITORY (use_for_config)** : il repository con l'interruttore "usa per la configurazione" attivo (novità della 6.1.0)
3. **DA UN REPOSITORY (use_for_forms)** : il repository con l'interruttore "usa per i moduli" attivo (ripiego per compatibilità con le versioni precedenti)
4. **DA UN FILE LOCALE** : il file locale `config.yaml` (variabile d'ambiente CONFIG_PATH)

{: .warning }
> **Nota:** attiva "usa per la configurazione" su un solo repository. Se ce l'hanno attivo più repository, viene registrato un avviso e si usa il primo.

---

## In questa sezione

Il file ha tre attributi di primo livello, e ognuno ha una pagina propria:

| Pagina | Cosa tratta |
|---|---|
| [Categorie](categories.html) | Raggruppa i moduli nella dashboard in un albero di categorie con icone |
| [Ruoli](roles.html) | Associa utenti e gruppi ai ruoli, e stabilisci cosa può fare ogni ruolo |
| [Costanti](constants.html) | Oggetti liberi che ogni modulo può riutilizzare |
