---
layout: default
title: A estrutura própria do Ansible
parent: Repositórios git
nav_order: 6
translated_from: ea915eac819df2b716a2a5bdb21e4884d44c6ca4
---

# Um repositório na estrutura própria do Ansible
{: .no_toc }

Executar o playbook de um formulário a partir da raiz do seu repositório, como o AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores e autores de formulários cujos playbooks vivem num repositório organizado como o Ansible o documenta, desde 7.8.0.

---

## A estrutura

A estrutura própria do Ansible mantém a configuração, os inventários, os playbooks e as roles lado a lado na raiz do repositório.

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

Os playbooks estão em `playbooks/` e as roles em `roles/`, por isso o Ansible encontra as roles através do `ansible.cfg` da
raiz, que só lê quando o `ansible-playbook` arranca nessa pasta:

```ini
[defaults]
roles_path = ./roles
```

Os caminhos relativos do `ansible.cfg` leem-se a partir da pasta que o contém, por isso `collections_path = ./collections`
funciona da mesma forma. O AWX executa os playbooks de um projeto a partir da raiz do projeto, e desde 7.8.0 um formulário
pode fazer o mesmo.

---

## Indicar o repositório num formulário

Um formulário indica o repositório a partir do qual o seu playbook corre com `playbookRepository`, num formulário `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

A tarefa corre então a partir da raiz de `infra`, seja qual for a pasta em que estão os playbooks:

| O quê | Lido a partir de |
|---|---|
| `ansible.cfg` | A raiz do repositório, com o seu `roles_path`, `collections_path` e todas as outras definições |
| `playbook` | A raiz: `playbooks/site.yml`, não `site.yml` |
| Um `inventory` ou `__inventory__` relativo | A raiz: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Continua a mudar a pasta de execução, agora a partir da raiz |

Um inventário indicado pelo seu nome (`inventory: production`) continua a ser um dos [inventários](../designer/) do
designer, como antes. O repositório tem de ter o tipo de uso **Playbooks**: um nome que não seja de um repositório usado
para playbooks faz falhar a tarefa com `playbookRepository '<name>' is not a repository used for playbooks`.

Um passo `ansible` de um [formulário multistep](../forms/multistep.html) indica o seu próprio `playbookRepository`, e um nó de
playbook de um [workflow](../workflows/file.html#ansibleforms-own-keys) indica-o como `playbook_repository`.

---

## O repositório em que está o formulário

Desde 7.8.0, um formulário guardado no mesmo repositório que o seu playbook indica-o com `__self__`, em vez de repetir o seu nome.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` é o repositório a partir do qual o formulário é lido, e tem de ter o tipo de uso **Playbooks**, como qualquer
repositório que um formulário indique. Num nó de playbook de um workflow, `playbook_repository: __self__` é o repositório em
que está o ficheiro do workflow.

Um formulário da pasta local de formulários não está em nenhum repositório, por isso o seu `__self__` não indica nenhum. O
formulário recebe então um erro de carregamento que o indica, `Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none`, e o
seu início é recusado, com o motivo. O `__self__` de um nó num ficheiro da pasta local de workflows faz falhar a tarefa do nó.

---

## Vários repositórios de playbooks

Desde 7.8.0 vários repositórios podem ter o tipo de uso **Playbooks**; antes, só se usava o primeiro, com um aviso.

| O formulário | De onde corre o seu playbook |
|---|---|
| Sem `playbookRepository` | O primeiro repositório usado para playbooks, pela ordem em que foram adicionados: a sua pasta `playbooks`, senão a sua raiz, exatamente como antes de 7.8.0 |
| Com `playbookRepository: <name>` | A raiz desse repositório, incluindo o primeiro |

Um formulário que indique o primeiro repositório corre portanto a partir da sua raiz, e dá o seu `playbook` a partir daí
(`playbooks/site.yml`). Os formulários que não indicam nenhum continuam a correr como sempre correram.

---

## No designer

O designer oferece o repositório e os playbooks que lhe correspondem, num formulário e num nó de workflow.

| Onde | O que mostra |
|---|---|
| O separador **Visual** de um formulário | **Repositório**, acima de **Playbook**, quando há vários repositórios de playbooks ou o formulário indica um. A sua primeira opção, **Primeiro repositório de playbooks**, remove a chave; a segunda, **Repositório deste formulário (name)**, escreve `__self__` |
| **Playbook** | Os playbooks do repositório escolhido, indicados a partir da sua raiz; com **Primeiro repositório de playbooks**, os do primeiro, tal como os executa |
| Um nó de playbook de um workflow | O mesmo campo **Repositório**, no seu separador **Como corre**, com **Repositório deste workflow (name)** para `__self__`, e os playbooks desse repositório em **O que executa** |
| A secção **Playbooks** | Os playbooks do primeiro repositório, a partir da sua pasta `playbooks` (senão da sua raiz), e depois cada um dos outros repositórios inteiro, numa pasta com o seu nome |

A opção de função [**Editar todos os playbooks**](../designer/#limited-designers) conta um playbook pelo seu repositório e
pelo seu caminho: um formulário que executa `playbooks/site.yml` de `infra` usa esse ficheiro, não um `site.yml` do primeiro
repositório.

---

## Num runner RTE

Um [RTE](../rte/) recebe o repositório que a tarefa indica, em qualquer um dos seus [modos de ficheiros](../rte/modes.html).

- Com `RTE_FILES=transfer`, o predefinido, a aplicação envia o repositório inteiro que o formulário indica, empacotado, em vez
  da pasta `playbooks` do primeiro repositório.
- Com `RTE_FILES=local`, o RTE corre a partir do seu próprio clone desse repositório, em `REPO_PATH`.

O RTE tem de ser 7.8.0 ou posterior para executar um formulário que indique o seu repositório. Os runners AWX, Semaphore,
Rundeck e Jenkins executam os seus próprios modelos e jobs: `playbookRepository` não é uma chave dos seus formulários, e um nó
de workflow num desses runners não a tem.

---

## Exemplo: um formulário para todos os ambientes

O formulário abaixo executa `playbooks/site.yml` de `infra` contra o inventário do ambiente que o utilizador escolhe.

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

O campo `__inventory__` dá o inventário `inventories/production/hosts.yaml` para **production**, lido a partir da raiz de
`infra`, com os `group_vars` ao lado. As roles de `site.yml` vêm de `roles/`, através do `roles_path` do `ansible.cfg`.

---

## O mesmo antes de 7.8.0

Antes de 7.8.0 um formulário só podia sair da pasta `playbooks` do único repositório de playbooks, com `playbookSubPath: ../`.

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

Também corre a partir da raiz, com estes limites, que o `playbookRepository` elimina:

- Só se podia chegar ao primeiro repositório usado para playbooks, por isso a estrutura do Ansible tinha de ser esse.
- A lista de playbooks do designer mostrava `site.yml`, a partir da pasta `playbooks`, por isso `playbooks/site.yml` era
  escrito à mão.
- Com `RTE_FILES=transfer`, o predefinido, o RTE recebia só a pasta `playbooks`, por isso `../` não chegava ao
  `ansible.cfg`, às roles nem aos inventários: só funcionava com `RTE_FILES=local`.

Passar um formulário destes para 7.8.0 é substituir `playbookSubPath: ../` por `playbookRepository: <name>`; `playbook` e
`__inventory__` ficam como estão.
