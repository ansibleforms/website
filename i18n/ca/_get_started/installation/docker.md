---
layout: default
title: Docker
parent: Instal·lació
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Executa les imatges de l'aplicació i de l'RTE d'AnsibleForms amb Docker o Podman, al costat d'un servidor MySQL propi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pots executar AnsibleForms amb Docker o Podman com a dos contenidors, l'aplicació i l'RTE que executa els playbooks, connectats a una base de dades MySQL.

---

## Requisits previs

Abans de començar, necessites:

* **Docker o Podman** : un dels dos instal·lat i en marxa
* **MySQL** : instal·lat i en marxa

---

## Instal·lar MySQL

Instal·la MySQL 8+, o MariaDB, en un servidor Linux al qual pugui arribar el contenidor:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu inclou MySQL 8:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian inclou MariaDB en lloc de MySQL, que AnsibleForms també admet:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 i posteriors, i les seves recompilacions, inclouen MySQL 8 a AppStream:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms es connecta a la base de dades per la xarxa, com a `DB_USER` amb `DB_PASSWORD`. Dona-li un usuari propi, amb permisos només sobre
l'esquema `AnsibleForms`, no root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

És tot el que necessita AnsibleForms: amb això, crea i actualitza el seu esquema i fa les seves còpies de seguretat. La pàgina **Estat** i el registre
avisen quan l'usuari té permisos sobre totes les bases de dades. A Ubuntu i Debian el servidor només escolta a localhost: defineix `bind-address` a la seva
configuració perquè els contenidors hi puguin arribar.

---

## Preparar les carpetes

AnsibleForms 7 s'executa en dos contenidors: l'aplicació, i l'RTE (runtime environment, entorn d'execució) que executa els playbooks. Tots dos munten una carpeta per al
teu `config.yaml`, formularis, playbooks, registres i certificats, i una carpeta per a la clau SSH. Les imatges s'executen amb l'usuari `node` (uid 1000),
així que dona a aquest usuari totes dues carpetes:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Posa la configuració de l'aplicació en un fitxer d'entorn: la connexió a la base de dades,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) abans de desar cap credencial, el token que comparteixen l'aplicació i
l'RTE ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), com a mínim 16 caràcters) i el config seed que declara l'RTE:

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

L'RTE rep un fitxer propi, sense la configuració de la base de dades: des de la 7.3.0 l'aplicació el truca i hi manté un WebSocket obert
(`RTE_MODE=inbound`, consulta [Modes](../rte/modes.html)), i executa els playbooks des de les mateixes carpetes (`RTE_FILES=local`):

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

El [config seed](../seed/) declara una credencial d'RTE amb l'adreça de l'RTE i el seu token, i el runner predeterminat `rte` que s'hi
autentica:

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

## Iniciar els contenidors

Executa les imatges publicades al GitHub Container Registry (consulta [Etiquetes d'imatge](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) per a l'aplicació i
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) per a l'RTE.

El seed afegeix l'RTE a **Connexions > Runners** com el runner `rte`, el predeterminat, així que els formularis de playbook s'hi executen sense cap més
configuració. L'aplicació crea l'esquema en el primer inici, i truca a l'RTE un cop tots dos s'executen (hi ha un `config.yaml` d'exemple al
[projecte de docker-compose](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

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

Un cop iniciats, es llisten tots dos contenidors:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman accepta les mateixes opcions i no necessita cap servei:

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

Un cop iniciats, es llisten tots dos contenidors:

```bash
podman ps
```

</div>
</div>

L'aplicació escolta al port `8000`, per HTTP tret que defineixis `HTTPS=1`. L'RTE no es publica a l'amfitrió: només el truca l'aplicació, dins de
la xarxa. `--stop-timeout 30` dona temps a l'RTE perquè els playbooks en execució acabin quan s'atura (consulta
[Executar un RTE](../rte/run.html) per a la configuració de l'RTE i per construir un RTE propi).

---

## Provar l'aplicació

Un cop els contenidors estan en marxa, obre AnsibleForms en un navegador:

* Obre `http://your_ip:8000` (o HTTPS, si has definit `HTTPS=1`)
* Inicia sessió com a `admin` / `AnsibleForms!123` (o amb la contrasenya que hagis definit amb `ADMIN_PASSWORD`), i tria una contrasenya nova
* Comprova a **Connexions > Runners** que l'RTE apareix com a `rte`, el runner predeterminat, i que la seva pàgina mostra la seva
  **Connexió** com a **Connectat**
* Passos següents:
  * Crea formularis afegint fitxers YAML a la carpeta `forms` o fent servir el dissenyador integrat
  * Afegeix els teus playbooks a la carpeta `playbooks` de la carpeta persistent muntada
  * Afegeix una connexió LDAP
  * Afegeix usuaris i grups
  * Afegeix runners per als formularis de plantilles: AWX, AAP o Ascender, Semaphore, Rundeck o Jenkins
  * Afegeix credencials per a connexions externes, com ara altres servidors MySQL o API REST, o per passar-les als playbooks d'Ansible
