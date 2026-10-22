---
layout: default
title: Linhas de listas
parent: Validação no lançamento
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Linhas de listas
{: .no_toc }

Como são validadas as linhas dos campos list
{: .fs-6 .fw-300 }

---

Um campo `list` contém linhas; cada linha é uma instância do seu subformulário, preenchida através do editor
de linhas. Um campo `yaml` com um `subform` é uma dessas linhas. O servidor trata-as da mesma forma
que o editor de linhas do navegador: cada linha é resolvida através do seu subformulário, com os valores do formulário
como `__parent__`, as suas regras verificadas e os seus campos calculados avaliados. As listas aninhadas funcionam da
mesma forma: na própria lista de uma linha, `$(__parent__.__parent__.x)` chega ao formulário.

As linhas são verificadas da seguinte forma:

- **Uma linha que o utilizador acrescentou ou editou** no editor é resolvida e validada.
- **Uma linha em que ninguém mexeu**, produzida pelo próprio default, expressão ou consulta da lista
  (como as entradas existentes de uma lista de ACL), passa **exatamente como veio**, tal como no
  navegador: não é revalidada e não se lhe acrescenta nada. Uma entrada existente que viole uma regra
  escrita mais tarde não impede o lançamento.
- **Uma linha marcada como eliminada** (o `deleteMarker` da lista) é mantida tal como está e não é validada.

Para distinguir estas linhas sem confiar no pedido, o servidor volta a executar a própria
fonte da lista (o seu default, ou então a sua expressão ou consulta) sob a validação no lançamento. Uma linha
que não passou pelo editor só passa sem alterações **quando é uma das linhas que essa
fonte produz**. Qualquer outra linha, como uma inventada por quem chama a API REST, é resolvida e
validada como uma linha editada. Assim, uma linha simples não consegue contornar as verificações, enquanto as
linhas do navegador em que ninguém mexeu continuam a passar sem alterações.

Um utilizador do navegador só nota isto num caso: os dados da fonte mudaram entre a abertura do
formulário e o seu lançamento (uma entrada foi alterada ou removida entretanto), **e** essa linha
viola uma regra do seu subformulário. A linha deixa então de contar como uma das linhas da fonte, pelo que
é validada, e o lançamento é recusado com a linha indicada, por exemplo
`acls[2].user_or_group (regex)`.

As linhas que falham aparecem em `rowErrors` com o seu `index` (um campo `yaml` não tem) e no registo como
`disks[1].size (maxValue)`.

Um lançamento pode conter no máximo **500 linhas** em todos os níveis de aninhamento, já que cada linha executa as consultas do seu subformulário.

---

## Marcadores de linhas

Os marcadores que uma lista coloca nas suas linhas (`insertMarker`, `updateMarker` e `deleteMarker`; sem
`insertMarker`, as linhas novas recebem `__inserted__` quando a lista define `allowDelete: false`, um `deleteMarker` ou um `updateMarker`)
chegam ao playbook em todas as linhas que tenham um. Uma linha removida é enviada com o seu marcador de
eliminação, para que o playbook a possa remover. Antes da 6.4.1, uma linha de lista só levava um marcador quando o seu
subformulário o declarava como campo (oculto).
