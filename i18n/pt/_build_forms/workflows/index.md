---
layout: default
title: Workflows
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflows
{: .no_toc }

Encadear playbooks, aprovações e outros workflows, como faz o AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para autores de formulários: o que é um workflow, como correm os seus nós e onde continuar a ler.

Um workflow é um grafo de nós. Cada nó executa algo: um dos playbooks do designer, outro workflow, uma aprovação
ou um pull de repositório. As ligações entre os nós dizem o que corre a seguir, em caso de sucesso, em caso de falha ou sempre. Um formulário
do [tipo `workflow`](../forms/workflow.html) lança-o, e a página de tarefas desenha-o em direto enquanto corre.

Os workflows seguem a sintaxe e as regras do AWX, pelo que um workflow exportado do AWX lê-se da mesma forma no AnsibleForms. Correm
no RTE, sem AWX: um nó de playbook é uma tarefa própria, com o inventário, as credenciais, o limite e as etiquetas do nó.

---

## Como corre um workflow

Os nós correm segundo as regras do AWX, e os ramos que não dependem uns dos outros correm lado a lado.

- **Um nó sem pai arranca de imediato**, quando o workflow arranca.
- **Uma ligação dispara quando o seu nó terminou**: uma ligação *em caso de sucesso* depois de um sucesso, uma ligação *em caso de falha* depois de uma falha,
  uma ligação *sempre* depois de qualquer um dos dois. Um nó cancelado não dispara nenhuma das suas ligações.
- **Um nó arranca assim que uma ligação para ele dispara.** Com **Todos os pais têm de convergir** ligado, espera até que todas as ligações
  para ele tenham disparado.
- **Um nó que já não pode arrancar é marcado como *não corre***, tal como os nós que só ele podia arrancar.
- **O workflow falha quando um nó falhou e nada trata dessa falha**: esse nó não tem nenhuma ligação *em caso de falha* nem *sempre*.
  Uma falha que uma ligação trata não faz falhar o workflow.

Um nó com uma condição (`if_extra_var`) que não se cumpre é saltado. O que vem a seguir corre como depois de um sucesso. Um nó de
aprovação não aceita condição: espera sempre por uma resposta.

---

## Passar dados entre nós

O que o playbook de um nó recolhe com `set_stats` chega aos nós seguintes como extra vars, da mesma forma que o AWX passa os
artefactos de uma tarefa. Um nó recebe os dados de cada pai cuja ligação para ele disparou, juntados pela ordem em que os pais estão
escritos, e passa adiante o que recebeu mais os dados da sua própria tarefa, ganhando os seus quando ambos definem a mesma chave.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Um nó seguinte lê então {% raw %}`{{ version }}` e `{{ build_id }}`{% endraw %} como qualquer outra extra var.

As extra vars de um nó vêm de quatro sítios. Um deles, `extra_data`, são as variáveis próprias do nó: o nome que o AWX lhes dá,
definidas no nó no [ficheiro do workflow](file.html#run-settings). Quando dois definem a mesma chave, a ordem de precedência é
a do AWX, da mais baixa para a mais alta:

| Origem | Prevalece sobre |
|---|---|
| as variáveis próprias do nó (`extra_data`) | nada |
| os dados passados com `set_stats` | o `extra_data` do nó |
| as `extra_vars` do workflow | os dados passados |
| os valores do formulário | tudo |

- Só são passados os dados de todo o playbook: `set_stats` com `per_host: false`, a sua predefinição.
- Um nó de aprovação, um nó saltado e um nó de projeto passam adiante o que lhes chegou.
- O resultado de um nó termina com as chaves que passou adiante, só pelo nome, pois os seus valores podem ser secretos.
- A tarefa do nó guarda os seus dados como artefactos (**Mostrar artefactos** na sua página), e a tarefa do workflow guarda os dados de todos os seus
  nós, pelo que um workflow aninhado também os passa aos nós que vêm depois dele.
- Um nó que corre num runner AWX passa adiante os artefactos da sua tarefa AWX da mesma forma.
---

## Nesta secção

As páginas seguintes descrevem os workflows em detalhe:

| Página | O que abrange |
|---|---|
| [O ficheiro do workflow](file.html) | A sintaxe do ficheiro, os tipos de nó e as definições de execução de cada nó |
| [Editar no designer](designer.html) | A secção Fluxos de trabalho do designer: o grafo, os diálogos de nó e de ligação e o ensaio |
| [Executar um workflow](running.html) | O formulário que o lança, a página da tarefa, os resultados dos nós, as aprovações e a interrupção |
