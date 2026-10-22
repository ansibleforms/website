---
layout: default
title: Hardening
parent: Sicurezza
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Hardening
{: .no_toc }

L'account admin, i limiti di accesso, il database, le espressioni, i dati dei job, la policy del browser, le funzionalità facoltative e le opzioni dei ruoli
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'account admin

L'account admin locale viene creato al primo avvio da [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
e [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), il cui valore predefinito è `AnsibleForms!123`.

* Un accesso con la password predefinita pubblica `AnsibleForms!123` deve prima cambiarla: fino ad allora il server risponde
  a ogni richiesta tranne il cambio password con `403` (codice `password_change_required`), e il browser mostra una
  pagina di cambio password che non si può chiudere. La nuova password non può essere di nuovo quella predefinita.
* `ADMIN_PASSWORD` viene letta solo quando l'account viene creato la prima volta: imposta un tuo valore prima del primo avvio.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` reimposta la password a `ADMIN_PASSWORD` a ogni
  avvio. Usala solo per recuperare una password persa, poi rimuovila e riavvia.
* Imposta prima i due segreti principali: vedi [Segreti e cifratura](secrets.html).
* Una volta che l'accesso LDAP o SSO funziona, tieni l'admin locale solo per le emergenze, con una password lunga conservata nel tuo vault.

---

## Limiti di accesso e password

I tentativi di indovinare le password vengono rallentati da tre limiti. I fallimenti si contano nel database, quindi ogni nodo dell'app vede gli
stessi tentativi, e ogni limite si applica senza riavvio:

| Variabile | Predefinito | Cosa fa |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Dopo questo numero di accessi non riusciti, un account locale o LDAP viene bloccato per `LOGIN_LOCKOUT_MINUTES`. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Un indirizzo con questo numero di accessi non riusciti entro `LOGIN_LOCKOUT_MINUTES` viene trattenuto finché quella finestra non termina: un indirizzo che prova molti account. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Per quanto tempo un account resta bloccato, e la finestra in cui si contano i fallimenti. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Richieste al minuto da un indirizzo, per nodo dell'app, su accesso, disconnessione, rinnovo del token e callback di single sign-on. |

Un account bloccato o un indirizzo trattenuto riceve `429` con un'intestazione `Retry-After`, prima che si verifichi qualsiasi password e
che l'account esista o no; oltre `AUTH_RATE_LIMIT` la risposta è ugualmente `429`. Un accesso riuscito azzera il
conteggio dell'account, e lo stesso fa un admin che imposta la password dell'utente. `0` disattiva un limite; `LOGIN_LOCKOUT_MINUTES=0`
disattiva sia il blocco sia il limite per indirizzo.

`LOGIN_MAX_FAILURES_PER_IP` e `AUTH_RATE_LIMIT` contano per indirizzo del client: dietro un reverse proxy, imposta `TRUST_PROXY`
così che l'indirizzo sia quello del client e non quello del proxy, vedi [Indirizzi dei client](../production/reverse-proxy.html#client-addresses).

Una password locale impostata tramite l'applicazione, per un nuovo utente, da un admin o dagli utenti che cambiano la propria, deve avere
almeno [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) caratteri (`8` per impostazione predefinita,
`0` non verifica la lunghezza). Non può essere il nome utente né la password predefinita pubblica. `ADMIN_PASSWORD` non viene verificata.

---

## Il database

AnsibleForms conserva ogni credenziale e ogni job nel suo database MySQL, quindi tieni quel database fuori dalla rete:

* Il progetto docker-compose pubblica MySQL sull'host (`MYSQLDB_LOCAL_PORT`, `3306`) e viene fornito con la password di root
  `AnsibleForms!123`. Rimuovi quella mappatura di porta, o legala a `127.0.0.1`, e cambia la password.
