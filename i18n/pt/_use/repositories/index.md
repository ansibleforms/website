---
layout: default
title: Repositórios git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Repositórios git
{: .no_toc }

Manter formulários, ficheiros de variáveis, configuração e playbooks em git
{: .fs-6 .fw-300 }

---

Para administradores que mantêm formulários, configuração e playbooks em git: o que um repositório pode conter e que origem prevalece.

---

## Para que serve um repositório

Um repositório é um remoto git que o AnsibleForms clona e mantém atualizado, e cada um tem interruptores que dizem o que contém:

| Interruptor | O que o AnsibleForms lê dele | Pasta no repositório |
|---|---|---|
| **Usar para a configuração ?** | `config.yaml` com as categorias, funções e constantes | a raiz |
| **Usar para formulários ?** | Os ficheiros de formulários, que o designer também guarda de volta nele, e os seus ficheiros de variáveis | `forms`, ou a raiz; ficheiros de variáveis em `vars` |
| **Usar para playbooks ?** | Os playbooks Ansible que as tarefas executam | `playbooks`, ou a raiz |
| **Usar para workflows?** | Os ficheiros de [workflow](../workflows/), que o designer também guarda de volta nele | qualquer pasta |
| **Usar para inventários?** | Um inventário, com o nome do repositório, que um formulário indica com `inventory:` | a raiz: `inventory.yaml`, `group_vars`, `host_vars` |

Sem a subpasta, usa-se a raiz do repositório. Um só repositório pode conter tudo; se os separar, só **Usar para
formulários**, **Usar para workflows** e **Usar para inventários** podem estar ligados em vários: os outros interruptores ficam com o primeiro repositório
e registam um aviso.

Cada repositório é clonado numa subpasta com o seu nome, dentro de [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### Um repositório para tudo

Um único repositório pode conter formulários, ficheiros de variáveis, configuração e playbooks, com os interruptores ligados e uma subpasta por tipo.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Um repositório por finalidade

Repositórios separados permitem que cada equipa seja dona da sua parte, com um interruptor cada e os ficheiros diretamente na raiz.

| Repositório | Interruptor | Conteúdo na raiz |
|---|---|---|
| `af-config` | **Usar para a configuração ?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Usar para formulários ?** | Os ficheiros de formulários de cada equipa, juntados numa só lista |
| `af-playbooks` | **Usar para playbooks ?** | Os playbooks e as roles |

Só os formulários podem vir de vários repositórios; a configuração e os playbooks vêm cada um de um só. Os ficheiros de variáveis vêm da pasta `vars`
do primeiro repositório de formulários que tenha uma.

---

## Como os repositórios se combinam com as pastas locais

O conteúdo de um repositório substitui a pasta local correspondente; esta tabela resume de onde é lido cada tipo de ficheiro.

| Conteúdo | Lido de, prevalece a primeira correspondência |
|---|---|
| Configuração | 1. a base de dados, quando a configuração é guardada lá ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. o `config.yaml` do repositório **Usar para a configuração** <br> 3. o `config.yaml` de um repositório **Usar para formulários**, quando nenhum repositório é usado para a configuração <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulários | Todos os repositórios **Usar para formulários** mais `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) só quando não há nenhum |
| Playbooks | O repositório **Usar para playbooks**, caso contrário [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Ficheiros de variáveis | A pasta `vars` do primeiro repositório **Usar para formulários** que tenha uma, caso contrário [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Todos os repositórios **Usar para workflows** mais [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), em conjunto |

Os formulários de vários repositórios são juntados numa só lista. Quando dois deles contêm um formulário com o mesmo nome, fica o primeiro
carregado e é registado o aviso `skipping duplicate form <name>`, por isso mantenha os nomes dos formulários únicos entre repositórios.

---

## Resolução de problemas

A maioria dos problemas aparece na coluna **Pull** e em **Mostrar saída do último pull** (ou **Mostrar saída do último push**), que contêm a própria
mensagem de erro do git.

- [O clone ou pull de um repositório falhou](../troubleshooting.html#a-repository-clone-or-pull-failed): autenticação, hosts
  conhecidos e alterações locais.
- [O repositório de formulários ainda não está clonado](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): o designer
  não pode guardar antes do primeiro clone.
- Um repositório preso em `running` é reposto como `failed`: depois de um reinício, no arranque seguinte; no espaço de um minuto quando o nó
  que executa a sua operação git deixa de responder durante 2 minutos; e, em qualquer caso, ao fim de 2 horas. Faça **Pull** de novo.

---

## Nesta secção

Cada tema tem a sua própria página:

| Página | O que abrange |
|---|---|
| [Adicionar um repositório](adding.html) | A página Repositórios, todos os campos de um repositório, e como declarar um no config seed |
| [Autenticação](authentication.html) | HTTPS com um token, SSH com a chave gerada, e comandos git personalizados |
| [Fazer pull das alterações](pulling.html) | Pulls agendados, manuais e pela API, e alterações locais |
| [Designer e push](designer.html) | Editar formulários no designer e enviá-los (push) para o repositório |
