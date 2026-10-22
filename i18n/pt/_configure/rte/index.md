---
layout: default
title: RTE
nav_order: 10
has_children: true
has_toc: false
permalink: /rte/
translated_from: 2c3f3f81ad8faaf18eac56f18782ef5f78111b04
---

# Ambientes de execução (RTE)
{: .no_toc }

O que é um RTE, como corre um playbook, e em que pode tocar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: perceba o RTE antes de correr um, de o dimensionar, ou de o mudar para outra rede.

| Página | O que abrange |
|---|---|
| [Imagens](images.html) | As três imagens do RTE, e construir a sua com as collections que os seus playbooks usam |
| [Modos](modes.html) | Saída, entrada ou base de dados: quem abre a ligação, o spool, os ficheiros da tarefa |
| [Correr um RTE](run.html) | As definições de cada modo, e um exemplo `docker run` de cada um |
| [Vários RTE](several.html) | Capacidade, réplicas atrás de um endereço, e o que acontece quando um RTE para ou morre |
| [Outro centro de dados](another-datacenter.html) | Um runbook: adicionar um RTE num segundo centro de dados, de um host vazio até à sua primeira tarefa |

---

## O que é um RTE

O AnsibleForms 7 não corre nenhum playbook no contentor da aplicação. A tarefa de um formulário `ansible` é entregue a um [runner](../runners.html) do tipo
`rte`, um ambiente de execução: o servidor do AnsibleForms arrancado com `AF_ROLE=rte`, ao lado de python e ansible, sem
interface web. Fala com a aplicação por um WebSocket e não tem credenciais da base de dados
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` ou `inbound`, consulte [Modos](modes.html)): a aplicação envia-lhe a tarefa,
o RTE corre `ansible-playbook`, e a aplicação guarda a saída e o estado final que ele devolve, onde o navegador os lê.

A aplicação resolve as credenciais da tarefa e entrega-as ao RTE seladas só para esse RTE e essa tarefa. O RTE nunca lê a
tabela de credenciais nem um cofre de segredos, e um playbook não herda as variáveis de ambiente do próprio AnsibleForms
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` e as outras): passe um valor desses como extravar ou como credencial. O RTE da 7.0 à 7.2,
que lia e escrevia ele próprio na base de dados, continua a correr na 7.x como o modo base de dados obsoleto (consulte [Modo base de dados](#database-mode-deprecated)).

---

## Como o RTE corre

O RTE é um contentor que corre você mesmo, ao lado da aplicação ou noutra rede: o AnsibleForms nunca cria nenhum. Isto percorre
onde corre, o que partilha com a aplicação, e o que acontece dentro dele desde o momento em que um formulário é lançado até o processo do playbook
desaparecer:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Como o RTE corre um playbook</title>
<desc id="afr-desc">Num host de contentores ou num cluster Kubernetes, ambos geridos pelo operador, o contentor da aplicação e um ou mais contentores RTE mantêm cada um um WebSocket entre eles, aberto pela aplicação (entrada) ou pelo RTE (saída). Só a aplicação fala com a base de dados. 1: o navegador lança um formulário na aplicação. 2: a aplicação guarda a tarefa na base de dados, escolhe o runner e sela para ele os segredos da tarefa. 3: a aplicação envia a tarefa pelo socket. 4: o RTE reclama-a e obtém os ficheiros da tarefa, da sua cache ou da aplicação. 5: o RTE arranca o ansible-playbook como processo filho, um por tarefa, até RTE_MAX_JOBS. 6: o playbook chega aos hosts geridos. 7: o RTE escreve a saída, os eventos e o fim no seu spool e envia-os pelo socket; a aplicação guarda-os na base de dados e confirma a sua receção. 8: o navegador acompanha a tarefa através da aplicação. O volume da aplicação só é montado no RTE com RTE_FILES=local.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Host de contentores ou cluster Kubernetes</text>
<text class="afr-s" x="181" y="61">gerido por si; um RTE de saída pode estar noutra rede</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Navegador</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">formulários, tarefa</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">Contentor da app</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">web, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">selam os segredos</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">Hub do RTE</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">guarda e confirma</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">Contentor RTE</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="477" y="160" text-anchor="middle">Ficheiros da tarefa</text>
<text class="afr-s" x="477" y="174" text-anchor="middle">em cache por hash</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">até RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">até à confirmação</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">um</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Hosts geridos</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Volume da app</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbooks, inventários</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">só RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">só da app</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="532" cy="161" r="9"/><text class="afr-nt" x="532" y="165" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

O diagrama mostra um socket por RTE, seja qual for o lado que o abriu: a aplicação liga-se a um RTE de entrada, um RTE de saída liga-se à aplicação (consulte
[Modos](modes.html)). As mesmas mensagens circulam nos dois sentidos depois de aberto, e só a aplicação lê e escreve na base de dados.

**Quem o arranca.** Um RTE é um contentor de longa duração, arrancado pelo que quer que corra os seus outros contentores. Espera por tarefas e continua
a correr entre elas:

| Como corre o AnsibleForms | Quem arranca o RTE |
|---|---|
| `docker run` ou `podman run` | Você, com um comando como o de [Correr um RTE](run.html), em qualquer host que chegue à aplicação, ou a que a aplicação chegue |
| [Docker Compose](../installation/docker-compose.html) | O serviço `rte` do `docker-compose.yml`, ao lado de `app` e `mysqldb`. O seu config seed declara-o como o runner predefinido `rte`, de entrada, em `http://rte:8000` |
| [Helm chart](../installation/kubernetes.html) | O Kubernetes, como um segundo contentor chamado `rte` no pod da aplicação (`containers.rte`). A aplicação liga-se a ele em `127.0.0.1`, de entrada, e o seed do chart declara-o como o runner predefinido |
| [O instalador](../installation/installer.html) | O Docker Compose ou o Helm chart como acima, ou um serviço systemd [sem contentores](../installation/native.html); um Runner próprio, que pede para aderir e espera pela aprovação de um admin |

O motor de contentores é seu: Docker ou Podman no host, ou o runtime de contentores do seu cluster Kubernetes, instalado e mantido
atualizado por si. O AnsibleForms nunca fala com ele. Nem a aplicação nem o RTE chamam o Docker ou o Podman, montam o seu socket, ou arrancam um
contentor: a aplicação só fala com o RTE pelo socket dele.

**O que tem dentro.** Um contentor, com o necessário para correr um playbook e nada mais:

* **O servidor** : o mesmo servidor Node.js que a aplicação, arrancado com `AF_ROLE=rte` (definido na imagem) sob `tini`
* **O que fica de fora** : a interface web, o início de sessão, o agendador, o worker e todos os módulos de base de dados, que esta função não carrega
* **Onde está à escuta** : a sua `PORT` (`8000`): `/live` e `/ready` para as sondas e `/metrics` para o Prometheus, e, em modo de entrada, o socket
  a que a aplicação se liga, `/rte/v1/socket`. Um RTE de saída não aceita nenhuma ligação da aplicação
* **Python e ansible** : trazidos pela camada de imagem que escolher (consulte [As imagens do RTE](images.html))
* **O utilizador** : o servidor e todos os playbooks correm como `node` (uid 1000), nunca como root

**O que partilha com a aplicação.** O seu token, e com `RTE_FILES=local` os ficheiros da aplicação. Com `RTE_FILES=transfer`, a predefinição, os
playbooks e os inventários chegam com cada tarefa, e o RTE não precisa de disco partilhado:

| Partilhado com a aplicação | O que o RTE faz com isso |
|---|---|
| `RTE_TOKEN` | Apresenta-o quando se liga à aplicação (saída), ou verifica-o quando a aplicação se liga a ele (entrada). A aplicação tem o mesmo valor na credencial RTE do runner, e os segredos da tarefa são selados com ele |
| O volume persistente, `/app/dist/persistent`, só com `RTE_FILES=local` | A pasta dos playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), ou o repositório de playbooks que o worker clonou em [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), os inventários ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) e os repositórios de inventário) e os ficheiros carregados. O RTE escreve os ficheiros de extravars da tarefa na pasta do playbook, por isso monte-a em leitura e escrita |
| A pasta ssh, `/home/node/.ssh` | A chave privada e o `known_hosts` que as ligações ssh do playbook usam: monte a da aplicação, gerida nas suas páginas de definições, ou dê ao RTE a sua própria |

