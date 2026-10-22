---
layout: default
title: Adicionar um repositório
parent: Repositórios git
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Adicionar um repositório
{: .no_toc }

A página Repositórios, todos os campos de um repositório, e como declarar um no config seed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A página Repositórios

Os repositórios gerem-se em **Definições > Ligações > Repositórios**, que precisa da [opção de função](../config/roles.html#role-options) `showSettings` ou, a partir da 7.3.0,
`showConnectionsSettings`. Algumas alterações são exclusivas de um administrador, ver [abaixo](#who-may-change-a-repository).

![Repositórios](../assets/screenshots/git.jpg)

A lista mostra o **Nome**, a **Descrição**, o **Ramo**, a **Head** (o hash curto do commit em uso), **Pull** e
**Push**. O separador **Detalhes** de um repositório mostra as mesmas etiquetas de Pull e Push por cima da sua head:

| Coluna | O que diz |
|---|---|
| **Pull** | O último clone, pull ou reposição: **Em execução** enquanto o git trabalha, e depois **Bem-sucedido** ou **Falhado**; um traço antes do primeiro |
| **Push** | **Falhado** quando o último push falhou; **Alterações pendentes** quando há alterações guardadas aqui, pelo designer, ainda não enviadas para o remoto; **Bem-sucedido** quando nada está à espera; um traço antes do primeiro push |

**Bem-sucedido** na coluna Push só significa que nada está à espera de ser enviado: o remoto pode ainda ter commits mais recentes que um
pull traz. O menu de cada linha contém estas ações:

| Ação | O que faz |
|---|---|
| **Editar** | Alterar os campos abaixo |
| **Pull** | Clonar o repositório, ou fazer pull quando a cópia de trabalho já existe |
| **Push** | Fazer commit e push da cópia de trabalho; só nos repositórios usados para formulários, configuração, playbooks, workflows ou inventários, e ativo só enquanto há alterações por enviar |
| **Repor** | Eliminar a cópia de trabalho e cloná-la de novo, o que descarta as alterações locais |
| **Alterar credenciais** | Abrir o separador **Credenciais** do repositório, para escolher a credencial que o git usa |
| **Mostrar saída do último pull** | Mostrar a saída do git do último clone, pull ou reposição, com a palavra-passe oculta |
| **Mostrar saída do último push** | Mostrar a saída do git do último push, com a palavra-passe oculta |
| **Eliminar** | Remover o registo e a sua cópia de trabalho em `REPO_PATH`; exclusivo de um administrador |

**Pull de todos**, por cima da lista, faz pull de todos os repositórios de uma vez.

Só corre uma operação git de cada vez num repositório. Uma segunda é recusada com
`Repository '<name>' not found or already running, try again later`.

---

## Adicionar um repositório

Clique em **Adicionar repositório**: um assistente pede os campos em quatro passos (**Repositório**, **Credenciais**, **Utilização**, **Agendamento
do pull**), e o AnsibleForms inicia o clone em segundo plano assim que guardar.

![Editar repositório](../assets/screenshots/git-edit.jpg)

| Campo | Obrigatório | Significado |
|---|---|---|
| **Nome** | sim | O nome da pasta em `REPO_PATH`; letras, dígitos, hífen, underscore e ponto |
| **Ramo** | sim | O ramo a clonar, a puxar e a enviar, por exemplo `main`; obrigatório a partir da 7.3.0. Só um repositório do config seed o pode omitir, para clonar o ramo predefinido do remoto |
| **Credencial** | não | Uma credencial de [Ligações > Credenciais](../credentials.html) com o utilizador e a palavra-passe ou o token que o git usa; **Adicionar credencial** cria uma |
| **Uri** | sim | O remoto, `https://...` ou SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Ativar o pull agendado** | não | Fazer pull do repositório segundo um agendamento |
| **Agendamento do pull** | não | Quando fazer pull, como expressão cron; mostrado depois de o pull agendado ser ativado |
| **Descrição** | sim | Uma descrição em texto livre |
| **Usar para a configuração ?** ... **Usar para inventários?** | não | O que o repositório contém, ver [acima](./#what-a-repository-is-for) |
| **Fazer pull ao iniciar a aplicação** | não | Clonar o repositório, ou fazer pull, sempre que o AnsibleForms arranca |

Mudar o nome de um repositório move a sua cópia de trabalho para a nova pasta e leva consigo o seu agendamento de pull. Um repositório de
antes da 7 que ainda tenha o seu próprio utilizador indica-o no seu separador **Credenciais**: escolha uma credencial para o substituir.

---

## Quem pode alterar um repositório

O conteúdo de um repositório passa a ser o que o AnsibleForms carrega e executa, por isso a partir da 7.3.0 um utilizador sem a função `admin` já não pode:

- adicionar ou eliminar um repositório;
- alterar o seu **Uri** ou o seu **Ramo**;
- ligar ou desligar qualquer uma das suas opções **Usar para**.

Pode ainda alterar a sua descrição, o agendamento do pull e a credencial, e fazer pull, push ou repô-lo. Não pode escolher uma credencial que um runner,
uma ligação ou um início de sessão use; a recusa indica-a, e não diz nada sobre o que contém.

---

## Declarar repositórios no config seed

Os repositórios também podem ser declarados no [config seed](../seed/), para que uma instância nova os clone no seu primeiro arranque.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

Os campos são os da página, incluindo `credential` (uma credencial do seed ou da aplicação), `rebase_on_start` (**Fazer pull ao iniciar
a aplicação**) e `cron` (o agendamento do pull); `user` e `password` continuam a ser aceites em vez de uma credencial. Um
repositório do seed é só de leitura na interface, e é clonado de novo no arranque quando falta a sua cópia de trabalho; ver
[Objetos geridos](../seed/managed-objects.html).
