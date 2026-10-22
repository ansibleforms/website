---
layout: default
title: Docker
parent: Instalação
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Execute as imagens da aplicação AnsibleForms e do RTE com Docker ou Podman, ao lado de um servidor MySQL próprio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pode executar o AnsibleForms com Docker ou Podman como dois contentores, a aplicação e o RTE que executa os playbooks, ligados a uma base de dados MySQL.

---

## Pré-requisitos

Antes de começar, precisa de:

* **Docker ou Podman** : um deles instalado e em execução
* **MySQL** : instalado e em execução

---

## Instale o MySQL

Instale o MySQL 8+, ou o MariaDB, num servidor Linux que o contentor consiga alcançar:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

O Ubuntu inclui o MySQL 8:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

O Debian inclui o MariaDB em vez do MySQL, que o AnsibleForms também suporta:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

O RHEL 8 e posteriores, e as suas recompilações, incluem o MySQL 8 no AppStream:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

O AnsibleForms liga-se à base de dados pela rede, como `DB_USER` com `DB_PASSWORD`. Dê-lhe um utilizador próprio, com direitos apenas sobre
o esquema `AnsibleForms`, e não o root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

É tudo o que o AnsibleForms precisa: com isso, cria e atualiza o seu esquema e faz as suas cópias de segurança. A página **Estado** e o registo
avisam quando o utilizador tem direitos sobre todas as bases de dados. No Ubuntu e no Debian o servidor escuta apenas em localhost: defina `bind-address` na sua
configuração para que os contentores o consigam alcançar.

---

## Prepare as pastas

O AnsibleForms 7 é executado em dois contentores: a aplicação e o RTE (ambiente de execução) que executa os playbooks. Ambos montam uma pasta para
o seu `config.yaml`, formulários, playbooks, registos e certificados, e uma pasta para a chave SSH. As imagens são executadas como o utilizador `node` (uid 1000),
por isso dê a esse utilizador as duas pastas:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Coloque as definições da aplicação num ficheiro de ambiente: a ligação à base de dados,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) antes de guardar qualquer credencial, o token que a aplicação e o
RTE partilham ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), com pelo menos 16 caracteres) e o config seed que declara o RTE:

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

O RTE recebe um ficheiro próprio, sem as definições da base de dados: desde a 7.3.0 a aplicação liga-se a ele e mantém um WebSocket aberto
(`RTE_MODE=inbound`, consulte [Modos](../rte/modes.html)), e ele executa os playbooks a partir das mesmas pastas (`RTE_FILES=local`):

```bash
sudo tee /srv/apps/ansibleforms/rte.env > /dev/null <<'END'
RTE_MODE=inbound
RTE_TOKEN=<the same token>
RTE_FILES=local
PORT=8000
HTTPS=0
END
sudo chmod 600 /srv/apps/ansibleforms/rte.env
```

O [config seed](../seed/) declara uma credencial de RTE com o endereço do RTE e o seu token, e o runner predefinido `rte` que inicia
sessão com ela:

```bash
sudo tee /srv/apps/ansibleforms/persistent/seed.yaml > /dev/null <<'END'
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
END
sudo chown 1000:1000 /srv/apps/ansibleforms/persistent/seed.yaml
```

---

## Inicie os contentores

Execute as imagens publicadas no GitHub Container Registry (consulte [Tags da imagem](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) para a aplicação e
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) para o RTE.

O seed adiciona o RTE em **Ligações > Runners** como o runner `rte`, o predefinido, por isso os formulários de playbook são executados nele sem mais
configuração. A aplicação cria o esquema no primeiro arranque e liga-se ao RTE assim que ambos estiverem em execução (há um `config.yaml` de exemplo no
[projeto docker-compose](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Depois de iniciados, os dois contentores aparecem na lista:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

O Podman aceita as mesmas opções e não precisa de um serviço:

```bash
podman network create ansibleforms

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Depois de iniciados, os dois contentores aparecem na lista:

```bash
podman ps
```

</div>
</div>

A aplicação escuta na porta `8000`, por HTTP, a menos que defina `HTTPS=1`. O RTE não é publicado no host: só a aplicação se liga a ele, dentro
da rede. `--stop-timeout 30` dá ao RTE tempo para deixar terminar os playbooks em curso numa paragem (consulte
[Executar um RTE](../rte/run.html) para as definições do RTE e para construir um RTE próprio).

---

## Teste a aplicação

Quando os contentores estiverem a funcionar, abra o AnsibleForms num navegador:

* Abra `http://your_ip:8000` (ou HTTPS, se definiu `HTTPS=1`)
* Inicie sessão como `admin` / `AnsibleForms!123` (ou com a palavra-passe que definiu com `ADMIN_PASSWORD`) e escolha uma nova palavra-passe
* Verifique em **Ligações > Runners** que o RTE aparece como `rte`, o runner predefinido, e que a sua página mostra a
  **Ligação** como **Ligado**
* Próximos passos:
  * Crie formulários adicionando ficheiros YAML à pasta `forms` ou usando o designer incorporado
  * Adicione os seus playbooks à pasta `playbooks` da pasta persistente montada
  * Adicione uma ligação LDAP
  * Adicione utilizadores e grupos
  * Adicione runners para formulários de template: AWX, AAP ou Ascender, Semaphore, Rundeck ou Jenkins
  * Adicione credenciais para ligações externas, como outros servidores MySQL ou APIs REST, ou para passar a playbooks Ansible
