---
layout: default
title: Docker Compose
parent: Instalação
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

Instale o AnsibleForms, o seu RTE e o MySQL em conjunto com docker-compose ou podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

O [projeto docker-compose](https://github.com/ansibleforms/docker) executa três contentores: MySQL, a aplicação AnsibleForms e o RTE
(ambiente de execução) que executa os playbooks. Contém as respetivas definições, formulários e playbooks de exemplo, por isso o único outro requisito é
o Docker ou o Podman com a sua ferramenta de compose.

O [instalador](installer.html) descarrega este projeto, preenche as suas definições e segredos e inicia-o com um único comando. Esta página
configura-o à mão.

---

## Pré-requisitos

Antes de começar, precisa de:

* **Máquina Linux** : qualquer distribuição, com CPU e memória modestos
* **Acesso ao GitHub** : para descarregar ou clonar o projeto docker-compose a partir do GitHub
* **Docker ou Podman** : um motor de contentores, instalado mais abaixo
* **Uma ferramenta de compose** : Docker Compose ou podman-compose, para iniciar os três contentores a partir de alguns ficheiros de configuração

**VÍDEO**: [Como instalar o AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Escolha um local de instalação

Crie uma pasta para o projeto; os exemplos usam `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Clone o projeto docker-compose

Instale o Git:

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

Depois clone o projeto docker-compose para essa pasta:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Defina as permissões corretas

A aplicação e o RTE são executados como o utilizador `node` (uid 1000), por isso dê a esse utilizador a pasta `data`:

```bash
sudo chown -R 1000:1000 ./data
```

Se vem da 6, cujo contentor era executado como root, execute o mesmo `chown` uma vez antes de iniciar a 7. O MySQL recupera a sua própria pasta quando arranca.

---

## Instale um motor de contentores

Instale o Docker ou o Podman, cada um com a sua ferramenta de compose:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Instale o Docker Engine com o plugin Compose a partir do repositório do Docker
(consulte os [manuais de instalação do Docker](https://docs.docker.com/engine/install)):

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

Depois permita a resolução de nomes dentro dos contentores e inicie o Docker como serviço:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

O Podman não precisa de um serviço. Instale-o juntamente com o podman-compose:

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

## Personalize

Reveja as variáveis nos ficheiros `.env` e `docker-compose.yml` e altere todas as palavras-passe: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` e `RTE_TOKEN`. [Saiba mais sobre as variáveis de ambiente](../customization)

A aplicação liga-se ao MySQL como `ansibleforms` (`MYSQLDB_USER`), com todos os direitos sobre o esquema `AnsibleForms` e nenhum
noutro sítio; o root serve apenas para o próprio MySQL. O MySQL cria esse utilizador apenas no primeiro arranque: uma instalação que até agora se ligava como root
cria-o uma vez, como mostra o [README](https://github.com/ansibleforms/docker#database) do projeto.

O RTE não é publicado no host. Desde a 7.3.0, a aplicação liga-se a ele em `http://rte:8000` com `RTE_TOKEN` e mantém um WebSocket aberto
(`RTE_MODE=inbound`, consulte [Modos](../rte/modes.html)): o RTE não recebe definições da base de dados nem o `.env`, apenas o seu token e algumas
definições próprias no `docker-compose.yml`. O config seed `data/seed.yaml` declara uma credencial de RTE com o token e esse
endereço, e o runner predefinido `rte`, em modo inbound, que inicia sessão com ela. O RTE executa os playbooks a partir da mesma pasta `data`
(`RTE_FILES=local`). Quando os seus playbooks precisarem de mais coleções ou bibliotecas Python, construa um RTE próprio
e aponte o serviço `rte` para ele (consulte [Construir o seu próprio RTE](../rte/images.html#build-your-own-rte)).

---

## Inicie o projeto docker-compose

Inicie os três contentores em segundo plano. A aplicação espera até o MySQL estar saudável e depois liga-se ao RTE:

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

## Teste a aplicação

Quando os contentores estiverem a funcionar, abra o AnsibleForms num navegador:

* Abra `https://your_ip` (porta 443, consulte `WEBAPP_LOCAL_PORT` no ficheiro .env)
* Inicie sessão como `admin` com a `ADMIN_PASSWORD` do ficheiro `.env`; enquanto ainda for a predefinida `AnsibleForms!123`, escolha uma nova palavra-passe
* Verifique em **Ligações > Runners** que o RTE aparece como `rte`, o runner predefinido, e que a sua página mostra a
  **Ligação** como **Ligado**
* Próximos passos:
  * Crie formulários adicionando ficheiros YAML à pasta data/forms/ ou usando o designer incorporado
  * Adicione os seus playbooks à pasta data/playbooks/
  * Adicione uma ligação LDAP
  * Adicione utilizadores e grupos
  * Adicione runners para formulários de template: AWX, AAP ou Ascender, Semaphore, Rundeck ou Jenkins
  * Adicione credenciais para ligações externas, como outros servidores MySQL ou APIs REST, ou para passar a playbooks Ansible
  * Ligue repositórios Git e escolha se os seus formulários e/ou playbooks se sincronizam com um repositório

---

## Estrutura de ficheiros

O projeto docker-compose tem a seguinte estrutura de pastas:

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
