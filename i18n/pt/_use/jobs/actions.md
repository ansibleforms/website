---
layout: default
title: Ações sobre tarefas
parent: Tarefas
nav_order: 3
translated_from: 6842b5564e9f629eed007085fa356df2e22cd031
---

# Ações sobre tarefas
{: .no_toc }

Lançar, interromper, relançar, aprovar ou rejeitar, e eliminar uma tarefa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Lançar uma tarefa

Todas as tarefas começam num formulário. Abra-o a partir da página **Formulários**, preencha os campos e carregue em **Submeter**:

1. O formulário é validado no navegador, e os valores dos campos são enviados para o servidor.
2. O servidor cria a tarefa e devolve o seu número; as ações [`onSubmit`](../forms/job-status-action.html) do formulário são executadas.
3. O resultado da tarefa aparece por baixo do formulário e atualiza-se a cada dois segundos até a tarefa terminar.

A tarefa aparece também na página **Tarefas**, onde a pode acompanhar mais tarde.

### Quem pode lançar um formulário

Um formulário é listado, e pode ser lançado, para os utilizadores que têm uma das [funções](../config/roles.html) da sua lista `roles`.
A função `default`, que todos os utilizadores têm, torna um formulário disponível para todos os que podem iniciar sessão.

### Antes de submeter

A barra por cima dos campos oferece algumas ferramentas, cada uma mostrada só quando a sua função o permite:

| Botão | O que faz | Opção de função |
|---|---|---|
| **Mostrar extravars** | Pré-visualiza as extravars que a tarefa vai receber, à medida que preenche os campos | `showExtraVars` |
| **verbose** | Executa a tarefa em modo verbose | `allowVerboseMode` |
| **Carregar dos guardados** | Preenche os campos a partir de uma [tarefa guardada](stored-jobs.html) | `allowStoredJobs` |
| **Recarregar este formulário** | Carrega de novo o formulário, com os seus valores predefinidos | nenhuma |

### Escolhas no momento do lançamento

Um formulário pode deixar os seus utilizadores escolher algumas opções do Ansible quando o lançam, declarando um campo com um nome reservado. O
valor do campo sobrepõe-se então à definição do próprio formulário:

| Nome do campo | Sobrepõe-se a | Tipo de campo habitual |
|---|---|---|
| `__check__` | Modo check, um ensaio que não altera nada | `checkbox` |
| `__diff__` | Modo diff, que mostra o que mudaria | `checkbox` |
| `__limit__` | Os hosts em que o playbook corre | `text` ou `enum` |
| `__tags__` | As etiquetas a executar | `text` ou `enum` |
| `__inventory__` | O inventário | `enum` |
| `__playbook__`, `__template__` | O playbook, ou o template de AWX / AAP | `enum` |

Por exemplo, um formulário que oferece um ensaio e um limite de hosts:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

O servidor só aceita estes nomes de um formulário que os declare como campos, pelo que um lançamento a partir da API não os pode acrescentar
por si. As propriedades a que se sobrepõem estão descritas em [Formulários de Ansible](../forms/ansible.html) e [Formulários de AWX](../forms/awx.html).

### O que pode travar um lançamento

Um lançamento nem sempre se torna de imediato uma tarefa em execução:

* **Campos inválidos** : o formulário não é submetido, e cada campo que falha a sua validação mostra porquê.
* **Validação no lançamento** : com a [validação no lançamento](../launch-validation/) definida como `enforce`, o servidor verifica os valores
  de novo e recusa um lançamento que viole as regras do formulário.
