---
layout: default
title: Tipos de runner
parent: Runners
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# Tipos de runner
{: .no_toc }

Os produtos que um runner pode ser, o seu endereço e o seu acesso
{: .fs-6 .fw-300 }

O passo **Tipo** oferece uma opção por produto, cada uma com uma dica; a do RTE escreve o seu nome por extenso, *Ambiente de execução*. O AAP e o
Ascender são guardados como um runner do tipo `awx` com uma variante (`aap` ou `ascender`), que é também o que o config seed usa:

| Tipo | Exemplo de Uri | Projeto | Autenticação |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | O `RTE_TOKEN` do RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Um token de API, ou um utilizador e uma palavra-passe |
| Ascender | `https://ascender.example.com/api/v2` | | Um token de API, ou um utilizador e uma palavra-passe |
| AWX | `https://awx.example.com/api/v2` | | Um token de API, ou um utilizador e uma palavra-passe |
| Jenkins | `https://jenkins.example.com` | A pasta onde estão os jobs (opcional) | Um utilizador e o token de API desse utilizador |
| Rundeck | `https://rundeck.example.com` | O nome do projeto | O token de API de um utilizador |
| Semaphore | `https://semaphore.example.com` | O id do projeto, o número em `/project/<id>` | O token de API de um utilizador |

Um endereço de AWX, AAP ou Ascender leva o seu caminho de API: `/api/v2`, ou `/api/controller/v2` para o AAP 2.5 e posteriores.
Um RTE é a imagem do AnsibleForms arrancada com `AF_ROLE=rte`; como correr um está descrito em
[Ambientes de execução](../rte/).
