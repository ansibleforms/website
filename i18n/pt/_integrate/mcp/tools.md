---
layout: default
title: Ferramentas
parent: Servidor MCP
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Ferramentas
{: .no_toc }

As ferramentas que um agente usa para preencher, aprovar e relançar formulários
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

O servidor MCP oferece até 15 ferramentas. Seis são oferecidas a todos os utilizadores; as outras dependem das opções de função do utilizador, por isso a um utilizador
sem uma opção não são sequer oferecidas as respetivas ferramentas:

| Ferramenta | O que faz | Oferecida com |
|---|---|---|
| `list_forms` | Os formulários que o utilizador pode usar: nome, descrição, categorias e `enableForChat` (se o assistente de chat o disponibiliza). | sempre |
| `get_form` | A definição completa de um formulário. Cada campo traz também `dynamic` (avaliado a partir de uma expressão ou consulta) e `dependsOn` (os campos que lê). | sempre |
| `resolve_field` | Avalia o formulário com os valores preenchidos até ao momento. Ver abaixo. | sempre |
| `launch_job` | Lança o formulário com os valores indicados, exatamente como uma submissão a partir do navegador. Devolve o ID da tarefa. | sempre |
| `relaunch_job` | Lança novamente uma tarefa com alguns campos alterados. Ver abaixo. | sempre |
| `get_job` | Estado e saída de uma tarefa (`tail` limita a saída às últimas linhas). | sempre |
| `plan_job` | Executa o formulário uma vez, mais tarde, como o utilizador: o que **Executar mais tarde (única)** faz no formulário. | `allowPlannedJobs` |
| `create_schedule` | Cria um agendamento, recorrente (`cron`) ou único (`run_at`), como na página **Agendamentos**. | `allowScheduledJobs` |
| `list_schedules` | Os agendamentos que o utilizador pode ver: todos com `allowScheduledJobs`, caso contrário as execuções que planeou. | `allowPlannedJobs` ou `allowScheduledJobs` |
| `get_schedule` | Um agendamento, com as suas extra vars (as que parecem segredos ficam mascaradas) e a saída da sua última execução. | `allowPlannedJobs` ou `allowScheduledJobs` |
| `delete_schedule` | Cancela uma execução planeada ou elimina um agendamento que o utilizador pode ver. | `allowPlannedJobs` ou `allowScheduledJobs` |
| `list_stored_jobs` | As [tarefas guardadas](../jobs/stored-jobs.html) que o utilizador pode ver, sem os seus valores. | `allowStoredJobs` |
| `get_stored_job` | Uma tarefa guardada com os seus valores, por `id`, ou por `form` e `name` entre as do próprio utilizador. | `allowStoredJobs` |
| `store_job` | Guarda valores de um formulário com um nome, como faz **Guardar** no formulário. | `allowStoredJobs` |
| `delete_stored_job` | Elimina uma tarefa guardada que o utilizador pode ver. | `allowStoredJobs` |

