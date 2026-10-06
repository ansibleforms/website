---
layout: default
title: From source
parent: Installation
nav_order: 3
---

# From source
{: .no_toc }

Build AnsibleForms from source and run it with Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

If you are familiar with Node js, you can download the code and build and run this locally, using PM2 for example.
This project has 2 node applications

* A client app in vue
* A server app in express

The client app will dynamically build the forms (vue.js v2) for ansible/awx, based on one or more yaml files (config.yml).
The server app (express.js) will cover authentication, background database connections and executing the ansible playbooks or awx templates.

## Prerequisites

* **Ansible or AWX** : Native installation does not cover Ansible, you must have this installed manually

## Project download

```bash
# remove nodejs if needed
sudo yum remove -y nodejs
# get repro
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -

# install nodejs
sudo yum install -y nodejs

# create holder folder (can be custom)
sudo mkdir /srv/apps
cd /srv/apps

# grab the code from github
sudo yum install -y git
sudo git clone https://github.com/ansibleforms/ansibleforms.git

# enter the app project
cd ansibleforms

# verify that you have 2 subfolder
```

## Project init

First we install all nodejs dependencies for both client & server

```bash
cd server
sudo npm install

cd ..
cd client
sudo npm install

cd ..
```

Second we prep our environment variables.  An environment variable file contains the configuration of this application, such as http(s) settings, ldap settings, database connections, log settings, ...
This application comes with an `.env.example` file that you must copy to `.env.development` or `.env.production` and adjust to your needs.  You can maintain both development and production file to test if you have different dev & prod environments and settings.

```bash
cd client
sudo cp .env.example .env.development

cd ..
cd server
sudo cp .env.example .env.development
sudo cp ./persistent/config.yml.example ./persistent/config.yml
```

## Modify the .env.development (or .env.production) to your needs

* enable https if needed and set the certificates (the code comes with self signed certficates)
* update forms path and log path
* set mysql server connection details

## Modify the config.yml to your needs

The `config.yml` file describes all your forms in a yaml format.  It must be available in the server application.  By default the webapp will search under `/server/persistent` 

* add categories
* add roles
* add constants
* add forms

## How to run

### In development

First of all one must understand that this application has both a client and server side.
The client side is build with vue2 and compiles in a single html, css & js script file.
The server side is build with express (must also be compiled) and runs the api's and database connections.

All behavior and how things are started using the `npm run command` is in the `package.json` file (one for client and one for server).  There are several methods like 'build, bundle, start, ...' depending on what you want to do.

#### Run both server and client for development

When you test a vue2 application (client application), it typically spins up a temporary Express webserver, which is useless if you also have a server application, which would not be running in this case.  Therefor we have added a `vue.config.js` file which also starts our server code in that temp express server.  Now we start our client app in development, along with the server code.  We also use nodemon to auto rebuild if the code changes.

```bash
cd client
sudo npm run start
```

#### Run compiled in development

If you are done testing, you can compile the client code and have it embedded into the server code.  And then spin up the server application.  the command `npm run bundle` will compile the client code and copy it under `/views` in the server application.  You can then start the server application with `npm run dev`, and as you will see in the `package.json`, it will build, copy the environment file and start the server application in dev mode.

First we compile the client code, and bundle it in the server code

```bash
cd client
sudo npm run bundle
```

Then we run the server code in development mode.  `npm run dev` will also copy the `.env.development` file into the `./dist` folder, so make sure it's there !

```bash
cd ..
cd server
sudo npm run dev
```

### Run in production with PM2

Running the application in the commandline, makes it fragile when something goes wrong.  We need an environment where the nodejs application can run when logged of, where it can be monitored and even restarted in case of a crash.  That's were PM2 comes in. (https://pm2.keymetrics.io/)

```bash
sudo npm install -g pm2
```

We again compile the client code and bundle it in the server code

```bash
cd client
sudo npm run bundle
```

We now compile the server code, but don't start it.

```bash
cd ..
cd server
sudo npm run build
```

Then we copy a production ready environment file. (change it to fit your production environment)

```bash
sudo cp .env.example ./dist/.env.production
```

Then we start it in PM2.  

```bash
cd dist
sudo pm2 start ecosystem.config.js --env production
```

Once started

```bash
# pm2 status
┌─────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name            │ namespace   │ version │ mode    │ pid      │ uptime │      │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ ansibleforms    │ default     │ 1.0.0   │ fork    │ 3104     │ 8s     │ 0    │ online    │ 0%       │ 57.1mb   │ root     │ enabled  │
└─────┴─────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

## First time run

The first time you surf to the webapplication, it will ask you if it should create the AnsibleForms schema.  
The default admin user is :

* username : admin
* password : AnsibleForms!123