O RTE não clona nada: um repositório chega-lhe nos ficheiros de uma tarefa, ou no volume que partilha com a aplicação. As collections, os roles e o
`ansible.cfg` vêm da imagem, das pastas `/etc/ansible/collections`, `/etc/ansible/roles` e `/etc/ansible/ansible.cfg` quando
os monta aí (o projeto Docker Compose fá-lo), ou de um `ansible.cfg` ao lado dos playbooks.

**A vida de uma tarefa.** Os números abaixo são os números do diagrama, para um formulário de playbook lançado a partir do navegador ou da API:

1. **Lançamento** : a aplicação verifica o formulário e os seus valores, constrói os extravars e guarda a tarefa com o estado `running`. Um formulário com uma
   [aprovação](../forms/approval.html) para aqui até um aprovador a aceitar, e não chega a nenhum RTE antes disso
2. **Escolher o runner** : a aplicação fica com o RTE que o formulário nomeia com `runner: <name>`, senão com o runner predefinido do tipo RTE, e guarda o seu
   nome na tarefa. Resolve as credenciais da tarefa a partir da base de dados ou de um [cofre de segredos](../secret-stores/), o seu acesso ansible e a sua
   palavra-passe de vault, e sela-os com AES-256-GCM sob uma chave derivada do token desse runner e do id da tarefa