* **Aprovação** : um formulário com um [ponto de aprovação](../forms/approval.html) cria a tarefa, que fica depois à espera no estado
  `approve`; ver [Aprovar ou rejeitar uma tarefa](#approve-or-reject-a-job).

Quando a tarefa termina, as [notificações](../forms/notifications.html) do formulário enviam os seus emails e mensagens para canais, e as suas
ações conforme o estado da tarefa são executadas.

### Outras formas de iniciar uma tarefa

Um formulário também pode iniciar uma tarefa sem que uma pessoa carregue em **Submeter**:

| Iniciada por | Como | Página |
|---|---|---|
| Executar mais tarde ou um agendamento cron | **Executar mais tarde (única)** ou **Agendar (recorrente)** ao lado de **Submeter** | [Agendamentos](schedules.html) |
| Um script ou um pipeline | `POST /api/v2/job` com um token de API | [Tarefas na API REST](../api/jobs.html) |
| Um agente de IA | A ferramenta `launch_job` do servidor MCP | [Ferramentas MCP](../mcp/tools.html) |
| Uma conversa | O assistente de chat preenche o formulário e lança-o | [Assistente de chat](../chat/) |
| Uma tarefa anterior | **Relançar**, abaixo | [Relançar uma tarefa](#relaunch-a-job) |

---

## Interromper uma tarefa

**Interromper** no menu da linha (⋮) da lista, ou **Interromper tarefa** na página da tarefa, para uma tarefa com o estado `running`. Depois de confirmar,
o AnsibleForms marca a tarefa para interrupção:

* **`ansible`**: o RTE para o processo do playbook (com todos os seus workers), e a tarefa termina como `aborted` com
  `... was aborted by the operator`. Uma tarefa ainda à espera de um RTE livre é interrompida antes de arrancar.
* **Uma tarefa de template** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins): o AnsibleForms pede ao runner que cancele ou pare
  a tarefa, e a tarefa termina como `aborted`. Quando o runner recusa, o resultado mostra `Abort request denied`, seguido de
  `reverting abort request`, e a tarefa continua em execução. Um build de Jenkins ainda na fila é retirado dela.
* **`workflow`**: as tarefas dos nós em execução são interrompidas e não arranca mais nada (ver
  [Executar um workflow](../workflows/running.html#abort)).
* **`multistep`**: os passos que ainda não arrancaram são saltados (`skipping: [Abort is requested]`), e a tarefa principal
  termina como `aborted`. Um passo que já está em execução é uma tarefa própria: abra-o e interrompa-o para o parar também.

Pode interromper as suas próprias tarefas; um administrador, ou a partir da 7.3.0 um utilizador cuja função defina `manageAllJobs`, pode interromper qualquer tarefa. `showAllJobLogs` permite a um
utilizador ver as tarefas de outros utilizadores, não interrompê-las.

---

## Relançar uma tarefa

**Relançar** no menu da linha (⋮) da lista, ou **Relançar tarefa** na página da tarefa, inicia uma nova tarefa a partir de uma terminada. É oferecido em qualquer
tarefa que não esteja `running` nem à espera de aprovação, aos utilizadores cuja função defina a opção de função `allowJobRelaunch`.

Na página da tarefa, **Relançar tarefa** é um botão simples, ou um botão dividido com uma seta, como o **Submeter** do formulário, quando a tarefa
oferece uma segunda escolha: [nos seus hosts com falha](#relaunch-on-the-failed-hosts) ou [a partir do seu nó com falha](#relaunch-from-the-failed-node).
A sua parte principal é sempre o relançamento completo, e o menu da linha da lista oferece apenas o relançamento completo.

O diálogo oferece:

* **Relançar**: executa a tarefa de novo com os valores com que foi executada, como uma nova tarefa em seu nome.
* **Modo detalhado**: relança em modo verbose; mostrado com a opção de função `allowVerboseMode`.
* **Editar os valores antes de relançar**, e depois **Editar e relançar**: abre o formulário preenchido com os valores da tarefa, para que
  os possa alterar antes de submeter.

Um relançamento exige também que o formulário o permita (`allowRelaunch`, verdadeiro por predefinição) e que a tarefa seja **sua**, a menos que
seja administrador ou, a partir da 7.3.0, tenha `manageAllJobs`; `showAllJobLogs`, que até à 7.2 relançava qualquer tarefa, já não o faz. A forma como um relançamento é verificado com as regras do formulário, e porque é que um formulário com um
campo de palavra-passe o pode recusar, está descrita em [Relançar](../launch-validation/relaunching.html).

### Relançar nos hosts com falha

A partir da 7.7.0, uma tarefa que falhou em alguns dos seus hosts pode correr de novo só nesses hosts, sem tocar nos outros.

A seta de **Relançar tarefa** oferece então **Em todos os hosts**, o relançamento completo, e **Nos hosts com falha (N)**, com N os hosts em que
uma tarefa falhou ou que não foi possível alcançar. É oferecido numa tarefa terminada destes tipos:

| Tarefa | Os seus hosts com falha vêm de | A nova execução |
|---|---|---|
| Um playbook num RTE | O resumo dos seus [eventos](following.html#hosts-and-tasks), senão o `PLAY RECAP` do seu resultado | Uma nova tarefa, limitada a esses hosts |
| Um modelo de job em AWX, AAP ou Ascender | Os resumos de hosts do job nesse runner | O relançamento do próprio produto nos hosts com falha, no runner onde a tarefa correu |

Uma tarefa que correu num só host, ou que falhou em todos os hosts, mantém o botão simples: voltar a correr os seus hosts com falha seria o
relançamento completo. Uma falha que `ignore_errors` deixou passar, ou que um `rescue` tratou, não conta. As tarefas Jenkins, Semaphore e
Rundeck, as tarefas de workflow e multistep, e as tarefas dos nós de um workflow não voltam a correr nos seus hosts com falha.

A nova execução é uma nova tarefa com os mesmos valores da tarefa de onde vem:

* **Hosts**: só os hosts com falha, dentro do limite da própria tarefa; uma nova execução de outra fica dentro dos hosts da anterior.
* **Verificações**: a mesma aprovação, validação no lançamento e permissões que o relançamento completo.
* **Diálogo**: lista os hosts antes de confirmar, sem **Editar os valores antes de relançar**.
* **Página da tarefa**: **relançamento de #N**, com *hosts com falha* ao lado, liga à tarefa; o facto **hosts** de um playbook lista os hosts.
* **Resultado**: começa com uma linha como `ok: [Re-run of job 42 on its 2 failed host(s): web07, web19]`.

Um host com falha cujo nome o Ansible leria como um padrão, com um `*`, um `~` ou um `[` por exemplo, fica fora da nova execução, e a
resultado di-lo numa linha `[WARNING]`. No RTE os hosts chegam ao `ansible-playbook` como um ficheiro de limite, um host por linha, por isso um
nome de host com uma vírgula ou dois pontos continua a ser um só host.

### Relançar a partir do nó com falha

A partir da 7.7.0, uma tarefa de workflow que falhou pode correr de novo a partir do nó que falhou, mantendo o que os nós anteriores fizeram.

A seta de **Relançar tarefa** oferece então **A partir do primeiro nó**, o relançamento completo, e **A partir do nó com falha**. As tarefas de
workflow que o oferecem:

| Tarefa de workflow | A partir do nó com falha |
|---|---|
| Um [workflow](../workflows/) do AnsibleForms | Os nós que tiveram sucesso são mantidos, e a execução começa no(s) nó(s) com falha |
| Uma tarefa de workflow do Ascender | O relançamento dos nós com falha do próprio Ascender, no runner onde a tarefa correu |
| Uma tarefa de workflow do AWX ou AAP | Não oferecido: só o relançamento completo |
| Uma tarefa [multistep](../forms/multistep.html) (obsoleta) | Não oferecido: só o relançamento completo |

A nova tarefa passa pela mesma aprovação, validação no lançamento e permissões que o relançamento completo, e a sua página mostra
**relançamento de #N** com *nó com falha* ao lado. Quando um workflow do AnsibleForms o oferece, e o que é mantido, está descrito em
[Executar um workflow](../workflows/running.html#relaunch-from-the-failed-node).

### Relançar com dados preenchidos

**Editar e relançar** abre o formulário com o parâmetro de URL `prefillJobId`, que também pode usar numa ligação sua:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

O formulário carrega os valores dos campos guardados com a tarefa `61` e mostra `Formulário preenchido com os dados do trabalho anterior #61`.
Submetê-lo inicia uma nova tarefa, verificada como qualquer outro lançamento. O preenchimento segue as mesmas regras de um relançamento:

* **Os campos de palavra-passe nunca são guardados**, por isso nunca são preenchidos: introduza-os de novo. As constantes também não são guardadas.
* É necessária a opção de função `allowJobRelaunch`, e a tarefa tem de ser sua (ou tem de ser administrador ou ter `manageAllJobs`).
* Um formulário com `allowRelaunch: false` não pode ser relançado nem preenchido:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Uma tarefa de antes de os valores dos campos serem guardados não pode ser preenchida, e o formulário mostra antes um erro:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Aprovar ou rejeitar uma tarefa

Uma tarefa com um [ponto de aprovação](../forms/approval.html) para no estado `approve` e espera. É listada na página Tarefas dos
seus aprovadores, os utilizadores com uma das funções da aprovação, para que a possam encontrar; a partir da 7.3.0 os outros utilizadores deixam de a ver.

**Rever aprovação** é oferecido aos administradores e aos utilizadores que têm uma das funções da aprovação: um clique na linha da tarefa,
**Rever aprovação** no menu da linha, ou o botão **Rever aprovação** na página da tarefa. O diálogo mostra a mensagem
da aprovação, com os valores da tarefa preenchidos (ou uma linha genérica se não tiver mensagem), e o formulário, o id da tarefa, quem a lançou e
quando, com uma ligação para a tarefa; **Rejeitar** e **Aprovar** respondem-lhe:

* **Aprovar**: a tarefa continua e o seu estado volta a `running`.
* **Rejeitar**: a tarefa termina como `rejected`, e o seu resultado regista `rejected by <username>`.

Uma tarefa à espera de aprovação não pode ser relançada nem eliminada a partir da página Tarefas; aprove-a ou rejeite-a primeiro.

A partir da 7.3.0, o utilizador que lançou uma tarefa não a pode aprovar, para que uma segunda pessoa a veja sempre, embora possa ainda rejeitá-la para
a retirar. Um administrador pode sempre aprovar, incluindo as suas próprias tarefas. Um formulário cujo ponto de aprovação defina
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) permite a quem o lança aprovar também a sua própria tarefa.

---

## Eliminar uma tarefa

**Eliminar** no menu da linha (⋮) da lista, ou **Eliminar tarefa** na página da tarefa, elimina uma tarefa com o seu resultado depois de confirmar.
Eliminar uma tarefa multistep elimina também os seus passos. Para eliminar várias tarefas de uma vez, marque-as na primeira coluna da lista e
clique em **Eliminar (n)** por cima dela.

Pode eliminar as suas próprias tarefas. Os administradores e, a partir da 7.3.0, os utilizadores com a opção de função `manageAllJobs` podem eliminar qualquer tarefa; `showAllJobLogs`
já não pode. Uma função que defina `allowJobDeletion: false` não elimina nenhuma tarefa, nem sequer as suas, para que o histórico de tarefas fique completo. Na página
da tarefa, o botão fica oculto enquanto a tarefa está em execução ou a ser interrompida (exceto para administradores e `manageAllJobs`) e enquanto aguarda aprovação; na lista, a
entrada do menu e a caixa de seleção ficam a cinzento para uma tarefa que não pode eliminar.
