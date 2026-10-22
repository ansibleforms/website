---
layout: default
title: Executar um workflow
parent: Workflows
nav_order: 3
translated_from: 1883c268cde716170bdb84c7f2df49e9122dc55d
---

# Executar um workflow
{: .no_toc }

Lançar um workflow a partir de um formulário e acompanhá-lo na página de tarefas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O formulário

Um formulário do [tipo `workflow`](../forms/workflow.html) lança um workflow, indicado com `workflow:` tal como se faz com um playbook: pelo
seu **ficheiro** na pasta de workflows, com as suas subpastas (`team/deploy-app.yml`), ou pelo **nome** do workflow dentro
do ficheiro (`deploy-app`):

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

Os campos do formulário chegam a todos os nós como extra vars, e o mesmo acontece com as suas [`credentials`](../forms/workflow.html#workflow_credentials), com os nomes
que o formulário lhes dá, tal como as de um formulário multistep chegam aos seus passos:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

As credenciais próprias de um nó, definidas no ficheiro do workflow, chegam ao seu playbook com o seu próprio nome e prevalecem quando ambos usam o mesmo nome. No separador Visual de um formulário no designer, **Workflow** é uma lista dos
ficheiros de workflow do designer.

Um nome de ficheiro sozinho também é encontrado numa subpasta, quando só um ficheiro o tem. Dois workflows com o mesmo nome travam um formulário que
o indique pelo nome, e o designer avisa quando guarda o segundo: mude o nome de um deles, ou indique o seu ficheiro. Um workflow que não pode ser
encontrado termina a tarefa como falhada, com o motivo no seu resultado.

---

## A tarefa

Uma tarefa de workflow corre no servidor do AnsibleForms, e cada nó de playbook corre como uma tarefa própria, filha da tarefa
do workflow, tal como os passos de um formulário multistep: um playbook do designer no RTE ou, para um nó com `runner:`, o
modelo ou job desse runner em AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins (ver [Onde corre um nó](designer.html#where-a-node-runs)).

A página da tarefa desenha o workflow em direto: cada nó com a cor do seu estado, as ligações que dispararam e os nós que não
vão correr. Os dados no topo indicam o workflow em vez de um playbook.

- **Clique num nó** que terminou para abrir o seu resultado num diálogo.
- **O resultado** contém o resultado de cada nó sob um cabeçalho `WORKFLOW NODE [identifier] (status)`, pela ordem em que os nós
  terminaram.
- **Mostrar extravars** e **Mostrar artefactos**, no cabeçalho de cada nó no resultado e no diálogo aberto a partir do grafo,
  mostram as extravars e os artefactos próprios desse nó (`{}` quando não tem nenhum), em JSON ou YAML, com um botão Copiar.

As extravars de um nó contêm o que os nós anteriores lhe passaram, e os seus artefactos o que o seu playbook recolheu com
`set_stats`. Os dois botões seguem as [opções de função](../config/roles.html#role-options) `showExtravars` e
`showArtifacts`. Os mesmos dados vêm de `GET /api/v2/job/{id}/node/{nodeId}`, para quem possa ver a tarefa.

A tarefa falha quando um nó falhou e nada tratou essa falha, segundo a regra do AWX; caso contrário, tem sucesso.

---

## Aprovações

Um nó de aprovação retém a tarefa do workflow até alguém lhe responder.

Quando o workflow chega a um nó de aprovação, o estado da tarefa passa a **À espera de aprovação**: aparece no sino e na
página da tarefa, como um [ponto de aprovação](../forms/approval.html) de um formulário. O nome do nó é o título da aprovação e a sua descrição
a mensagem; o resto vem do `approval` do formulário:

- os seus `roles` decidem quem a pode aprovar ou rejeitar, e `allowSelf` se quem lançou também a pode aprovar;
- o pedido é enviado para as suas `notifications` e os seus `channels`.

Um formulário de workflow sem `approval` também retém a tarefa num nó de aprovação, mas aí só um administrador a pode aprovar.

- **Aprovada**, o nó tem sucesso e o workflow continua pelas suas ligações *em caso de sucesso*.
- **Rejeitada**, o nó falha e o workflow continua pelas suas ligações *em caso de falha*.
- **Expirada**, depois do tempo limite do nó sem resposta, o nó também falha.

---

## Interromper

**Interromper** numa tarefa de workflow em execução para-a: as tarefas dos nós em execução são interrompidas, não arranca mais nada, e uma aprovação de que
esteja à espera é cancelada. Uma tarefa de workflow à espera de uma aprovação também pode ser interrompida.
