---
layout: default
title: Requisits previs
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Requisits previs
{: .no_toc }

El que necessites abans d'instal·lar AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Entorn d'execució

AnsibleForms s'executa com a contenidor, com a serveis de systemd al mateix servidor o, per a qui el compila pel seu compte, com a aplicació Node.js:

| Instal·lació | Necessites |
|---|---|
| [Instal·lador](installation/installer.html) | Linux en amd64 o arm64, `curl` o `wget` i `sha256sum`, i els requisits del motor on s'instal·la (a sota) |
| [Nativa](installation/native.html) | Root, systemd i un Linux compatible (Ubuntu, Debian, RHEL i les seves derivades, SUSE); l'instal·lador instal·la la resta |
| [Docker](installation/docker.html) | Docker o Podman, i un servidor MySQL propi |
| [Docker Compose](installation/docker-compose.html) | Docker Compose o podman-compose; el projecte també inicia MySQL |
| [Kubernetes](installation/kubernetes.html) | Un clúster, Helm 3 i una StorageClass (o PersistentVolumes creats prèviament) |
| [Des del codi font](installation/from-source.html) | Node.js 26 (com a mínim 24) amb npm, Git, i Ansible per al procés RTE que executa els playbooks |

La imatge de l'aplicació, `ghcr.io/ansibleforms/ansibleforms`, conté Node.js i les eines que crida el servidor (git, ssh, el client de mariadb i
ytt), però ni Python ni Ansible. Els playbooks s'executen en un RTE (runtime environment, entorn d'execució), un segon contenidor de
`ghcr.io/ansibleforms/ansibleforms-rte-full`, o d'una imatge que construeixes sobre `ansibleforms-rte-core` (consulta [Escalat](rte/)).
Els formularis que només llancen plantilles a AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins no necessiten cap RTE.

---

## Base de dades

AnsibleForms desa les seves tasques, usuaris, credencials i connexions a MySQL 8 o posterior, o a MariaDB.

En el primer inici crea ell mateix l'esquema `AnsibleForms`. Dona-li un usuari de base de dades propi, amb permisos només sobre aquest esquema,
no root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

És tot el que necessita: crea i actualitza l'esquema, fa les seves còpies de seguretat i, amb diversos workers, tanca la sessió d'un que ha caigut.
La pàgina **Estat** i el registre avisen quan l'usuari té permisos sobre totes les bases de dades. Els nodes d'aplicació i els workers es connecten amb aquest
usuari. Un RTE en un mode de socket (outbound o inbound, consulta [Modes](rte/modes.html)) no té credencials de la base de dades: només un en mode
database, obsolet des de la 7.3.0, també s'hi connecta. Per crear l'esquema tu mateix, posa [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0`.
El projecte de Docker Compose i el chart de Helm (que fa servir `mysql:8.4`) inicien una base de dades per tu.

---

## Dimensionament

No hi ha requisits mesurats: la càrrega depèn sobretot de quantes tasques s'executen alhora i de quanta sortida escriuen.
Els recursos predeterminats del chart de Helm són un punt de partida raonable per a un equip petit:

| Component | Requests | Limits | Volum |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB de memòria | 4 CPU, 4 GiB de memòria | 10 GiB |
| MySQL | 0,5 CPU, 512 MiB de memòria | 2 CPU, 2 GiB de memòria | 10 GiB |

El contenidor de l'aplicació no executa cap playbook. Cada playbook és un procés `ansible-playbook`, amb els seus forks, en un RTE: dimensiona la CPU i la
memòria de cada RTE per als playbooks que executa alhora, com a màxim [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (`10` per defecte), i executa més
RTE per executar-ne més. Les tasques que s'executen a AWX, AAP, Ascender o als altres runners de plantilles costen poc a AnsibleForms.

La sortida de les tasques es conserva a la base de dades per sempre per defecte. Defineix [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
en una instància amb molta activitat per evitar que la base de dades creixi sense límit.

---

## Xarxa

L'aplicació i cada RTE escolten en un port propi, i obren connexions sortints cap als sistemes que fan servir els teus formularis i la teva configuració.

### Entrant
{: .no_toc }

El servidor escolta al port `8000` ([`PORT`](customization/server.html#env_PORT)), per HTTP o, amb
[`HTTPS`](customization/server.html#env_HTTPS) a `1`, per HTTPS. El projecte de Docker Compose el publica al port 443,
i el chart de Helm l'exposa mitjançant un service o un ingress. Un RTE també escolta al seu propi `PORT`, però només el crida l'aplicació:
mantén-lo fora de la xarxa pública. Un RTE outbound no necessita cap port entrant: és ell qui truca a l'aplicació al port de l'aplicació.

### Sortint
{: .no_toc }

Obre les connexions des d'AnsibleForms cap als sistemes que fas servir:

| Destinació | S'usa per a |
|---|---|
| MySQL / MariaDB | La base de dades d'AnsibleForms (`DB_HOST`, `DB_PORT`, per defecte `3306`) |
| L'RTE | Trucar a un RTE inbound a l'adreça del seu runner a través d'un WebSocket, o cridar-ne un en mode database al seu [`RTE_URL`](customization/server.html#env_RTE_URL), que després es connecta ell mateix a MySQL; un RTE outbound és el que truca a l'aplicació (consulta [Modes](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Llançar i seguir plantilles i jobs als [runners](runners.html), a través de la seva API HTTP(S) |
| Els hosts gestionats | Els playbooks s'hi connecten des de l'RTE, per exemple per SSH o WinRM |
| LDAP, Entra ID, OIDC | Iniciar sessió amb comptes de directori o d'inici de sessió únic |
| Servidors git | Clonar repositoris i obtenir-ne els canvis, per HTTPS o SSH |
| API REST i bases de dades | Les fonts de dades de les expressions i les consultes dels teus formularis |
| HashiCorp Vault, CyberArk | Llegir credencials d'un [magatzem de secrets](secret-stores/) |
| Servidors de correu, Slack, Teams, Telegram, webhooks | Notificacions de tasques i sol·licituds d'aprovació, mitjançant els [canals de notificació](notification-channels.html) |
| Proveïdor de models | L'[assistent de xat](chat/), només quan està activat |

Per limitar a quins hosts poden cridar les funcions REST de les expressions, consulta
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) i
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Navegador

L'aplicació web està feta per a navegadors actuals: Chrome o Edge 111, Firefox 114, Safari 16.4 o posteriors.
Els navegadors més antics no són compatibles.

---

## Escalat

Per defecte, un contenidor d'AnsibleForms executa alhora l'aplicació web i la feina en segon pla, al costat d'un RTE.

Per atendre més usuaris, executa diversos nodes d'aplicació darrere d'un balancejador de càrrega (`AF_ROLE=app`) al costat d'un worker (`AF_ROLE=worker`), que executa les
programacions, les còpies de seguretat i la resta de la feina en segon pla; només treballa un worker alhora, i un segon espera per prendre-li el relleu. Comparteixen
la base de dades, la carpeta persistent, `ACCESS_TOKEN_SECRET` i `ENCRYPTION_SECRET`. Consulta [Escalat](production/scaling.html). Executa més
RTE per executar més playbooks alhora: consulta [Diversos RTE](rte/several.html).
