---
layout: default
title: Des del codi font
parent: Instal·lació
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# Des del codi font
{: .no_toc }

Compila AnsibleForms des del codi font i executa'l amb Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Com està organitzat el codi

El repositori conté dues aplicacions Node.js, i una compilació les combina en una de sola:

* **client** : la interfície web, escrita en Vue 3 i compilada en fitxers estàtics amb Vite
* **server** : l'API, escrita amb Express. Lliura les tasques als runners, es connecta a la base de dades i serveix el client compilat.
  Iniciat amb `AF_ROLE=rte`, el mateix servidor és l'RTE (runtime environment, entorn d'execució) que executa els playbooks

Només es compila el client; el resultat va a la carpeta `views` del servidor, com a la [imatge de Docker](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile).

---

## Requisits previs

Compilar i executar des del codi font requereix bons coneixements de Linux i una mica de Node.js. Instal·les tu mateix cada component. Per
executar AnsibleForms sense contenidors i sense compilar-lo, la [instal·lació nativa](native.html) de l'instal·lador ho fa tot per tu:

* **Node.js 26** (la versió de `.nvmrc`; com a mínim 24), amb npm
* **Git**, per obtenir el codi i sincronitzar repositoris
* **Client OpenSSH**, per a git per SSH, i **sshpass**, per als playbooks que es connecten amb una contrasenya SSH
* **Client de MariaDB** (`mariadb`, `mariadb-dump`), per a les còpies de seguretat i les restauracions, també amb un servidor MySQL
* **MySQL 8+ o MariaDB**, accessible des del servidor
* **Ansible**, per al procés RTE que executa els playbooks (`ansible-playbook` al seu path). El procés de l'aplicació en si no necessita
  ni Ansible ni Python, i amb només formularis de plantilles (AWX, AAP, Ascender i els altres runners) no necessites cap RTE

Instal·la'ls per a la teva distribució:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 ve del repositori de NodeSource, i les altres eines del mateix Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 ve del repositori de NodeSource, i les altres eines del mateix Debian:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js ve de NodeSource i `sshpass` d'EPEL (al mateix RHEL, activa EPEL tal com ho documenta Red Hat):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Comprova `node --version` (26) i `ansible-playbook --version`; per a la base de dades i el seu usuari, consulta [Instal·lar MySQL](docker.html#install-mysql).

---

## Obtenir el codi

Clona el repositori en una carpeta que triïs, propietat de l'usuari que executarà l'aplicació. Els exemples fan servir `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Compilar

Compila en tres passos, des de la carpeta del repositori. Primer compila el client:

```bash
cd client
npm ci
npm run build
```

Després instal·la les dependències del servidor:

```bash
cd ../server
npm ci --omit=dev
```

Finalment copia el client compilat a la carpeta `views` del servidor:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configurar

El servidor llegeix la seva configuració de variables d'entorn i, en producció, també de `server/persistent/.env`, el fitxer
on escriuen les pàgines de configuració.

Parteix del fitxer d'exemple de l'arrel del repositori i defineix com a mínim la connexió a MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Totes les variables es descriuen a [Variables d'entorn](../customization). Tota la resta es desa a `server/persistent` per defecte:
`config.yaml`, la carpeta `forms` i els certificats autosignats s'hi creen en el primer inici, al costat dels registres.
Posa els teus playbooks a `server/persistent/playbooks`, o fes que `ANSIBLE_PATH` apunti a un altre lloc a l'entorn de l'RTE, que és qui el llegeix.

---

## Executar

Executa AnsibleForms en producció, o en mode de desenvolupament per treballar en el codi mateix:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Producció</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Desenvolupament</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Inicia el servidor en mode de producció des de la carpeta `server`:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Una aplicació iniciada des de la línia d'ordres s'atura quan tanques la sessió. [PM2](https://pm2.keymetrics.io/) la manté en marxa en
segon pla, la reinicia després d'una fallada i la torna a iniciar en arrencar:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Els playbooks s'executen en un RTE: inicia el mateix servidor una segona vegada amb `AF_ROLE=rte`, en un port propi. L'aplicació el truca i hi manté
un WebSocket obert (`RTE_MODE=inbound`, consulta [Modes](../rte/modes.html)), i executa els playbooks des de les mateixes carpetes
(`RTE_FILES=local`). També llegeix `persistent/.env`, però no en fa servir cap paràmetre de la base de dades. Afegeix a `persistent/.env` el token que comparteixen l'aplicació i l'RTE,
de com a mínim 16 caràcters, i el config seed que declara l'RTE:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

El [config seed](../seed/) declara una credencial d'RTE amb l'adreça de l'RTE i el seu token, i el runner predeterminat `rte` que s'hi
autentica:

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

Sense seed, afegeix-los a **Connexions > Credencials** (una credencial d'RTE amb aquesta adreça i el token) i a
**Connexions > Runners** (tipus RTE, **Mode** **Entrant**). Després inicia l'RTE, només a `127.0.0.1`:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

La configuració de l'RTE es descriu a la pàgina [Executar un RTE](../rte/run.html). Comprova que PM2 llista tots dos processos:

```bash
pm2 status
```

Tots dos són `online`:

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

Per treballar en el codi mateix, inicia-ho tot des de l'arrel del repositori amb recàrrega en directe: el servidor al port 3001, un RTE al port 8010
i el client a `https://localhost:8443`. En aquest mode, el servidor i l'RTE llegeixen `server/.env.development`:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

L'RTE (`npm run dev:rte`) necessita `ansible-playbook` al path, i s'afegeix ell mateix com a runner en mode database, obsolet, només per al
desenvolupament; `npm run dev:local` inicia el client i el servidor sense ell. La [guia de contribució](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) descriu les proves i les comprovacions que cal executar.

</div>
</div>

---

## Primera execució

Obre el servidor en un navegador (amb el `.env` d'exemple, `https://your_ip:8443`). Amb una base de dades buida, l'esquema es crea en el
primer inici.

Les credencials d'administrador predeterminades són:

* nom d'usuari : `admin`
* contrasenya : `AnsibleForms!123`
