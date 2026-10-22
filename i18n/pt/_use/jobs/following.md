---
layout: default
title: Acompanhar uma tarefa
parent: Tarefas
nav_order: 2
translated_from: 3beb53d60eeac0e108e31a8dabf2877ab15d2126
---

# Acompanhar uma tarefa
{: .no_toc }

Resultado em direto, extravars, filtros e transferências
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Acompanhar uma tarefa

Clicar numa tarefa abre a sua página: o formulário da tarefa como título, as suas ações no cabeçalho e o seu resultado por baixo.

![O resultado de uma tarefa](../assets/screenshots/job-output.jpg)

A partir da 7.3.0, a página é feita de cartões, e cada um recolhe-se sob o seu cabeçalho:

| Cartão | O que mostra |
|---|---|
| **Resumo** | O nome, o estado e o tipo da tarefa como cabeçalho, e os seus dados por baixo numa grelha de três colunas (duas, e depois uma, numa página estreita) |
| **Fluxo de trabalho** | Para uma tarefa de workflow, e também uma tarefa de workflow de AWX ou AAP, o seu grafo e o seu número de nós (ver [O grafo do workflow](#the-workflow-graph)) |
| **Saída** | O resultado da tarefa e a sua barra de ferramentas |

Uma tarefa que correu em AWX, AAP, Ascender, Jenkins, Semaphore ou Rundeck mostra aí o seu número como uma ligação para a sua página nessa ferramenta, aberta
num novo separador. A ligação fica guardada na tarefa, pelo que continua a funcionar quando o runner é renomeado ou removido mais tarde.

A página atualiza-se em direto: o servidor envia um evento sempre que uma tarefa é lançada, muda de estado, escreve resultado ou é
eliminada, e a página lê de novo a tarefa, pelo que o resultado cresce à medida que a tarefa o escreve. A lista de tarefas atualiza-se da mesma forma.
**Atualizar** recarrega a tarefa manualmente.

Enquanto estiver no fim do resultado, a página acompanha-o para baixo à medida que chegam novas linhas. Desloque-se para cima para ler uma linha anterior
e a página fica onde está: aparece então **Ir para as mais recentes** sobre o fundo do resultado, que passa a **Linhas novas** quando
chegarem mais. Clique nele, ou desloque-se de novo até ao fim, para voltar a acompanhar as linhas novas. O resultado na página do formulário, depois de
**Submeter**, e o [registo do servidor](../production/logs.html) acompanham as suas linhas novas da mesma forma.

A barra de ferramentas do resultado tem:

| Botão | O que faz |
|---|---|
| **Mostrar extravars** | Mostra as extravars com que a tarefa correu num painel sobre o resultado, com um seletor **JSON** / **YAML** e **Copiar** |
| **Mostrar artefactos** | Mostra os artefactos da tarefa no mesmo painel (ver abaixo) |
| **Mostrar parâmetros** | Ocupa o lugar de **Mostrar extravars** numa tarefa de Jenkins: os valores com que correu, os seus parâmetros de build |
| **Mostrar payload** | Ocupa o lugar de **Mostrar extravars** numa tarefa de Rundeck: o payload que lhe foi enviado |
| **Hosts e tarefas** | Mostra os hosts e as tarefas de um playbook sobre o seu resultado (ver [Hosts e tarefas](#hosts-and-tasks)) |
| **Atualizar** | Recarrega o resultado |
| **Aplicar filtro** | Oculta as tarefas cujo nome corresponde ao filtro do resultado; **Remover filtro** volta a mostrá-las |
| **Copiar resultado** | Copia o resultado como texto simples, com ou sem o filtro aplicado |
| **Transferir resultado** | Transfere o resultado como `ansibleforms-job-<id>.txt` |

**Mostrar artefactos** é oferecido para todas as tarefas que não sejam de template, como um playbook no RTE ou um workflow (vazio quando
os seus playbooks não recolheram artefactos com `set_stats`), e para uma tarefa de template que correu em AWX, AAP ou Ascender. As tarefas de Semaphore, Rundeck
e Jenkins não têm artefactos, por isso nunca é oferecido para elas.

À esquerda da barra de ferramentas, o botão **Recolher tudo** recolhe todas as secções do resultado (cada play e cada tarefa) e passa a
**Expandir tudo**, que as volta a expandir.

**Mostrar extravars** exige a opção de função `showExtravars` e **Mostrar artefactos** a opção de função `showArtifacts` (ver
[opções de função](../config/roles.html#role-options)). Os valores dos campos de palavra-passe e das chaves que correspondem a
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) são ocultados.

O filtro é definido por [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), `\[low\]` por
predefinição. Ponha `[low]` no nome de uma tarefa ruidosa, e **Aplicar filtro** oculta essa tarefa e as suas linhas.

A página de uma tarefa multistep mostra todos os passos por baixo da tarefa principal, um por baixo do outro, cada um sob uma barra de título como
**Passo 1 · Prepare the server (id da tarefa 98)** com o seu estado. Clique num título (ou carregue em Enter ou Espaço sobre ele) para recolher esse resultado,
e de novo para o expandir. Os workflows de AWX/AAP mostram também o estado dos seus nós.

As tarefas de [workflow](../workflows/running.html#the-job) guardam o resultado de cada nó no seu próprio, sob um cabeçalho `WORKFLOW NODE` por
nó; desenham o seu grafo, em direto, e um clique num nó abre o seu resultado.

---

## Procurar um texto no resultado

A partir da 7.3.0, a página da tarefa tem uma caixa de pesquisa, **Procurar na saída**, na sua linha de título, à esquerda das ações da tarefa.

Cada sítio onde o texto aparece no resultado é destacado, sem distinguir maiúsculas de minúsculas, e a página desloca-se até ao primeiro. **Enter** vai para
o seguinte, mostrado com mais destaque, e a barra de ferramentas diz qual de quantos (**2 de 4**), ou **Não encontrado**. A pesquisa expande primeiro o resultado e
as suas secções, e enquanto a tarefa corre as linhas novas também são pesquisadas, sem deslocar a página.

---

## Percorrer um resultado longo

A partir da 7.3.0, um resultado longo, na página da tarefa e por baixo de um formulário depois de **Submeter**, tem estas formas de o percorrer:

| Controlo | O que faz |
|---|---|
| Cabeçalhos fixos | O cabeçalho de uma secção (um nó de workflow, o playbook da tarefa, o passo de uma tarefa multistep) fica no topo enquanto as suas linhas passam |
| **2 falhadas** | Conta as tarefas falhadas, deixando de fora as falhas que o Ansible foi instruído a ignorar; cada clique vai para a seguinte, expandida e destacada. Sem tarefas falhadas, **1 erro** conta antes as linhas de erro |
| Números de linha | Cada número de linha é uma ligação para a sua linha, como `#L45` no endereço: abrir esse endereço desloca até à linha e destaca-a |
| Botões para cima e para baixo | Mostrados no canto inferior direito depois de a página ser deslocada, para voltar ao topo ou ir para o fim |
| **Em execução** e **Interromper** | Enquanto a tarefa corre, a barra da página do formulário fica presa ao fundo da janela, e **Interromper** aí para a tarefa de imediato |

---

## Resultados das tarefas

A partir da 7.3.0, a linha de resultado de um host no resultado de um playbook abre esse resultado num diálogo **Resultado da tarefa**, como faz o AWX.

A linha, o corpo do resultado a seguir a ela (`=> { ... }`) e o erro escrito antes de um resultado falhado destacam-se como um só bloco ao passar o rato, e um
clique abre o diálogo. Funciona na página da tarefa e por baixo de um formulário depois de **Submeter**, para um playbook que correu num RTE da 7.3.0 ou
posterior, já que o resultado vem dos mesmos eventos que [Hosts e tarefas](#hosts-and-tasks). O diálogo tem estes separadores:

| Separador | O que mostra |
|---|---|
| **Detalhes** | O estado, o host, o play, a tarefa, o módulo, o item do ciclo, a hora de início, a duração, o código de retorno e a mensagem |
| **JSON** e **YAML** | O resultado completo do módulo, colorido e com as linhas numeradas |
| **Saída padrão** e **Erro padrão** | O `stdout` e o `stderr` do resultado, quando os tem |

O resultado completo, e com ele os separadores **JSON**, **YAML** e de saída, só é guardado quando a tarefa corre em modo verbose, já que o resultado
também o mostra nesse caso; caso contrário, o diálogo mostra só os detalhes. Mesmo em modo verbose, os argumentos do módulo (`invocation`) ficam
de fora, os valores das chaves que se parecem com um segredo são ocultados, e um resultado é cortado quando ultrapassa 64 KB de JSON.

---

## O grafo do workflow

A partir da 7.3.0, o grafo de um workflow em execução desliza para manter à vista o nó em execução.

Desloque o grafo para outro lado e ele fica onde o deixou, com um botão **Seguir o nó em execução** para o voltar a seguir. Passar o rato sobre um nó
mostra o seu cartão com o nome completo e coloca em foco o nó e as suas ligações, com o resto do grafo esbatido. O grafo tem os botões **Ajustar ao
ecrã** e **Ecrã inteiro**, e por baixo de um formulário depois de **Submeter** um clique num nó abre o seu resultado tal como na página da tarefa.

---

## Hosts e tarefas

Desde a 7.3.0, uma tarefa de playbook que correu num RTE da 7.3.0 ou posterior regista os seus eventos estruturados ao lado do seu resultado em texto: cada play, tarefa
e resultado de host, e o resumo final. **Hosts e tarefas**, na barra de ferramentas do resultado, mostra-os num painel sobre o resultado, na página da tarefa e
por baixo de um formulário depois de **Submeter**. É oferecido assim que a tarefa tem eventos, e o painel é lido de novo a cada poucos segundos enquanto a tarefa corre:

| Vista | O que mostra |
|---|---|
| **Grelha** | O resumo por host (ok, alterados, falhados, inacessíveis, saltados, recuperados, ignorados), e depois uma grelha de hosts por tarefas: cada célula tem a cor do resultado do host nessa tarefa, com a sua mensagem e tempo ao passar o rato, ou *não executada* |
| **Cronologia** | Cada tarefa como uma barra, tão longa quanto demorou o seu host mais lento, com o seu tempo em segundos e o total |

O resultado em texto fica como está. Os eventos são escritos pelo próprio plugin de callback `af_events` do RTE, pelo que o playbook não precisa de nenhuma alteração.
