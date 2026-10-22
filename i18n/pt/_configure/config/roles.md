---
layout: default
title: Funções
parent: config.yaml
nav_order: 2
translated_from: c23a8fb9203e85e81cd128d2c129228c0a207f6c
---

# Funções
{: .no_toc }

Mapear utilizadores e grupos para funções, e definir o que cada função pode fazer.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O atributo roles

A lista `roles` de topo do config.yaml:

{% include config_attribute.html name="roles" %}

---

## A função default

Todos os utilizadores com sessão iniciada têm a função `default`, por isso um formulário com `roles: [default]` está aberto a todos os que podem iniciar sessão. Não
há acesso anónimo: ninguém recebe esta função sem iniciar sessão.

A função não contém grupos nem utilizadores, já que se aplica a todos. As suas `options` são as predefinições de todos, tal como
descrito em [Opções de função](#role-options) abaixo. O `config.yaml` tem de ter uma função `admin` e uma função `default`, e a
página de funções mostra ambas como **Obrigatório**.

`default` chamava-se `public` antes da 7.0.0, e o nome antigo continua a funcionar:

- **Num formulário**, `roles: [public]` continua a corresponder a todos os utilizadores, por isso os formulários nos seus repositórios não precisam de alterações.
- **No `config.yaml`**, uma função chamada `public` é renomeada para `default` no ficheiro quando a configuração é carregada. Só o nome
  muda, é feita antes uma cópia de segurança da configuração, e uma configuração mantida num repositório fica então com uma alteração para enviar (push).
- **Num template ytt**, o template não é reescrito: a configuração que produz é renomeada, e um aviso no registo pede-lhe
  que renomeie também a função no template. A versão 8 recusa aí uma função `public`.

Uma configuração com uma função `default` e uma função `public` é recusada, porque são a mesma função.

---

## Objeto Role

Cada entrada da lista `roles`:

{% include config_object.html name="Role" %}

---

## Opções de função

As `options` de uma função ligam ou desligam funcionalidades para os seus membros. A partir da 7.3.0, a página da função mostra-as em quatro grupos,
cada opção com um (i) que diz o que concede, o mesmo texto que a vista **Permissões** do perfil mostra:

| Opção | Permite ao utilizador | Predefinição |
|---|---|---|
| **Definições** | | |
| `showSettings` | Ver e alterar todas as páginas de definições; o registo do servidor e as cópias de segurança têm as suas próprias opções | Só admins |
| `showAppearanceSettings` | Alterar as definições de aparência, sem as outras definições (a partir da 7.3.0) | Desligado |
| `showConnectionsSettings` | Gerir as definições de ligações (credenciais, runners e mais), sem as outras definições (a partir da 7.3.0) | Desligado |
| `showLogs` | Ver o registo do servidor | Só admins |
| `showAuditLog` | Ver o registo de auditoria, sem as outras definições (a partir da 7.3.0) | Só admins |
| `allowBackupOps` | Fazer cópias de segurança e restaurar a base de dados | Só admins |
| **Designer** | | |
| `showDesigner` | Ver e usar o designer | Só admins |
| `allowFormDesign` | Editar a configuração dos formulários no designer: categorias, constantes e formulários. Sem ela, só leitura (a partir da 7.3.0) | Ligado |
| `allowPlaybookDesign` | Editar os playbooks no designer: guardá-los, criá-los, removê-los e enviá-los (push). Sem ela, só leitura | Ligado |
| `allowWorkflowDesign` | Editar os workflows no designer: guardá-los, criá-los, removê-los e enviá-los (push). Sem ela, só leitura | Ligado |
| `allowInventoryDesign` | Editar os inventários no designer: guardá-los, criá-los, removê-los e enviá-los (push). Sem ela, só leitura | Ligado |
| `allowVarsFileDesign` | Editar os ficheiros de variáveis no designer: guardá-los, criá-los, removê-los e enviá-los (push). Sem ela, só leitura | Ligado |
| **Tarefas** | | |
| `showJobs` | Ver a página de tarefas | Ligado |
| `showAllJobLogs` | Ver as tarefas de todos os utilizadores, não só as suas | Só admins |
| `manageAllJobs` | Abortar, eliminar e relançar as tarefas de todos os utilizadores; eliminar e relançar também precisam das duas opções abaixo (a partir da 7.3.0) | Só admins |
| `showExtravars` | Ver os extravars de um formulário e de uma tarefa | Ligado |
| `showDebugButtons` | Ver os botões de depuração num formulário | Ligado |
| `showArtifacts` | Ver os artefactos de uma tarefa: o que uma tarefa do AWX devolve, ou o que um playbook recolheu com `set_stats` | Ligado |
| `allowVerboseMode` | Executar tarefas em modo verboso | Ligado |
| `allowJobRelaunch` | Relançar uma tarefa com os dados do formulário de uma execução anterior | Só admins |
| `allowJobDeletion` | Eliminar tarefas: as próprias, ou as de todos os utilizadores com `manageAllJobs`. Sem ela, o histórico de tarefas fica completo (a partir da 7.3.0) | Ligado |
| `allowScheduledJobs` | Criar e gerir agendamentos recorrentes e únicos, na página **Agendamentos** (consulte o aviso abaixo) | Só admins |
| `allowPlannedJobs` | Planear uma tarefa para correr uma vez a uma hora definida (**Executar mais tarde**) | Ligado |
| `allowStoredJobs` | Guardar os dados de um formulário e voltar a carregá-los mais tarde | Ligado |
| **Acesso e integrações** | | |
| `allowLogin` | Iniciar sessão no AnsibleForms | Ligado |
| `allowChat` | Usar o [assistente de chat](../chat/), quando está ativado | Ligado |
| `allowMcp` | Usar o [servidor MCP](../mcp/) a partir de um agente de IA, quando está ativado | O `allowChat` da função |
| `allowFileUploads` | Carregar ficheiros pelos campos de ficheiro de um formulário (a partir da 7.3.0) | Ligado |
| `allowApiTokens` | Criar [tokens de API](../profile/api-token.html) para scripts, até à duração máxima que a instância permite (a partir da 7.3.0) | Desligado |
| `extendedTokenExpiration` | Criar também tokens de API que nunca expiram; precisa de `allowApiTokens` | Desligado |

Algumas opções incluem outras, e a página da função mostra as incluídas ligadas e a cinzento:

- **`showSettings`** concede também `showAppearanceSettings`, `showConnectionsSettings` e `showAuditLog`.
- **`manageAllJobs`** concede também `showAllJobLogs`, já que atuar sobre as tarefas de todos os utilizadores implica vê-las.
- **As opções de design** só contam com `showDesigner`, e `extendedTokenExpiration` só com `allowApiTokens`.

Até à 7.2.0, `showAllJobLogs` também deixava um utilizador abortar e eliminar as tarefas que mostrava; a partir da 7.3.0 isso requer `manageAllJobs`.
Uma função de antes da 7.3.0 com `extendedTokenExpiration` e sem `allowApiTokens` recebe `allowApiTokens`, para manter os seus tokens.

**Só admins** significa ligado para os utilizadores que têm a função `admin`, e desligado para todos os outros. Quando um utilizador corresponde a várias funções,
as opções combinam-se assim:

- **Entre as funções do utilizador**, uma opção só fica ligada quando todas as funções que a definem concordam: um `false` explícito ganha.
- **A função `default`** preenche as opções que nenhuma das outras funções do utilizador define, por isso pode conter predefinições para todos.
- **As opções não definidas em lado nenhum** recebem a predefinição da tabela.

`showExtraVars`, com V maiúsculo, é aceite como outra grafia de `showExtravars`; quando qualquer das grafias é `false`, a
opção fica desligada.

{: .warning }
> Trate `allowScheduledJobs` como uma opção de nível de admin. Os agendamentos não pertencem ao utilizador que os criou: todos os utilizadores com
> a opção veem e podem alterar todos os agendamentos. Um agendamento também corre com direitos de admin, para qualquer formulário, seja qual for o
> acesso do seu criador. Conceda-a só a funções em que confiaria como admins.

{: .warning }
> `allowLogin: false` na função `default` bloqueia todos os utilizadores cujas outras funções não definam `allowLogin: true`, incluindo
> os admins. Volte a concedê-la nas funções que têm de iniciar sessão antes de guardar.
