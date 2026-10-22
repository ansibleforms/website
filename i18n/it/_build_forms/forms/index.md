---
layout: default
title: Moduli
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Moduli
{: .no_toc }

Definire i moduli che i tuoi utenti compilano
{: .fs-6 .fw-300 }

---

Per chi scrive i moduli: come si scrivono i moduli in YAML, da dove vengono caricati, e le proprietà di ogni tipo di modulo.

I moduli sono il cuore di AnsibleForms. Ogni modulo è un'interfaccia web che raccoglie l'input dell'utente e, con quei dati, esegue un
playbook Ansible, un template di AWX, AAP o Ascender, un template di Semaphore, un job Rundeck o Jenkins, oppure un
[workflow](../workflows/).

I moduli sono definiti in file YAML nella cartella dei moduli. Ogni file YAML contiene un solo modulo o una lista di moduli, e si possono usare sottocartelle per organizzarli.

**VIDEO**: [Crea il tuo primo modulo](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Capire la struttura di un modulo

Ogni modulo di AnsibleForms si configura con un insieme di proprietà. **[Proprietà comuni](common.html)** elenca le proprietà valide per tutti i tipi di modulo; le pagine specifiche di ciascun tipo descrivono quelle aggiuntive.

---

## Come vengono caricati i moduli

AnsibleForms carica i moduli dalle seguenti posizioni:

1. **DAI REPOSITORY** : tutti i repository con l'interruttore "Usare per moduli?" attivo (sono supportati più repository)
   - I moduli di tutti i repository abilitati vengono uniti automaticamente.
   - In ogni repository si cerca prima una sottocartella `forms/`.
   - Se la sottocartella `forms/` non esiste, si usa la radice del repository.
   - I moduli creati nel designer e non ancora inviati con push restano in una cartella di staging
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) e vengono caricati insieme a loro.

2. **DALLA CARTELLA LOCALE** : la cartella locale `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), quando nessun repository ha "Usare per moduli?" attivo

{: .warning }
> **Nota:** quando "Usare per moduli?" è attivo su più repository, tutti i loro moduli vengono uniti. I nomi dei moduli devono essere univoci tra i repository per evitare conflitti.

---

## Dove gira un modulo

Il tipo di un modulo decide il tipo di [runner](../runners.html) su cui gira il suo job: un RTE per `ansible`, un runner AWX per `awx`,
`aap` e `ascender`, e un runner del tipo corrispondente per `semaphore`, `rundeck` e `jenkins`.

- `runner: <name>` sul modulo sceglie per nome un runner di quel tipo; senza, il job gira sul runner predefinito del tipo.
- Un runner disattivato in **Connessioni > Runner** fa fallire il job, che il modulo lo nomini o che sia quello predefinito. Il job
  non ripiega mai su un altro runner.
- Quando uno dei ruoli dell'utente elenca `runners` in `config.yaml`, il job può girare solo su un runner elencato da un ruolo del genere, altrimenti viene
  rifiutato. I ruoli senza l'elenco non lo limitano, e un amministratore non è mai limitato.

---

## In questa sezione

Le pagine seguenti descrivono in dettaglio le proprietà dei moduli:

| Pagina | Cosa tratta |
|---|---|
| [Proprietà comuni](common.html) | Proprietà valide per tutti i tipi di modulo (`name`, `description`, `help`, `type`, `fields`) |
| [Moduli Ansible](ansible.html) | Proprietà specifiche di `type: ansible` |
| [Moduli AWX](awx.html) | Proprietà specifiche di `type: awx` |
| [Moduli Semaphore](semaphore.html) | Proprietà specifiche di `type: semaphore`, che esegue un template di Semaphore |
| [Moduli Rundeck](rundeck.html) | Proprietà specifiche di `type: rundeck`, che esegue un job Rundeck |
| [Moduli Jenkins](jenkins.html) | Proprietà specifiche di `type: jenkins`, che esegue la build di un job Jenkins |
| [Moduli multistep](multistep.html) | Proprietà specifiche di `type: multistep`, deprecato a favore di `workflow` |
| [Moduli workflow](workflow.html) | Proprietà specifiche di `type: workflow`, che esegue un [workflow](../workflows/) |
| [Wizard](wizard.html) | Suddividere l'input di un modulo su più pagine (funziona sopra qualsiasi tipo di modulo eseguibile) |
| [Sottomodulo](subform.html) | I sottomoduli usano solo le proprietà comuni |
| [Punti di approvazione](approval.html) | Mettere in pausa un job finché non viene approvato (`approval`) |
| [Notifiche](notifications.html) | Inviare email e messaggi sui canali in base allo stato o agli eventi del job (`notifications`) |
| [Azioni sullo stato del job](job-status-action.html) | Agire sul modulo quando un job cambia stato (`onSubmit`, `onSuccess`, ...) |
