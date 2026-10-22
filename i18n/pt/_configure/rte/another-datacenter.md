---
layout: default
title: Outro centro de dados
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# Um RTE noutro centro de dados
{: .no_toc }

De um host vazio num segundo centro de dados a um RTE de saída a correr o seu primeiro playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Para administradores: quando os hosts geridos de um segundo centro de dados devem ser alcançados a partir de um RTE nesse centro de dados, e não a partir do primeiro.

{: .note }
> **O caminho fácil.** O [instalador](../installation/installer.html#a-runner) faz todos os passos abaixo no host do RTE num só comando:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, com `--join afj_...` para que seja aprovado de imediato.
> Este runbook faz o mesmo à mão, com Docker ou Podman, para que possa ver e adaptar cada parte.

---

## Com o que fica

A aplicação, o seu worker e a sua base de dados ficam onde estão, no centro de dados 1. O centro de dados 2 recebe um host que corre um contentor RTE em
modo de saída ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), consulte [Modos](modes.html#outbound)): liga-se à aplicação por
HTTPS e mantém um WebSocket aberto, adere como runner próprio, e corre os playbooks dos formulários que o nomeiam contra os hosts geridos
do centro de dados 2.

| Onde | O que corre lá | Fala com |
|---|---|---|
| Centro de dados 1 | Os nós da aplicação, o worker, a base de dados (como hoje) | Nada de novo: recebe o socket do RTE no seu endereço HTTPS habitual |
| Centro de dados 2, o host do RTE | Docker ou Podman, e o contentor RTE | A aplicação em `APP_URL` por HTTPS, e os hosts geridos do centro de dados 2 |

O RTE não tem credenciais da base de dados nem `ENCRYPTION_SECRET`, só um token próprio. Nada se liga a ele, por isso não precisa de nenhuma porta
aberta, nenhum nome DNS nem nenhum certificado. A aplicação envia os playbooks e os inventários com cada tarefa (`RTE_FILES=transfer`, a
predefinição), por isso o RTE não precisa de uma cópia deles nem de disco partilhado.

Todos os comandos abaixo correm num terminal no host do RTE, como um utilizador com `sudo`, salvo indicação em contrário. Demora cerca de 20 minutos,
a maior parte à espera da imagem.

---

## 0. Antes de começar

Reúna o seguinte:

| O quê | De onde vem |
|---|---|
| O endereço da aplicação | `APP_URL`: o endereço que as pessoas abrem num navegador, como `https://forms.example.com`, com o seu caminho base se tiver um |
| O certificado da aplicação | Assinado por uma CA pública, por uma CA privada (precisa do certificado dela, passo 6), ou autoassinado |
| Um proxy | O `HTTPS_PROXY` que este centro de dados usa para chegar ao centro de dados 1, se houver |
| O nome do RTE | O nome do seu runner em **Ligações > Runners**, que os formulários nomeiam com `runner:`, como `rte-dc2`: letras, dígitos e `_ . : @ -` |
| Um join token | Opcional: um [join token](../runners/registration.html#join-tokens) (`afj_...`) aprova o RTE de imediato. Sem ele, um admin aprova-o (passo 8) |
| A chave ssh | A chave privada que os playbooks usam para chegar aos hosts geridos, ou o direito de criar uma |

A aplicação tem de correr a 7.3.0 ou posterior. Para criar um join token para este RTE, um admin chama a API uma vez (consulte
[Join tokens](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Preparar o host

O RTE é um contentor, por isso o host precisa de um motor de contentores e de nada mais: o Node.js, o python e o ansible estão na imagem.

| Necessidade | Porquê |
|---|---|
| Linux em **x86_64** (amd64) | As imagens do RTE só são publicadas para amd64 |
| 2 CPU e 4 GB de memória, ou mais | Um RTE corre até [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks ao mesmo tempo (10), cada um com os seus forks: dimensione-o para eles |
| 20 GB de disco livre | A imagem `-rte-full` tem cerca de 3,3 GB, mais uma imagem durante as atualizações, os ficheiros das tarefas que a aplicação envia e os ficheiros temporários das tarefas |
| Docker, ou Podman com podman-compose | Para descarregar e correr a imagem |
| A hora definida por NTP | As horas das tarefas são comparadas com as da aplicação |

**Docker**, em Ubuntu ou Debian (outras distribuições: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, em RHEL, Rocky ou Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Com Podman, escreva `podman` em vez de `docker` e `podman-compose` em vez de `docker compose` em todos os comandos abaixo.

---

## 2. Rede e firewall

O RTE abre ele próprio todas as ligações. Nada lhe chega de fora:

| De | Para | Porta | Porquê |
|---|---|---|---|
| O host do RTE | A aplicação, em `APP_URL` (através de `HTTPS_PROXY` se estiver definido) | A porta da aplicação, `443` atrás da maioria dos proxies | O socket por onde passam as tarefas, os seus ficheiros e a sua saída |
| O host do RTE | Os hosts geridos do centro de dados 2 | ssh (`22`), WinRM, as suas APIs | Os playbooks correm a partir daqui |
| O host do RTE | `ghcr.io` | `443` | Para descarregar a imagem, a menos que venha do seu próprio registo ou de um ficheiro (passo 4) |

Não abra nenhuma porta de entrada para o RTE. A sua `PORT` (`8000`) serve só `/live`, `/ready` e `/metrics`, para as sondas neste host.

O RTE liga-se a `APP_URL` com `/api/v2/rte/socket` acrescentado, como WebSocket. Um reverse proxy à frente da aplicação tem de deixar passar o upgrade
nesse caminho (consulte [WebSockets dos runners](../production/reverse-proxy.html#runner-websockets)). Verifique a partir daqui que a aplicação responde:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Pastas

Tudo fica em `/opt/af-rte`. O RTE corre como o utilizador `node` (uid 1000), por isso os seus dados pertencem a esse uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Pasta | No contentor | Contém |
|---|---|---|
| `data/` | `/app/dist/persistent` | O spool (`rte-spool`: a saída e o fim de cada tarefa até a aplicação os guardar), os ficheiros das tarefas que a aplicação enviou (`rte-files`), uma CA privada, as bibliotecas python que um playbook instala |
| `data/ssh/` | `/home/node/.ssh` | A chave ssh e o `known_hosts` dos playbooks |
| `data/ansible/` | `/etc/ansible/...` | Um `ansible.cfg`, roles e collections seus, montados em vez de incluídos na imagem |

Mantenha `data/` no host: um RTE reiniciado continua a enviar o que a aplicação ainda não tinha guardado, e mantém a sua cache de ficheiros das tarefas.

**Chave ssh.** Copie a chave que os playbooks usam no centro de dados 1, ou crie uma para este centro de dados e dê a sua metade pública aos hosts geridos:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Depois dê tudo ao uid 1000, com a chave legível só pelo seu dono:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. A imagem

Escolha uma das duas.

### Opção A: a imagem oficial
{: .no_toc }

As imagens publicadas estão no GitHub Container Registry, públicas, sem necessidade de início de sessão (consulte [Imagens](images.html) para as três camadas).
Use a mesma camada que no centro de dados 1. `:7` acompanha a última versão 7, tal como o `:7` da aplicação:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Um host sem acesso à internet obtém a imagem a partir de um que tenha:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

Ou envie-a uma vez para o seu próprio registo (`docker tag` e `docker push`), e use esse nome nos passos seguintes.

### Opção B: a sua própria imagem
{: .no_toc }

Quando os playbooks do centro de dados 2 precisam de collections ou bibliotecas python que a imagem oficial não tem (as da VMware para o vCenter deste
centro de dados, por exemplo), construa sobre `ansibleforms-rte-core`:

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build --pull -t af-rte-dc2 /opt/af-rte/build
```

Reconstrua-a a cada nova versão da aplicação (consulte [Construir o seu próprio RTE](images.html#build-your-own-rte)). Com vários hosts RTE, construa
uma vez e envie para o seu próprio registo. Sem ligação, faça `docker save` e `docker load` da imagem construída como na opção A.

---

## 5. Definições

Um novo [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) próprio, com pelo menos 16 caracteres. É a palavra-passe deste RTE: a aplicação
guarda-o na credencial RTE do runner, e sela com ele os segredos de cada tarefa.

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
RTE_MODE=outbound
APP_URL=https://forms.example.com
RTE_NAME=rte-dc2
RTE_TOKEN=<the new token>
# optional, the first time only : approved at once instead of waiting for an admin
RTE_JOIN_TOKEN=<afj_..., or remove this line>
PORT=8000
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

| Variável | Significado |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: o RTE liga-se à aplicação. Sem ela, o RTE arranca no modo base de dados obsoleto |
| [`APP_URL`](../customization/server.html#env_APP_URL) | O endereço da aplicação, `http://` ou `https://`, com o seu caminho base se houver |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | O nome do seu runner. Não definida: o seu id de nó, `rte-<hostname>-<port>`, que muda com o contentor |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | O seu próprio token, com pelo menos 16 caracteres. Guarde-o: o runner inicia sessão com ele a partir de agora |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcional: um join token, usado só enquanto o seu runner ainda não existe ou aguarda aprovação |

Adicione estas quando a rede precisar delas:

| Variável | Quando |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | O RTE chega à aplicação através de um proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. Um host listado em `NO_PROXY` (separados por vírgulas, `.example.com` para um domínio) é contactado diretamente |
| `NODE_EXTRA_CA_CERTS` | O certificado da aplicação vem de uma CA privada: coloque o certificado da CA em `/opt/af-rte/data/certificates/ca.pem` e defina `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` aceita qualquer certificado da aplicação, um autoassinado incluído. Só dentro de uma rede de confiança: prefira `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predefinição) recebe os playbooks e os inventários com cada tarefa. Deixe-o assim, a menos que os monte você mesmo no RTE (`local`) |

As outras definições que um RTE lê estão em [Correr um RTE](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` e
`RTE_DRAIN_SECONDS` também podem ser definidas mais tarde na sua página de runner, que prevalece sobre a variável (consulte
[As definições de um RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Arrancá-lo

Um ficheiro compose mantém toda a definição num só sítio, ao lado das definições. Coloque a imagem do passo 4 em `image:`:

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7   # or af-rte-dc2, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    # the probes, on this host only : nothing connects to an outbound RTE
    ports:
      - "127.0.0.1:8000:8000"
    healthcheck:
      test: ["CMD", "node", "./healthcheck.js"]
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 30s
    volumes:
      - ./data:/app/dist/persistent
      - ./data/ssh:/home/node/.ssh
      - ./data/git/.gitconfig:/home/node/.gitconfig
      - ./data/ansible/ansible.cfg:/etc/ansible/ansible.cfg
      - ./data/ansible/roles:/etc/ansible/roles
      - ./data/ansible/collections:/etc/ansible/collections
EOF
cd /opt/af-rte && docker compose up -d
```

O Docker volta a arrancá-lo depois de um reinício (`unless-stopped`). O Podman não tem nenhum daemon que o faça: ative `podman-restart.service`
(`sudo systemctl enable --now podman-restart`), ou corra o contentor como serviço systemd com um ficheiro Quadlet. Num host com SELinux
em modo enforcing, acrescente `:Z` a cada volume (`./data:/app/dist/persistent:Z`).

Sem compose, o mesmo contentor num só comando:

```bash
docker run -d --name af_rte_dc2 --restart unless-stopped --stop-timeout 40 \
  --env-file /opt/af-rte/rte.env -p 127.0.0.1:8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

---

## 7. Verificá-lo no host

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

O registo mostra o RTE a arrancar, a ligar-se à aplicação e a ficar ligado:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Sem join token, mais uma linha diz que está à espera:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Anote a impressão digital.

`/ready` responde `503` com `not connected to the app` até o socket estar aberto. O healthcheck só diz que o processo está à escuta.

---

## 8. Aprová-lo

Sem join token, o RTE pediu para aderir: **Ligações > Runners** mostra um aviso laranja acima da lista,
**1 Runner aguarda aprovação**. Abra-o, verifique que a **Impressão digital** é a do registo do RTE e que **Modo** diz
Saída, e depois clique em **Aprovar** (consulte [Aprovar um RTE](../runners/registration.html#approving-an-rte)). Só um admin aprova. Um pedido
que ninguém trate em 24 horas é removido, e o RTE volta a pedir da próxima vez que se ligar à aplicação.

Com um join token, o runner é aprovado de imediato e a sua descrição nomeia o join token. Em ambos os casos, a aplicação guarda o token do RTE
numa nova credencial RTE, `rte-dc2-rte`, e o RTE inicia sessão com o seu próprio `RTE_TOKEN` a partir daí: `RTE_JOIN_TOKEN` deixa de ser
usado, e pode removê-lo do `rte.env`.

---

## 9. Verificá-lo no AnsibleForms

1. **Ligações > Runners** lista o runner `rte-dc2`, tipo RTE. Ligue **Colunas > Ligação** para ver **Ligado** na lista
2. Abra-o. O seu separador **RTE** mostra **Modo** Saída e o distintivo **Ligação** **Ligado**; ao passar o ponteiro nomeia o nó da aplicação que
   tem o socket, a versão do RTE e quantas das suas tarefas estão a correr
3. Clique em **Testar ligação**: diz **Runner connection is OK**. Não chama nada: lê que nó da aplicação tem o socket do RTE
   (`runner_leases`) e verifica o contrato que o RTE falou quando se ligou
4. Dê-lhe uma descrição, como *Centro de dados 2*
5. Deixe **Predefinido** no runner do centro de dados 1, a menos que todos os formulários de playbook sem `runner:` devam correr no centro de dados 2

A página **Estado** lista o novo RTE com a sua versão, ao lado dos outros.

---

## 10. Uma primeira tarefa

Prove todo o caminho com um playbook que não altera nada. Nos playbooks da aplicação (a sua pasta de playbooks ou o seu repositório, como no
centro de dados 1), adicione `ping-dc2.yaml`:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Depois adicione no designer um formulário que nomeie o novo runner:

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

Lance-o. A aplicação envia a pasta dos playbooks e o inventário com a tarefa, e o RTE guarda-os pelo seu hash, por isso uma pasta inalterada
nunca é enviada duas vezes. A saída começa por `Running on RTE rte-dc2 (outbound)`, mostra `pong` para cada host, e a tarefa
termina com sucesso. Uma pasta maior do que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 por predefinição) não é
enviada: a tarefa falha e indica-o.

---

## 11. Enviar-lhe os formulários

Um formulário corre no RTE que nomeia, por isso acrescente a mesma linha a todos os formulários do centro de dados 2:

```yaml
runner: rte-dc2
```

Consulte [Runners](../runners.html) para o runner predefinido e os outros tipos de runner.

---

## Quando algo falha

O RTE escreve em `docker logs` a partir de `notice`. Uma ligação que falha antes de o socket abrir (um nome DNS, uma porta recusada, um
certificado) só aparece como `RTE: dialing the app again in <n> seconds`, em `info`: defina
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) no `rte.env` e reinicie-o para ver
`RTE: socket to wss://...: <the error>`.

| O que vê | Onde | O que fazer |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` falta ou é demasiado curto no `rte.env` |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Defina `APP_URL` no `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` tem de começar por `https://` (ou `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | Falta `RTE_MODE=outbound` no `rte.env` |
| Nenhuma linha `connected to the app`, `/ready` fica em `503` | `docker logs`, `/ready` | A rede do passo 2: faça `curl` à aplicação a partir deste host, o proxy (`HTTPS_PROXY`, `NO_PROXY`), o certificado da aplicação (`NODE_EXTRA_CA_CERTS`, passo 5). Defina `LOG_CONSOLE_LEVEL=debug` para ver o erro |
| `the app refused the socket (404)` ou outro estado que não 401, 403 e 409 | `docker logs` | Um reverse proxy não deixa passar o WebSocket em `/api/v2/rte/socket`, ou falta a `APP_URL` o caminho base da aplicação |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Existe um runner `rte-dc2` com outro token. Dê ao RTE esse token (a palavra-passe da credencial do runner), ou elimine o runner para que ele peça para aderir |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Crie um novo join token, ou remova `RTE_JOIN_TOKEN` e aprove o RTE (passo 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | O RTE foi instalado de novo com um token novo: use o token da credencial do seu runner, ou peça a um admin que o altere |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Segue-se a uma recusa. Corrija a sua causa, e depois faça `docker restart af_rte_dc2` em vez de esperar |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Aprove-o (passo 8). Está ligado, mas não recebe tarefas até lá |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | A aplicação e o RTE correm versões de outro [contrato](images.html#the-contract): atualize o RTE para a versão da aplicação (consulte Atualizá-lo) |
| **Não ligado**, ou **Testar ligação** diz *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | A aplicação | Nenhum nó da aplicação tem o seu socket: o RTE está parado, ou não chega à aplicação. Leia os seus `docker logs` |
| Uma tarefa espera e depois falha com *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | A saída da tarefa | O RTE não estava ligado enquanto a tarefa esperava |
| `Permission denied` na chave ssh | A saída da tarefa | Os ficheiros de `data/` têm de pertencer ao uid 1000 (passo 3) |
| `UNREACHABLE` nos hosts geridos | A saída da tarefa | O ssh a partir deste host: a chave, o `known_hosts`, e a firewall em direção aos hosts |

Do lado da aplicação, um RTE recusado aparece no registo da aplicação como `Refused an RTE socket from <address>: <why>`.

---

## Atualizá-lo

Quando a aplicação passa para uma versão nova, acompanhe-a também neste host. Um RTE do mesmo contrato continua a funcionar entretanto; quando uma versão
altera o contrato, as suas notas de versão indicam-no (consulte [O contrato](images.html#the-contract)). Com `:7` no `compose.yml`, ou no
`FROM` do seu Dockerfile:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Atualize-o quando nenhum playbook estiver a correr nele: uma paragem espera `RTE_DRAIN_SECONDS` (25) pelos playbooks em execução, e os que ainda estiverem a correr
terminam então como abandonados. O que imprimiram antes da paragem fica no spool e é enviado quando o RTE voltar. Sem ligação, faça `docker load`
da imagem nova (passo 4) antes de `docker compose up -d`.

---

## Reverter

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

O socket fecha, e o runner mostra **Não ligado** de imediato: nenhum nó da aplicação tem já o seu socket (`runner_leases`). Um host
que desaparece sem o fechar mostra **Não ligado** em cerca de um minuto, quando o nó da aplicação deixa de ouvir algo no socket. O
runner fica: um runner que aderiu por um socket nunca é removido sozinho. Elimine-o em **Ligações > Runners**, e a sua
credencial `rte-dc2-rte` em **Ligações > Credenciais**. Remova primeiro a linha `runner:` dos formulários que o nomeavam: até
lá as suas tarefas esperam pelo RTE, até `RTE_QUEUE_MINUTES`, e falham.

---

## Mais capacidade no centro de dados 2

Repita os passos 1 a 9 em mais hosts do centro de dados 2, cada um com o seu próprio `RTE_NAME` e `RTE_TOKEN`, como `rte-dc2-b`: cada um adere como
runner próprio e recebe até [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks. Um formulário escolhe um com
`runner:`. Dois RTE com o mesmo `RTE_NAME` não partilham o trabalho: o segundo fica com o socket do primeiro (consulte
[Vários RTE](several.html#several-rtes)).

---

## Um RTE em modo base de dados

Antes da 7.3.0, este runbook configurava um RTE em modo base de dados: tinha as credenciais da base de dados (`DB_*`, `ENCRYPTION_SECRET`), ligava-se
à base de dados do centro de dados 1 pela porta `3306`, e a aplicação chamava-o na sua porta `8000`. Esse modo está obsoleto desde a 7.3.0 e
é removido na 8.0.0. Para passar um RTE destes para saída sem um runner novo, defina nele `RTE_MODE=outbound`, `APP_URL` e `RTE_NAME` (o nome do
seu runner), mantenha o seu `RTE_TOKEN`, e remova `DB_*`, `ENCRYPTION_SECRET` e `RTE_REGISTER`: consulte
[Base de dados (obsoleto)](modes.html#database-deprecated). Depois feche a porta `8000` e a porta da base de dados de que já não precisa.