`launch_job`, `relaunch_job` e `plan_job` aceitam `verbose: true` para executar a tarefa em modo detalhado, o que exige a
opção de função `allowVerboseMode`. Com [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do), as ferramentas que lançam, planeiam ou
alteram (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` e `delete_stored_job`)
não são oferecidas.

Não existe nenhuma ferramenta para executar uma expressão, consulta, playbook ou extravars arbitrários. As expressões
e as consultas só são executadas tal como o formulário as define.

O [Assistente de chat](../chat) também usa estas ferramentas, com um botão **Iniciar** em vez de `launch_job`.

---

## Preencher um formulário

Chame `resolve_field` com o nome do formulário e os valores que tem até ao momento, e novamente depois de cada resposta. Percorre
os campos por ordem de dependência e indica para cada um:

- `status`: `resolved`, `waiting` (com `waitingFor`), `hidden`, ou `error` (o campo recorre à sua predefinição);
- `value`, `default` e, para campos de escolha, `options` (no máximo `maxOptions`, por predefinição 200);
- `needsInput`: um campo obrigatório sem valor, ou uma escolha ainda em `__auto__`;
- `validationErrors`: as regras que o valor viola, como `[{type, description}]`, com a mensagem do navegador.

Para o formulário completo, `missing` e `invalid` listam o que ainda é preciso corrigir; `launch_job` recusa-o até `complete` ser true.

A validação é o próprio código do navegador, partilhado com a [validação do lançamento](../launch-validation). Os campos ocultos não são
validados, e um campo opcional vazio é válido.

---

## Agendamentos e execuções planeadas

`plan_job` aceita o mesmo `form`, `values` e `expectedPayloadHash` que `launch_job`, com um `name` para a execução e `run_at`, uma
hora ISO 8601 com o seu desvio ou `Z` (`2026-10-15T22:00:00+02:00`); uma hora sem fuso horário é recusada. Os valores são resolvidos
e validados agora, e verificados novamente quando a execução dispara, tal como numa [execução planeada](../jobs/schedules.html#planned-runs) no
navegador. A resposta indica a hora da execução em UTC e no relógio da aplicação.

`create_schedule` aceita um `form`, um `name`, ou `cron` (cinco campos, como `0 22 * * 1-5`) ou `run_at`, e as
`extraVars` que a tarefa recebe. Um agendamento destes é executado como o `Schedule Service`, sem a validação do formulário; para executar um formulário uma vez como
o utilizador, use `plan_job`. Os nomes dos agendamentos são únicos.

---

## Tarefas guardadas

Uma tarefa guardada são os valores de um formulário guardados com um nome; as ferramentas trabalham sobre as mesmas tarefas guardadas que o navegador.

`list_stored_jobs` lista as tarefas guardadas do próprio utilizador, ou as de toda a gente para um utilizador com `showSettings`, com o seu nome, descrição,
formulário, criação e expiração. Uma marcada como `usable` (do próprio utilizador, de um formulário que pode lançar) pode ser passada como `storedJob`
(`{ "id": 7 }`, ou `{ "name": "..." }` entre as do próprio utilizador desse formulário) a `resolve_field`, `launch_job` ou `plan_job`: os seus
valores são o ponto de partida e os `values` são sobrepostos. Os campos de palavra-passe não são guardados, por isso forneça-os em `values`.
`launch_job` e `plan_job` a partir de uma tarefa guardada precisam do `expectedPayloadHash` que `resolve_field` devolveu para ela, e
`resolve_field` recusa `storedJob` em conjunto com `subform`.

`store_job` aceita o `form`, um `name` único entre as tarefas guardadas do utilizador para esse formulário, os `values` e, opcionalmente, uma
`description` e `expires_at` (ISO 8601 com o seu desvio ou `Z`). A sua resposta indica que campos de palavra-passe ficaram de fora.

---

## Passar valores

Passe `field` para resolver apenas esse campo e aquilo de que depende. Para uma linha de lista ou um passo de wizard, passe `subform` (e
opcionalmente `parent`, os valores do formulário pai).

Envie os valores tal como o navegador os guarda. Um campo de escolha também aceita um registo parcial ou o seu valor de `valueColumn`
(`"vol1"`), e um array quando é `multiple`. Os campos calculados ignoram os valores enviados, a menos que sejam `editable`.

---

## Aprovar o payload exato

Quando o formulário está completo, `resolve_field` devolve também o que `launch_job` vai submeter:

- `modeledExtravars`: as extravars depois de aplicados `model`, `valueColumn` e `output`,
  com os campos de palavra-passe mascarados;
- `credentials`: as credenciais do AnsibleForms que a tarefa vai usar (nomes, não segredos);
- `payloadHash`: um hash SHA-256 do nome do formulário, das extravars reais e das credenciais.

Mostre `modeledExtravars` ao operador, e passe o `payloadHash` que ele aprovou a
`launch_job` como `expectedPayloadHash`. O lançamento resolve o formulário novamente e é recusado
quando o payload difere, por exemplo porque uma consulta responde agora de forma diferente.
`ansibleforms_user`, `__jobid__` e `__verbose__` são adicionados no lançamento e não fazem parte do hash.

`launch_job` verifica apenas o payload. Uma edição do formulário que deixe o payload igual não recusa o lançamento.
Cada resposta de `resolve_field` traz também um `formFingerprint`, um hash SHA-256 da definição do formulário: para recusar um
lançamento depois de qualquer edição do formulário, compare-o por si antes de chamar `launch_job`, como faz o botão
**Iniciar** do assistente de chat.

---

## Relançar com alterações

`relaunch_job` aceita um `id` de tarefa e `values`: apenas os campos a alterar, como valores brutos.
`values` é sobreposto aos valores com que a tarefa foi originalmente lançada, e o resultado é
resolvido e validado exatamente como por `launch_job`, incluindo as linhas de lista, e depois lançado como uma
nova tarefa por si (`ansibleforms_user` é você, e não quem a submeteu originalmente). Os carregamentos de ficheiros da
tarefa original são reutilizados.

Sem `values`, é um relançamento **tal como a tarefa foi executada**: as suas extravars guardadas são repetidas no
servidor, incluindo as palavras-passe (a pré-visualização mascara-as). No entanto, se o formulário estiver sob a validação do lançamento
`enforce`, o relançamento passa pela mesma verificação que um relançamento com
alterações.

**As palavras-passe nunca são guardadas com os valores dos campos**, por isso um relançamento que passa pela
verificação é recusado quando o formulário mostra um campo de palavra-passe, no nível de topo ou numa linha de lista
(`unsupported`, com os `passwordFields`). Um campo de palavra-passe oculto pelas suas dependências
não bloqueia o relançamento. Consulte [Validação do lançamento](../launch-validation).

Chame-a primeiro com `preview: true`: devolve `modeledExtravars` (palavras-passe mascaradas),
`credentials` e um `payloadHash` sem lançar. Confirme-os com o utilizador e depois chame-a
novamente com `expectedPayloadHash`. Aplicam-se as mesmas permissões que num relançamento no navegador:
o formulário tem de permitir o relançamento e as suas funções precisam da opção `allowJobRelaunch`. Uma
tarefa sem dados de formulário guardados (lançada antes de existir o relançamento) e um formulário wizard não podem ser
relançados com alterações.

A API REST oferece o mesmo através de `POST /api/v2/job/{id}/relaunch` com o corpo
`{ "values": { ... } }`; sem corpo, repete a tarefa tal como foi executada.

---

## Erros

Uma chamada recusada é um erro de ferramenta cujo conteúdo estruturado traz um `code` e os detalhes:

| Código | Quando |
|---|---|
| `form_incomplete` | `launch_job` ou `relaunch_job` num formulário que não está completo, com `missing`, `invalid`, `waiting`, `validationErrors` e `rowErrors` |
| `payload_mismatch` | o payload difere de `expectedPayloadHash`, com os dois hashes |
| `access_denied` | as funções do utilizador não concedem o formulário, a tarefa, o agendamento ou a tarefa guardada, ou o modo detalhado, ou o servidor é só de leitura |
| `not_found` | não existe esse formulário, subform ou tarefa |
| `unsupported` | um formulário wizard, um subform isolado, um campo de ficheiro, ou um `relaunch_job` que precisaria de um campo de palavra-passe visível |
| `no_form_data` | `relaunch_job` com alterações para uma tarefa que não guardou valores do formulário, como uma lançada por um agendamento; relance-a antes sem alterações |
| `invalid_request` | um pedido que o servidor recusa por estar mal formado |
| `internal_error` | qualquer outra situação |
