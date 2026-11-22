---
layout: default
title: Configurazione in git
parent: Repository Git
nav_order: 5
translated_from: 7d0beda8f50fb1602dd685827ccbf20eb3679501
---

# Configurazione in git
{: .no_toc }

Ogni impostazione tenuta in un repository git, letta e scritta in entrambi i sensi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori che vogliono le impostazioni, gli utenti e le connessioni di AnsibleForms revisionati e versionati in git, dalla 7.8.0.

---

## I tipi di utilizzo

Il passo **Utilizzo** di un repository, nel suo wizard e nella scheda **Utilizzo** della sua pagina, dice cosa l'app ne prende.

I tipi sono raggruppati sotto sei intestazioni, ciascuna con il numero di tipi che contiene, per esempio **Designer (6)**. Ogni tipo ha
la propria casella di spunta e una breve riga che dice cosa il repository contiene per esso; la casella di un'intestazione spunta o toglie
la spunta a ogni tipo di quell'intestazione che si può spuntare.

| Intestazione | Tipi di utilizzo (flag) |
|---|---|
| **Designer** | **Categorie** (`use_for_categories`), **Costanti** (`use_for_constants`), **Moduli** (`use_for_forms`), **Inventari** (`use_for_inventories`), **Playbook** (`use_for_playbooks`), **Workflow** (`use_for_workflows`) |
| **Job** | **Pianificazioni** (`use_for_schedules`) |
| **Sistema** | **Generale** (`use_for_general`) |
| **Aspetto** | **Valori predefiniti** (`use_for_defaults`), **Logo** (`use_for_logo`), **Icona** (`use_for_icon`), **Nome** (`use_for_name`), **Collegamenti** (`use_for_links`), **Etichette** (`use_for_labels`), **Annunci** (`use_for_announcements`) |
| **Accesso** | **Disclaimer** (`use_for_disclaimer`), **Utenti** (`use_for_users`), **Gruppi** (`use_for_groups`), **Ruoli** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Connessioni** | **Repository** (`use_for_repositories`), **Credenziali** (`use_for_credentials`), **Archivi di segreti** (`use_for_secret_stores`), **Database** (`use_for_databases`), **Runner** (`use_for_runners`), **SSH** (`use_for_ssh`), **Notifiche** (`use_for_notifications`), **Assistente chat** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Moduli**, **Inventari** e **Workflow** possono essere spuntati su più repository. I **Playbook** provengono da uno solo: il passo Utilizzo
li mostra in grigio sugli altri, e il server prende il primo con un avviso. Ogni altro tipo appartiene a un repository al massimo, e un
secondo viene rifiutato dall'API e dal config seed. Un tipo che un altro repository detiene appare spuntato in grigio e disattivato, con
un tooltip che nomina quel repository: `Già gestito dal repository "platform"`.

