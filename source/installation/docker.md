---
layout: default
title: Docker
parent: Installation
nav_order: 1
---

# Docker
{: .no_toc }

Run the AnsibleForms image on its own, next to a MySQL server of your own
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Running the image without docker-compose needs good Linux skills and some knowledge about containers

## Prerequisites

* **Docker** : Install docker and have it running
* **MySQL** : Install MySQL and have it running

## Install MySQL

Below is just an example of how you could install MySQL

```bash
wget https://dev.mysql.com/get/mysql57-community-release-el7-9.noarch.rpm
sudo rpm -ivh mysql57-community-release-el7-9.noarch.rpm
sudo yum install mysql-server
sudo systemctl start mysqld
sudo grep 'temporary password' /var/log/mysqld.log
sudo mysql_secure_installation
# the above will be interactive
# do NOT disallow remote access
# set new password of choice
```

## Get the image
If you don't want to go through the hassle of a dockerbuild, run the published image directly. It lives at
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) on the GitHub Container Registry,
(see [Image tags](./#image-tags)).  
  
Note that we have deployed the solution in the `/app` folder inside the docker.  So if you want your `config.yaml`, forms, logs, certificates and playbooks reachable from within the docker image, you have to use a mount path or persistent volume and make sure it's mounted under `/app/dist/persistent`.  
Make sure you have your environment variables set.  Most variables fall back to defaults, but the MySQL database connection (`DB_HOST`, `DB_PORT`, `DB_USER` and `DB_PASSWORD`) is mandatory.  The image contains ansible and python3.  The below command is merely an example. An example of a config.yaml you can find in the [docker-compose project](https://github.com/ansibleforms/docker/blob/main/data/config.yaml).

```bash
docker run -p 8000:8000 -d -t --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:7
```

Once started :

```bash
docker ps
CONTAINER ID   IMAGE                                  COMMAND                  CREATED         STATUS         PORTS                                       NAMES
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7    "node ./index.js"        7 seconds ago   Up 6 seconds   0.0.0.0:8000->8000/tcp, :::8000->8000/tcp   ansibleforms
```

## Test the application

* Surf to : http://your_ip:8000 (or https, if you set `HTTPS=1`)
* Login with admin / AnsibleForms!123 (or the password you set with `ADMIN_PASSWORD`)
* Next steps :
  * Start creating your forms by adding yaml files to the `forms` folder or using the built-in designer
  * Add your own playbooks under the `playbooks` folder of the mounted persistent folder
  * Add LDAP connection
  * Add users and groups
  * Add AWX connection
  * Add credentials for custom external connections such as other MySQL servers or credentials for rest api's or to pass to ansible playbooks
