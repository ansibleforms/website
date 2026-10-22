---
layout: default
title: Prerequisiti
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Prerequisiti
{: .no_toc }

Cosa ti serve prima di installare AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Runtime

AnsibleForms gira come container, come servizi systemd sul server stesso o, per chi lo compila da sé, come applicazione Node.js:

| Installazione | Ti serve |
|---|---|
| [Installer](installation/installer.html) | Linux su amd64 o arm64, `curl` o `wget` e `sha256sum`, e i requisiti del motore su cui installa (sotto) |
| [Nativa](installation/native.html) | Root, systemd e un Linux supportato (Ubuntu, Debian, RHEL e le sue ricompilazioni, SUSE); l'installer installa il resto |
| [Docker](installation/docker.html) | Docker o Podman, e un tuo server MySQL |
| [Docker Compose](installation/docker-compose.html) | Docker Compose o podman-compose; il progetto avvia anche MySQL |
| [Kubernetes](installation/kubernetes.html) | Un cluster, Helm 3 e una StorageClass (o dei PersistentVolume creati in anticipo) |
| [Dai sorgenti](installation/from-source.html) | Node.js 26 (almeno la 24) con npm, Git, e Ansible per il processo RTE che esegue i playbook |

L'immagine dell'app, `ghcr.io/ansibleforms/ansibleforms`, contiene Node.js e gli strumenti che il server chiama (git, ssh, il client mariadb e
ytt), ma né Python né Ansible. I playbook girano su un RTE (ambiente di runtime), un secondo container da
`ghcr.io/ansibleforms/ansibleforms-rte-full`, o da un'immagine che costruisci su `ansibleforms-rte-core` (vedi [Scalabilità](rte/)).
I moduli che avviano solo template su AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins non hanno bisogno di un RTE.

---

## Database

AnsibleForms salva i suoi job, utenti, credenziali e connessioni in MySQL 8 o successivo, o in MariaDB.

Al primo avvio crea da sé lo schema `AnsibleForms`. Dagli un utente del database tutto suo, con diritti solo su quello schema,
non root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

È tutto ciò che gli serve: crea e aggiorna lo schema, fa i suoi backup e, con più worker, termina la sessione di uno morto.
La pagina **Stato** e il log avvisano quando l'utente ha diritti su tutti i database. I nodi dell'app e i worker si connettono con questo
utente. Un RTE in modalità socket (in uscita o in entrata, vedi [Modalità](rte/modes.html)) non contiene credenziali del database: solo uno in modalità
database, deprecata dalla 7.3.0, si connette anch'esso. Per creare lo schema tu stesso, imposta [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) su `0`.
Il progetto Docker Compose e il chart Helm (che usa `mysql:8.4`) avviano un database per te.

---

## Dimensionamento

Non ci sono requisiti misurati: il carico dipende soprattutto da quanti job girano nello stesso momento e da quanto output scrivono.
Le risorse predefinite del chart Helm sono un punto di partenza ragionevole per un piccolo team:

| Componente | Richieste | Limiti | Volume |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB di memoria | 4 CPU, 4 GiB di memoria | 10 GiB |
| MySQL | 0,5 CPU, 512 MiB di memoria | 2 CPU, 2 GiB di memoria | 10 GiB |

Il container dell'app non esegue nessun playbook. Ogni playbook è un processo `ansible-playbook`, con i suoi fork, su un RTE: dimensiona CPU e
memoria di ogni RTE per i playbook che esegue contemporaneamente, al massimo [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (`10` per impostazione predefinita), ed esegui più
RTE per eseguirne di più. I job che girano su AWX, AAP, Ascender o sugli altri runner di template costano poco ad AnsibleForms.

Per impostazione predefinita l'output dei job resta nel database per sempre. Imposta [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
su un'istanza molto usata per evitare che il database cresca senza limiti.

---

## Rete

L'app e ogni RTE ascoltano su una porta propria, e aprono connessioni in uscita verso i sistemi che usano i tuoi moduli e le tue impostazioni.

### In ingresso
{: .no_toc }

Il server ascolta sulla porta `8000` ([`PORT`](customization/server.html#env_PORT)), in HTTP o, con
[`HTTPS`](customization/server.html#env_HTTPS) impostato su `1`, in HTTPS. Il progetto Docker Compose la pubblica sulla porta 443,
e il chart Helm la espone tramite un servizio o un ingress. Anche un RTE ascolta sulla sua `PORT`, ma solo l'app lo chiama:
tienilo fuori dalla rete pubblica. Un RTE in uscita non ha bisogno di nessuna porta in ingresso: contatta l'app sulla porta dell'app.

### In uscita
{: .no_toc }

Apri le connessioni da AnsibleForms verso i sistemi che usi:

| Destinazione | Usata per |
|---|---|
| MySQL / MariaDB | Il database di AnsibleForms (`DB_HOST`, `DB_PORT`, predefinita `3306`) |
| L'RTE | Contattare un RTE in entrata all'indirizzo del suo runner tramite un WebSocket, o chiamarne uno in modalità database al suo [`RTE_URL`](customization/server.html#env_RTE_URL), che poi si connette lui stesso a MySQL; un RTE in uscita invece contatta l'app (vedi [Modalità](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Avviare e seguire template e job sui [runner](runners.html), tramite la loro API HTTP(S) |
| Gli host gestiti | I playbook vi si collegano dall'RTE, per esempio via SSH o WinRM |
| LDAP, Entra ID, OIDC | L'accesso con account di directory o single sign-on |
| Server Git | Clonare e aggiornare i repository, via HTTPS o SSH |
| API REST e database | Le origini dati delle espressioni e delle query nei tuoi moduli |
| HashiCorp Vault, CyberArk | Leggere credenziali da un [archivio di segreti](secret-stores/) |
| Server di posta, Slack, Teams, Telegram, webhook | Notifiche dei job e richieste di approvazione, tramite i [canali di notifica](notification-channels.html) |
| Fornitore di modelli | L'[assistente chat](chat/), solo quando è attivo |

Per limitare quali host possono chiamare le funzioni REST delle espressioni, vedi
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) e
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Browser

L'applicazione web è fatta per i browser attuali: Chrome o Edge 111, Firefox 114, Safari 16.4 o più recenti.
I browser più vecchi non sono supportati.

---

## Scalabilità

Per impostazione predefinita un solo container di AnsibleForms esegue insieme l'app web e il lavoro in background, accanto a un RTE.

Per servire più utenti, esegui più nodi dell'app dietro un load balancer (`AF_ROLE=app`) accanto a un worker (`AF_ROLE=worker`), che esegue le
pianificazioni, i backup e l'altro lavoro in background; lavora un solo worker alla volta, e un secondo aspetta di subentrare. Condividono
il database, la cartella persistente, `ACCESS_TOKEN_SECRET` e `ENCRYPTION_SECRET`. Vedi [Scalabilità](production/scaling.html). Esegui più
RTE per eseguire più playbook contemporaneamente: vedi [Più RTE](rte/several.html).
