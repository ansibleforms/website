---
layout: default
title: La struttura propria di Ansible
parent: Repository Git
nav_order: 6
translated_from: ea915eac819df2b716a2a5bdb21e4884d44c6ca4
---

# Un repository nella struttura propria di Ansible
{: .no_toc }

Eseguire il playbook di un modulo dalla radice del suo repository, come AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli admin e gli autori di moduli i cui playbook stanno in un repository organizzato come lo documenta Ansible, dalla 7.8.0.

---

## La struttura

La struttura propria di Ansible tiene la configurazione, gli inventari, i playbook e i ruoli uno accanto all'altro nella radice del repository.

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

I playbook stanno in `playbooks/` e i ruoli in `roles/`, quindi Ansible trova i ruoli tramite l'`ansible.cfg` della radice,
che legge solo quando `ansible-playbook` parte in quella cartella:

```ini
[defaults]
roles_path = ./roles
```

I percorsi relativi di `ansible.cfg` si leggono dalla cartella che lo contiene, quindi `collections_path = ./collections`
funziona allo stesso modo. AWX esegue i playbook di un progetto dalla radice del progetto, e dalla 7.8.0 un modulo può fare
lo stesso.

---

## Indicare il repository in un modulo

Un modulo indica il repository da cui gira il suo playbook con `playbookRepository`, su un modulo `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

Il job gira allora dalla radice di `infra`, qualunque sia la cartella dei playbook:

| Cosa | Letto da |
|---|---|
| `ansible.cfg` | La radice del repository, con il suo `roles_path`, il suo `collections_path` e ogni altra impostazione |
| `playbook` | La radice: `playbooks/site.yml`, non `site.yml` |
| Un `inventory` o `__inventory__` relativo | La radice: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Sposta ancora la cartella di esecuzione, ora a partire dalla radice |

Un inventario indicato per nome (`inventory: production`) resta uno degli [inventari](../designer/) del designer, come
prima. Il repository deve avere il tipo di utilizzo **Playbook**: un nome che non è un repository usato per i playbook fa
fallire il job con `playbookRepository '<name>' is not a repository used for playbooks`.

Un passo `ansible` di un [modulo multistep](../forms/multistep.html) indica il proprio `playbookRepository`, e un nodo
playbook di un [workflow](../workflows/file.html#ansibleforms-own-keys) lo indica come `playbook_repository`.

---

## Il repository in cui si trova il modulo

Dalla 7.8.0 un modulo tenuto nello stesso repository del suo playbook lo indica con `__self__`, invece di ripeterne il nome.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` è il repository da cui viene letto il modulo, e deve avere il tipo di utilizzo **Playbook**, come ogni repository
indicato da un modulo. In un nodo playbook di un workflow, `playbook_repository: __self__` è il repository in cui si trova il
file del workflow.

Un modulo nella cartella locale dei moduli non si trova in nessun repository, quindi il suo `__self__` non ne indica nessuno. Il
modulo riceve allora un errore di caricamento che lo nomina, `Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none`, e il
suo avvio viene rifiutato, spiegando il motivo. Il `__self__` di un nodo in un file della cartella locale dei workflow fa
fallire il job del nodo.

---

## Più repository di playbook

Dalla 7.8.0 più repository possono avere il tipo di utilizzo **Playbook**; prima si usava solo il primo, con un avviso.

| Il modulo | Da dove gira il suo playbook |
|---|---|
| Senza `playbookRepository` | Il primo repository usato per i playbook, nell'ordine in cui sono stati aggiunti: la sua cartella `playbooks`, altrimenti la sua radice, esattamente come prima della 7.8.0 |
| Con `playbookRepository: <name>` | La radice di quel repository, compreso il primo |

Un modulo che indica il primo repository gira quindi dalla sua radice, e dà il suo `playbook` da lì
(`playbooks/site.yml`). I moduli che non ne indicano uno continuano a girare come hanno sempre fatto.

---

## Nel designer

Il designer offre il repository e i playbook che lo accompagnano, su un modulo e su un nodo di workflow.

| Dove | Cosa mostra |
|---|---|
| La scheda **Visuale** di un modulo | **Repository**, sopra **Playbook**, quando ci sono più repository di playbook o il modulo ne indica uno. La sua prima opzione, **Primo repository di playbook**, toglie la chiave; la seconda, **Repository di questo modulo (name)**, scrive `__self__` |
| **Playbook** | I playbook del repository scelto, indicati dalla sua radice; con **Primo repository di playbook**, quelli del primo, come li esegue |
| Un nodo playbook di un workflow | Lo stesso campo **Repository**, nella sua scheda **Come viene eseguito**, con **Repository di questo workflow (name)** per `__self__`, e i playbook di quel repository in **Cosa esegue** |
| La sezione **Playbook** | I playbook del primo repository, dalla sua cartella `playbooks` (altrimenti dalla radice), poi ogni altro repository per intero, in una cartella con il suo nome |

L'opzione di ruolo [**Modificare tutti i playbook**](../designer/#limited-designers) conta un playbook per il suo repository e
il suo percorso: un modulo che esegue `playbooks/site.yml` di `infra` usa quel file, non un `site.yml` del primo repository.

---

## Su un runner RTE

Un [RTE](../rte/) riceve il repository che il job indica, in entrambe le sue [modalità dei file](../rte/modes.html).

- Con `RTE_FILES=transfer`, il valore predefinito, l'app invia l'intero repository che il modulo indica, impacchettato,
  invece della cartella `playbooks` del primo repository.
- Con `RTE_FILES=local`, l'RTE gira dal proprio clone di quel repository, sotto `REPO_PATH`.

L'RTE deve essere alla 7.8.0 o successiva per eseguire un modulo che indica il suo repository. I runner AWX, Semaphore,
Rundeck e Jenkins eseguono i propri template e job: `playbookRepository` non è una chiave dei loro moduli, e un nodo di
workflow su un tale runner non ne ha.

---

## Esempio: un modulo per ogni ambiente

Il modulo qui sotto esegue `playbooks/site.yml` di `infra` sull'inventario dell'ambiente che l'utente sceglie.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

Il campo `__inventory__` dà l'inventario `inventories/production/hosts.yaml` per **production**, letto dalla radice di
`infra`, con i `group_vars` accanto. I ruoli di `site.yml` vengono da `roles/`, tramite il `roles_path` di `ansible.cfg`.

---

## Lo stesso prima della 7.8.0

Prima della 7.8.0 un modulo poteva solo uscire dalla cartella `playbooks` dell'unico repository di playbook, con `playbookSubPath: ../`.

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

Anche questo gira dalla radice, con questi limiti, che `playbookRepository` elimina:

- Si poteva raggiungere solo il primo repository usato per i playbook, quindi la struttura Ansible doveva essere quello.
- L'elenco dei playbook del designer mostrava `site.yml`, dalla cartella `playbooks`, quindi `playbooks/site.yml` si scriveva a mano.
- Con `RTE_FILES=transfer`, il valore predefinito, l'RTE riceveva solo la cartella `playbooks`, quindi `../` non raggiungeva
  l'`ansible.cfg`, i ruoli e gli inventari: funzionava solo con `RTE_FILES=local`.

Portare un tale modulo alla 7.8.0 significa sostituire `playbookSubPath: ../` con `playbookRepository: <name>`; `playbook` e
`__inventory__` restano come sono.
