---
layout: default
title: "A página de um runner"
parent: Runners
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# A página de um runner
{: .no_toc }

Os separadores de um runner, o modo, a ligação e as definições de um RTE, e Testar ligação
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Separadores

A página de um runner mostra os passos da sua caixa de diálogo como separadores, mais o que corre nele:

| Separador | O que contém |
|---|---|
| Detalhes | O nome e a descrição, o interruptor **É predefinido** e o interruptor **Ativado**, iguais para todos os tipos de runner |
| Tipo | O produto, como na caixa de diálogo. Para um RTE também o seu **Modo**: **Base de dados (obsoleto)**, **Entrada** ou **Saída**, o `RTE_MODE` com que o seu RTE corre (consulte [Modos](../rte/modes.html)) |
| RTE | Só de um RTE: o seu **Modo** por extenso e, num modo socket, a sua **Ligação** e as suas definições (consulte [As definições de um RTE](#an-rtes-settings)) |
| Credenciais | A **Credencial** com que inicia sessão, uma credencial de Ligações > Credenciais do tipo do runner, que contém o seu token ou acesso e o endereço do seu servidor. A de um RTE contém o seu `RTE_TOKEN`, e o endereço do RTE a menos que seja de saída. **Projeto** para Semaphore, Rundeck e Jenkins |
| Formulários | Os formulários que correm nele, e como: **Nomeia-o** ou **Como runner predefinido**. Uma linha abre o formulário |
| Trabalhos | As últimas 100 tarefas que correram nele, com o seu estado, início, fim e duração. Uma linha abre a tarefa |

Cada separador tem o seu próprio endereço, como `/settings/runners/<id>/rte`, por isso uma ligação ou um marcador abre-o. Um runner sem esse separador abre em
Detalhes.

Os dois interruptores do separador Detalhes são guardados de imediato. **É predefinido** torna o runner o predefinido do seu tipo; é desligado tornando
outro runner o predefinido. **Ativado** ativa ou desativa o runner: desativado, nenhuma tarefa vai para ele, nem como predefinido do seu tipo (consulte
[Predefinido e Ativado](list.html#default-and-enabled)).

Um RTE que pediu para aderir abre com uma caixa amarela, **Este RTE pediu para aderir**, com a sua impressão digital e o que disse de si próprio, e
**Aprovar** e **Rejeitar** (consulte [Aprovar um RTE](registration.html#approving-an-rte)). Um runner do [config seed](../seed/) indica-o
no topo da sua página, e é só de leitura.

---

## As definições de um RTE

O separador RTE gere um RTE a partir da aplicação, sem editar o seu ambiente na máquina onde corre.

**Ligação.** Um RTE num modo socket mostra um distintivo: **Ligado** ou **Não ligado**. Ao passar o ponteiro, **Ligado** mostra o nó da aplicação
que tem o seu socket, a versão do RTE, e quantas das suas tarefas estão a correr. **Não ligado** significa que nenhum nó da aplicação tem um socket para ele:
verifique se o RTE está a correr, o seu endereço ou `APP_URL`, e o seu token.

**Definições.** Um RTE em modo de saída ou de entrada tem quatro definições, cada uma vazia por predefinição:

| Definição | Equivale a | O que faz |
|---|---|---|
| Máximo de trabalhos em simultâneo | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Quantos playbooks corre ao mesmo tempo, `10` por predefinição; `0` significa sem limite |
| Cache de ficheiros | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Quanto dos ficheiros de tarefas que a aplicação lhe enviou guarda, em MB, `1024` por predefinição; `0` não guarda nada |
| Tempo de espera ao parar | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Quanto tempo um RTE a parar espera pelos seus playbooks em execução, `25` segundos por predefinição |
| Ficheiros de trabalho | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Transferência**: a aplicação envia os ficheiros de uma tarefa com a tarefa. **Local**: corre a partir das suas próprias pastas montadas |

**Que valor prevalece.** Um valor na página prevalece sobre a mesma variável definida no RTE. Um campo deixado vazio usa a variável própria do RTE,
senão a predefinição. Por baixo de cada campo a página diz qual: **Substitui RTE_MAX_JOBS definida no RTE (3).**, ou **Vazio: o RTE usa a sua
própria RTE_MAX_JOBS, 3.**; o texto de exemplo mostra o valor que um campo vazio representa.

**Como chegam ao RTE.** As definições são guardadas com o runner na base de dados da aplicação. A aplicação envia-as pelo socket do RTE
quando ele se liga e sempre que são guardadas, e o RTE aplica-as de imediato: uma cache mais pequena é reduzida, um novo limite conta a partir da
tarefa seguinte. O RTE guarda-as só em memória e não escreve nenhum ficheiro: depois de um reinício recebe-as de novo ao ligar-se, antes da sua primeira tarefa.

Um RTE em modo base de dados (obsoleto) não tem socket: lê estas definições das suas próprias variáveis, e o separador indica-o.

---

## Testar ligação

Os botões no canto superior direito atuam sobre o runner tal como está guardado.

Ao lado de **Guardar** estão **Testar ligação** e **Eliminar**, e no separador Credenciais **Adicionar credencial**, que cria uma credencial do
tipo do runner e a escolhe. Um token ou uma palavra-passe nunca voltam a ser mostrados depois de guardados: altere-os na credencial.

**Testar ligação** verifica que o runner responde e aceita o seu token ou acesso, e indica-o numa mensagem: **Runner connection is
OK**, ou porque falhou. Não corre nenhuma tarefa. Para um RTE verifica também o contrato que o RTE fala (consulte
[O contrato](../rte/images.html#the-contract)):

| RTE | O que o teste lê | Quando falha |
|---|---|---|
| Saída ou Entrada | Quem tem o seu socket, tal como cada nó da aplicação o regista, e o que o RTE disse quando se ligou. Não chama nada | Nenhum nó da aplicação tem um socket para ele: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, ou para um de entrada, *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. Ou o RTE fala outro contrato que não o 3 |
| Base de dados (obsoleto) | O `/rte/v1/health` do RTE, chamado com o seu token | O RTE não responde no seu endereço, recusa o token, ou fala outro contrato que não o 2 |

O distintivo **Ligação** do separador RTE mostra o mesmo estado do socket sem um teste.
