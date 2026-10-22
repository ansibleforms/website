---
layout: default
title: Vários RTE
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Vários RTE
{: .no_toc }

Quantos playbooks corre um RTE, mais RTE como runners ou réplicas, e o que acontece quando um para ou morre
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Várias tarefas num RTE

Um RTE corre até [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks lado a lado, 10 por
predefinição (`0` significa sem limite). Uma tarefa para um RTE cheio não é reclamada. Num modo socket, a aplicação não a envia enquanto o último
relatório de saúde do RTE não mostrar nenhuma vaga livre, e um RTE que está cheio ou a parar responde `refused` por estar ocupado; em modo base de dados o RTE responde
`503`. Em ambos os casos, a aplicação escreve `Waiting for a free slot on RTE <name>` uma vez na saída e volta a oferecer a tarefa a cada 10 segundos,
durante no máximo [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) (60 por predefinição). Depois a tarefa falha com
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Uma tarefa abortada enquanto espera termina `aborted` sem nunca
chegar ao RTE.

---

## Vários RTE

A aplicação não distribui tarefas pelos runners por si só: cada tarefa vai para um runner, o que o formulário nomeia ou o
predefinido. Mais contentores RTE ajudam de duas formas:

* **Como runners próprios** : cada RTE tem o seu próprio `RTE_NAME` e adere como runner próprio: pede para aderir e um admin
  aprova-o, ou apresenta um join token (consulte [Registo](../runners/registration.html)). Um formulário escolhe um com `runner: <name>`,
  por exemplo um RTE com as collections da VMware, ou um noutra zona de rede; os outros correm no RTE predefinido
* **Como réplicas atrás de um endereço** (só em modo base de dados) : vários contentores RTE com o mesmo `RTE_URL` e o mesmo `RTE_TOKEN`,
  como os pods atrás de um Service do Kubernetes, partilham um runner, e o endereço distribui as chamadas por eles. Uma réplica cheia responde
  `503`, e a tentativa seguinte pode ir parar a outra. A aplicação acompanha uma tarefa pela base de dados, por isso não importa que réplica
  responde às suas chamadas de estado

Num modo socket (consulte [Modos](modes.html)), um runner tem um socket para um RTE, e um segundo RTE que inicia sessão com o mesmo
`RTE_NAME` fica com o socket do primeiro. Dê a cada RTE um nome e um runner próprios, e deixe os formulários escolher entre eles com
`runner:`.

Cada RTE em modo base de dados escreve um heartbeat na base de dados a cada 10 segundos, e um que se regista a si próprio verifica a sua linha de runner a cada
30 segundos. Para um RTE num modo socket, o nó da aplicação que tem o seu socket escreve o heartbeat por ele a cada 20 segundos, enquanto o
socket está aberto. A página **Estado** lista todos os RTE com a sua versão. O worker remove um runner que um RTE em modo base de dados registou
ele próprio quando esse RTE não escreveu nenhum heartbeat durante 10 minutos, e quando o runner predefinido é uma linha dessas cujo RTE parou, o RTE seguinte
que verifica fica com a predefinição. Um runner do config seed, adicionado à mão ou que aderiu por um socket nunca é removido dessa forma.

---

## Quando um RTE para ou morre

**Quando um RTE para.** Com `SIGTERM` (`docker stop`, uma atualização gradual, uma redução de escala) o RTE deixa de aceitar tarefas: `/ready` responde `503`,
e uma tarefa nova é recusada por estar ocupado (`503` em modo base de dados), por isso a aplicação espera, ou em modo base de dados o endereço envia-a para outra
réplica. Os playbooks em execução têm [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) para terminar, 25 por predefinição,
e depois o RTE sai.

**Quando um RTE morre.** Um contentor morto (sem memória, um nó perdido, o fim do tempo de paragem) leva consigo os seus playbooks: nada
os passa para outro RTE, e nada os volta a correr. As suas tarefas terminam como `abandoned`, pelo próprio RTE ou pela aplicação quando ele
volta com o mesmo id, que um contentor reiniciado mantém (`rte-<hostname>-<port>`), ou pelo worker, quando o heartbeat do RTE
tem dois minutos. Verifique nos hosts geridos o que o playbook fez antes de o lançar de novo.

**Enquanto um RTE está em baixo.** Num modo socket, uma tarefa nova para ele espera pelo seu socket, até `RTE_QUEUE_MINUTES` e mais um minuto, e depois
falha com *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
Em modo base de dados falha de imediato com *the RTE at ... is unreachable*, a menos que outra réplica responda no seu endereço.
