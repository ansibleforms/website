---
layout: default
title: Escalabilidade
parent: Em produção
nav_order: 4
translated_from: 5b76f1bfb7520ff2b072919d714d2ab72b1e5d5e
---

# Escalabilidade
{: .no_toc }

O AnsibleForms dividido por vários nós da aplicação e um worker, ao lado de um ou mais RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Funções

Todos os contentores do AnsibleForms correm o mesmo código de servidor, e [`AF_ROLE`](../customization/server.html#env_AF_ROLE) decide o que fazem:

| `AF_ROLE` | Imagem | Corre | Quantos |
|---|---|---|---|
| `all` (não definida) | `ansibleforms` | A aplicação web e o worker num só processo: a predefinição | 1 |
| `app` | `ansibleforms` | A interface web e a API | Tantos quantos quiser, atrás de um balanceador de carga |
| `worker` | `ansibleforms` | O trabalho em segundo plano: o esquema da base de dados e as suas atualizações, o config seed, os agendamentos, a cópia de segurança noturna, as sincronizações de repositórios e as limpezas | Um a trabalhar; os outros esperam e assumem |
| `rte` | `ansibleforms-rte-full` (ou `-rte-core`, `-rte-base`) | Os playbooks | Tantos quantos quiser |

A instalação mais pequena é um contentor sem `AF_ROLE` ao lado de um RTE: é o que correm o [projeto Docker Compose](../installation/docker-compose.html)
e o [Helm chart](../installation/kubernetes.html). Qualquer outro valor de `AF_ROLE` para o processo no seu arranque.

---

## O RTE

O RTE, o ambiente de execução que corre os playbooks, tem a sua própria secção: [Ambientes de execução](../rte/). Abrange como um RTE
corre uma tarefa, [as suas imagens](../rte/images.html), [como correr um](../rte/run.html), [vários RTE](../rte/several.html) como runners ou
réplicas, e [um RTE noutro centro de dados](../rte/another-datacenter.html).

---

## Vários nós da aplicação

Para servir mais utilizadores, ou para sobreviver à perda de um nó, divida a aplicação em nós `app` atrás de um balanceador de carga e um `worker`.

### O que os nós partilham
{: .no_toc }

Os nós entendem-se entre si através da base de dados e de um volume partilhado:

* **A base de dados** : as tarefas, o bloqueio do worker, o bloqueio do designer, a lista de nós, as leases dos runners (que nó da aplicação tem o
  socket de cada RTE) e os avisos de alteração que mantêm atualizadas as caches de todos os nós. Uma credencial, um runner ou um agendamento editado
  num nó fica em vigor em todos eles em 5 segundos
* **O volume persistente** (`/app/dist/persistent`) : formulários, a configuração, repositórios, ficheiros carregados, cópias de segurança e o `.env` gerido.
  Todos os nós da aplicação e o worker montam o mesmo, em leitura e escrita
* **A pasta ssh** (`/home/node/.ssh`) : a chave e os hosts conhecidos para git por ssh; o worker cria a chave no seu primeiro arranque
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : o mesmo em todos os nós da aplicação, ou um token assinado
  por um nó é recusado pelo seguinte. Um nó da aplicação recusa-se a arrancar sem ele
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : o mesmo em todos os nós da aplicação e no worker, ou uma
  credencial guardada por um não pode ser lida por outro. Um RTE em modo socket nunca o lê; só um RTE obsoleto em modo base de dados
  que se regista a si próprio precisa dele

Dê também o mesmo utilizador de base de dados a todos os contentores: um worker em espera só pode terminar a sessão de um que morreu quando é a sua.

### O bloqueio do worker
{: .no_toc }

Só um worker trabalha de cada vez. Detém o bloqueio de base de dados `ansibleforms_worker`; quando para, a base de dados liberta o bloqueio e um
worker em espera fica com ele em 10 segundos. Quando o host do worker morre sem se despedir, a base de dados podia manter o bloqueio durante horas,
por isso um worker em espera termina essa sessão quando nenhum worker escreveu um heartbeat durante dois minutos, e assume.

Um worker que perde o bloqueio para outro para, e o seu contentor reinicia como o que está em espera. Um worker cujo arranque falha também
para, para nunca manter o bloqueio sem fazer nada. O Galera e a group replication não partilham o bloqueio entre nós da base de dados: aponte todos os
workers para o mesmo nó da base de dados.

### Tarefas e nós
{: .no_toc }

Cada contentor dá a si próprio o nome `<role>-<hostname>-<port>`, sem nada a definir, e a página **Estado** lista-os todos com a sua função
e versão, qual é o worker, e um aviso quando correm versões diferentes.

Uma tarefa a correr num RTE pertence a esse RTE, e continua quando o nó da aplicação que a iniciou desaparece. Qualquer outra tarefa (uma tarefa de template
no AWX ou noutro runner, uma tarefa de workflow, ou os passos de um formulário multistep obsoleto) pertence ao nó da aplicação que a iniciou. Um contentor que reinicia termina as suas próprias tarefas por acabar, e o
worker termina as tarefas de um contentor que deixou de responder durante dois minutos, como um pod substituído.

Um `SIGHUP` enviado a qualquer nó volta a aplicar o [config seed](../seed/): um nó da aplicação pede ao worker que o faça.

### Atualizar
{: .no_toc }

Atualize **primeiro o worker**, depois os nós da aplicação. O worker aplica os patches ao esquema, e um nó da aplicação da versão nova espera até o
esquema estar atualizado e regista aquilo de que está à espera. Os nós da aplicação atualizados primeiro ficam não prontos até o worker os seguir, enquanto os antigos continuam
a servir. Os RTE podem seguir a qualquer momento, desde que falem o mesmo contrato.

### Limites
{: .no_toc }

Algumas coisas ficam presas a um nó:

* **O assistente de chat** mantém as suas conversas na memória de um nó da aplicação: use sticky sessions no balanceador de carga (nginx
  `ip_hash`), ou um único nó da aplicação
* **Os registos** ficam em cada contentor. Defina [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) fora do volume partilhado, porque vários
  processos a rodar o mesmo ficheiro perdem linhas. O visualizador de registos mostra o registo do nó que responde, por isso recolha os registos centralmente
* **As definições** alteradas nas páginas de definições são escritas no `.env` gerido do volume partilhado e aplicam-se em todos os nós; as que
  precisam de reinício precisam dele em todos os nós

---

## Exemplo de disposição

O repositório da aplicação tem um ponto de partida completo em [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale):

| Serviço | Imagem | Função |
|---|---|---|
| `db` | `mariadb:11` | A base de dados, com um utilizador que só tem permissões no esquema `AnsibleForms` |
| `app1`, `app2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=app`, atrás do balanceador de carga |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: o segundo espera e assume |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Corre os playbooks com `RTE_MODE=inbound` e `RTE_FILES=local`: a aplicação liga-se a ele |
| `lb` | `nginx:stable` | Termina o HTTPS na porta 8443 e distribui os navegadores pelos nós da aplicação com `ip_hash` |

O runner `rte` do RTE e a credencial com que inicia sessão (o seu endereço `http://rte:8000` e `RTE_TOKEN`) estão declarados no
[config seed](../seed/) `seed.yaml`, que o worker aplica em cada arranque; o RTE não define `RTE_URL` e não é publicado no host.

Os nós da aplicação e os workers partilham um `.env`, com o utilizador da base de dados, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` atrás do balanceador de carga e um `LOG_PATH` fora do volume partilhado. O RTE não tem `env_file`: recebe
só `RTE_TOKEN` do `compose.yaml`, por isso não contém nenhuma palavra-passe da base de dados. Os nós da aplicação, os workers e o RTE montam os mesmos
volumes persistente e ssh:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
