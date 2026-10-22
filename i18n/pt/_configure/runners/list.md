---
layout: default
title: A página de runners
parent: Runners
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# A página de runners
{: .no_toc }

A lista de runners, adicionar um, ativar ou desativar um, e o predefinido de cada tipo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A lista

A página em **Ligações > Runners** lista todos os runners com estas colunas:

| Coluna | Significado |
|---|---|
| Ativado | Se recebe tarefas. Um runner desativado não recebe nenhuma tarefa, mesmo sendo o predefinido do seu tipo. |
| Nome | Como os formulários se referem a ele, com `runner: <name>`. |
| Tipo | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck ou Jenkins. O runner predefinido do seu tipo tem uma pílula **Predefinido** a seguir. |
| Descrição | Para que serve. |

**Colunas** acrescenta mais duas, desligadas por predefinição: **Modo**, o modo de um RTE (Saída, Entrada ou Base de dados (obsoleto), consulte
[Modos](../rte/modes.html)), e **Ligação**, se um nó da aplicação tem um socket para um RTE num modo socket: **Ligado** ou
**Não ligado**.

A partir da 7.3.0, os runners a aguardar aprovação não estão na lista mas num aviso acima dela, consulte [Aprovar um RTE](registration.html#approving-an-rte).
**Adicionar runner** abre uma caixa de diálogo em passos: **Runner** (nome e descrição), **Tipo** e **Credenciais**, com um passo **Modo** depois de
**Tipo** para um RTE (Saída, a predefinição para um novo, Entrada ou Base de dados (obsoleto)): quatro passos para um RTE, três para os
outros. No passo **Tipo**, cada produto tem uma dica: a do RTE dá o seu nome completo, *Ambiente de execução*. Uma linha abre a página
própria do runner, e o seu menu oferece:

| Ação | O que faz |
|---|---|
| Editar | Abre a sua página |
| Testar ligação | Verifica que responde e aceita a sua credencial, consulte [Testar ligação](runner-page.html#test-connection) |
| Ativar, Desativar | Ativa-o ou desativa-o, conforme não esteja |
| Alterar credenciais | Abre o separador Credenciais da sua página |
| Eliminar | Remove-o |

---

## Predefinido e Ativado

O predefinido de cada tipo é onde correm os formulários desse tipo quando não nomeiam nenhum runner:

| Predefinido para | Onde correm estes formulários quando não nomeiam nenhum runner |
|---|---|
| Formulários de playbook | Formulários `ansible`, num RTE |
| Formulários AWX, AAP e Ascender | Formulários `awx`, `aap` e `ascender`, num runner AWX |
| Formulários Semaphore | Formulários `semaphore` |
| Formulários Rundeck | Formulários `rundeck` |
| Formulários Jenkins | Formulários `jenkins` |

O primeiro runner de um tipo torna-se o seu predefinido, por isso um único runner por tipo não precisa de nenhum passo extra. Para tornar outro runner o predefinido,
ligue o interruptor **É predefinido** na sua página (consulte [A página de um runner](runner-page.html)).

Um runner desativado continua listado com as suas definições, mas nenhuma tarefa vai para ele, nem como predefinido do seu tipo. Uma tarefa para ele falha com
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Ative-o ou desative-o com **Ativar** ou **Desativar** no menu da sua linha, ou com o interruptor **Ativado** na sua página. Um runner novo fica ativado, e os
runners que existiam antes da 7.3.0 ficam ativados depois da atualização. O [config seed](../seed/example.html) pode desativar um com
`enabled: false`.