* Connettiti con un account dedicato invece di `root`, impostato in [`DB_USER`](../customization/server.html#env_DB_USER) e
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Ha bisogno di diritti solo sullo schema `AnsibleForms`:

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Questo copre la creazione dello schema (`CREATE DATABASE` compreso), le patch agli aggiornamenti, e i
  [backup](../production/backups.html) e i ripristini, che girano con lo stesso utente: il dump si fa con
  `--no-tablespaces`, quindi non serve nessun diritto a livello di server come `PROCESS`. Sostituisci `%` con l'indirizzo
  dell'applicazione dove puoi. Un utente con diritti su ogni database, come li ha `root`, trasforma una falla nell'applicazione in
  una falla nell'intero server di database: la pagina **Stato** lo segnala nel suo controllo **Utente del database**, e il log
  a ogni avvio.
* Imposta [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0` una volta che lo schema esiste.
  Creare lo schema elimina prima ogni tabella; con `0` né il bootstrap all'avvio né l'endpoint `/api/v2/schema`
  possono eseguirla.

---

## Espressioni e chiamate in uscita

Le espressioni server girano sul server per qualsiasi utente che ha effettuato l'accesso, quindi il sanitizer e i filtri in uscita contano:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` o `paranoid`, mai `legacy`, che permette agli utenti di eseguire codice sul server.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : gli host che le espressioni REST non possono raggiungere, es. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : quando è impostata, le espressioni REST possono raggiungere
  solo questi host e intervalli. La lista dei negati vince su di essa.

Entrambe le liste coprono solo le funzioni helper REST di AnsibleForms stesso; i playbook girano al di fuori di esse e non vengono filtrati.

Dalla 7.3.0 le funzioni helper REST verificano il certificato dell'endpoint, come fa ogni altra connessione.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` disattiva la verifica: usala solo per
endpoint con un certificato autofirmato.

---

## Dati dei job

Le extravars e l'output dei job vengono salvati nel database e mostrati a chiunque possa vedere il job:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : le extravars la cui chiave corrisponde vengono
  mostrate come `********`. Il valore predefinito è `password|secret|token`; i campi password sono sempre mascherati. Estendila con
  i nomi usati dai tuoi moduli, per esempio `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : riduce l'oggetto `ansibleforms_user`
  inviato con ogni job, che altrimenti contiene tutte le appartenenze ai gruppi dell'utente.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) nasconde solo i task rumorosi; nascondi i segreti con `no_log`.

---

## La Content-Security-Policy

L'interfaccia viene servita con un'intestazione Content-Security-Policy, che limita ciò che una pagina può caricare ed eseguire nel browser:

* Gli script arrivano solo dall'applicazione stessa, quindi uno script iniettato in una pagina non viene eseguito.
* Nessun altro sito può mostrare l'interfaccia in un frame.
* Permette ciò di cui l'applicazione ha bisogno: le espressioni locali dei moduli valutate nel browser (`'unsafe-eval'`), gli stili
  inline, le immagini da qualsiasi URL (immagini dei moduli e delle categorie), e i worker dell'editor di codice.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) è `1` per impostazione predefinita e dovrebbe
restare così. Con `0` la policy viene inviata come `Content-Security-Policy-Report-Only`: la console del browser elenca ciò che
bloccherebbe, e nulla viene bloccato. Usa `0` solo per una configurazione che non può ancora funzionare con la policy, come un reverse proxy
che inietta uno script proprio. Una modifica nella pagina delle impostazioni si applica senza riavvio.

---

## Le pagine delle impostazioni e il designer

Gli amministratori possono modificare gran parte della configurazione dal browser. Restringilo dove la configurazione sta altrove:

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : impostazioni in sola lettura, per un [ambiente gestito](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : rimuove il designer integrato quando i moduli
  sono mantenuti in git.

---

## Funzionalità facoltative

Queste funzionalità sono disattivate per impostazione predefinita. Attivale solo quando le usi; una modifica nella pagina delle impostazioni si applica senza riavvio:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : espone il [server MCP](../mcp/) su `/api/v2/mcp`,
  così i client MCP possono avviare moduli con il token di un utente.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : l'[assistente chat](../chat/). Le definizioni dei moduli
  e i valori in compilazione vengono inviati al provider del modello configurato.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) funziona al contrario: è `enforce`
per impostazione predefinita, quindi il server rifiuta un avvio i cui valori violano le regole del modulo, compresi gli avvii tramite l'API REST.
Lasciala così: `log` registra solo ciò che verrebbe rifiutato e `off` non verifica nulla, vedi [Validazione all'avvio](../launch-validation/).

---

## Opzioni dei ruoli

Alcune opzioni di ruolo in [config.yaml](../config/roles.html) concedono più di quanto suggerisca il loro nome. Concedile con attenzione:

| Opzione | Perché conta |
|--------|----------------|
| `allowScheduledJobs` | Un utente che ce l'ha vede e può modificare ogni pianificazione, e una pianificazione gira con diritti di admin, per qualsiasi modulo. Considerala di livello admin. |
| `allowBackupOps` | Comprende il **ripristino**, che sostituisce l'intero database. |
| `showSettings` | Apre le pagine di amministrazione. Senza il ruolo admin, non può modificare gli account e i gruppi indicati dal ruolo admin, vedi [Utenti e gruppi](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Mostra il log del server, che può contenere nomi host, nomi utente e dettagli degli errori. |
| `showConnectionsSettings` | Apre le pagine delle connessioni: credenziali, runner, canali di notifica e altro. Aggiungere, modificare ed eliminare runner e archivi di segreti resta compito di un admin, e così le credenziali delle connessioni e degli accessi. Di un repository, aggiungerlo o eliminarlo e cambiarne l'indirizzo, il branch o i flag `use_for_*` resta compito di un admin. |
| `showAllJobLogs` | Mostra i job di tutti gli utenti, non solo quelli dell'utente stesso. |
| `manageAllJobs` | Interrompe, elimina e rilancia i job di tutti gli utenti. |
| `allowApiTokens` | Permette all'utente di creare token API che durano fino a [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 per impostazione predefinita). Disconnettersi con un token o revocarlo lo termina, e un cambio di password termina tutti i token dell'utente, vedi [Token](secrets.html#tokens). |
| `extendedTokenExpiration` | Con `allowApiTokens`, permette anche all'utente di creare token API che non scadono mai. |
| `allowFileUploads` | Permette all'utente di caricare file tramite i campi file di un modulo. Attiva per ogni utente a meno che un ruolo non la disattivi. |
| `allowChat`, `allowMcp` | Permettono all'utente di usare l'assistente chat e il server MCP, quando sono attivati. `allowChat` è attiva per ogni utente a meno che un ruolo non la disattivi, e `allowMcp` segue `allowChat` a meno che un ruolo non la imposti. |

Un utente senza il ruolo `admin` non riceve nessuna delle opzioni di livello admin qui sopra a meno che un ruolo non gliele conceda. Quando il ruolo `admin`
non imposta nessuna opzione, i suoi utenti ricevono `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` e `allowScheduledJobs`. `allowApiTokens` ed
`extendedTokenExpiration` restano disattivate anche per il ruolo `admin`: impostale sui ruoli che ne hanno bisogno.

Quando più ruoli di un utente impostano la stessa opzione, vince `false`. Le opzioni del ruolo `default` completano solo le opzioni
che nessuno dei ruoli propri dell'utente imposta; non prevalgono mai su di essi.