Attivare o disattivare un tipo di utilizzo è una modifica riservata a un amministratore, come l'**URI** e il **Branch** (vedi
[Chi può modificare un repository](adding.html#who-may-change-a-repository)).

---

## Dove un repository li tiene

Un repository contiene un tipo in qualsiasi file YAML, con qualsiasi nome, in qualsiasi cartella: la chiave di primo livello del file dice
quale tipo contiene.

Quella chiave è sempre `controller_` seguito dalla chiave del tipo: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
Ogni file `.yaml` o `.yml` del repository viene esaminato, a qualsiasi profondità, esclusi i file e le cartelle nascosti. Un file può
contenere più tipi, e un tipo può essere distribuito su molti file.

| Chiave | Contiene |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | una mappa, per ciò di cui l'app ha un solo esemplare; al massimo un file la dà |
| `controller_users:` | un elenco di utenti, ciascuno trovato dal suo `type` (locale quando omesso) e dal suo `username` |
| `controller_disclaimer:` | un elenco di versioni, ciascuna trovata dalla sua `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | i ruoli, le categorie e le costanti, nel loro formato abituale |
| ogni altra chiave `controller_` | un elenco di voci, ciascuna trovata dal suo `name` |

Un oggetto viene trovato dal suo nome all'interno del suo tipo, mai dal suo file: una voce spostata in un altro file mantiene il suo oggetto.
Una chiave semplice (`credentials:`, il `roles:` di un file di requirements Galaxy, il `labels:` di un file di variabili) non appartiene a
nessun tipo, e l'app non la legge né la scrive mai. Un modulo non è mai il file di un tipo, e una chiave di un tipo per cui il repository non
è usato viene lasciata com'è, con un'indicazione nell'output del pull.

### Ruoli, categorie e costanti

Questi tre mantengono il formato di `config.yaml`, ora ciascuno sotto la propria chiave, in un tipo di utilizzo a sé (un repository ciascuno).

Ciascuno viene letto dal file del suo repository che dà la sua chiave al primo livello, con qualsiasi nome e in qualsiasi cartella; un solo
file può dare tutti e tre. Quando nessun file la dà, il `config.yaml` del repository viene ancora letto, con le sue chiavi semplici `roles:`,
`categories:` e `constants:`: è deprecato dalla 7.8.0 e non più letto nella 8.0, e il log del server, l'output del pull e la pagina del
repository lo segnalano. Sposta ogni chiave in un file a sé, per esempio `roles.yaml` con `controller_roles:`.

Una chiave che nessun repository contiene proviene dalla configurazione di base, come prima: la sua copia nel database, o il file in
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). L'interruttore **Usare per configurazione** di prima non esiste più:
un'istanza aggiornata dà **Ruoli**, **Categorie** e **Costanti** al repository che lo aveva. Il config seed, le voci
`controller_repositories:` di un repository e l'API accettano ancora `use_for_config` come alias deprecato dei tre, con un avviso.

---

## In entrambi i sensi: git e l'app

Un repository usato per un tipo resta allineato con l'app in entrambe le direzioni, mentre ciò che gira resta il database dell'app.

| Direzione | Cosa succede |
|---|---|
| Da git all'app | Dopo ogni pull, clone o reset del repository, e all'avvio del server, i suoi file vengono letti: un nome nuovo crea un oggetto, una voce cambiata lo cambia, una voce rimossa lo rimuove |
| Dall'app a git | Un salvataggio nell'app scrive nel file della voce: solo i campi cambiati, mantenendo i commenti, le altre chiavi e le altre voci del file. Un oggetto nuovo va in fondo al primo file che dà la chiave del tipo, altrimenti in `<key>.yaml` nella radice (`credentials.yaml`), creato apposta; un'eliminazione rimuove la sua voce. Attende il **Push** del repository |

Una voce non valida viene rifiutata da sola, con la sua posizione e il motivo, e l'oggetto con quel nome resta com'era. Una voce che nomina
un oggetto non ancora presente (un runner e la sua credenziale) attende, e viene riletta al prossimo pull di quel tipo. Una rinomina in git
viene seguita quando un nome lascia un file e un nome nuovo vi compare, con il resto invariato.

### Attivare o disattivare un utilizzo

Salvare un repository con un tipo attivato o disattivato chiede prima cosa fare, e mostra cosa farà la modifica.

| Modifica | Domanda | Cosa fa |
|---|---|---|
| Attivazione | **Attiva Credenziali**: `Usare platform per Credenziali?` | Il repository viene aggiornato con un pull e le sue voci lette; git prevale su un nome che hanno entrambi; gli altri oggetti dell'app vengono scritti nel repository, in attesa del **Push**, senza i loro segreti |
| Disattivazione | **Disattiva Credenziali**: `Non usare più platform per Credenziali?` | Si fa un ultimo pull del repository, poi i suoi oggetti vengono scollegati: restano nell'app così come sono, e i file in git non vengono toccati |
| Più tipi | **Cambia l'uso**: `Cambiare a cosa serve platform?` | Una sola domanda, una sezione per tipo, confermata con **Salva l'uso** |

La domanda elenca anche cosa resta nell'app: gli oggetti del config seed, i runner che un RTE ha registrato da sé, e quelli in attesa di
approvazione. Un messaggio dice poi cosa ha preso ogni tipo, per esempio
`Credenziali: 2 letti dai suoi file, 3 scritti nel repository (in attesa del Push), 1 sostituiti da git, 0 mantenuti in questa app.`

### Cosa dice l'output del pull

**Mostra output dell'ultimo pull** del repository contiene una riga per tipo dopo l'output di git stesso.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Un oggetto tenuto in un repository mostra **Repository: platform** nella sua pagina (il nome del suo repository), con il file della sua voce
nel tooltip. Salvarlo scrive quel file, e il **Push** del repository lo invia a git.

---

## Segreti

Git non contiene mai un segreto in chiaro: un campo segreto di una voce è solo un riferimento `${ENV}`, risolto dall'ambiente.

Password, token, client secret e chiavi si scrivono come `${SEED_RTE_TOKEN}`, come nel [config seed](../seed/). Una voce con un segreto in
chiaro, o che nomina una variabile non impostata, viene rifiutata e nominata nell'output del pull; così anche una variabile del server stesso
(`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` …). Un segreto omesso da una voce mantiene quello nel database dell'app, e l'app scrive
i propri oggetti in git senza i loro segreti.

Un segreto digitato nell'app per un oggetto la cui voce lo dà come riferimento `${ENV}` viene rifiutato: cambia la variabile, o la voce in git.

---

## Il designer e questi file

Il designer resta fuori dai file dei tipi di utilizzo, così la modifica di un modulo non cambia mai un'impostazione.

Non elenca, legge, scrive né elimina mai un file che dà la chiave di un tipo che il suo repository detiene, né le immagini che un tale file
nomina. Rifiuta anche di scrivere un file il cui contenuto darebbe la chiave di un tipo, e il caricamento dei moduli non legge mai un tale
file come modulo.

---

## Ogni tipo, con un esempio

Le voci di ogni tipo sono nel formato del config seed, così un elemento del seed e una voce di repository sono intercambiabili.

I nomi di file qui sotto sono esempi: qualsiasi nome e qualsiasi cartella andrebbero bene.

### Categorie, costanti e ruoli

Le categorie e i ruoli sono elenchi, le costanti una mappa, ciascuno sotto la propria chiave.

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

Ogni ruolo viene controllato per conto suo: uno non valido viene rifiutato da solo, e gli altri vengono serviti. I ruoli possono essere
distribuiti su più file, serviti nell'ordine dei loro file. Vedi [Ruoli](../config/roles.html).

### Pianificazioni

Le pianificazioni sono un elenco `controller_schedules:`, ogni voce nomina il modulo che esegue ed è temporizzata da esattamente uno tra
`cron`, `rrule` o `one_time_run`.

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

I job "Esegui più tardi" che gli utenti pianificano restano nell'app. Vedi [Pianificazioni](../jobs/schedules.html) per le temporizzazioni
e le richieste.

### Generale

Le impostazioni **Generale** sono una sola mappa, secondo i nomi delle loro variabili d'ambiente in minuscolo.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Vengono prese solo le variabili che la pagina Generale modifica; una chiave in maiuscolo, o una variabile impostata nell'ambiente reale,
viene rifiutata. Una variabile il cui nome termina in `_PASSWORD`, `_SECRET` o `_TOKEN` è solo un riferimento `${ENV}`.

### Valori predefiniti, logo, icona, nome e collegamenti

Le pagine Aspetto sono una mappa ciascuna, con ciò che la pagina salva.

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

Il logo e l'icona sono immagini del repository, indicate in modo relativo al file che le nomina. Un campo che il config seed dichiara resta
quello del seed.

### Etichette e annunci

Le etichette e gli annunci sono elenchi di voci, ciascuna trovata dal suo nome.

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

Un annuncio la cui fine è già passata non viene importato, come dice una riga `Not imported` dell'output del pull.

### Disclaimer

Il disclaimer è un elenco di versioni, ciascuna trovata dalla sua `version`, con al massimo una attiva.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Un testo cambiato da git corregge quella versione; `ask_again: true` lo richiede di nuovo a tutti quelli che l'hanno accettato. Chi ha accettato cosa non è mai in git.

### Utenti e gruppi

La voce di un gruppo elenca i suoi membri locali; la voce di un utente non dice nulla dei suoi gruppi.

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

La `password` di un utente locale è solo un riferimento `${ENV}`, sottoposto a hash alla lettura. Un utente di una directory (`ldap`,
`entraid`, `oidc`) dà solo la sua `description` e `blocked`. L'amministratore integrato non viene mai letto da git né scritto in git.

### LDAP e SSO

Le directory LDAP e i provider SSO sono elenchi, ciascuno con il nome della credenziale con cui accede.

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

La voce chiamata `main` è la directory principale, che non viene mai rinominata né eliminata. `position` mantiene l'ordine di ricerca.

### Repository

Un repository può contenere gli altri repository, nel formato degli elementi `repositories:` del config seed.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

Il repository che li contiene non è mai nei propri file, una voce non imposta mai `use_for_repositories`, e un utente o un token nell'`uri`
viene rifiutato: indica invece una credenziale. Una voce rimossa elimina il suo repository, a meno che abbia modifiche non ancora inviate.

### Credenziali, archivi di segreti e database

Le credenziali vengono lette per prime, poi tutto ciò che ne nomina una.

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

Rimuovere la voce di una credenziale mentre qualcosa la usa ancora viene rifiutato, come dice l'output del pull.

### Runner

Un runner nomina la sua credenziale, del tipo del runner, e attende finché manca.

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

Un runner che un RTE ha registrato da sé, o uno in attesa di approvazione, resta nell'app.

### SSH

La chiave SSH dell'app e gli host di cui si fida sono una sola mappa, letta subito dopo i repository, prima che vengano clonati.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` è solo un riferimento `${ENV}`, mai scritto in git: se omessa, l'app mantiene la propria. `known_hosts` contiene una riga
known_hosts per server, e un elenco vuoto li cancella.

### Notifiche e syslog

I canali di notifica e i server syslog sono elenchi di voci.

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### Assistente chat e MCP

L'assistente chat e le impostazioni MCP sono una mappa ciascuno.

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` e le chiavi MCP sono nomi di variabili d'ambiente in minuscolo. Una variabile impostata nell'ambiente reale non viene mai
scritta, e una mappa che la dà viene rifiutata. `api_key` è solo un riferimento `${ENV}`, oppure viene omessa.
