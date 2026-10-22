---
layout: default
title: Relançar
parent: Validação no lançamento
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# Relançar
{: .no_toc }

Como é validada uma tarefa relançada
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Uma tarefa pode ser relançada de duas formas. A forma como o relançamento é verificado depende de qual delas, e do modo de validação
no lançamento.

---

## Dois tipos de relançamento

Os dois tipos diferem em se quem chama envia ou não valores novos:

* **Tal como foi executada**: o botão Relançar, `POST /api/v2/job/{id}/relaunch` sem corpo, ou `relaunch_job` sem
  `values`.
* **Com alterações**: as mesmas chamadas com valores novos, aplicados por cima dos valores dos campos guardados da tarefa:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Como cada um é verificado

O modo de validação no lançamento decide se um relançamento é repetido tal como estava ou verificado de novo:

| Relançamento | `off` / `log` | `enforce` |
|---|---|---|
| **Tal como foi executada** | repete as extravars guardadas da tarefa, palavras-passe incluídas | a verificação completa, a partir dos valores dos campos guardados |
| **Com alterações** | a verificação completa, sobre os valores guardados com as alterações aplicadas por cima | a verificação completa, da mesma forma |

Uma exceção com `enforce`: uma tarefa lançada por um agendamento de nível de administrador não tem valores de campos próprios, por isso relançá-la tal como foi executada
repete as extravars guardadas do agendamento, para um administrador ou para um utilizador com a opção de função `allowScheduledJobs`.

Um relançamento verificado (ver [Registar e impor](log-and-enforce.html)) inicia uma nova tarefa em nome de quem chama.

---

## Campos de palavra-passe

Os valores dos campos guardados não contêm palavras-passe, pelo que um relançamento verificado não tem nenhuma para um **campo de palavra-passe visível**:

* O relançamento é recusado como `unsupported`, com os `passwordFields` que lhe faltam.
* Lance de novo o formulário e introduza a palavra-passe.
* Um campo de palavra-passe que as dependências do formulário **ocultam** não é necessário e não bloqueia o relançamento.

Com `enforce`, isto aplica-se também ao botão Relançar.

---

## Quem pode relançar

Ambos os tipos de relançamento exigem:

* que o formulário permita relançar (`allowRelaunch`, verdadeiro por predefinição);
* a opção de função `allowJobRelaunch`;
* que o utilizador seja **o dono da tarefa**, um administrador, ou um utilizador com a opção de função `manageAllJobs`.

Ver todas as tarefas (`showAllJobLogs`) não chega para relançar a tarefa de outro utilizador. Os aprovadores podem ver uma tarefa que aguarda a sua
aprovação, mas também não a podem relançar.
