---
layout: default
title: Agendamentos
parent: Tarefas
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Agendamentos
{: .no_toc }

Executar um formulário mais tarde ou segundo um agendamento cron, e gerir todos os agendamentos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## As ações do formulário

Um formulário pode fazer mais do que executar de imediato: a lista pendente ao lado do seu botão **Submeter** contém mais três ações.

| Ação | O que faz | Opção de função |
|---|---|---|
| **Agendar (recorrente)** | Cria um agendamento que executa o formulário segundo uma expressão cron | `allowScheduledJobs` |
| **Executar mais tarde (única)** | Cria um agendamento que executa o formulário uma vez, numa data e hora que escolher | `allowPlannedJobs` |
| **Guardar** | Guarda os valores dos campos, para os carregar de novo no formulário mais tarde | `allowStoredJobs` |

Uma ação cuja opção de função esteja desligada não é mostrada. O formulário é validado antes de qualquer uma delas, tal como para **Submeter**. Ambas
as ações de agendamento criam uma entrada na página **Agendamentos**; **Guardar** cria uma entrada na página **Tarefas guardadas**. A
barra lateral da página [Tarefas](./) abre-as em **Futuro**, como **Agendados** e **Guardados**. As opções de função estão descritas
em [Opções de função](../config/roles.html#role-options).

{: .warning }
> Trate `allowScheduledJobs` como uma opção de nível de administrador. Os seus agendamentos não pertencem ao utilizador que os criou: todos os utilizadores
> com a opção veem e podem alterar todos os agendamentos. Um agendamento destes também corre com direitos de administrador, para qualquer formulário, seja qual for
> o acesso próprio de quem o criou. Conceda-a apenas a funções em que confiaria como administradores.

{: .note }
> **Executar mais tarde (única)** só precisa de `allowPlannedJobs`. Para um utilizador sem `allowScheduledJobs`, planeia uma execução **como esse
> utilizador**: o servidor verifica que o utilizador pode executar o formulário, e a tarefa corre como ele, pertencendo-lhe, quando chegar a hora
> (ver [Execuções planeadas](#planned-runs)).

---

## Agendar um formulário

Preencha o formulário, abra a lista pendente ao lado de **Submeter** e escolha uma das ações de agendamento.

- **Agendar (recorrente)** abre **Criar agendamento**: introduza um **Nome** e uma **Expressão Cron** (a predefinição, `0 0 * * *`,
  executa diariamente à meia-noite), e selecione **Criar agendamento**.
- **Executar mais tarde (única)** abre **Executar mais tarde**: introduza um **Nome** e escolha a data e hora em **Executar em**, e selecione
  **Agendar tarefa**.

O nome tem de ser único entre todos os agendamentos. O agendamento guarda o nome do formulário e uma cópia das extravars que o formulário produziu
nesse momento, escritas em YAML; cada execução usa essa cópia, por isso edite-a na página **Agendamentos** para mudar o que a tarefa recebe.

![Agendamentos](../assets/screenshots/schedules.jpg)

---

## A página Agendamentos

A página **Agendamentos** lista todos os agendamentos, com a sua coluna **Ativado** a partir da 7.3.0, e precisa de `allowScheduledJobs`. O menu de cada linha oferece:

| Ação | O que faz |
|---|---|
| **Editar** | Altera o nome, o tipo, a expressão cron ou a hora de execução, o formulário e as extra vars |
| **Executar agora** | Executa o agendamento agora, sem esperar pela sua expressão cron ou hora de execução |
| **Ativar** ou **Desativar** | Liga ou desliga o agendamento, conforme o caso, como mostra a sua coluna **Ativado** (a partir da 7.3.0) |
| **Eliminar** | Remove o agendamento; deixa de correr de imediato |
| **Último resultado** | Na página do agendamento, o que a última execução reportou, como o número da tarefa que iniciou |

Também se pode criar aqui um agendamento de raiz. Escolha o **Formulário** e depois marque **Execução única** e defina
**Executar em**, ou deixe-a desmarcada e defina um **Agendamento cron**. **Extra vars** é YAML sem formulário que o preencha, por isso acrescente
você mesmo os valores de que o playbook precisa, como um dicionário (pares chave: valor).

O campo **Agendamento cron** é um editor de cron: descreve a expressão por palavras, oferece predefinições e pré-visualiza as próximas
execuções. O servidor recusa uma expressão que não consiga executar, ou uma que nunca possa ocorrer.

A partir da 7.3.0, cada agendamento tem um interruptor **Ativado**, para o pausar sem o eliminar. Um agendamento desligado continua na página
com as suas definições, mas não corre sozinho: um recorrente salta os seus disparos cron, e um único espera para além do seu
**Executar em** até ser ligado de novo. **Executar agora** continua a executá-lo a pedido. Um agendamento novo está ligado, e os agendamentos
que existiam antes da 7.3.0 ficam ligados depois da atualização.

---

## Expressões cron e fuso horário

Um agendamento recorrente aceita uma expressão cron padrão de 5 campos: minuto, hora, dia do mês, mês e dia da semana.

| Expressão | Executa |
|---|---|
| `*/15 * * * *` | A cada 15 minutos |
| `0 2 * * *` | Todos os dias às 02:00 |
| `30 7 * * 1-5` | De segunda a sexta às 07:30 |
| `0 0 1 * *` | À meia-noite do primeiro dia de cada mês |

Mais exemplos, e as funcionalidades de cron que o editor não aceita, estão nas FAQ em
[Que expressões cron posso usar?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Os agendamentos cron correm no fuso horário do servidor, definido com [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (predefinição `UTC`),
> não no fuso horário do seu perfil nem do seu navegador. O editor de cron pré-visualiza as próximas execuções nesse mesmo fuso.

---

## Como corre um agendamento

Quando um agendamento chega à hora, é colocado em fila, e o servidor inicia os agendamentos em fila um de cada vez, verificando a fila a cada 10 segundos.

- **Os agendamentos recorrentes** saltam um disparo enquanto a execução anterior ainda está em fila ou em execução, pelo que as execuções nunca se sobrepõem.
- **Os agendamentos únicos** correm no minuto seguinte a **Executar em**, e depois são eliminados, também quando iniciados com **Executar agora**.
- **Estado** é `success` quando a tarefa foi iniciada e `failed` quando não pôde ser. Um `success` só diz que a tarefa foi
  lançada: abra a tarefa para ver como terminou.

Um agendamento criado com `allowScheduledJobs` corre como o utilizador incorporado `Schedule Service` (tipo `schedule`) com a
função `admin`. Pode executar qualquer formulário, seja qual for o acesso da pessoa que criou o agendamento, e `ansibleforms_user` nas
suas extravars descreve esse utilizador. Uma [execução planeada](#planned-runs), pelo contrário, corre como o utilizador que a planeou.

A tarefa recebe também um objeto `schedule` (com o seu `id`, `name` e `form`), para que um playbook saiba que foi um agendamento que o iniciou:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Execuções planeadas

**Executar mais tarde (única)** por um utilizador sem `allowScheduledJobs` cria uma execução planeada: um agendamento único ligado a esse utilizador.

- **Quando é planeada**, o servidor verifica que o utilizador pode executar o formulário (os seus `roles`), e o modo verbose precisa de
  `allowVerboseMode`. Uma execução planeada é sempre única; uma expressão cron é recusada.
- **Com a validação no lançamento em `enforce`**, os valores dos campos são verificados quando é planeada, para que uma execução que seria recusada seja
  recusada enquanto o utilizador ainda está a olhar.
- **Quando corre**, a tarefa corre como esse utilizador, pertencendo-lhe, passando pelas mesmas verificações que um lançamento a partir do navegador: as
  funções do formulário tal como estão nesse momento, as extravars reservadas retiradas, e a validação no lançamento. `ansibleforms_user` descreve-o.

Quem planeia não vê a página **Agendamentos**, que precisa de `allowScheduledJobs`; a tarefa aparece no seu próprio histórico de tarefas.

---

## Quando o formulário muda

Um agendamento refere-se ao seu formulário pelo nome e executa-o tal como está definido no momento de cada execução.

- **O formulário é editado**: a execução seguinte usa a nova definição (playbook, template, inventário) com as extravars guardadas
  no agendamento. O formulário não é construído, pelo que nenhum campo é recalculado; edite as extra vars do agendamento para corresponderem.
- **O formulário é renomeado ou removido**: a execução falha, **Estado** passa a `failed` e **Último resultado** diz
  `Failed to launch : No such form '<name>'`. Edite o agendamento e escolha o formulário certo, ou elimine-o.

---

## Tarefas agendadas no histórico de tarefas

Cada execução de um agendamento cria uma tarefa normal, listada na página [Tarefas](./) com `Schedule Service` como utilizador ou,
numa execução planeada, com o utilizador que a planeou.

Uma tarefa de `Schedule Service` não pertence à pessoa que criou o agendamento, pelo que só é visível para os administradores e para
os utilizadores com `showAllJobLogs`; a tarefa de uma execução planeada também é visível para o seu utilizador. O **Último resultado** do agendamento indica a tarefa que iniciou, para que a possa encontrar na lista.
