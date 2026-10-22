---
layout: default
title: Repository Git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Repository Git
{: .no_toc }

Tenere moduli, file di variabili, configurazione e playbook in git
{: .fs-6 .fw-300 }

---

Per gli amministratori che tengono moduli, configurazione e playbook in git: cosa può contenere un repository e quale sorgente prevale.

---

## A cosa serve un repository

Un repository è un remote git che AnsibleForms clona e mantiene aggiornato, e ognuno ha degli interruttori che dicono cosa contiene:

| Interruttore | Cosa ne legge AnsibleForms | Cartella nel repository |
|---|---|---|
| **Usare per configurazione?** | `config.yaml` con le categorie, i ruoli e le costanti | la radice |
| **Usare per moduli?** | I file dei moduli, che il designer vi salva anche di nuovo, e i loro file di variabili | `forms`, o la radice; i file di variabili in `vars` |
| **Usare per playbook?** | I playbook Ansible eseguiti dai job | `playbooks`, o la radice |
| **Usare per i workflow?** | I file di [workflow](../workflows/), che il designer vi salva anche di nuovo | qualsiasi cartella |
| **Usare per gli inventari?** | Un inventario, con il nome del repository, che un modulo indica con `inventory:` | la radice: `inventory.yaml`, `group_vars`, `host_vars` |

Senza la sottocartella, si usa la radice del repository. Un solo repository può contenere tutto; se li separi, solo **Usare per
moduli**, **Usare per i workflow** e **Usare per gli inventari** possono essere attivi su più repository: gli altri interruttori prendono il primo repository
e registrano un avviso nel log.

Ogni repository viene clonato in una sottocartella con il suo nome, sotto [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### Un repository per tutto

Un unico repository può contenere moduli, file di variabili, configurazione e playbook, con gli interruttori attivi e una sottocartella per ogni tipo.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un repository per ogni scopo

Repository separati permettono ai team di gestire la propria parte, con un interruttore ciascuno e i file direttamente nella radice.

| Repository | Interruttore | Contenuto nella radice |
|---|---|---|
| `af-config` | **Usare per configurazione?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Usare per moduli?** | I file dei moduli di ogni team, uniti in un unico elenco |
| `af-playbooks` | **Usare per playbook?** | I playbook e i ruoli |

Solo i moduli possono provenire da più repository; configurazione e playbook provengono ciascuno da uno solo. I file di variabili provengono dalla cartella `vars`
del primo repository di moduli che ne ha una.

---

## Come si combinano i repository con le cartelle locali

Il contenuto dei repository sostituisce la cartella locale corrispondente; questa tabella riassume da dove viene letto ogni tipo di file.

| Contenuto | Letto da, vince la prima corrispondenza |
|---|---|
| Configurazione | 1. il database, quando la configurazione è conservata lì ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. `config.yaml` del repository **Usare per configurazione** <br> 3. `config.yaml` di un repository **Usare per moduli**, quando nessun repository è usato per la configurazione <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Moduli | Ogni repository **Usare per moduli** più `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) solo quando non ce n'è nessuno |
| Playbook | Il repository **Usare per playbook**, altrimenti [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| File di variabili | La cartella `vars` del primo repository **Usare per moduli** che ne ha una, altrimenti [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflow | Ogni repository **Usare per i workflow** più [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), insieme |

I moduli di più repository vengono uniti in un unico elenco. Quando due di essi contengono un modulo con lo stesso nome, viene mantenuto il primo
caricato e viene registrato l'avviso `skipping duplicate form <name>`, quindi mantieni i nomi dei moduli univoci tra i repository.

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
