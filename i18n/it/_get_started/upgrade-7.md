---
layout: default
title: Aggiornare alla v7
parent: Aggiornamento
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Aggiornare alla v7
{: .no_toc }

Cosa cambiare quando sei ancora sulla 6.5, e cosa cambia quando passi alla versione 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La versione 7 elimina tutto ciò che la 6.x aveva deprecato; correggilo prima sulla 6.5, dove funzionano sia il vecchio sia il nuovo, poi aggiorna.

---

## Prima di aggiornare (sulla 6.5)

### I moduli stanno nei loro file

I moduli stanno solo nella cartella dei moduli (`FORMS_FOLDER_PATH`) o in un repository di moduli; `config.yaml` conserva categorie, ruoli e costanti.

- **Un file `forms.yaml`:** rinominalo in `config.yaml`. Sulla 6.5 la pagina delle impostazioni ha un pulsante
  **Convert forms.yaml to config.yaml** per questo.
- **Una sezione `forms:` nella configurazione di base:** la versione 7 la rifiuta. Sposta ogni modulo nel suo file, per esempio
  trascinandolo su un file nel designer della 6.5.
- **Variabili d'ambiente:**

  | Rimossa | Usa invece |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` e `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### Il campo `table`

La versione 7 rifiuta i campi `table`, e con loro se ne vanno le loro proprietà (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`): usa un campo `list` con un `subform`, e trasforma il `from` di ogni colonna in un'espressione
su `__parent__` (vedi le [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Proprietà rinominate

Ogni proprietà rimossa ha un sostituto diretto:

| Rimossa | Usa invece |
|---|---|
| `disableRelaunch: true` (modulo) | `allowRelaunch: false` |
| `noOutput: true` (campo) | `output: false` |
| `enableLogin` (opzione del ruolo) | `allowLogin` |

### Datasource e schemi di dati

Le importazioni dei datasource e le loro pagine di amministrazione sono state rimosse, così come la
collection Galaxy di AnsibleForms, i cui moduli servivano solo a esse.

- Le importazioni pianificate si fermano e le tabelle dei datasource vengono eliminate: annota prima ciò che ti serve.
- Gli schemi di dati riempiti da un'importazione sono database a sé e restano. Un modulo che
  li interroga tramite una credenziale continua a funzionare.
- Per mantenere aggiornati quei dati, esegui l'importazione come un tuo playbook, per esempio da una
  pianificazione.

### API v1

`/api/v1/*` è stata rimossa; usa `/api/v2/*` (documentazione interattiva su `/api/v2/docs`). Le chiamate
che gli script usano di solito sono:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

La v2 risponde con codici di stato HTTP (`400`, `403`, `404`, `422`) e un corpo JSON semplice, non con l'involucro
`{ status, message, data }` della v1.

**Anche i callback del single sign-on.** Un URL di reindirizzamento con `/api/v1/` non risponde più: l'accesso torna
alla pagina di login senza accedere. Cambialo in `/api/v2/` in due punti, sul provider SSO in
AnsibleForms e nell'identity provider (gli URI di reindirizzamento della registrazione dell'app Entra ID, gli URI di reindirizzamento validi
del client OIDC):

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback`, o `/api/v2/auth/entraid/callback` dalla 7.3.0
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## Cosa cambia nella 7

La versione 7 cambia il modo in cui vengono eseguiti i playbook e rende più restrittive diverse impostazioni predefinite. Controlla ogni punto qui sotto quando passi dalla 6.5.

### I playbook girano su un RTE

La versione 7 non esegue più `ansible-playbook` nel container di AnsibleForms. I playbook girano su un ambiente di runtime (RTE),
un container a sé, e l'immagine dell'app non contiene più né ansible né python. Avvia un RTE accanto all'app, dall'immagine
`ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Dalla 7.3.0 l'app contatta l'RTE e tiene aperto un WebSocket (vedi
[Modalità](rte/modes.html)): l'RTE non riceve impostazioni del database né `ENCRYPTION_SECRET`. Le sue impostazioni:

| Impostazione | Valore |
|---|---|
| `AF_ROLE` | `rte`. Le immagini RTE la impostano già. |
| `RTE_MODE` | `inbound`: l'app contatta l'RTE. Un Runner in un'altra rete usa `outbound` (vedi [Modalità](rte/modes.html)). |
| `RTE_TOKEN` | Un token di almeno 16 caratteri. L'app accede con esso al socket dell'RTE, e l'RTE si rifiuta di partire senza. |
| `RTE_FILES` | `local` quando l'RTE monta la stessa cartella persistente dell'app, come quando le sta accanto. |

Poi sposta i mount di ansible dal container dell'app all'RTE:

- `ansible.cfg` in `/etc/ansible/ansible.cfg`, i tuoi ruoli in `/etc/ansible/roles` e le tue collection in
  `/etc/ansible/collections`.
- Monta anche sull'RTE la stessa cartella persistente dell'app, così trova i playbook e i repository.

Poi dichiara l'RTE come runner, nel [config seed](seed/) come fa il progetto Docker Compose, o in **Connessioni → Runner**:
una credenziale RTE con l'indirizzo dell'RTE (per esempio `http://rte:8000`) e lo stesso token, e un runner di tipo RTE, in modalità inbound,
che la nomina:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Il seed legge `RTE_TOKEN` dall'ambiente dell'app. Vedi [Runner](runners.html) e [Ambienti di runtime](rte/).

{: .warning }
> **Lo stesso contratto per l'app e l'RTE** L'app risolve le credenziali di un job e le passa all'RTE sigillate per
> quell'RTE (contratto RTE 2, novità della 7.0.0). Un RTE con un altro contratto rifiuta i job dell'app: esegui l'immagine RTE della stessa
> release dell'app, e aggiornali insieme. Le release 7 successive continuano a funzionare con un RTE 7 più vecchio finché il contratto
> resta lo stesso (vedi [Scalabilità](../rte/images.html#build-your-own-rte)).


### Cosa contiene l'immagine RTE

L'RTE è disponibile in tre livelli, ognuno costruito sul precedente. Scegli quello adatto ai tuoi playbook:

| Immagine | Contenuto |
|---|---|
| `ansibleforms-rte-full` | Quella predefinita. Ansible 14 con ansible-core 2.21, e le collection e le librerie python che aveva l'immagine 6.5. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core e alcune librerie comuni, senza collection. Aggiungi le tue in un'immagine costruita su di essa. |
| `ansibleforms-rte-base` | Solo il server, senza python né ansible, per costruire un RTE con le tue versioni. |

Passare dalla 6.5 (ansible 12 con ansible-core 2.19) cambia anche queste cose per i tuoi playbook:

- **ansible-core 2.21:** leggi le [guide al porting](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  per la 2.20 e la 2.21.
- **Python 3.14:** i livelli RTE girano su python 3.14.
- **Niente più `boto`:** la vecchia libreria `boto` 2 non c'è più. La collection `amazon.aws` usa `boto3`, che è inclusa.

Due variabili d'ambiente ora appartengono all'RTE e non sono più lette dall'app, quindi impostale nel container dell'RTE:

| Variabile | Cambiamento |
|---|---|
| `ANSIBLE_PATH` | La cartella dei playbook, sull'RTE. |
| `PROCESS_MAX_BUFFER` | Ora 50 MB per impostazione predefinita. Oltre questo limite, l'output del job non viene più salvato (il job lo segnala), ma il playbook prosegue invece di essere fermato. |


### I container girano come uid 1000

Le immagini dell'app e dell'RTE girano come utente `node` (uid 1000) invece che come root, e la loro cartella home è `/home/node`:

- **Assegna i volumi all'uid 1000, una volta.** Per i volumi persistente e ssh, esegui
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v`; per una cartella dell'host, `sudo chown -R 1000:1000 <folder>`.
  Su Kubernetes, imposta `fsGroup: 1000`.
- **Monta la cartella ssh su `/home/node/.ssh`**, non su `/root/.ssh`. Se hai impostato
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) su `/root`, rimuovilo o impostalo su `/home/node`.
- **La tua immagine RTE** costruita su un livello RTE passa a `USER root` per le sue installazioni e torna a `USER node` alla fine.


### La validazione all'avvio è attiva

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) ora vale per impostazione predefinita `enforce` (6.5: `off`). Ogni
avvio, dal browser o da `POST /api/v2/job`, viene controllato rispetto alle regole del modulo, e il job usa le extravars e
le credenziali che il server costruisce dai valori controllati.

- **I client REST devono inviare `rawFormData`**, i valori grezzi dei campi come li invia il browser. Un avvio con solo
  `extravars` viene rifiutato, perché i suoi valori non si possono controllare.
- **Per vedere prima cosa verrebbe rifiutato**, imposta `LAUNCH_VALIDATION=log` e leggi gli avvisi nel log. `off` ripristina il
  comportamento della 6.5.

Vedi [Validazione all'avvio](launch-validation/) per i dettagli.


### I playbook non vedono più le impostazioni dell'app

Un playbook non eredita più le variabili d'ambiente che AnsibleForms legge per sé: `ENCRYPTION_SECRET`, le impostazioni `DB_*`,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, le impostazioni `VAULT_*`, ogni altra variabile documentata e ogni variabile `MYSQL_*`.
Il resto dell'ambiente dell'RTE, come `PATH`, i proxy, le impostazioni `ANSIBLE_*` e le credenziali cloud, viene passato come prima.

Un playbook che leggeva una di queste con `lookup('env', ...)` deve ottenere il valore in un altro modo: passalo come extravar o come
credenziale, o impostalo sull'RTE con un altro nome.

### Solo il ruolo admin gestisce runner e admin

Un utente con accesso alle impostazioni non ha più il pieno controllo su chi è admin e su dove vanno le credenziali:

- **Runner:** solo il ruolo admin aggiunge, modifica o elimina un runner, perché un runner riceve le credenziali dei job
  che esegue. Gli utenti con accesso alle impostazioni possono ancora vedere e provare i runner.
- **Account e gruppi admin:** solo il ruolo admin concede i diritti di admin. Senza di esso, un utente non può mettere un account in un gruppo nominato
  dal ruolo admin, né modificare, reimpostare o eliminare un account admin o un gruppo del genere.
- **Ruoli:** un designer senza il ruolo admin non può modificare i ruoli. Un salvataggio o un ripristino i cui ruoli sono diversi viene rifiutato.

Dai il ruolo admin a chi gestisce runner, admin e ruoli.

### La password predefinita va cambiata

Un utente che accede con la password predefinita pubblica `AnsibleForms!123` deve prima cambiarla. Fino ad allora, ogni altra chiamata
API risponde `403` con il codice `password_change_required`, e il browser mostra la pagina di cambio password.

Accedi una volta e scegli una nuova password, o imposta [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) prima del
primo avvio. Gli script che accedono con la password predefinita devono usarne un'altra.

### I token terminano al logout e al cambio password

Un logout ora termina i token di quella sessione, e un cambio password termina tutte le sessioni di quell'utente, quindi accedi di nuovo dopo
aver cambiato una password.

Un token API richiesto con `?expiryDays=` dura al massimo [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) giorni
(90 per impostazione predefinita). Gli script che usano token API di lunga durata devono richiederne uno nuovo prima che scada.

### Entra ID ha bisogno del tuo tenant

L'accesso con Entra ID (Azure AD) ora usa OpenID Connect solo verso il tuo tenant, e un utente di un altro tenant non può
accedere. Un provider senza ID tenant, o con `common`, `organizations` o `consumers`, viene rifiutato.

- **Imposta l'ID tenant** sul provider SSO: il Directory (tenant) ID, un GUID, o il dominio del tenant.
- **Concedi i permessi Graph:** il login chiede `openid profile email User.Read GroupMember.Read.All`. Dai alla registrazione
  dell'app i permessi delegati di Microsoft Graph `User.Read` e `GroupMember.Read.All`, con consenso dell'amministratore.
- **Preferisci gli ID dei gruppi nei ruoli:** indica un gruppo come `azuread/<object id>` (`entraid/<object id>` dalla 7.3.0) invece che con il suo nome visualizzato.

Vedi [Entra ID](authentication/entra-id.html) per la configurazione.

### Le password hanno una lunghezza minima

Una password locale impostata tramite l'applicazione ha bisogno di almeno
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) caratteri (8 per impostazione predefinita), e non può essere il nome utente né la
password predefinita. `PASSWORD_MIN_LENGTH=0` disattiva il controllo della lunghezza. Le password esistenti continuano a funzionare.

### Esegui i container con una restart policy

Un'eccezione non gestita ora termina il processo, registrata a livello `crit`, invece di lasciarlo in esecuzione in uno stato sconosciuto. Esegui
i container con una restart policy, come `--restart unless-stopped` con Docker (il progetto docker-compose la imposta).
Kubernetes riavvia i pod da sé.

### Connessioni AWX e il link home

Altre due cose spariscono nella 7, senza nulla da fare sulla 6.5:

- **Connessioni AWX e AAP:** la tabella `awx`, `/api/v2/awx` e la pagina A.A.P. non ci sono più. L'aggiornamento sposta ogni connessione AWX o
  AAP in **Connessioni → Runner**, come runner di tipo `awx`, e i moduli con `awx:` continuano a funzionare.
- **`NAV_HOME_LABEL` e `NAV_HOME_ICON`:** non vengono più letti. Il primo link dell'intestazione è sempre Moduli.

### Deprecato nella 7, rimosso nella 8

Questi funzionano ancora nella 7, ma ognuno registra un avviso quando viene usato. Passa al sostituto prima della versione 8:

| Deprecato | Usa invece |
|---|---|
| Variabili d'ambiente `VAULT_*` | Un archivio di segreti chiamato `vault` (**Connessioni → Archivi di segreti**). Il primo avvio della 7 importa le variabili una volta come quell'archivio, poi le ignora. |
| Variabili d'ambiente `LOG_SYSLOG_*` | Un server syslog (**Connessioni → Syslog**). Quando `LOG_SYSLOG_HOST` è impostata, il primo avvio della 7 le importa una volta come il server `syslog`, che riceve il log del server come prima, poi le ignora. Per inviare anche le voci di audit, impostalo per ricevere entrambi. |
| `vault_path` su una credenziale (API, config seed) | `secret_store` e `secret_ref`. Vedi [Archivi di segreti](secret-stores/). |
| Il ruolo `public` in `config.yaml` | Il ruolo `default`. Il file viene rinominato quando la configurazione si carica; rinomina a mano un template ytt. `public` nei `roles:` di un modulo continua a corrispondere. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` su un modulo o un passo | `approval`. `hasApproval` non ha effetto. |
| `awx: <name>` su un modulo | `runner: <name>`. Una connessione AWX è un runner di tipo `awx`. |
| `type: multistep` su un modulo, con i suoi `steps` | `type: workflow`, con nodi che nominano un `runner`. Vedi [Moduli workflow](forms/workflow.html). |
| La sezione `awx:` del config seed | Elementi `runners:` con `type: awx` |
| `LOCK_PATH` | Niente: non viene più letto, il blocco del designer è conservato nel database. |
| Un RTE in modalità database, dalla 7.3.0: `RTE_MODE=database` o nessun `RTE_MODE`, con i `DB_*` del database e `ENCRYPTION_SECRET` sull'RTE | `RTE_MODE=outbound` o `RTE_MODE=inbound`, senza `DB_*`. L'RTE si unisce una volta con un token di adesione (`RTE_JOIN_TOKEN`), oppure il suo runner viene impostato su quella modalità in **Connessioni → Runner** o nel config seed (`rte_mode`). Vedi [Modalità](rte/modes.html). |
| `RTE_REGISTER`, dalla 7.3.0 (solo modalità database) | Un token di adesione (`RTE_JOIN_TOKEN`): l'RTE si aggiunge come runner che accede con una credenziale RTE. |
| Una credenziale `api` o `userpass` su un runner del config seed, dalla 7.3.0 | Una credenziale del tipo del runner (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` o `jenkins`), con il suo server in `url`. |
| Un runner del config seed con un proprio `token`, o `username` e `password`, dalla 7.3.0 | Una credenziale del tipo del runner nella sezione `credentials`, con il suo server in `url`, che il runner nomina con `credential:`. Nel frattempo il seed ne crea una con il nome del runner. |

`ENABLE_SSO` e `SSO_AUTO_LOGIN` non vengono più letti dalla 7.3.0. Il primo avvio della 7.3 li trasferisce una volta: `ENABLE_SSO=0` disattiva
ogni provider SSO, e `SSO_AUTO_LOGIN=1` spunta **Salta la pagina di accesso** sull'unico provider abilitato. Poi vengono ignorati: ogni avvio
registra un avviso finché sono impostati, e ogni provider ha **Abilitato** e **Salta la pagina di accesso** in **Accesso → SSO**.

---

## Tag delle immagini

`latest` passa alla 7 con la 7.0.0. Per restare sulla 6, usa il tag `6` (o `6.5`) invece di `latest`.
Tutti i tag sono elencati in [Tag delle immagini](installation/#image-tags).

---

## Tornare indietro

Fai un backup prima di aggiornare (**Impostazioni → Backup**). La 6.5 gira su un database aggiornato alla 7, ma solo
il backup ripristina le definizioni dei datasource eliminate.
