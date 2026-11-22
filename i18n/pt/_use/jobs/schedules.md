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
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Agendamentos
{: .no_toc }

Executar um formulário mais tarde, segundo um cron ou uma rrule, e gerir todos os agendamentos
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
as ações de agendamento criam uma entrada em **Tarefas > Agendados**; **Guardar** cria uma entrada na página **Tarefas guardadas**. A
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
nesse momento, escritas em YAML; cada execução usa essa cópia, por isso edite-a na página do agendamento para mudar o que a tarefa recebe. Para
o temporizar com uma rrule, ou lhe dar um fim, abra a sua página e altere o separador **Agendamento**.

![Agendamentos](../assets/screenshots/schedules.jpg)

---

## A lista de agendamentos

**Tarefas > Agendados** lista todos os agendamentos e precisa de `allowScheduledJobs`; uma linha abre a página própria do agendamento.

| Coluna | Mostra |
|---|---|
| **Ativado** | Se o agendamento corre segundo a sua própria temporização |
| **Nome** e **Formulário** | O agendamento, e o formulário que executa |
| **Agendamento** | A sua temporização em linguagem corrente, como *At 02:00 AM*; passe o rato por cima para ver o cron ou a própria regra |
| **Última execução** | Quando executou pela última vez |
| **Próxima execução** | Quando executa a seguir, um traço quando não tem execução pela frente |
| **Estado** | O seu último lançamento: se iniciou uma tarefa, ou **A iniciar…** enquanto lança uma |

A coluna **Agendamento** indica um agendamento único como **Execução única**. Uma rrule que a linguagem corrente não consegue descrever é
mostrada tal como está. O menu de cada linha oferece:

| Ação | O que faz |
|---|---|
| **Editar** | Abre a página do agendamento |
| **Executar agora** | Executa o agendamento agora, sem esperar pela sua temporização |
| **Ativar** ou **Desativar** | Liga ou desliga o agendamento, conforme o caso, como mostra a sua coluna **Ativado** |
| **Eliminar** | Remove o agendamento; deixa de correr de imediato |

**Novo agendamento** cria um de raiz, em três passos: **Detalhes** (o seu **Nome**, **Descrição** e **Formulário**),
**Agendamento** (a sua temporização e o seu fim) e **Extra vars**. **Extra vars** é YAML sem formulário que o preencha, por isso acrescente
você mesmo os valores de que o playbook precisa, como um dicionário (pares chave: valor).

---

## A página de um agendamento

A página de um agendamento apresenta os passos do seu diálogo como separadores, com **Executar agora**, **Eliminar** e **Guardar** no canto superior direito.

