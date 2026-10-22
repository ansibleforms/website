---
layout: default
title: Modos
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# Como um RTE fala com a aplicação
{: .no_toc }

Saída, entrada ou base de dados: quem abre a ligação, e o que passa por ela
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: desde a 7.3.0, um RTE fala com a aplicação por um WebSocket e não tem credenciais da base de dados. Escolha o modo
que se adequa à rede entre eles: quem pode abrir uma ligação para quem, e por que proxies e firewalls passa.

---

## Os três modos

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) no RTE diz como chega à aplicação; o seu runner tem o mesmo **Modo**:

| Modo | Quem abre a ligação | O que o RTE contém | Para |
|---|---|---|---|
| `outbound` | O RTE liga-se à aplicação em [`APP_URL`](../customization/server.html#env_APP_URL) e mantém um WebSocket aberto | O seu `RTE_TOKEN`, sem credenciais da base de dados | Uma DMZ, NAT, ou uma zona que não permite ligações de entrada: nada chega ao RTE de fora |
| `inbound` | A aplicação liga-se ao RTE no endereço do seu runner e mantém um WebSocket aberto | O seu `RTE_TOKEN`, sem credenciais da base de dados | Uma rede onde é o lado central que abre todas as ligações, um projeto compose, um pod |
| `database` (obsoleto) | A aplicação chama a API do RTE por HTTP, e o RTE lê e escreve ele próprio na base de dados da aplicação | As credenciais da base de dados (`DB_*`) e `ENCRYPTION_SECRET` | O comportamento da 7.0 à 7.2, removido na 8.0.0 |

Um RTE sem `RTE_MODE` corre em modo base de dados durante toda a 7.x, e regista um aviso `[DEPRECATED] This RTE runs in database mode` no
seu arranque. Um runner adicionado antes da 7.3.0 tem o modo **Base de dados (obsoleto)**; defina-o com o modo em que o seu RTE corre quando o migrar.

---

## Saída

O RTE abre a ligação, por isso funciona a partir de uma rede que não aceita nenhuma ligação de entrada:

* **O socket** : o RTE liga-se a `APP_URL` com `/api/v2/rte/socket` acrescentado, por `wss://` (`ws://` para um endereço `http://`), com o seu
  `RTE_TOKEN` e o nome do seu runner, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Volta a ligar-se quando o socket cai
* **A primeira vez** : pede para aderir, e o seu runner espera pela aprovação de um admin em **Ligações > Runners**, ligado
  mas sem tarefas (consulte [Pedir para aderir](../runners/registration.html#asking-to-join)). Um join token,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), aprova-o de imediato. A partir daí inicia sessão com o seu próprio token
* **A rede** : só da zona do RTE para a aplicação, na porta da aplicação, através de um proxy quando `HTTPS_PROXY` o indica. Um reverse
  proxy à frente da aplicação tem de deixar passar o WebSocket nesse caminho (consulte [WebSockets dos runners](../production/reverse-proxy.html#runner-websockets))
* **O certificado** : o certificado da aplicação é verificado. Indique uma CA privada com `NODE_EXTRA_CA_CERTS`, ou, só dentro de uma rede
  de confiança, desligue a verificação com [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)
* **O runner** : não precisa de endereço, por isso a sua credencial RTE contém só o token
* **Pronto** : `/ready` responde `503` até o socket para a aplicação estar aberto

Com vários nós da aplicação atrás de um balanceador de carga, o nó a que o RTE chega fica com o seu socket. Qualquer nó pode lançar uma tarefa: o nó que tem
o socket envia-a ao RTE, em dois segundos quando a tarefa foi lançada noutro nó.

---

## Entrada

O RTE escuta na sua `PORT`, e a aplicação liga-se a ele no endereço do seu runner, com `/rte/v1/socket` acrescentado e o token do RTE. Com
vários nós da aplicação, um de cada vez tem o socket de cada runner de entrada; quando esse nó para, outro assume e volta a ligar-se.

A aplicação precisa do runner do RTE antes de se poder ligar a ele: tipo RTE, modo **Entrada**, e uma credencial RTE com o endereço do RTE e o seu
`RTE_TOKEN`. Chega lá de uma de duas formas:

| Como | O que definir |
|---|---|
| O RTE pede para aderir | `APP_URL` e [`RTE_URL`](../customization/server.html#env_RTE_URL) (o endereço a que a aplicação se liga). O RTE faz uma chamada, `POST /api/v2/rte/register`, e o seu runner espera pela aprovação de um admin: a aplicação liga-se a ele depois de aprovado (consulte [Pedir para aderir](../runners/registration.html#asking-to-join)). Com `RTE_JOIN_TOKEN` é aprovado de imediato. Um RTE de entrada com `APP_URL` mas sem `RTE_URL` recusa-se a arrancar |
| Você adiciona o runner | Sem `APP_URL`: adicione o runner em **Ligações > Runners**, ou no [config seed](../seed/), como em [Correr um RTE](run.html#start-it) |

O projeto Docker Compose, o Helm chart e o controlador do instalador correm o seu próprio RTE desta forma, de entrada, declarado pelo seed.

**Por HTTPS.** Com [`HTTPS=1`](../customization/server.html#env_HTTPS) o RTE serve o seu socket por TLS, com a chave e o certificado
de [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) e [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(`key.pem` e `cert.pem` na sua pasta `certificates` por predefinição). Um RTE com um `RTE_URL` `https://` envia esse certificado quando
pede para aderir, e a aplicação fixa-o: só se liga ao RTE quando este apresenta o mesmo certificado, por isso um autoassinado funciona sem CA.
O RTE regista a impressão digital do certificado no seu arranque (os primeiros 8 dígitos hexadecimais do SHA-256 dos seus bytes DER, como `abcd-ef12`),
e a caixa de diálogo de aprovação mostra a que a aplicação recebeu: verifique que coincidem antes de o aprovar.
O [instalador](../installation/installer.html#a-runner) configura os seus Runners de entrada desta forma, com um certificado do seu próprio endereço.

---

## Base de dados (obsoleto)

O RTE da 7.0 à 7.2: a aplicação chama a sua API por HTTP, e o RTE reclama a tarefa na base de dados, escreve lá a saída e mantém atualizada a sua
própria linha de runner, com [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Modo base de dados](./#database-mode-deprecated)
diz em que diferem os seus passos. Continua a funcionar na 7.x, com um aviso em cada arranque, e é removido na 8.0.0.

Para passar um RTE destes para um modo socket, mantenha o seu runner e o seu token:

1. Um runner do [config seed](../seed/): defina primeiro `rte_mode: outbound` ou `rte_mode: inbound` para ele no seed (entrada: com
   o endereço a que a aplicação se liga no `url` da sua credencial). O RTE não pode migrar ele próprio um runner do seed
2. No RTE, defina `RTE_MODE=outbound` com `APP_URL`, ou `RTE_MODE=inbound` (com `APP_URL` e `RTE_URL` para fazer a sua única
   chamada de registo), e defina [`RTE_NAME`](../customization/server.html#env_RTE_NAME) com o nome que o seu runner tem em
   **Ligações > Runners**. Mantenha o seu `RTE_TOKEN`
3. Remova `DB_*` e `ENCRYPTION_SECRET` do seu ambiente, e `RTE_REGISTER`, que só o modo base de dados lê, e depois reinicie-o

Quando o RTE atualizado inicia sessão com o nome do runner e o próprio token do runner, a aplicação passa esse runner para o modo do RTE de
imediato, sem aprovação, e regista *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. O runner deixa de ser uma linha que o seu RTE registou, por isso o worker nunca o remove quando o contentor antigo deixa de responder. Um
runner do config seed ainda em modo base de dados é em vez disso recusado, com *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. Não use um join token para isto: um join
token é recusado para um runner que já está aprovado. Um RTE de entrada sem `APP_URL` não faz nenhuma chamada: defina antes o **Modo** do seu runner como
**Entrada** em **Ligações > Runners**, e a aplicação liga-se a ele. O [instalador](../installation/installer.html#a-72-runner)
atualiza um Runner da 7.2 desta forma.

---

## O que passa pelo socket

Em ambos os modos socket, a aplicação envia ao RTE cada tarefa com tudo o que o RTE costumava ler da base de dados, e guarda o que volta,
a saída, os eventos, o registo da tarefa e o fim, exatamente uma vez. A aplicação envia também as notificações de fim.

**O spool.** Cada lote de saída, lote de eventos, registo, início e fim é numerado e escrito no ficheiro de spool da tarefa
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) antes de ser enviado, e guardado até a aplicação dizer que o guardou.
Depois de voltar a ligar-se, ao mesmo nó da aplicação ou a outro, o RTE reenvia o que não foi confirmado, e a aplicação salta o que já
guardou: nada se perde, e nada é guardado duas vezes. Mantenha o spool num volume, para que um RTE que reinicia continue a enviar o que ainda não tinha
entregado. Um playbook que estava a correr quando o RTE reiniciou não pode continuar: a sua tarefa termina como abandonada.

**Capacidade.** O RTE corre até [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks ao mesmo tempo, ou o valor definido
na sua [página de runner](../runners/runner-page.html#an-rtes-settings), e diz à aplicação a cada 20 segundos quantos estão a correr. Uma tarefa para um RTE
cheio espera, como descrito em [Vários RTE](several.html#several-jobs-on-one-rte).

**Os ficheiros da tarefa.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES), ou a definição **Ficheiros de trabalho** da sua página de runner, diz
onde o RTE obtém os playbooks e os inventários:

| `RTE_FILES` | De onde vêm os ficheiros |
|---|---|
| `transfer` (predefinição) | A aplicação envia a pasta dos playbooks e os inventários com a tarefa, cada um empacotado e com o nome de um hash do seu conteúdo. O RTE guarda-os empacotados em [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), os usados mais recentemente até [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (1024 MB por predefinição), e só pede um hash que não tem: uma pasta inalterada nunca é enviada duas vezes. O RTE não precisa de disco partilhado nem de acesso aos repositórios |
| `local` | O RTE corre a partir das suas próprias pastas, como um RTE em modo base de dados: monte nele os playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) e os repositórios ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) |

Com `transfer`, cada tarefa desempacota os seus ficheiros numa pasta privada própria, removida quando a tarefa termina: nenhuma tarefa vê o que outra
escreveu, e nenhum ficheiro de inventário ou de extravars fica desempacotado no disco do RTE. Vários RTE podem partilhar um `RTE_CACHE_PATH`; cada um guarda as suas tarefas numa
pasta própria, e a pasta de um RTE que parou (morto a meio de uma tarefa, ou recriado com outro hostname) é removida pelos outros
ao fim de 10 minutos. Uma pasta maior do que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 por predefinição, lida pela
aplicação, aplicada sem reiniciar) não é enviada: a tarefa falha e diz para montar antes a pasta no RTE. A pasta ssh nunca é enviada: o RTE mantém a sua própria
chave privada e o seu `known_hosts` em `/home/node/.ssh`.

**Hosts e tarefas.** Desde a 7.3.0, um RTE em qualquer modo regista os eventos estruturados de um playbook ao lado da sua saída de texto: cada play, task e
resultado de host, e o resumo final, escritos pelo seu plugin de callback `af_events`. A página da tarefa mostra-os em **Hosts e tarefas** (consulte
[Acompanhar uma tarefa](../jobs/following.html#hosts-and-tasks)).

---

## Rede

O que abrir entre a aplicação, o RTE e os hosts geridos, por modo:

| Modo | De | Para | Porta |
|---|---|---|---|
| Saída | O RTE | A aplicação, em `APP_URL` | A porta da aplicação (`443` atrás da maioria dos proxies) |
| Entrada | Os nós da aplicação | O RTE, no endereço do seu runner | A `PORT` do RTE (`8000`) |
| Base de dados (obsoleto) | O RTE, e os nós da aplicação e o worker | A base de dados, e o RTE | `3306`, e a `PORT` do RTE |
| Todos os modos | O RTE | Os hosts geridos | ssh (`22`), WinRM, as suas APIs |

Num modo socket, o RTE nunca se liga à base de dados. A sua API só responde ao socket e às sondas: `/live`, `/ready`, `/metrics`.
