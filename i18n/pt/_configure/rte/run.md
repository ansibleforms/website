---
layout: default
title: Correr um RTE
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# Correr um RTE
{: .no_toc }

As definições de cada modo, e como arrancar um RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Definições

O que um RTE precisa depende do seu modo (consulte [Modos](modes.html)). Todos os RTE leem estas:

| Variável | Significado |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Desde a 7.3.0: `outbound` (liga-se à aplicação), `inbound` (a aplicação liga-se a ele) ou `database` (obsoleto, a predefinição em toda a 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | O token entre a aplicação e o RTE, com pelo menos 16 caracteres; o RTE recusa-se a arrancar sem ele |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Quantos playbooks corre ao mesmo tempo, `10` por predefinição (`0` significa sem limite). Uma tarefa para um RTE cheio espera até um playbook terminar |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Ao parar, quanto tempo espera pelos seus playbooks em execução, `25` por predefinição; os que ainda estiverem a correr terminam então como abandonados |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Lida pelos nós da aplicação e pelo worker, não pelo RTE: quanto tempo uma tarefa espera por um RTE cheio ou a parar, `60` por predefinição |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | A pasta dos playbooks e o limite de saída: lidas pelo RTE, por isso defina-as no seu ambiente |
| `LISTEN_HOST` | Desde a 7.3.0: o endereço onde os seus listeners escutam, todas as interfaces por predefinição; `127.0.0.1` quando nada se liga a ele de fora (um RTE de saída) |

Um RTE num modo socket, `outbound` ou `inbound`, lê também estas, e nenhuma `DB_*` nem `ENCRYPTION_SECRET`:

| Variável | Significado |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | O endereço da aplicação tal como as pessoas a abrem, como `https://forms.example.com`. Saída: o endereço a que se liga. Entrada: o endereço da sua única chamada de registo |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (predefinição): o certificado da aplicação tem de ser válido. `0` aceita qualquer um, só dentro de uma rede de confiança |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | O nome do seu runner, que os formulários nomeiam com `runner:`. Não definida: o seu id de nó, `rte-<hostname>-<port>`, que muda com o contentor: defina-a em produção |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcional, só da primeira vez: um join token, criado através da API, que aprova o seu runner de imediato em vez de esperar por um admin (consulte [Join tokens](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Entrada, quando pede para aderir: o endereço a que a aplicação se liga, como `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predefinição): a aplicação envia os playbooks e os inventários com a tarefa. `local`: corre a partir das suas próprias pastas montadas |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Onde a saída, os eventos e o fim de cada tarefa esperam até a aplicação os guardar, `<persistent>/rte-spool` por predefinição: mantenha-o num volume |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Com `transfer`: onde se guardam as pastas que a aplicação enviou, `<persistent>/rte-files` por predefinição |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Com `transfer`: quanto podem ocupar essas pastas, `1024` por predefinição; as usadas há mais tempo saem primeiro, e `0` não guarda nenhuma |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | Lida pela aplicação, não pelo RTE: a maior pasta que envia com `transfer`, `512` por predefinição |

Num RTE em modo socket, `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` e `RTE_CACHE_MB` também podem ser definidas na sua página de runner,
no separador RTE: um valor aí prevalece sobre a variável, que então só preenche um campo deixado vazio (consulte
[As definições de um RTE](../runners/runner-page.html#an-rtes-settings)). Um valor fora do intervalo é levado ao seu limite, e o RTE indica-o
quando arranca.

Um RTE em modo base de dados (obsoleto) lê em vez disso as definições da base de dados, e regista-se a si próprio:

| Variável | Significado |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Os próprios valores da aplicação: o RTE lê as suas tarefas da base de dados e escreve lá a sua saída |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | O endereço em que a aplicação chama o RTE, como `http://rte:8000`. O runner recebe o nome do seu host (`rte`), por isso os formulários podem usar `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | Obsoleta na 7.3.0, com o modo base de dados: um RTE em modo socket adere com um join token em vez disso. `1` (predefinição): o RTE adiciona-se a si próprio em **Ligações > Runners** no seu arranque, e o primeiro torna-se o runner predefinido. `0`: adicione-o lá você mesmo, ou no [config seed](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | O próprio valor da aplicação, necessário só para se registar (o token do runner é guardado cifrado); deixe-a de fora com `RTE_REGISTER=0` |

Em modo base de dados, sem `RTE_URL` o RTE regista o seu endereço IP e a sua porta com o nome `rte-<hostname>-<port>`, que mudam quando
o contentor é recriado: defina `RTE_URL` em produção. O worker remove um runner que o RTE registou ele próprio 10 minutos depois do
último heartbeat do RTE.

---

## Arrancá-lo

O RTE corre os playbooks, por isso precisa da sua pasta ssh, com a chave privada e o `known_hosts` que os playbooks usam, e de uma pasta persistente
para o seu spool e para os ficheiros que a aplicação envia. Escolha o modo:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Saída</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Entrada</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Base de dados (obsoleto)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Arranque o RTE em qualquer host que chegue à aplicação, com o seu próprio token e o nome que o seu runner recebe:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Liga-se à aplicação e pede para aderir: **Ligações > Runners** mostra o runner `rte-dmz` como a aguardar aprovação, e o seu registo mostra
a impressão digital do seu token. Verifique que a sua revisão mostra a mesma impressão digital, e depois clique em **Aprovar** (consulte
[Aprovar um RTE](../runners/registration.html#approving-an-rte)): passa a receber tarefas, iniciando sessão com o seu próprio `RTE_TOKEN`.
Para um arranque sem intervenção, adicione `-e RTE_JOIN_TOKEN=<a join token, afj_...>`, que o aprova de imediato. Nada precisa de chegar a este
host: não publique nenhuma porta. Só `/live`, `/ready` e `/metrics` escutam na sua `PORT`, para as sondas.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Arranque o RTE onde a aplicação chega a ele. Este corre ao lado da aplicação e corre os playbooks a partir das pastas dela (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Depois dê à aplicação o seu runner: no [config seed](../seed/), uma credencial RTE e um runner de entrada que inicia sessão com ela:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

Ou adicione os mesmos dois à mão: a credencial em **Ligações > Credenciais**, tipo RTE, e o runner em
**Ligações > Runners**, tipo RTE, modo **Entrada**, com essa credencial. Para deixar antes o RTE pedir para aderir, arranque-o com
`APP_URL` e `RTE_URL`, e aprove-o em **Ligações > Runners** (consulte [Entrada](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Obsoleto desde a 7.3.0 e removido na 8.0.0. O RTE corre os playbooks a partir do seu próprio disco, por isso monte nele também o volume persistente da aplicação
(playbooks, repositórios, ficheiros carregados) e a sua pasta ssh. Um exemplo Docker, com a aplicação acessível como `ansibleforms` na
mesma rede:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Mantenha um RTE de entrada fora da rede pública: o seu socket responde a qualquer chamador que tenha o token. `docker stop` só espera 10 segundos antes de
matar um contentor, por isso dê ao RTE um tempo de paragem mais longo (`--stop-timeout`, ou `stop_grace_period` no compose) ou baixe
`RTE_DRAIN_SECONDS`. O Kubernetes espera 30 segundos por predefinição.

O [instalador](../installation/installer.html) configura um RTE de saída ou de entrada num servidor próprio, com Docker, Podman ou
[sem contentores](../installation/native.html), e mostra a impressão digital para o aprovar. Para correr um RTE noutro centro de dados
à mão, siga [Outro centro de dados](another-datacenter.html).
