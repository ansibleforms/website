---
layout: default
title: A partir do código-fonte
parent: Instalação
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# A partir do código-fonte
{: .no_toc }

Compile o AnsibleForms a partir do código-fonte e execute-o com Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Como o código está organizado

O repositório contém duas aplicações Node.js, e uma compilação junta-as numa só:

* **client** : a interface web, escrita em Vue 3 e compilada em ficheiros estáticos com Vite
* **server** : a API, escrita em Express. Entrega as tarefas aos runners, liga-se à base de dados e serve o client compilado.
  Iniciado com `AF_ROLE=rte`, o mesmo servidor é o RTE (ambiente de execução) que executa os playbooks

Só o client é compilado; o resultado vai para a pasta `views` do servidor, tal como na [imagem Docker](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile).

---

## Pré-requisitos

Compilar e executar a partir do código-fonte exige bons conhecimentos de Linux e algum conhecimento de Node.js. Instala cada componente por si. Para
executar o AnsibleForms sem contentores e sem o compilar, a [instalação nativa](native.html) do instalador faz tudo isto por si:

* **Node.js 26** (a versão em `.nvmrc`; no mínimo a 24), com npm
* **Git**, para obter o código e sincronizar repositórios
* **Cliente OpenSSH**, para git por SSH, e **sshpass**, para playbooks que se ligam com uma palavra-passe SSH
* **Cliente MariaDB** (`mariadb`, `mariadb-dump`), para cópias de segurança e restauros, também com um servidor MySQL
* **MySQL 8+ ou MariaDB**, acessível a partir do servidor
* **Ansible**, para o processo RTE que executa os playbooks (`ansible-playbook` no seu path). O próprio processo da aplicação não precisa de
  Ansible nem de Python, e só com formulários de template (AWX, AAP, Ascender e os outros runners) não precisa de nenhum RTE

Instale-os para a sua distribuição:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

O Node.js 26 vem do repositório NodeSource, as outras ferramentas do próprio Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

O Node.js 26 vem do repositório NodeSource, as outras ferramentas do próprio Debian:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

O Node.js vem do NodeSource e o `sshpass` do EPEL (no próprio RHEL, ative o EPEL como a Red Hat documenta):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Verifique `node --version` (26) e `ansible-playbook --version`; para a base de dados e o seu utilizador, consulte [Instale o MySQL](docker.html#install-mysql).

---

## Obtenha o código

Clone o repositório para uma pasta à sua escolha, pertencente ao utilizador que vai executar a aplicação. Os exemplos usam `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Compile

Compile em três passos, a partir da pasta do repositório. Primeiro compile o client:

```bash
cd client
npm ci
npm run build
```

Depois instale as dependências do servidor:

```bash
cd ../server
npm ci --omit=dev
```

Por fim copie o client compilado para a pasta `views` do servidor:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configure

O servidor lê as suas definições a partir de variáveis de ambiente e, em produção, também de `server/persistent/.env`, o ficheiro
onde as páginas de definições escrevem.

Parta do ficheiro de exemplo na raiz do repositório e defina pelo menos a ligação ao MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Todas as variáveis estão descritas em [Variáveis de ambiente](../customization). Tudo o resto é guardado em `server/persistent` por predefinição:
`config.yaml`, a pasta `forms` e os certificados autoassinados são criados aí no primeiro arranque, junto com os registos.
Coloque os seus playbooks em `server/persistent/playbooks`, ou aponte `ANSIBLE_PATH` para outro sítio no ambiente do RTE, que é quem o lê.

---

## Execute

Execute o AnsibleForms em produção, ou em modo de desenvolvimento para trabalhar no próprio código:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Produção</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Desenvolvimento</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Inicie o servidor em modo de produção a partir da pasta `server`:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Uma aplicação iniciada a partir da linha de comandos para quando termina a sessão. O [PM2](https://pm2.keymetrics.io/) mantém-na em execução em
segundo plano, reinicia-a após uma falha e volta a iniciá-la no arranque:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Os playbooks são executados num RTE: inicie o mesmo servidor uma segunda vez com `AF_ROLE=rte`, numa porta própria. A aplicação liga-se a ele e mantém
um WebSocket aberto (`RTE_MODE=inbound`, consulte [Modos](../rte/modes.html)), e ele executa os playbooks a partir das mesmas pastas
(`RTE_FILES=local`). Também lê `persistent/.env`, mas não usa nenhuma das suas definições da base de dados. Adicione a `persistent/.env` o token que a aplicação e o RTE partilham,
com pelo menos 16 caracteres, e o config seed que declara o RTE:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

O [config seed](../seed/) declara uma credencial de RTE com o endereço do RTE e o seu token, e o runner predefinido `rte` que inicia
sessão com ela:

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Sem um seed, adicione-os em **Ligações > Credenciais** (uma credencial de RTE com esse endereço e o token) e
**Ligações > Runners** (tipo RTE, **Modo** **Entrada**). Depois inicie o RTE, apenas em `127.0.0.1`:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

As definições do RTE estão descritas na página [Executar um RTE](../rte/run.html). Verifique que o PM2 lista os dois processos:

```bash
pm2 status
```

Ambos estão `online`:

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

Para trabalhar no próprio código, inicie tudo a partir da raiz do repositório com recarregamento automático: o servidor na porta 3001, um RTE na porta 8010
e o client em `https://localhost:8443`. Neste modo, o servidor e o RTE leem antes `server/.env.development`:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

O RTE (`npm run dev:rte`) precisa de `ansible-playbook` no path, e adiciona-se a si próprio como runner em modo base de dados, obsoleto, apenas para
desenvolvimento; `npm run dev:local` inicia o client e o servidor sem ele. O [guia de contribuição](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) descreve os testes e as verificações a executar.

</div>
</div>

---

## Primeira execução

Abra o servidor num navegador (com o `.env` de exemplo, `https://your_ip:8443`). Numa base de dados vazia, o esquema é criado no
primeiro arranque.

As credenciais de administrador predefinidas são:

* nome de utilizador : `admin`
* palavra-passe : `AnsibleForms!123`