3. **Entrega** : o nó da aplicação que tem o socket do RTE envia-lhe a tarefa: os extravars, as opções do formulário, os segredos selados e
   os hashes dos ficheiros da tarefa. Qualquer nó da aplicação pode lançar a tarefa; o que tem o socket envia-a em dois segundos. Um RTE cheio,
   ou um que não está ligado, faz a tarefa esperar, até [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Reclamação** : o RTE responde `claimed`, ou `refused` quando está cheio, a parar, não consegue abrir os segredos, ou a tarefa chega com outro
   [contrato](images.html#the-contract) que não o seu. Com `RTE_FILES=transfer` vai buscar os playbooks e os inventários à sua
   cache pelo seu hash, pede à aplicação um hash que não tem, e desempacota-os numa pasta própria da tarefa
5. **Arranque** : na pasta do playbook (mais o `playbookSubPath` do formulário, que tem de existir) escreve dois ficheiros: `extravars_<id>.json`
   com os valores do formulário e as credenciais, e um oculto com o acesso ansible. Depois arranca `ansible-playbook` como seu próprio processo
   filho, sem shell, num grupo de processos próprio, com `-e @` esses ficheiros, um `-i` por inventário, e as tags, o limit, o check,
   o diff e a verbosidade do formulário. A palavra-passe de vault entra por stdin, nunca num ficheiro nem na linha de comandos, e o processo corre como
   `node` com um ambiente filtrado (ver abaixo)
6. **Execução** : o playbook liga-se aos hosts geridos a partir do contentor do RTE, por ssh com a chave e o `known_hosts` de
   `/home/node/.ssh`, com `sshpass` para um acesso por palavra-passe, ou pelas APIs que os seus módulos chamam. É o RTE, não a aplicação, que precisa de chegar a eles
7. **Saída e fim** : o RTE agrupa o stdout e o stderr a cada meio segundo ou 64 KB, com as credenciais mascaradas, e numera cada
   lote. Escreve cada item no spool da tarefa no seu disco antes de o enviar: a saída, os eventos, o registo da tarefa de
   `.joblogs/job_log_<id>.log` (a cada 2 segundos), o início e o fim com o estado final (`success`, `failed` ou `aborted`). A aplicação
   guarda cada item uma vez e confirma a sua receção, e o RTE descarta o spool quando o fim fica guardado. Para além de
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) bytes num fluxo (50 MB por predefinição) não envia mais, e
   o playbook continua. A aplicação envia depois as [notificações](../forms/notifications.html) do formulário
8. **Acompanhamento** : o navegador nunca fala com o RTE: a página do formulário volta a ler a tarefa através da aplicação a cada 2 segundos, e a página Tarefas
   acompanha-a em direto à medida que a aplicação guarda cada item

**Um socket que cai.** O playbook continua. O RTE volta a ligar-se (saída), ou um nó da aplicação liga-se de novo a ele (entrada), e reenvia o que
a aplicação ainda não tinha confirmado: a aplicação salta o que já guardou, por isso nenhuma linha se perde nem é guardada duas vezes. Isto vale enquanto o socket
voltar em dois minutos: a aplicação só escreve o heartbeat do RTE enquanto o seu socket está aberto, e quando esse heartbeat tem dois minutos
o worker termina as tarefas em execução do RTE como abandonadas, mesmo que os seus playbooks continuem a correr. Mantenha o spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) num volume, para que um RTE reiniciado continue a enviar o que tinha guardado. Um
playbook que estava a correr quando o seu RTE reiniciou não pode continuar: a aplicação termina a sua tarefa como abandonada quando o RTE volta sem ela.

**Abortar.** Abortar marca a tarefa como abortada, e o nó da aplicação que tem o socket do RTE envia `cancel` em dois segundos. O RTE
envia `SIGTERM` ao grupo de processos do playbook, por isso o `ansible-playbook` e todos os forks que arrancou param juntos, e a tarefa termina
`aborted`. Um cancel que chega antes da sua tarefa é guardado durante um minuto, e a tarefa arranca então já abortada.

