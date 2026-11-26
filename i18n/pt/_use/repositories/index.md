---
layout: default
title: Repositórios git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 5595dcc0c5adf343f1f347feef0f5586f0312a4b
---

# Repositórios git
{: .no_toc }

Manter formulários, playbooks, definições e ligações em git
{: .fs-6 .fw-300 }

---

Para administradores que mantêm formulários, playbooks e a configuração da aplicação em git: o que um repositório pode conter e que origem prevalece.

---

## Para que serve um repositório

Um repositório é um remoto git que o AnsibleForms clona e mantém atualizado, e os seus tipos de utilização dizem o que a aplicação tira dele.

Desde a 7.8.0, o passo **Utilização** de um repositório lista os tipos de utilização sob seis títulos: **Designer**, **Tarefas**, **Sistema**,
**Aparência**, **Acesso** e **Ligações**. Os tipos de **Designer** são os ficheiros que a aplicação lê tal como estão:

| Tipo de utilização | O que o AnsibleForms lê dele | Onde no repositório |
|---|---|---|
| **Formulários** | Os ficheiros de formulários, que o designer também guarda de volta nele, e os seus ficheiros de variáveis | `forms`, ou a raiz; ficheiros de variáveis em `vars` |
| **Playbooks** | Os playbooks Ansible que as tarefas executam | `playbooks`, ou a raiz |
| **Workflows** | Os ficheiros de [workflow](../workflows/), que o designer também guarda de volta nele | qualquer pasta |
| **Inventários** | Um inventário, com o nome do repositório, que um formulário indica com `inventory:` | a raiz: `inventory.yaml`, `group_vars`, `host_vars` |
| **Categorias**, **Constantes** | As categorias e as constantes, que o designer também guarda de volta no seu ficheiro | o ficheiro que dá `controller_categories:` ou `controller_constants:` |

Todos os outros tipos guardam definições, utilizadores ou ligações da aplicação em ficheiros YAML, lidos e escritos nos dois sentidos: os agendamentos,
as definições Geral, as páginas de Aparência, os utilizadores, grupos e funções, os inícios de sessão, as credenciais, os runners e as
outras ligações. Estão descritos em [Configuração em git](config-as-code.html).

**Formulários**, **Playbooks**, **Workflows** e **Inventários** podem ser marcados em vários repositórios, e cada um dos outros
tipos num repositório no máximo. Um formulário executa os playbooks do primeiro repositório de **Playbooks**, a menos que indique o
seu com `playbookRepository`. Cada repositório é clonado numa subpasta com o seu nome, dentro de
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

O interruptor **Usar para a configuração ?** de antes da 7.8.0 é substituído por **Funções**, **Categorias** e **Constantes**, cada um lido do
ficheiro que dá a sua chave; o `config.yaml` de um repositório continua a ser lido, como obsoleto (ver
[Funções, categorias e constantes](config-as-code.html#roles-categories-and-constants)).

### Um repositório para tudo

Um único repositório pode conter formulários, ficheiros de variáveis, configuração e playbooks, com os tipos de utilização marcados e uma subpasta por tipo.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Um repositório por finalidade

Repositórios separados permitem que cada equipa seja dona da sua parte, cada um com os seus tipos de utilização e os ficheiros diretamente na raiz.

| Repositório | Tipos de utilização | Conteúdo na raiz |
|---|---|---|
| `af-platform` | **Funções**, **Categorias**, **Constantes**, **Credenciais**, **Runners** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Formulários** | Os ficheiros de formulários de cada equipa, juntados numa só lista |
| `af-playbooks` | **Playbooks** | Os playbooks e as roles |

Os ficheiros de variáveis vêm da pasta `vars` do primeiro repositório de formulários que tenha uma.

---

## Como os repositórios se combinam com as pastas locais

O conteúdo de um repositório substitui a pasta local correspondente; esta tabela resume de onde é lido cada tipo de ficheiro.

| Conteúdo | Lido de, prevalece a primeira correspondência |
|---|---|
| Funções, categorias, constantes | Cada chave por si: 1. o ficheiro que dá `controller_roles:`, `controller_categories:` ou `controller_constants:` no repositório com esse tipo de utilização <br> 2. o `config.yaml` desse repositório (obsoleto) <br> 3. a configuração de base: a base de dados, quando a configuração é guardada lá ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), senão [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulários | Todos os repositórios **Formulários** mais `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) só quando não há nenhum |
| Playbooks | O repositório **Playbooks**, caso contrário [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Ficheiros de variáveis | A pasta `vars` do primeiro repositório **Formulários** que tenha uma, caso contrário [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Todos os repositórios **Workflows** mais [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), em conjunto |

Os formulários de vários repositórios são lidos pela ordem em que os repositórios foram adicionados. Quando dois deles contêm um formulário com o mesmo
nome, usa-se a cópia do repositório adicionado primeiro, e um aviso indica as duas cópias, por isso mantenha os nomes dos formulários únicos entre repositórios.

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
| [Configuração em git](config-as-code.html) | Todas as definições guardadas num repositório git, lidas e escritas nos dois sentidos |