| Separador | O que contém |
|---|---|
| **Detalhes** | A sua origem, **Nome**, **Descrição**, **Formulário**, depois **Último lançamento**, **Tarefa iniciada**, **Última execução**, **Próxima execução** e **Ativado** |
| **Agendamento** | Como é temporizado (ver [Temporizar um agendamento](#timing-a-schedule)) e como termina (ver [O fim de um agendamento](#the-end-of-a-schedule)) |
| **Extra vars** | O YAML que a tarefa recebe; para um agendamento guardado no git, também as perguntas do seu ficheiro |
| **Execuções** | As tarefas que iniciou, a mais recente primeiro; uma linha abre a tarefa |

**Último lançamento** diz como correu o seu último lançamento, como um estado: um que falhou diz porquê ao passar o rato por cima. **Tarefa iniciada**
liga à tarefa que iniciou, para que a possa abrir e ver como terminou. O separador **Execuções** lista as tarefas que pode ver, com o utilizador
com que correram, o seu início, fim, duração e estado; o seu número está no título do separador.

O interruptor **Ativado** pausa um agendamento sem o eliminar, e é guardado com **Guardar**, como todos os campos da página. Um
agendamento desligado continua listado com as suas definições, mas não corre sozinho: um recorrente salta as suas execuções, e um
único espera para além do seu momento até ser ligado de novo. **Executar agora** continua a executá-lo a pedido. Um agendamento novo está ligado.

---

## Temporizar um agendamento

Um agendamento é temporizado de uma de três formas, escolhida em **Tipo de agendamento** no seu separador **Agendamento**; a rrule é nova na 7.8.0.

| Temporização | Executa | Ver |
|---|---|---|
| **Cron** | De forma recorrente, segundo uma expressão cron no fuso horário do servidor | [Expressões cron e fuso horário](#cron-expressions-and-time-zone) |
| **Regra de recorrência (rrule)** | De forma recorrente, segundo uma regra iCal no seu próprio fuso horário | [Regras de recorrência](#recurrence-rules) |
| **Execução única** | Uma vez, numa data e hora | [Como corre um agendamento](#how-a-schedule-runs) |

Com um cron ou uma rrule, o editor mostra as três próximas execuções, e para-as no fim do agendamento. Mudar a temporização
mantém apenas a escolhida: um agendamento que passa de um cron para uma rrule perde o seu cron.

---

## Expressões cron e fuso horário

Um agendamento recorrente pode aceitar uma expressão cron padrão de 5 campos: minuto, hora, dia do mês, mês e dia da semana.

| Expressão | Executa |
|---|---|
| `*/15 * * * *` | A cada 15 minutos |
| `0 2 * * *` | Todos os dias às 02:00 |
| `30 7 * * 1-5` | De segunda a sexta às 07:30 |
| `0 0 1 * *` | À meia-noite do primeiro dia de cada mês |

O editor de cron descreve a expressão por palavras, oferece predefinições e pré-visualiza as próximas execuções. O servidor recusa uma
expressão que não consiga executar, ou uma que nunca possa ocorrer. Mais exemplos, e as funcionalidades de cron que o editor não aceita, estão
nas FAQ em [Que expressões cron posso usar?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Os agendamentos cron correm no fuso horário do servidor, definido com [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (predefinição `UTC`),
> não no fuso horário do seu perfil nem do seu navegador. O editor de cron pré-visualiza as próximas execuções nesse mesmo fuso.

---

## Regras de recorrência

A partir da 7.8.0 um agendamento recorrente pode aceitar, em vez disso, uma regra de recorrência iCal (rrule), que corre num fuso horário próprio.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

A primeira executa todos os dias às 02:00 em Bruxelas, a segunda todas as segundas-feiras às 06:00 UTC, a terceira no último dia útil de
cada mês às 07:30 em Nova Iorque. Uma regra é uma linha, com as suas partes separadas por espaços:

| Parte | O que diz |
|---|---|
| `DTSTART` | A primeira execução, com um `TZID` (um fuso IANA como `Europe/Brussels`, ou um desvio como `UTC+5` ou `GMT-3`), ou em UTC terminando em `Z` |
| `RRULE` | Quando se repete: `FREQ` com um `INTERVAL` de pelo menos 1, e `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … conforme necessário; uma ou mais |
| `EXRULE` | Opcional: uma regra de execuções a saltar |

O servidor recusa uma regra que não consiga executar, e diz porquê:

- nenhum `DTSTART`, mais do que um, ou um sem fuso horário, e `EXDATE` ou `RDATE`;
- uma regra sem `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` com um número (`5MO`), ou `COUNT` juntamente com `UNTIL`;
- `COUNT` acima de 999, um número `BYxxx` fora do seu intervalo (`BYHOUR` de 0 a 23, `BYSETPOS` de 1 a 366 ou de -366 a -1 …), um `WKST`
  que não é um dia da semana, um `DTSTART` ou `UNTIL` que não é uma data real (`20300230`), ou uma parte dada duas vezes numa regra;
- uma regra que nunca dispara: nenhuma execução nos 50 anos após o seu `DTSTART`, como `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` a partir
  da meia-noite, que só encontra horas pares.

O editor é uma caixa de texto: uma rrule nova começa como todos os dias à meia-noite no fuso horário do seu navegador. Diz de imediato porque é
que uma regra seria recusada, ou então mostra as suas três próximas execuções no fuso horário da própria regra, ou **Esta rrule não tem mais
execuções pela frente.** quando o seu `UNTIL` ou `COUNT` já passou. Uma hora que uma mudança de hora de verão salta executa quando o relógio
a atinge (02:30 executa às 03:30 na noite em que o relógio passa das 02:00 para as 03:00), tal como um cron; uma hora que o relógio mostra duas
vezes executa uma vez, na primeira.

---

## O fim de um agendamento

A partir da 7.8.0 um agendamento temporizado por um cron ou uma rrule pode terminar; em **Termina** no seu separador **Agendamento**, escolha uma opção.

| Termina | O agendamento termina |
|---|---|
| **Nunca** | Nunca: a predefinição, e todos os agendamentos de antes da 7.8.0 |
| **Numa data** | Na data e hora escolhidas: nenhuma execução depois disso |
| **Após** … **execuções** | Quando tiver iniciado esse número de tarefas no total, as que o seu separador **Execuções** lista; o campo diz quantas até agora |

**Ao terminar**, é desligado (**Desativá-lo**, a predefinição) ou eliminado (**Removê-lo**). A tarefa de sistema **Fim dos agendamentos**
aplica os fins a cada minuto, e um agendamento que atinge o seu número de execuções termina logo após a última. O `UNTIL` ou `COUNT`
próprio de uma rrule continua a aplicar-se; o fim acrescenta-se a ele.

Um agendamento único não tem fim: termina com a sua execução. O seu interruptor **Remover após executar**, ligado por predefinição, elimina-o após
a sua execução; desligado, o agendamento é desativado após a sua execução e mantido com o seu resultado.

---

## Como corre um agendamento

Quando um agendamento chega à hora, é colocado em fila, e o servidor inicia os agendamentos em fila um de cada vez, verificando a fila a cada 10 segundos.

- **Os agendamentos recorrentes** saltam uma execução enquanto a execução anterior ainda está em fila ou em execução, pelo que as execuções nunca se sobrepõem.
- **Os agendamentos únicos** correm no minuto seguinte ao seu momento, e depois são eliminados (ou mantidos, desligados, quando **Remover após
  executar** está desligado), também quando iniciados com **Executar agora**.
- **Estado** é `success` quando a tarefa foi iniciada e `failed` quando não pôde ser. Um `success` só diz que a tarefa foi
  lançada: abra a tarefa para ver como terminou.

Um agendamento criado com `allowScheduledJobs` corre como o utilizador incorporado `Schedule Service` (tipo `schedule`) com a
função `admin`. Pode executar qualquer formulário, seja qual for o acesso da pessoa que criou o agendamento, e `ansibleforms_user` nas
suas extravars descreve esse utilizador. Uma [execução planeada](#planned-runs), pelo contrário, corre como o utilizador que a planeou.

A tarefa recebe também um objeto `schedule`, para que um playbook saiba que foi um agendamento que o iniciou:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

O seu `one_time_run` é o momento da execução de um agendamento único, `null` para um recorrente. Contém também as outras definições do
agendamento, como `enabled` e `repository`, e `run_at`: o mesmo momento com o seu nome de antes da 7.8.0 (obsoleto, removido na 8).

---

## Execuções planeadas

**Executar mais tarde (única)** por um utilizador sem `allowScheduledJobs` cria uma execução planeada: um agendamento único ligado a esse utilizador.

- **Quando é planeada**, o servidor verifica que o utilizador pode executar o formulário (os seus `roles`), e o modo verbose precisa de
  `allowVerboseMode`. Uma execução planeada é sempre única; uma expressão cron ou uma rrule é recusada.
- **Com a validação no lançamento em `enforce`**, os valores dos campos são verificados quando é planeada, para que uma execução que seria recusada seja
  recusada enquanto o utilizador ainda está a olhar.
- **Quando corre**, a tarefa corre como esse utilizador, pertencendo-lhe, passando pelas mesmas verificações que um lançamento a partir do navegador: as
  funções do formulário tal como estão nesse momento, as extravars reservadas retiradas, e a validação no lançamento. `ansibleforms_user` descreve-o.

Quem planeia não vê **Tarefas > Agendados**, que precisa de `allowScheduledJobs`; a tarefa aparece no seu próprio histórico de tarefas. Uma
execução planeada é sempre removida após a sua execução.

---

## Quando o formulário muda

Um agendamento refere-se ao seu formulário pelo nome e executa-o tal como está definido no momento de cada execução.

- **O formulário é editado**: a execução seguinte usa a nova definição (playbook, template, inventário) com as extravars guardadas
  no agendamento. O formulário não é construído, pelo que nenhum campo é recalculado; edite as extra vars do agendamento para corresponderem.
- **O formulário é renomeado ou removido**: a execução falha, **Estado** passa a `failed` e **Último lançamento**, ao passar o rato por cima, diz
  `Failed to launch : No such form '<name>'`. Edite o agendamento e escolha o formulário certo, ou elimine-o.

---

## Tarefas agendadas no histórico de tarefas

Cada execução de um agendamento cria uma tarefa normal, listada na página [Tarefas](./) com `Schedule Service` como utilizador ou,
numa execução planeada, com o utilizador que a planeou.

Uma tarefa de `Schedule Service` não pertence à pessoa que criou o agendamento, pelo que só é visível para os administradores e para
os utilizadores com `showAllJobLogs`; a tarefa de uma execução planeada também é visível para o seu utilizador. O separador **Execuções** do
agendamento lista as tarefas que iniciou, e a sua **Tarefa iniciada** liga à última.

---

## Agendamentos num repositório git

A partir da 7.8.0 os agendamentos também podem ser mantidos num repositório git, como entradas de uma lista `controller_schedules:` nos seus ficheiros YAML.

No máximo um repositório tem a utilização **Agendamentos**: as suas entradas são lidas para **Tarefas > Agendados** em cada pull, temporizadas por um
`cron`, uma `rrule` ou um `one_time_run`, e um agendamento criado ou alterado na aplicação é escrito de volta no seu ficheiro, à espera do
push do repositório. Um agendamento destes mostra o seu ficheiro na sua página, e o seu fim apenas o desliga, nunca o elimina. Ver
[Repositórios git](../repositories/).

---

## Na API

A partir da 7.8.0 um agendamento da API tem três campos de temporização, com exatamente um deles definido: `cron`, `rrule` ou `one_time_run`.

| Campo | Contém |
|---|---|
| `cron` | Uma expressão cron |
| `rrule` | Uma regra de recorrência, numa linha |
| `one_time_run` | O momento da sua única execução, uma hora ISO 8601 com o seu desvio ou `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | O seu fim: `never`, `date` ou `count`, a sua data, o seu número de execuções, e `disable` ou `remove` |
| `remove_after_run` | Um agendamento único: `false` mantém-no, desligado, após a sua execução |

{: .warning }
> O par que a API aceitava antes da 7.8.0, `one_time_run: true` com `run_at`, está obsoleto desde a 7.8.0 e é removido na 8. Ainda
> é lido como `one_time_run` nesse momento, com um aviso no registo do servidor; `one_time_run: false` com um cron é lido como
> esse cron.
