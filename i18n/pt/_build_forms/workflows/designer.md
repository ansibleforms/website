---
layout: default
title: Editar no designer
parent: Workflows
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Editar no designer
{: .no_toc }

Desenhar um workflow e experimentá-lo sem executar nada
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A secção Fluxos de trabalho

**Designer > Fluxos de trabalho** lista os ficheiros de workflow num explorador de ficheiros, com os separadores YAML, Visual e Pré-visualização de todas as
secções do [designer](../designer/).

- **O botão `+`** da barra de ferramentas cria um ficheiro de workflow, com um workflow vazio para começar.
- **YAML** mostra o ficheiro tal como está escrito. Os comentários e a ordem das chaves também são mantidos pelos outros separadores.
- **Visual** desenha cada workflow do ficheiro como um grafo, com o seu nome e descrição por cima. Um ficheiro com dois workflows
  mostra ambos, um por baixo do outro.
- **Pré-visualização** é um ensaio do workflow: ver [Experimentá-lo](#trying-it-out).

Os problemas são listados por cima do grafo, cada um com uma ligação que abre o YAML na sua linha: uma ligação a um nó que não
existe, um ciclo, um playbook, inventário, credencial, runner ou repositório que o designer não conhece.

---

## O grafo

O grafo lê-se da esquerda para a direita, de **START** até aos últimos nós. Cada nó mostra o seu identificador e, por baixo, o que
executa; as ligações têm a cor do que as faz disparar, como diz a legenda dentro do grafo: em caso de sucesso, em caso de falha,
sempre.

- **Clique em START** para adicionar um primeiro nó: um nó sem pai, que corre assim que o workflow arranca.
- **Clique num nó** para o editar.
- **Clique numa ligação** para mudar o que a faz disparar, ou para a remover.

---

## Adicionar um nó

Um nó novo é adicionado com um assistente: **Novo nó em caso de sucesso**, **Novo nó em caso de falha** ou **Novo nó sempre** num nó
existente, ou START para um primeiro.

1. **O que executa**: o identificador do nó, **Executa** (que tipo de nó é e, para um nó de playbook, onde corre)
   e o que executa: um playbook ou um modelo ou job, um workflow, o nome e o tempo limite de uma aprovação, ou um repositório. Ver
   [Onde corre um nó](#where-a-node-runs).
2. **Como corre**: as definições de execução: o inventário, as credenciais, o limite, as etiquetas, a verbosidade,
   o modo check e o modo diff, a condição (**Corre quando**) e **Valores de** (ver [o ficheiro do workflow](file.html#run-settings)).
3. **Para onde vai**: o nó depois do qual corre, e em que caso.

**Criar** adiciona o nó ao YAML.

---

## Onde corre um nó

**Executa** diz o que um nó executa e onde, numa só lista: **Playbook no RTE**, **Modelo no AWX**, **Modelo no
Semaphore**, **Job no Rundeck**, **Job no Jenkins** e depois **Workflow**, **Aprovação** e **Pull de repositório**.

| Executa | O campo por baixo | Runner |
|---|---|---|
| **Playbook no RTE** | **Playbook**: um playbook do designer | **O RTE predefinido**, ou um runner RTE pelo nome |
| **Modelo no AWX** (incluindo AAP e Ascender) | **Modelo**: o nome do modelo, escrito à mão | os runners AWX, cada um com a sua variante |
| **Modelo no Semaphore** | **Modelo**: o nome do modelo, escrito à mão | os runners Semaphore |
| **Job no Rundeck** ou **Job no Jenkins** | **Job**: o nome do job, escrito à mão | os runners Rundeck ou Jenkins |

- **Playbook no RTE** é sempre oferecido; os outros só quando a instância tem um [runner](../runners.html) desse tipo.
- **Runner** lista só os runners desse tipo, com o predefinido marcado e pré-selecionado (ou o primeiro por nome).
- Escolher outro sítio limpa o que o nó executa, para que seja escolhido de novo.
- Um nó cujo runner o designer não conhece mostra **Modelo ou job em** esse runner.

O ficheiro do workflow não muda: um nó destes é um nó `job_template` com um `runner:` (ver
[o ficheiro do workflow](file.html#run-settings)).

---

## Editar um nó

Clicar num nó abre o seu diálogo, em quatro separadores:

| Separador | O que contém |
|---|---|
| **O que executa** | O identificador, **Executa**, o que executa e, para um nó de playbook, o runner |
| **Como corre** | As definições de execução; as credenciais escolhem-se de uma lista, cada uma adicionada com `+` |
| **Corre depois de** | As ligações para o nó, e **Todos os pais têm de convergir** |
| **Executa a seguir** | As ligações que saem dele, com **Ligar a um nó existente:** e **Ligar a um novo nó:** |

**Ver em YAML** abre o YAML no nó, e **Remover nó** remove-o com as suas ligações. Cada alteração é escrita no
YAML de imediato; **Guardar** guarda o ficheiro.

---

## Experimentá-lo

O separador **Pré-visualização** percorre o workflow sem lançar nada, segundo as regras do AWX.

Todos os nós começam como sucesso. Clique num nó para o fazer falhar, e clique de novo para o fazer ter sucesso; o grafo mostra então
que nós correriam, quais não correriam e se o workflow falharia. **Repor** faz com que todos os nós voltem a ter sucesso.
