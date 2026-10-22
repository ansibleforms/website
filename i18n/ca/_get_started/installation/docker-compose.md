---
layout: default
title: Docker Compose
parent: Instal·lació
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

Instal·la AnsibleForms, el seu RTE i MySQL alhora amb docker-compose o podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El [projecte de docker-compose](https://github.com/ansibleforms/docker) executa tres contenidors: MySQL, l'aplicació AnsibleForms i l'RTE
(runtime environment, entorn d'execució) que executa els playbooks. Conté la seva configuració, formularis i playbooks d'exemple, així que l'únic altre requisit és
Docker o Podman amb la seva eina compose.

L'[instal·lador](installer.html) baixa aquest projecte, n'emplena la configuració i els secrets, i l'inicia amb una sola ordre. Aquesta pàgina
el configura a mà.

---

## Requisits previs

Abans de començar, necessites:

* **Una màquina Linux** : qualsevol distribució, amb una CPU i una memòria modestes
* **Accés a GitHub** : per baixar o clonar el projecte de docker-compose de GitHub
* **Docker o Podman** : un motor de contenidors, que s'instal·la a continuació
* **Una eina compose** : Docker Compose o podman-compose, per iniciar els tres contenidors a partir d'uns quants fitxers de configuració

**VÍDEO**: [Com instal·lar AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Tria una ubicació per a la instal·lació

Crea una carpeta per al projecte; els exemples fan servir `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Clona el projecte de docker-compose

Instal·la Git:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

Després clona el projecte de docker-compose en aquesta carpeta:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Defineix els permisos adequats

L'aplicació i l'RTE s'executen amb l'usuari `node` (uid 1000), així que dona a aquest usuari la carpeta `data`:

```bash
sudo chown -R 1000:1000 ./data
```

Si véns de la 6, el contenidor de la qual s'executava com a root, executa el mateix `chown` una vegada abans d'iniciar la 7. MySQL recupera la seva pròpia carpeta quan s'inicia.

---

## Instal·la un motor de contenidors

Instal·la Docker o Podman, cadascun amb la seva eina compose:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Instal·la Docker Engine amb el plugin Compose des del repositori de Docker
(consulta els [manuals d'instal·lació de Docker](https://docs.docker.com/engine/install)):

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

Després permet que els noms es resolguin dins dels contenidors, i inicia Docker com a servei:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman no necessita cap servei. Instal·la'l juntament amb podman-compose:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## Personalitza

Revisa les variables dels fitxers `.env` i `docker-compose.yml`, i canvia totes les contrasenyes: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` i `RTE_TOKEN`. [Més informació sobre les variables d'entorn](../customization)

L'aplicació es connecta a MySQL com a `ansibleforms` (`MYSQLDB_USER`), amb tots els permisos sobre l'esquema `AnsibleForms` i cap
més enlloc; root només és per al mateix MySQL. MySQL només crea aquest usuari en el seu primer inici: una instal·lació que fins ara es connectava com a root
el crea una vegada, tal com mostra el [README](https://github.com/ansibleforms/docker#database) del projecte.

L'RTE no es publica a l'amfitrió. Des de la 7.3.0 l'aplicació el truca a `http://rte:8000` amb `RTE_TOKEN` i hi manté un WebSocket obert
(`RTE_MODE=inbound`, consulta [Modes](../rte/modes.html)): l'RTE no rep cap configuració de la base de dades ni el `.env`, només el seu token i uns quants
paràmetres propis a `docker-compose.yml`. El config seed `data/seed.yaml` declara una credencial d'RTE amb el token i aquesta
adreça, i el runner predeterminat `rte`, en mode inbound, que s'hi autentica. L'RTE executa els playbooks des de la mateixa carpeta `data`
(`RTE_FILES=local`). Quan els teus playbooks necessitin més col·leccions o biblioteques de Python, construeix un RTE propi
i fes que el servei `rte` hi apunti (consulta [Construir el teu propi RTE](../rte/images.html#build-your-own-rte)).

---

## Inicia el projecte de docker-compose

Inicia els tres contenidors en segon pla. L'aplicació espera fins que MySQL està en bon estat, i després truca a l'RTE:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## Prova l'aplicació

Un cop els contenidors estan en marxa, obre AnsibleForms en un navegador:

* Obre `https://your_ip` (port 443, consulta `WEBAPP_LOCAL_PORT` al fitxer .env)
* Inicia sessió com a `admin` amb l'`ADMIN_PASSWORD` del fitxer `.env`; mentre encara sigui el predeterminat `AnsibleForms!123`, tria una contrasenya nova
* Comprova a **Connexions > Runners** que l'RTE apareix com a `rte`, el runner predeterminat, i que la seva pàgina mostra la seva
  **Connexió** com a **Connectat**
* Passos següents:
  * Crea formularis afegint fitxers YAML a la carpeta data/forms/ o fent servir el dissenyador integrat
  * Afegeix els teus playbooks a la carpeta data/playbooks/
  * Afegeix una connexió LDAP
  * Afegeix usuaris i grups
  * Afegeix runners per als formularis de plantilles: AWX, AAP o Ascender, Semaphore, Rundeck o Jenkins
  * Afegeix credencials per a connexions externes, com ara altres servidors MySQL o API REST, o per passar-les als playbooks d'Ansible
  * Connecta repositoris git i tria si els teus formularis i/o playbooks se sincronitzen amb un repositori

---

## Estructura de fitxers

El projecte de docker-compose té l'estructura de carpetes següent:

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
