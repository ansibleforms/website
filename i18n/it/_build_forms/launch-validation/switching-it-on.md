---
layout: default
title: Attivarla
parent: Validazione all'avvio
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# Attivarla
{: .no_toc }

Per l'intera istanza, o per un solo modulo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La validazione all'avvio ha due impostazioni. **Vale la più severa delle due.**

---

## Per l'intera istanza: `LAUNCH_VALIDATION`

La variabile d'ambiente [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) vale per ogni modulo:

- `off`: nessun controllo lato server; il job gira con le extravars inviate dal browser o dal chiamante.
- `log`: ogni avvio viene controllato; ciò che verrebbe rifiutato viene scritto nel log come
  avviso, e l'avvio gira comunque come prima.
- `enforce` (predefinito): un avvio non valido viene rifiutato, e uno valido gira con le extravars costruite
  dal server.

Anche un valore vuoto o sconosciuto equivale a `enforce`. Le modifiche hanno effetto senza riavvio.

{: .warning }
> **L'aggiornamento cambia il comportamento.** Un'istanza che non imposta `LAUNCH_VALIDATION` applica enforce
> a ogni avvio dopo l'aggiornamento. Gli script che chiamano `POST /api/v2/job` senza `rawFormData`,
> o con valori che violano le regole di un modulo, vengono rifiutati con un `422`. Imposta
> `LAUNCH_VALIDATION=log` prima di aggiornare per vedere cosa verrebbe rifiutato, oppure `off` per mantenere il
> vecchio comportamento (vedi [Messa in produzione](rolling-it-out.html)).

---

## Per un solo modulo: `launchValidation`

Un modulo può impostare il proprio livello:

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Usa questa impostazione su un'istanza che gira in `off` o `log`, per un modulo che sai che verrà
avviato via REST: quel modulo è in enforce, mentre il resto dell'istanza no. Si può impostare anche nel designer, nelle
impostazioni del modulo.

**Un modulo può essere reso più severo dell'istanza, mai più permissivo.** Con `LAUNCH_VALIDATION`
su `enforce`, il `launchValidation: off` di un modulo non ha effetto: un modulo non può scavalcare
la decisione di un operatore.

La usano anche i moduli wizard: l'avvio di un wizard viene controllato passo per passo, ogni passo rispetto al proprio
sottomodulo (vedi [Moduli wizard](rolling-it-out.html#wizard-forms)).