**Limpeza.** Assim que o processo termina, seja qual for o resultado, o RTE remove os dois ficheiros de extravars (um formulário com `keepExtravars`
mantém o visível, nunca o oculto), o ficheiro de artefactos em `/tmp`, o ficheiro de registo da tarefa e a pasta de ficheiros da própria tarefa. O
fim é guardado uma vez: um segundo escritor, como a aplicação a falhar uma tarefa que o RTE já terminou, não altera nada.

**Um processo por tarefa, não um contentor por tarefa.** O AWX e o AAP arrancam um pod ou contentor novo a partir de uma imagem de execution environment para
cada tarefa. O AnsibleForms não arranca nada: o contentor do RTE já está a correr, e cada tarefa é um processo filho dentro dele. Uma tarefa arranca
sem descarregar uma imagem nem agendar um pod, e o AnsibleForms não precisa de direitos no seu motor de contentores nem no seu cluster. Em troca, os
playbooks que correm num RTE partilham o seu CPU, a sua memória, `/tmp`, a pasta pessoal e o python: dê ao contentor recursos suficientes para
`RTE_MAX_JOBS` playbooks com os seus forks. Para mudar o que um playbook pode usar, mude a imagem, não a tarefa.

---

## A fronteira de segurança

O RTE corre código escrito pelos autores dos formulários, por isso foi construído para conter o mínimo possível:

* **Só o seu token** : o RTE não tem credenciais da base de dados nem `ENCRYPTION_SECRET`. Não aceita nenhuma chamada além do socket da aplicação, com
  o seu token, e não tem utilizadores, nem início de sessão, nem páginas web. Pelo socket só pode correr as tarefas que a aplicação lhe envia, informar sobre elas e
  pedir os seus ficheiros: não pode criar uma tarefa, ler outra tarefa nem distribuir credenciais
* **Segredos selados** : para correr uma tarefa, o RTE nunca lê a tabela de credenciais nem um cofre de segredos. Recebe os segredos das tarefas que
  corre, selados só para o seu token e para esse id de tarefa, por isso um pacote destinado a outro RTE ou a outra tarefa não abre, e um byte alterado
  é recusado
* **Uma ligação verificada** : em modo de saída, o RTE verifica o certificado da aplicação. Em modo de entrada por HTTPS, a aplicação fixa o próprio certificado do RTE
  quando este adere, e só se liga a ele quando apresenta esse certificado (consulte [Modos](modes.html#inbound)). Um RTE de entrada por HTTP simples deve estar
  numa rede privada, como a do projeto Docker Compose
* **Nenhum ambiente herdado** : `ansible-playbook` recebe o ambiente do RTE sem nenhuma das variáveis que o próprio AnsibleForms lê
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, as `MYSQL_*` e as outras), por isso
  `lookup('env', ...)` não lhes chega. O que definir para os playbooks (`PATH`, proxies, `ANSIBLE_*`) passa tal como está
* **Nenhum template dos utilizadores** : {% raw %}um valor de formulário que contenha `{{`, `{%` ou `{#` chega ao playbook como uma string unsafe{% endraw %}
  que o ansible nunca processa como template, a menos que o formulário defina `allowJinjaInExtravars`, e nenhuma shell corre alguma vez a linha de comandos
* **Não é root** : o RTE e os seus playbooks correm como `node` (uid 1000), por isso um playbook pode fazer o que esse utilizador pode no contentor, como
  ler os seus ficheiros e a chave ssh, e nada mais

Trate o seu contentor, a sua imagem e o seu ambiente com o mesmo cuidado que os da aplicação.

---

## Modo base de dados (obsoleto)

O RTE da 7.0 à 7.2, sem `RTE_MODE`, corre durante toda a 7.x e é removido na 8.0.0. Difere dos passos acima em quatro aspetos:

* **Tem acesso à base de dados** : as suas definições `DB_*`, e `ENCRYPTION_SECRET` quando se regista a si próprio
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **A entrega é uma chamada HTTP** : a aplicação chama `POST <address>/rte/v1/jobs` com o token e os segredos selados, e o RTE reclama
  a tarefa escrevendo nela o seu nome na base de dados (passos 3 e 4)
* **Escreve ele próprio a saída** : na base de dados, em lotes, sem spool (passo 7). Um abortar chega-lhe pela marca de abortar da tarefa,
  que lê a cada 2 segundos, e por uma chamada `/cancel`
* **Lê os ficheiros do volume da aplicação** : precisa do mesmo disco que a aplicação, como com `RTE_FILES=local`

A sua página de runner não tem nenhuma das [definições do RTE](../runners/runner-page.html#an-rtes-settings): lê as suas próprias variáveis. Para o passar para um
modo socket, consulte [Modos](modes.html#database-deprecated).
