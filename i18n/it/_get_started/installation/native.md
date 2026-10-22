---
layout: default
title: Nativa
parent: Installazione
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Installazione nativa
{: .no_toc }

AnsibleForms direttamente sul server, senza container, come servizi systemd preparati dall'installer
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori di server in cui i container non sono consentiti: l'[installer](installer.html) installa tutto ciò che serve ad AnsibleForms
sul server stesso, poi lo aggiorna e lo rimuove. Installa AnsibleForms 7.3.0 o successivo.

---

## Cosa richiede

Scegli **Direttamente su questo server, senza container** al passo **Motore** dell'installer, o passa `--mode native`. Richiede:

* **Root** : esegui l'installer con `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : i servizi girano come unit systemd
* **Un Linux supportato** : Ubuntu, Debian, RHEL e le sue ricompilazioni come Rocky Linux e AlmaLinux, SUSE Linux Enterprise o openSUSE
* **amd64 o arm64**
* **Accesso a Internet** : ai repository della distribuzione, a GitHub, a nodejs.org e agli indici dei pacchetti Python e Ansible (vedi
  [Air-gapped](#air-gapped) per ciò che sostituisce un bundle di release)

Su un server che non soddisfa questi requisiti, il motore compare come *Direttamente su questo server (richiede root: eseguilo con sudo)* o
*Direttamente su questo server (non supportato su questo Linux)*. Entrambi i ruoli si installano in questo modo: un controller e un [Runner](installer.html#a-runner).

---

## Cosa installa

L'installer installa questi pacchetti della distribuzione, per entrambi i ruoli:

| Pacchetto | Perché |
|---|---|
| `git` | I repository |
| Il client ssh | Le connessioni dei playbook |
| Il client MariaDB | I backup dell'app: `app.env` imposta [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) e [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) sul client trovato, `mariadb-dump` e `mariadb` o i più vecchi `mysqldump` e `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | I download |
| `libatomic` | Node.js si collega a essa, e i server minimali non la hanno |
| `sshpass` | I playbook che accedono con una password ssh. Su RHEL e le sue ricompilazioni arriva da EPEL, che l'installer prova ad abilitare con `epel-release`; quando non si può installare, l'installazione prosegue e lo segnala |
| Il server MariaDB | Solo un controller: il suo database |

Poi, nella cartella di installazione, con ogni download verificato con il suo checksum pubblicato:

* **AnsibleForms** : il bundle di release `ansibleforms-<version>-linux-<arch>.tar.gz` dalla release GitHub dell'app, l'app compilata per
  Node.js. Una versione senza bundle dice *Senza container serve AnsibleForms 7.3.0 o successivo.*
* **Node.js** : l'ultima release della major indicata dal bundle, da nodejs.org
* **Python e Ansible** : uv, poi con esso il Python delle immagini RTE e un ambiente virtuale con Ansible e le librerie
  dell'immagine RTE full, poi le sue collection Ansible (vedi [Le immagini RTE](../rte/images.html)). Richiede qualche minuto
* **I file iniziali** : i moduli, i playbook e le impostazioni della cartella `data` del [progetto docker-compose](https://github.com/ansibleforms/docker),
  come li riceve una nuova installazione Docker Compose. Un Runner mantiene solo la sua configurazione Ansible e le impostazioni ssh e git

Per un controller crea poi lo schema `AnsibleForms` in MariaDB, e un utente del database con il nome dell'istanza, con tutti i diritti su quello
schema e nessuno altrove, che accede solo da questo server.

---

## La cartella

Tutto si trova nella cartella di installazione, per impostazione predefinita `/opt/ansibleforms` (o `/opt/ansibleforms-runner` per un Runner):

| Percorso | Cosa contiene |
|---|---|
| `releases/<version>/` | Una release: il bundle, il suo link a Node.js, il suo ambiente virtuale Python e le sue collection |
| `current` | Il link alla release in esecuzione; un aggiornamento lo sposta, e così un rollback |
| `runtime/` | Node.js, uv e Python, condivisi dalle release |
| `data/` | Ciò che i container montano come `/app/dist/persistent`: moduli, playbook, `config.yaml`, il config seed, certificati e log |
| `home/` | La home dell'utente di sistema: `.ssh` e `.gitconfig`, collegati a `data/ssh` e `data/git` |
| `app.env`, `rte.env` | Le impostazioni e i segreti dei servizi, leggibili solo da root e dall'utente di sistema. Quello dell'RTE non contiene impostazioni del database |
| `installer-backups/` | I backup del database fatti dall'installer, prima di un aggiornamento o con `backup` |

Le release e i runtime appartengono a root, quindi i servizi non possono modificare il proprio codice; `data/` e `home/` appartengono all'utente di sistema.
I file del database sono conservati da MariaDB, fuori dalla cartella.

---

## I servizi

Un controller esegue due servizi systemd, un Runner uno. Ognuno gira come un utente di sistema con il nome dell'istanza (`ansibleforms` per impostazione predefinita),
da `current/server`, con il suo file di impostazioni:

| Servizio | Cosa esegue | Impostazioni |
|---|---|---|
| `<name>` | L'app: l'interfaccia web, l'API e il worker. Solo un controller | `app.env` |
| `<name>-rte` | L'RTE che esegue i playbook | `rte.env` |

L'RTE di un controller è `inbound` su una porta tutta sua su `127.0.0.1` (`8001`, o la prima libera successiva, con
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), esegue i playbook dalle cartelle dell'app (`RTE_FILES=local`),
ed è dichiarato dal config seed `data/seed.yaml` come runner predefinito.

L'RTE di un Runner riceve la modalità, `APP_URL`, `RTE_NAME` e, con `--join`, il token di adesione, e riceve i playbook con ogni job (vedi
[Modalità](../rte/modes.html)). Uno in uscita non riceve chiamate dall'app, quindi ascolta solo su `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Uno in entrata serve HTTPS con un certificato autofirmato del proprio indirizzo in `data/certificates`, che AnsibleForms fissa.
Senza un token di adesione chiede di unirsi, e un admin lo approva in **Connessioni > Runner**.

Si avviano al boot e si riavviano dopo un errore. Gestiscili e leggi i loro log con gli strumenti di systemd:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

L'app può ascoltare su una porta sotto la 1024, come `443`, senza root. L'RTE mantiene il diritto di usare `sudo`, che serve ai playbook con
`become` su questo server, così un playbook può gestire il server su cui gira l'RTE.

---

## Aggiornamento e rollback

`sudo /usr/local/bin/ansibleforms-installer upgrade` aggiorna un'installazione nativa come fa con le altre (vedi [Aggiornamento](installer.html#upgrade)), in
questo ordine:

1. Mette in posizione la nuova release accanto a quella in esecuzione: il suo bundle, Node.js, Python, Ansible e le collection. I servizi
   in esecuzione non vengono ancora toccati
2. Aggiunge i nuovi file iniziali portati dalla release, mantenendo ogni file esistente
3. Fa il backup del database (un controller) in `installer-backups/`, con una copia di `app.env` e `rte.env`
4. Ferma i servizi, fa puntare `current` alla nuova release, e li riavvia
5. Aspetta che l'app risponda con la nuova versione (un Runner: che il suo RTE torni ad ascoltare)

Quando la nuova versione non risponde, l'installer propone di tornare indietro: `current` punta di nuovo alla release precedente, il
database viene ripristinato dal backup, e i servizi si avviano. Vengono conservate solo la release in esecuzione e quella precedente.

I servizi nativi con la struttura dell'installer senza un `installer.json` accanto, per esempio dopo che è stato eliminato, vengono trovati da `install`
e `upgrade`, che propongono di prenderli in carico (vedi [Un'installazione esistente](installer.html#an-existing-installation)).

---

## Disinstallazione

`sudo /usr/local/bin/ansibleforms-installer uninstall` ferma e rimuove i servizi. Mantiene la cartella e il database, a meno che tu non scelga di eliminare
i dati (o passi `--purge`) e digiti il nome dell'istanza per confermare. In quel caso elimina anche il database e il suo utente (un controller),
cancella la cartella e rimuove l'utente di sistema.

I pacchetti restano installati, MariaDB compreso: altri software potrebbero usarli.

---

## Air-gapped

`--bundle` installa da un bundle di release che hai copiato sul server, invece di scaricarlo da GitHub. Prendi il file per la sua
architettura, `ansibleforms-<version>-linux-amd64.tar.gz` o `-arm64`, dalle [Releases](https://github.com/ansibleforms/ansibleforms/releases) dell'app:

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` fa lo stesso per i file iniziali, da una copia locale del repository [ansibleforms/docker](https://github.com/ansibleforms/docker).
Node.js, Python con i suoi pacchetti e le collection Ansible vengono comunque scaricati durante l'installazione.
