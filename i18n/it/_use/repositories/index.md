---
layout: default
title: Repository Git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 5595dcc0c5adf343f1f347feef0f5586f0312a4b
---

# Repository Git
{: .no_toc }

Tenere moduli, playbook, impostazioni e connessioni in git
{: .fs-6 .fw-300 }

---

Per gli amministratori che tengono moduli, playbook e la configurazione dell'app in git: cosa può contenere un repository e quale sorgente prevale.

---

## A cosa serve un repository

Un repository è un remote git che AnsibleForms clona e mantiene aggiornato, e i suoi tipi di utilizzo dicono cosa l'app ne prende.

Dalla 7.8.0 il passo **Utilizzo** di un repository elenca i tipi di utilizzo sotto sei intestazioni: **Designer**, **Job**, **Sistema**,
**Aspetto**, **Accesso** e **Connessioni**. I tipi di **Designer** sono i file che l'app legge così come sono:

| Tipo di utilizzo | Cosa ne legge AnsibleForms | Dove nel repository |
|---|---|---|
| **Moduli** | I file dei moduli, che il designer vi salva anche di nuovo, e i loro file di variabili | `forms`, o la radice; i file di variabili in `vars` |
| **Playbook** | I playbook Ansible eseguiti dai job | `playbooks`, o la radice |
| **Workflow** | I file di [workflow](../workflows/), che il designer vi salva anche di nuovo | qualsiasi cartella |
| **Inventari** | Un inventario, con il nome del repository, che un modulo indica con `inventory:` | la radice: `inventory.yaml`, `group_vars`, `host_vars` |
| **Categorie**, **Costanti** | Le categorie e le costanti, che il designer salva anche di nuovo nel loro file | il file che dà `controller_categories:` o `controller_constants:` |

Ogni altro tipo tiene impostazioni, utenti o connessioni dell'app in file YAML, letti e scritti in entrambi i sensi: le pianificazioni,
le impostazioni Generale, le pagine Aspetto, gli utenti, i gruppi e i ruoli, i metodi di accesso, le credenziali, i runner e le
altre connessioni. Sono descritti in [Configurazione in git](config-as-code.html).

**Moduli**, **Playbook**, **Workflow** e **Inventari** possono essere spuntati su più repository, e ogni altro tipo su un
repository al massimo. Un modulo esegue i playbook del primo repository **Playbook**, a meno che non nomini il proprio con
`playbookRepository`. Ogni repository viene clonato in una sottocartella con il suo nome, sotto
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

L'interruttore **Usare per configurazione?** di prima della 7.8.0 è sostituito da **Ruoli**, **Categorie** e **Costanti**, ciascuno letto dal
file che dà la sua chiave; il `config.yaml` di un repository viene ancora letto, deprecato (vedi
[Ruoli, categorie e costanti](config-as-code.html#roles-categories-and-constants)).

### Un repository per tutto

Un unico repository può contenere moduli, file di variabili, configurazione e playbook, con i tipi di utilizzo spuntati e una sottocartella per ogni tipo.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un repository per ogni scopo

Repository separati permettono ai team di gestire la propria parte, ciascuno con i propri tipi di utilizzo e i file direttamente nella radice.

| Repository | Tipi di utilizzo | Contenuto nella radice |
|---|---|---|
| `af-platform` | **Ruoli**, **Categorie**, **Costanti**, **Credenziali**, **Runner** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Moduli** | I file dei moduli di ogni team, uniti in un unico elenco |
| `af-playbooks` | **Playbook** | I playbook e i ruoli |

I file di variabili provengono dalla cartella `vars` del primo repository di moduli che ne ha una.

---

## Come si combinano i repository con le cartelle locali

Il contenuto dei repository sostituisce la cartella locale corrispondente; questa tabella riassume da dove viene letto ogni tipo di file.

| Contenuto | Letto da, vince la prima corrispondenza |
|---|---|
| Ruoli, categorie, costanti | Ogni chiave per conto suo: 1. il file che dà `controller_roles:`, `controller_categories:` o `controller_constants:` nel repository con quel tipo di utilizzo <br> 2. il `config.yaml` di quel repository (deprecato) <br> 3. la configurazione di base: il database, quando la configurazione è conservata lì ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), altrimenti [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Moduli | Ogni repository **Moduli** più `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) solo quando non ce n'è nessuno |
| Playbook | Il repository **Playbook**, altrimenti [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| File di variabili | La cartella `vars` del primo repository **Moduli** che ne ha una, altrimenti [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflow | Ogni repository **Workflow** più [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), insieme |

I moduli di più repository vengono letti nell'ordine in cui i repository sono stati aggiunti. Quando due di essi contengono un modulo con lo stesso
nome, si usa la copia del repository aggiunto per primo, e un avviso nomina entrambe le copie, quindi mantieni i nomi dei moduli univoci tra i repository.

---

## Risoluzione dei problemi

La maggior parte dei problemi si vede nella colonna **Pull** e in **Mostra output dell'ultimo pull** (o **Mostra output dell'ultimo push**), che contengono il messaggio
di errore di git stesso.

- [Il clone o il pull di un repository non è riuscito](../troubleshooting.html#a-repository-clone-or-pull-failed): autenticazione, host
  conosciuti e modifiche locali.
- [Il repository dei moduli non è ancora stato clonato](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): il designer
  non può salvare prima del primo clone.
- Un repository bloccato in `running` viene riportato a `failed`: dopo un riavvio, all'avvio successivo; entro un minuto quando il nodo
  che esegue la sua operazione git smette di rispondere per 2 minuti; e in ogni caso dopo 2 ore. Esegui di nuovo **Pull**.

---

## In questa sezione

Ogni argomento ha una pagina dedicata:

| Pagina | Cosa tratta |
|---|---|
| [Aggiungere un repository](adding.html) | La pagina Repository, ogni campo di un repository, e come dichiararne uno nel config seed |
| [Autenticazione](authentication.html) | HTTPS con un token, SSH con la chiave generata, e comandi git personalizzati |
| [Fare il pull delle modifiche](pulling.html) | Pull pianificati, manuali e via API, e modifiche locali |
| [Designer e push](designer.html) | Modificare i moduli nel designer e inviarli al repository con push |
| [Configurazione in git](config-as-code.html) | Ogni impostazione tenuta in un repository git, letta e scritta in entrambi i sensi |
