---
layout: default
title: Risoluzione dei problemi
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Risoluzione dei problemi
{: .no_toc }

Messaggi di errore e sintomi, perché si verificano e come risolverli
{: .fs-6 .fw-300 }

---

Ogni problema qui sotto ha come titolo il messaggio o il sintomo che vedi, seguito dalla causa e dalla soluzione. I messaggi sono citati
esattamente come li scrive AnsibleForms; `<name>` indica un valore che cambia caso per caso. La maggior parte finisce nel log del
server, che puoi leggere in [Log del server](gui/administration.html#server-log) o con `docker logs`.

**Database e avvio**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Configurazione e moduli**

* [Could not load the forms](#could-not-load-the-forms)
* [La configurazione di base ha una sezione forms](#the-base-config-has-a-forms-section)
* [Un modulo manca dalla dashboard](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Accesso**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [L'autenticazione Azure AD o OIDC non riesce](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Disconnessi dopo un riavvio o dopo un giorno](#logged-out-after-a-restart-or-after-a-day)
* [Moduli e job vuoti dopo un single sign-on (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Job**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Un job mostra lo stato abandoned](#a-job-shows-the-status-abandoned)
* [Un RTE non si connette](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Repository git e backup**

* [Il clone o il pull di un repository non riesce](#a-repository-clone-or-pull-failed)
* [Il repository dei moduli non è ancora clonato](#the-forms-repository-is-not-cloned-yet)
* [Un backup non riesce](#a-backup-failed)

Le [FAQ](faq.html) trattano a fondo due problemi collegati: una
[password di admin persa](faq.html#recovering-a-lost-admin-password) e
[la restrizione delle destinazioni degli helper REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms non si avvia, e il log ripete queste righe ogni 5 secondi:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Perché succede**

All'avvio, AnsibleForms aspetta che il database risponda a una query, e continua ad aspettare finché non risponde.
Il `<reason>` è il messaggio del driver del database: una connessione rifiutata o scaduta indica l'host o la porta,
un messaggio di accesso negato il nome utente o la password.

**Come risolverlo**

Controlla [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) e [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
Dentro un container, `localhost` è il container stesso, non l'host che esegue MySQL. Assicurati che MySQL ascolti
su un indirizzo di rete e che l'utente possa connettersi dall'host di AnsibleForms. AnsibleForms prosegue da solo non appena
il database risponde; non serve riavviare.

---

## Schema is not ready, skipping group and user initialization

Il browser apre una pagina del database invece della pagina di accesso, e il log mostra:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Perché succede**

Lo schema `AnsibleForms` manca o è incompleto. Un database *vuoto* viene preparato automaticamente all'avvio, a meno che
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) non sia `0`. Se questo non riesce, per esempio perché
l'utente del database non può creare uno schema, il log dice `Failed to create the schema automatically : <reason>`. Uno schema
che esiste ma a cui mancano delle tabelle (`Table '<name>' is not present`) non viene mai ricreato automaticamente, perché creare lo
schema elimina prima tutte le tabelle. La pagina del database dice allora *It appears that you have an unuseable schema*.

**Come risolverlo**

Su un'installazione nuova, dai all'utente del database il diritto di creare lo schema `AnsibleForms` e riavvia, oppure premi
**Crea** nella pagina del database. Con uno schema presente solo in parte, ripristina un backup o rimuovi lo schema `AnsibleForms`
incompleto così che AnsibleForms possa crearlo di nuovo. Il log elenca quali tabelle e patch non sono riuscite.

---

## Schema creation is disabled

La creazione dello schema, dalla pagina del database o con `POST /api/v2/schema`, non riesce con:

```
Schema creation is disabled
```

**Perché succede**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) è `0`, il che disattiva sia la creazione
automatica all'avvio sia l'endpoint. Su un database che ha già degli utenti, l'endpoint rifiuta anche i chiamanti che non hanno
effettuato l'accesso come amministratore, con `Schema creation requires an authenticated administrator`.

**Come risolverlo**

Crea lo schema una volta con `ALLOW_SCHEMA_CREATION=1` (è il valore predefinito), o ripristinalo da un backup, e poi rimetti la
variabile a `0`. Su un database già preparato, accedi come amministratore prima di ricreare lo schema, e ricorda
che elimina e ricrea tutte le tabelle.

---

## Config seed failed, refusing to start

Il container esce subito dopo l'avvio, e il suo output termina con:

```
Config seed failed, refusing to start : <reason>
```

**Perché succede**

Il file in [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) non è stato applicato: per esempio non è YAML
valido o viola lo schema del seed; `<reason>` dice cosa è andato storto. AnsibleForms si rifiuta di avviarsi piuttosto che
girare con metà dei suoi oggetti dichiarati. Il motivo viene scritto anche sullo standard error, quindi `docker logs` e `kubectl logs` lo mostrano.

**Come risolverlo**

Correggi ciò che indica `<reason>` e avvia di nuovo. Vedi [Ricaricamento e avvio](seed/reloading.html) per come viene applicato
il seed, ed [Esempio](seed/example.html) per un file valido.

---

## ENCRYPTION_SECRET is not set

Ogni avvio registra questo avviso:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

Oppure il worker si rifiuta di avviarsi con:

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Perché succede**

I segreti salvati sono cifrati con [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET): dalla 7.3.0 stanno nelle
credenziali (le password e i token di directory LDAP, provider SSO, runner e archivi di segreti, tra gli altri), accanto agli indirizzi
dei webhook di Slack e Teams. Senza di essa, viene usata una chiave che è pubblica nel codice sorgente. Dalla 7.3.0, un avvio con un nuovo
`ENCRYPTION_SECRET` cifra di nuovo con esso ogni segreto salvato, in un'unica transazione: dalla chiave predefinita quando viene impostato per la prima
volta, o da [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) quando cambia. Quando i
segreti salvati non sono stati cifrati con nessuna delle due, non viene modificato nulla e AnsibleForms non si avvia.

**Come risolverlo**

Imposta `ENCRYPTION_SECRET`, e conservalo con gli altri tuoi segreti: i backup non lo contengono mai. L'avvio successivo registra
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Per cambiarlo in seguito, imposta il nuovo valore in
`ENCRYPTION_SECRET` e quello vecchio in `ENCRYPTION_SECRET_PREVIOUS` per un avvio, poi rimuovi `ENCRYPTION_SECRET_PREVIOUS`. Quando il
worker si rifiuta di avviarsi, imposta `ENCRYPTION_SECRET_PREVIOUS` sulla chiave con cui sono stati cifrati i segreti, o rimetti il vecchio valore.

---

## Could not load the forms

La dashboard non mostra nessun modulo e segnala:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Perché succede**

La configurazione di base (`config.yaml`) non si è potuta leggere o non è valida. Il `<reason>` dice quale dei due:

| Motivo | Causa |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Un errore di sintassi YAML |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Un file vuoto, o con solo commenti |
| `Duplicate role name(s) : <names>. Each role must appear once.` | Lo stesso ruolo è definito due volte |
| `There is no config.yaml nor could one be created from template.` | `config.yaml` manca e la sua cartella non è scrivibile |
| `There is no forms directory nor could there be one created from template.` | La cartella dei moduli manca e non si può creare |
| Qualsiasi altra riga | La configurazione viola lo schema, per esempio un ruolo senza `groups` |

**Come risolverlo**

Correggi il file indicato da [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH), o il `config.yaml` nel
repository usato per la configurazione. Quando mancano dei file, fai puntare [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) e
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) a una posizione scrivibile e persistente. Vedi
[config.yaml](config/) per la struttura.

---

## La configurazione di base ha una sezione forms

Dopo un aggiornamento dalla 6.x la dashboard è vuota, e il pannello degli avvisi mostra:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Perché succede**

Dalla 7.0.0, ogni modulo sta nel suo file nella cartella dei moduli. I moduli ancora elencati in `config.yaml` vengono
ignorati.

**Come risolverlo**

Sposta ogni modulo nel suo file in [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Vedi
[Aggiornare alla 7.x](upgrade-7.html).

---

## Un modulo manca dalla dashboard

Un file di modulo esiste, ma un utente non vede il modulo nella dashboard.

**Perché succede**

Un utente vede un modulo solo quando uno dei `roles` del modulo è uno dei ruoli dell'utente; gli admin vedono tutti i moduli. Ogni utente ha
il ruolo `default`, quindi un modulo con `roles: [default]` è visibile a tutti. I ruoli di un utente vengono dai gruppi e dagli utenti
elencati sotto `roles` in `config.yaml`. Un modulo senza `categories` compare sotto **Default**, quindi manca dalle
altre categorie, pur essendo elencato sotto **Tutti i moduli**. Infine, un modulo che non supera la validazione viene saltato. La
dashboard mostra allora un pulsante **Questa configurazione ha Avvisi o errori**, che apre messaggi come:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Come risolverlo**

Apri il pannello degli avvisi e correggi ciò che elenca. Controlla i ruoli dell'utente in
[Permessi](profile/permissions.html) nel profilo, e i `roles` e le `categories` del modulo. Vedi
[Ruoli](config/roles.html) e [Categorie](config/categories.html). Quando due file definiscono lo stesso nome di modulo,
vince il primo caricato.

---

## Could not save the forms

Il salvataggio nel designer non riesce con:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Perché succede**

Il designer valida ogni modulo rispetto allo schema prima di scrivere qualsiasi cosa. Ogni riga di `<messages>` indica il
modulo e il campo che violano una regola. Le opzioni rimosse nella 7.0.0 hanno un messaggio apposito, per esempio
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Come risolverlo**

Correggi i campi indicati dai messaggi. Per le opzioni rimosse dalla 7.0.0, segui [Aggiornare alla 7.x](upgrade-7.html).
Per validare i file dei moduli prima che arrivino ad AnsibleForms, vedi
[Validazione in VS Code dei file dei moduli](faq.html#vs-code-validation-for-form-files) nelle FAQ.

---

## The editor is read-only

Il designer mostra **Bloccato** con il nome di un altro utente, e il salvataggio non riesce con:

```
The editor is read-only
```

**Perché succede**

Solo una persona alla volta può modificare i moduli. Il blocco viene preso quando qualcuno avvia il designer, e resta finché
non lo ferma, anche se ha chiuso il browser senza fermarlo. L'API rifiuta un salvataggio da chiunque altro con
`Designer is locked by <username>`.

**Come risolverlo**

Chiedi a `<username>` di fermare il designer. Se non è possibile, usa **Force Unlock** nel designer. Chi detiene il
blocco perde le modifiche che non ha salvato.

---

## Abuse attempt of eval function

Un campo con un'espressione mostra un errore, e il log ha una riga come:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Perché succede**

Le espressioni lato server vengono controllate prima di essere eseguite. Possono chiamare solo funzioni `fn.` e `fnc.`; istruzioni multiple,
righe multiple, template literal, `process.env` e parole come `require` o `constructor` vengono rifiutate. Il messaggio
dice quale regola è stata violata. Con [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) impostato su
`off`, ogni espressione lato server fallisce con
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Come risolverlo**

Riscrivi l'espressione come una singola chiamata `fn.` o un'operazione semplice, o eseguila nel browser con `runLocal: true`. Vedi
[Espressioni](expressions/) ed [Espressioni locali](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Un campo che chiama un'API REST resta vuoto, e il log mostra:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Perché succede**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) è impostata, e l'host dell'URL non vi è compreso.
Un host che corrisponde a [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) viene rifiutato con
`blocked by REST_DENIED_HOSTS entry "<entry>"`, e un host che non si risolve con `cannot resolve <host>`.

**Come risolverlo**

Aggiungi il nome host, o un CIDR che copra i suoi indirizzi, a `REST_ALLOWED_HOSTS`, o rimuovi da `REST_DENIED_HOSTS` la voce che lo blocca.
Vedi [Limitare le destinazioni degli helper REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

La pagina di accesso rifiuta un nome utente e una password con:

```
Authentication failed: Invalid credentials
```

**Perché succede**

La pagina di accesso dà la stessa risposta per ogni errore, così da non rivelare se un utente esiste. AnsibleForms
prova prima gli utenti locali e poi LDAP: con più directory, un nome utente viene cercato nel loro ordine in **Accesso > LDAP**,
a meno che non indichi una directory (`corp\jane`) o uno dei suoi domini di accesso (`jane@corp.example`). Il motivo reale va nel log. Gli errori
LDAP vengono registrati come `Error connecting to ldap: <reason>`, con motivi come `Wrong binding credentials` o
`Unable to verify the certificate`; i codici di Active Directory vengono tradotti in `Wrong password`, `User not found`,
`Account disabled`, `Account locked` o `Password expired`.

**Come risolverlo**

Leggi il motivo nel log. Per il motivo completo di ogni accesso fallito, imposta
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) su `debug`, che registra `Ldap authentication failed: <reason>`.
Se la password dell'admin locale è persa, vedi [Recuperare una password di admin persa](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Il test di una directory LDAP in **Accesso > LDAP** non riesce con uno di questi:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Perché succede**

L'utente di bind o la sua password sono sbagliati, il server o la porta non sono raggiungibili, o, con TLS, il certificato del server non si può
verificare con il bundle della CA. Dalla 7.3.0 questi stanno nella credenziale ldap della directory, in **Connessioni > Credenziali**. Un utente di test che non esiste
conta comunque come test riuscito, perché la connessione e il bind hanno funzionato.

**Come risolverlo**

Apri la credenziale indicata dalla directory (la directory predefinita è `main`) in **Connessioni > Credenziali**, e correggi il bind
DN e la sua password, i server e la porta (di solito 389, o 636 per LDAPS). Per i problemi TLS, incolla il bundle della CA che ha firmato il
certificato del server LDAP; saltare il controllo del certificato non è adatto alla produzione. Vedi [LDAP](authentication/ldap.html).

---

## L'autenticazione Azure AD o OIDC non riesce

Un accesso single sign-on torna alla pagina di accesso con:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Perché succede**

L'identity provider ha rimandato indietro l'utente, ma AnsibleForms non è riuscito a completare l'accesso. Motivi comuni sono
`azuread login is not enabled` o `oidc login is not enabled` (il provider è disattivato), e `jwt expired`, perché
il passaggio dal provider è valido solo 5 minuti. Anche un errore durante il callback dal provider viene mostrato
nella pagina di accesso, e registrato.

**Come risolverlo**

Abilita il provider in **Accesso > SSO**, e registra l'URL di callback nell'identity provider esattamente come
lo usa AnsibleForms: `https://<your host>/api/v2/auth/entraid/callback` per Entra ID (dalla 7.3.0; `azureadoauth2` funziona ancora), o
`https://<your host>/api/v2/auth/oidc/callback` per OIDC. Un URL di callback con `/api/v1/`, di prima della 7 o prima della
6.1.5, va aggiornato: la pagina di accesso allora si ricarica senza accedere e senza errori. Riprova l'accesso dopo
un passaggio scaduto.

---

## Not authenticated, login is not enabled for this user

Un utente con una password valida non riesce ad accedere, e riceve:

```
Not authenticated, login is not enabled for this user.
```

**Perché succede**

Uno dei ruoli dell'utente imposta l'opzione di ruolo `allowLogin` su `false`. Il log dice
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Come risolverlo**

Rimuovi `allowLogin: false` dal ruolo, o togli l'utente da quel ruolo. Vedi [Ruoli](config/roles.html).

---

## Disconnessi dopo un riavvio o dopo un giorno

Ogni utente viene rimandato alla pagina di accesso dopo che AnsibleForms si riavvia, o dopo un giorno di uso.

**Perché succede**

Quando [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) non è impostato, ogni avvio genera una
nuova chiave di firma, e registra
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
I token di prima del
riavvio non vengono più accettati. Indipendentemente da questo, una sessione termina quando il suo refresh token scade
(`Refresh token is expired`), dopo
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), 24 ore per impostazione predefinita.

**Come risolverlo**

Imposta `ACCESS_TOKEN_SECRET` su un valore fisso e segreto. Aumenta `ACCESS_TOKEN_REFRESH_EXPIRATION` se un giorno è troppo poco. Per
un accesso all'API di lunga durata, usa un [token API](profile/api-token.html).

---

## Moduli e job vuoti dopo un single sign-on (HTTP 431)

Un utente accede con Entra ID o OIDC senza errori, ma le pagine dei moduli e dei job restano vuote. La scheda rete
del browser mostra le chiamate API con la risposta:

```
431 Request Header Fields Too Large
```

Il log del server non mostra nulla per queste chiamate, e lo stesso utente può lavorare senza problemi con un account LDAP o locale.

**Perché succede**

Prima della 7.1.0, il token di accesso conteneva ogni gruppo dell'utente, e i gruppi di Entra ID vi comparivano due volte, per object id
e per nome. Il browser invia quel token nell'header `Authorization` di ogni richiesta, quindi un utente in un centinaio di
gruppi o più si ritrova con un header di ben oltre 16 KB. Node.js rifiuta gli header di richiesta più grandi di 16 KB con un 431,
prima che la richiesta raggiunga AnsibleForms, ed è per questo che non viene registrato nulla. Un reverse proxy davanti può rifiutare la
richiesta anche prima: Nginx consente per impostazione predefinita 8 KB per campo di header
(`large_client_header_buffers 4 8k`), e risponde invece 400.

**Come risolverlo**

Aggiorna alla 7.1.0 o successiva: il token di accesso non contiene più i gruppi, quindi la sua dimensione non dipende più da quanti
gruppi ha un utente, e l'interfaccia lo segnala quando una richiesta viene rifiutata con 431 invece di mostrare pagine vuote.
Finché non puoi aggiornare, puoi:

* impostare un **Filtro gruppi** sul provider in **Accesso > SSO**, un'espressione regolare che mantiene solo i gruppi usati dai tuoi
  ruoli, vedi [Entra ID](authentication/entra-id.html) o [OIDC](authentication/oidc.html); l'utente accede di nuovo
  per ottenere un token più piccolo
* oppure alzare il limite di Node.js con la variabile d'ambiente `NODE_OPTIONS=--max-http-header-size=65536`, e
  riavviare AnsibleForms

Dalla 7.1.0, [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) imposta lo stesso limite, 16384
byte per impostazione predefinita e letto all'avvio, per altri header grandi, come i cookie voluminosi impostati da un gateway di single sign-on
davanti. Alza anche i limiti degli header del proxy, vedi [Dimensione degli header di richiesta](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Un job Ansible termina come fallito, e l'ultima riga del suo output è:

```
[ERROR]: Playbook failed with status (<code>)
```

**Perché succede**

`ansible-playbook` è uscito con un codice diverso da zero. Le righe sopra contengono l'errore di Ansible stesso: il playbook non è stato
trovato, un host non era raggiungibile, un task è fallito, o l'inventario è sbagliato. Il playbook viene cercato nel repository
con **Usare per playbook?** attivo, o in [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); la riga di log
`Running from directory : <path>` mostra la cartella usata.

**Come risolverlo**

Leggi l'output del job sopra l'ultima riga. Quando il playbook non viene trovato, confronta il `playbook` del modulo con la
cartella in `Running from directory`. Vedi [Moduli Ansible](forms/ansible.html).

---

## Playbook was aborted by the main process

Un job Ansible termina come fallito con:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Perché succede**

Il processo `ansible-playbook` sull'RTE è stato terminato da un segnale, e nessuno ha interrotto il job. Dalla 7.0.0 la dimensione
dell'output non causa più questo: oltre [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (50 MB per stream
per impostazione predefinita) il resto dell'output non viene salvato, il job mostra
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
e il playbook arriva fino alla fine. La causa abituale ora è la memoria: il container RTE ha raggiunto il suo limite di memoria e il
kernel ha ucciso il playbook, per esempio con molti fork o facts di grandi dimensioni.

**Come risolverlo**

Controlla la memoria del container RTE mentre il playbook gira (`docker stats`, `kubectl top pod`) e alzane il limite, o riduci
l'uso di memoria del playbook (meno `forks`, niente raccolta di facts inutile). Quando vedi solo l'avviso di `PROCESS_MAX_BUFFER` e
ti serve l'intero output, alza `PROCESS_MAX_BUFFER` nell'ambiente del container RTE; viene letta dall'RTE, non dall'app.
---

## Failed to launch awx template

Un job AWX termina come fallito, con un output che inizia con:

```
failed to launch awx template <name>
```

**Perché succede**

La riga successiva dà il motivo. `Request failed with status code 401` significa che il token o il nome utente e la password nella
credenziale del runner AWX vengono rifiutati. `could not find job template <name>` significa che né un job template né un workflow job template
ha esattamente quel nome, o che l'utente della connessione non può vederlo. Un errore di certificato, come
`unable to verify the first certificate`, significa che il certificato di AWX non è considerato attendibile.

**Come risolverlo**

Usa **Testa connessione** sul runner (**Connessioni > Runner**), che risponde `Runner connection is OK` quando funziona. Dalla
7.3.0 il token o l'utente e la password, l'indirizzo e il **Bundle CA** stanno nella credenziale del runner, in
**Connessioni > Credenziali**: rinnova lì il token o la password, e per gli errori di certificato incolla la CA nel suo **Bundle CA**.
Controlla il nome e i permessi del template. Inserisci l'indirizzo senza `/api/v2`: AnsibleForms aggiunge da sé
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX).
Vedi [Moduli AWX](forms/awx.html).

---

## Un job mostra lo stato abandoned

Un job che era in esecuzione ora è contrassegnato come `abandoned`, e il log di un nodo o di un RTE mostra uno di questi:

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

Un RTE in modalità database, deprecata, registra i suoi:

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Perché succede**

Un job appartiene al container che lo esegue o lo segue: un playbook al suo RTE, qualsiasi altro job (un job AWX, i passi di un modulo
multistep) al nodo dell'app che l'ha avviato. Quando quel container si riavvia, termina i propri job non finiti. Quando scompare, per esempio un pod
sostituito, il worker termina i suoi job dopo che non ha risposto per due minuti. Un RTE in modalità socket che torna senza
un job che stava eseguendo, per esempio un nuovo container senza il suo spool, fa terminare quel job come abandoned. Un RTE che si ferma aspetta
prima [`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) per i suoi playbook. Ogni ora, anche i job in esecuzione da più
di un giorno vengono contrassegnati come abandoned.

Dalla 7.3.0 un job su AWX, AAP o Ascender prosegue sul suo runner: subito dopo che un riavvio lo abbandona, un nodo torna a seguirlo,
se è partito nelle ultime 24 ore, e termina con ciò che è successo davvero lì. Il log dice allora `Following <n> abandoned job(s) again on their runner`.

**Come risolverlo**

Rilancia un job playbook. Riavvia o aggiorna RTE e nodi dell'app mentre nessun job è in esecuzione, e dai a un RTE che si ferma abbastanza tempo
(vedi [Scalabilità](rte/run.html)). Controlla se il playbook è davvero terminato sugli host gestiti prima di
rilanciarlo, perché potrebbe essere stato eseguito solo in parte.

---

## Un RTE non si connette

**Testa connessione** su un runner RTE (**Connessioni > Runner**) non riesce con:

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Perché succede**

Un RTE in modalità socket parla con l'app tramite un WebSocket: in uscita contatta l'app, in entrata è l'app a contattarlo (vedi
[Modalità](rte/modes.html)). I log dell'app e dell'RTE dicono perché il socket non è aperto:

| Messaggio | Dove | Cosa significa |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | L'RTE (in entrata) | Il token della credenziale RTE del runner non è l'`RTE_TOKEN` dell'RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | L'app (in entrata) | Lo stesso, visto dall'app |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | L'app, e l'RTE che viene rifiutato (`401`) | L'RTE accede con un token diverso da quello che l'app conserva per il suo runner |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | L'RTE (in uscita) | Ha chiesto di unirsi e aspetta un'approvazione |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | L'RTE (in entrata, con `APP_URL`) | Lo stesso, per un RTE in entrata |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | L'app, e l'RTE che viene rifiutato (`409`) | Il config seed dichiara il runner senza `rte_mode`, quindi in modalità database, ed è il seed a decidere la sua modalità. Un RTE in entrata riceve `rte_mode: inbound` e `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | L'RTE | Un RTE in entrata che si registra da solo ha bisogno dell'indirizzo su cui l'app lo contatta |
| `Runner '<name>': dialing <address>: <reason>` | L'app, a livello `debug` | L'app non riesce ad aprire il socket, per esempio perché il certificato dell'RTE non è quello fissato per il suo runner |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | L'RTE | Gira in modalità database, e non apre affatto un socket |

**Come risolverlo**

* **Un token rifiutato** : dai all'RTE il token della credenziale RTE del suo runner (**Connessioni > Credenziali**), o viceversa
* **In attesa di approvazione** : approvalo in **Connessioni > Runner**, dopo aver controllato che l'impronta mostrata lì sia quella nel suo
  log (vedi [Approvare un RTE](runners/registration.html#approving-an-rte))
* **Gestito dal config seed in modalità database** : imposta `rte_mode` sul runner nel seed, con una credenziale RTE (per l'entrata, il suo
  indirizzo), poi riavvia l'RTE
* **In entrata senza `RTE_URL`** : imposta `RTE_URL` sull'indirizzo su cui l'app raggiunge l'RTE, oppure ometti `APP_URL` e dichiara il
  runner nel seed o in **Connessioni > Runner**
* **Un certificato che non è quello fissato** : un RTE in entrata su HTTPS invia il suo certificato quando si registra, e l'app lo contatta
  solo con quello. Dopo un nuovo certificato, l'RTE lo invia di nuovo quando si registra; quando il bundle CA della credenziale è stato impostato
  a mano, l'app lo mantiene e registra
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **L'avviso [DEPRECATED]** : imposta `RTE_MODE` sull'RTE, rimuovi `DB_*` dal suo ambiente, e imposta il suo runner su quella modalità (vedi
  [Modalità](rte/modes.html))

---

## The form data is not valid

Con la validazione all'avvio su `enforce`, un avvio viene rifiutato con `422` e:

```
The form data is not valid
```

**Perché succede**

Il server ha controllato i valori dei campi rispetto alle regole del modulo e ha trovato campi mancanti o non validi; la risposta li elenca
sotto `details`. Anche un avvio senza `rawFormData` viene rifiutato. Un modulo che non si può ancora controllare, come un wizard,
viene rifiutato con `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**Come risolverlo**

Correggi i campi indicati dai dettagli, o le regole del modulo se sono troppo rigide. Esegui prima in modalità `log`: registra
`Launch validation would refuse form '<name>' ...` senza rifiutare nulla. Vedi
[Cosa fa enforce](launch-validation/log-and-enforce.html#what-enforce-does) e
[Introdurla gradualmente](launch-validation/rolling-it-out.html).

---

## Il clone o il pull di un repository non riesce

Un repository mostra uno stato di errore, e il suo output contiene l'errore di git, oppure il log mostra
`Background clone of '<name>' failed : <reason>`.

**Perché succede**

Git non è riuscito a raggiungere il remoto o ad autenticarsi presso di esso. Per gli URL SSH (`git@host:path`), il remoto deve accettare la chiave
pubblica di AnsibleForms; per HTTPS, il nome utente e il token devono essere validi. Un pull viene rifiutato anche quando l'albero di lavoro ha
modifiche, con
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Come risolverlo**

Per SSH, copia la chiave pubblica dalla scheda **Chiave** di **Connessioni > SSH** e aggiungila come deploy key, o a un utente con
accesso al repository. AnsibleForms aggiunge l'host remoto agli host conosciuti durante un clone; per altri host, usa la
scheda **Host conosciuti** della stessa pagina. Per
HTTPS, rinnova il token. Vedi [Repository Git](gui/designer-and-git.html#git-repositories) e
[Sui repository](faq.html#about-repositories).

---

## Il repository dei moduli non è ancora clonato

Il salvataggio dei moduli nel designer non riesce con:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Perché succede**

Un repository con **Usare per moduli?** attivo non ha ancora un albero di lavoro, perché il clone non è stato eseguito o non è riuscito.

**Come risolverlo**

Clona il repository dalle impostazioni dei repository. Se il clone non riesce, vedi
[Il clone o il pull di un repository non riesce](#a-repository-clone-or-pull-failed).

---

## Un backup non riesce

Un backup non riesce, e non viene aggiunto nulla all'elenco dei backup. Il motivo è uno di questi:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Perché succede**

Il comando di dump, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), non è installato, non è riuscito a
connettersi, o ha prodotto un file vuoto. Un database grande può anche richiedere più di
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), un'ora per impostazione predefinita.
Un backup fallito non lascia nessuna cartella; il log dice `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Come risolverlo**

Installa gli strumenti client di MySQL o MariaDB, o imposta `MYSQLDUMP_COMMAND` (e `MYSQL_COMMAND` per i ripristini) su un comando
che funzioni su questo host e con la versione del tuo server. Alza `BACKUP_COMMAND_TIMEOUT_SECONDS` per un database grande.
Vedi [Backup](gui/administration.html#backups).
