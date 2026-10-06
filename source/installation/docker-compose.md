---
layout: default
title: Docker Compose
parent: Installation
nav_order: 2
---

# Docker Compose
{: .no_toc }

Install AnsibleForms and MySQL together with docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

The [docker-compose](https://github.com/ansibleforms/docker), together with the environment variables should get you started.

{: .warning }
> **Note** You can also use Podman and Podman-Compose. The commands are similar (docker-> podman and docker-compose -> podman-compose)

{: .warning }
> **Note** Using docker and docker-compose for the first time, requires some basic linux skills and some knowledge about containers

## Prerequisites

* **Linux machine** : Any flavour should do. The need of CPU and memory is not very high, but of course it can grow if you start a lot of playbooks simultaneously. When using Podman, I recommend Debian (ubuntu has some issues with Podman)
* **GitHub access** : The easiest way is to download or clone the docker-compose project on GitHub
* **Install Docker** : You need to have a container environment, and in this example we use Docker
* **Install Docker Compose** : To spin-up AnsibleForms and MySQL with docker, using a few simple configuration-files, we need Docker Compose

{: .warning }
> **Linux Flavour** The examples below are for Ubuntu/Debian, use yum, dnf or other package managers for your flavour of linux.

**VIDEO**: [How to install AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

## Choose a location to install

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

## Clone the docker-compose project

```bash
# ubuntu or debian
sudo apt-get install -y git

sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker

cd ansibleforms-docker
```

## Set proper permissions

```bash
# write access will be needed on the datafolder
sudo chmod -R u+rwX,g+rwX ./data
```

## Install Docker and docker-compose

[Docker installation manuals](https://docs.docker.com/engine/install)

```bash
# ubuntu / debian
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose

# the below is to ensure dns works properly inside the dockerimages
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json

# start docker permanently as a service
sudo systemctl start docker
sudo systemctl enable docker
```

## Install Podman and podman-compose

```bash
# ubuntu / debian
sudo apt-get install -y podman podman-compose
```

## Customize

Feel free to look at the variables in the `.env` file and `docker-compose.yml` file.  
[Learn more about the environment variables](../customization)

## Start docker-compose project

```bash
sudo docker-compose up -d
# note, with some flavors and versions, it's `docker compose` (with a space)
# or
sudo podman-compose up -d
# note that podman is service-less.  You can run it as any user.  Your choice to use sudo or not.
```

## Test the application

* Surf to : https://your_ip (port 443, see `WEBAPP_LOCAL_PORT` in the .env file)
* Login with admin / AnsibleForms!123 (or the password you chose in the .env file)
* Next steps :
  * Start creating your forms by adding yaml files to the data/forms/ folder or using the built-in designer
  * Add your own playbooks under the data/playbooks/ folder
  * Add LDAP connection
  * Add users and groups
  * Add AWX connection
  * Add credentials for custom external connections such as other MySQL servers or credentials for rest api's or to pass to ansible playbooks
  * Connect to git repositories and choose whether you want your forms and/or playbooks to sync with a repository

## File structure

The docker-compose project comes with the following folder structure :

```bash
.
├── docker-compose.yml # the AnsibleForms and MySQL containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade
    ├── ansible # ansible.cfg, plus roles and collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
