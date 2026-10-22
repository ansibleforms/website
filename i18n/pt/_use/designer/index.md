---
layout: default
title: Designer
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: 77ea52f327e41f36adaf3be7d2b50c1d1716bcb6
---

# Designer
{: .no_toc }

Editar formulários, playbooks, inventários e workflows no navegador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para autores de formulários: as secções do designer, e o que mostra cada um dos seus separadores.

O designer precisa da [opção de função](../config/roles.html#role-options) `showDesigner`. Edita um item de cada vez, um
formulário, um playbook ou um ficheiro de workflow, com as suas secções no menu da esquerda. Cada tipo de ficheiro precisa também da sua própria opção, todas
ligadas por predefinição: `allowPlaybookDesign` para os **Playbooks**, `allowWorkflowDesign` para os **Fluxos de trabalho**,
`allowInventoryDesign` para os **Inventários** e `allowVarsFileDesign` para os **Ficheiros de variáveis**. Sem uma delas, a sua secção fica
só de leitura e o servidor recusa-se a guardar, criar, remover ou enviar (push) os seus ficheiros; os formulários e os workflows continuam a poder escolhê-los. Os
**Formulários**, as **Categorias** e as **Constantes** precisam de `allowFormDesign` da mesma forma: sem ela ficam só de leitura, e o servidor
recusa-se a guardá-los, a fazer pull ou a enviá-los. Só uma pessoa edita de cada vez: ver [O bloqueio do designer](lock.html).

---

## As suas secções

Cada secção edita um tipo de ficheiro, guardado localmente ou num [repositório](../repositories/):

| Secção | O que edita |
|---|---|
| **Formulários** | Os ficheiros de formulários |
| **Categorias** | As categorias do `config.yaml` |
| **Constantes** | As constantes do `config.yaml` |
| **Ficheiros de variáveis** | Os ficheiros de variáveis que os formulários carregam |
| **Playbooks** | Os playbooks que os formulários e os workflows executam |
| **Inventários** | Os inventários: `inventory.yaml`, `group_vars` e `host_vars` |
| **Fluxos de trabalho** | Os ficheiros de [workflow](../workflows/) |

As secções com ficheiros listam-nos num explorador de ficheiros e abrem o primeiro; uma secção ainda sem ficheiros indica-o. A
secção **Formulários** e todas as secções de ficheiros têm um botão **Novo ficheiro** em primeiro lugar na sua barra de ferramentas: nos Inventários cria um novo
inventário, nos Fluxos de trabalho um workflow novo e vazio. A lupa do explorador abre uma caixa que filtra os seus ficheiros pelo nome.

A caixa de pesquisa na linha do título encontra um texto no YAML que está aberto: marca todos os sítios onde aparece. Funciona no
separador **YAML**, depois de o bloqueio do designer ser seu.

---

## Os seus separadores

Todas as secções têm os mesmos três separadores, todos sobre o mesmo YAML: uma edição num aparece nos outros, e **Guardar** guarda-a.

- **YAML** é o ficheiro tal como está escrito.
- **Visual** edita-o com campos. Só mudam as chaves em que uma edição toca, pelo que os comentários e o resto ficam como estavam escritos.
- **Pré-visualização** mostra o que faz, e não edita nada.

O que mostram os separadores Visual e Pré-visualização, secção a secção:

| Secção | Visual | Pré-visualização |
|---|---|---|
| **Formulários** | As definições do formulário e os seus campos, com listas dos playbooks, inventários e workflows do designer | O formulário tal como está agora, incluindo as edições não guardadas; o seu envio não executa nada |
| **Categorias** | As categorias como tabela, editadas | O menu da página Formulários, construído a partir delas |
| **Constantes** | As constantes como estrutura em árvore, editadas (uma chave move-se com as teclas de seta) | Cada constante com a sua referência, `$(NAME)`, para copiar, e os formulários que a usam |
| **Ficheiros de variáveis** | As variáveis, editadas | Cada variável com a sua referência num playbook, {% raw %}`{{ name }}`{% endraw %}, para copiar, e os formulários que carregam o ficheiro |
| **Playbooks** | Os plays: o nome, os hosts, **Become**, **Recolher facts** e as roles de cada play, e as suas tarefas, cada uma com o seu módulo e argumentos | A estrutura do playbook: os seus plays, com os seus hosts, roles e tarefas, e os playbooks que importa |
| **Inventários** | Os grupos, os seus grupos filhos, os seus hosts e as variáveis que cada um define | O inventário como árvore, com os seus `group_vars` e `host_vars` |
| **Fluxos de trabalho** | O grafo do workflow, para o [editar](../workflows/designer.html) | Um [ensaio](../workflows/designer.html#trying-it-out): clique num nó para o fazer falhar |

Quando o YAML não pode ser lido, os separadores Visual e Pré-visualização dizem porquê, com **Ver em YAML** para abrir o YAML na linha.
