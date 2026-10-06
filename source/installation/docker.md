---
layout: default
title: Docker
parent: Installation
nav_order: 2
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
* **MySql** : Install Mysql and have it running

## Install MySql

Below is just an example of how you could install MySql

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
  
Note that we have deployed the solution in the `/app` folder inside the docker.  So if you want your `config.yml`, logs, certificates and playbooks reachable from within the docker image, you have to use a mount path or persistent volume and make sure it's mounted under `/app/dist/persistent`.  
Make sure you have your environment variables set.  Most variables fall back to defaults, but the MySQL database connection is mandatory.  The image contains ansible and python3.  The below command is merely an example. An example of a config.yml you can find here (https://github.com/ansibleforms/ansibleforms/tree/main/server/persistent).

```bash
docker run -p 8000:8000 -d -t --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:7
```

Once started :

```bash
docker ps
CONTAINER ID   IMAGE                                  COMMAND                  CREATED         STATUS         PORTS                                       NAMES
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7    "node ./dist/index.js"   7 seconds ago   Up 6 seconds   0.0.0.0:8000->8000/tcp, :::8000->8000/tcp   ansibleforms
```

## Test the application

* Surf to : https://your_ip:8000
* Login with admin / AnsibleForms!123 (or password you chose in the .env file)
* Next steps :
  * Start creating your forms by changing the config.yml file or using the built-in designer
  * Add your own playbooks under the data/playbooks/ folder
  * Add ldap connection
  * Add users and groups
  * Add AWX connection
  * Add credentials for custom external connections such as other mysql servers or credentials for rest api's or tho pass to ansible playbooks
