---
layout: default
title: Come funziona
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Come funziona
{: .no_toc }

Le parti di un'installazione, cosa succede a un avvio, e dove vengono conservati i dati
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Architettura

AnsibleForms è un server Node.js che serve l'applicazione web e un'API REST, appoggiandosi a un database MySQL. Legge i moduli
da file YAML e non esegue nulla da sé: passa ogni job a un [runner](runners.html). Un playbook va a uno dei tuoi container RTE
(ambiente di runtime), che esegue `ansible-playbook`, e un template o un job va ad AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Architettura di AnsibleForms</title>
<desc id="afd-desc">Il browser e un client MCP facoltativo comunicano con il server di AnsibleForms. Il server salva i suoi dati in MySQL e nella cartella persistente, e si collega a origini dati, archivi di segreti, repository git, provider di accesso, canali di notifica, server syslog e un fornitore di modelli facoltativo. I suoi runner passano ogni playbook a uno di uno o più container RTE, ciascuno tramite un WebSocket, che eseguono ansible-playbook e rimandano l'output al server, e ogni template o job ad AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins.</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="99" text-anchor="middle">Browser</text>
<text class="afd-s" x="105" y="118" text-anchor="middle">moduli, designer, job, chat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">Client MCP</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">facoltativo</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">Server di AnsibleForms</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">App web e API REST</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Moduli, espressioni</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflow, pianificazioni</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">Server MCP (facoltativo)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runner</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">passano ogni job al suo runner</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Origini dati</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">database, API REST, file</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Archivi di segreti</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Repository git</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">moduli, playbook, config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Provider di accesso</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Canali di notifica</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">mail, Slack, Teams, webhook</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Server syslog</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">il log, la traccia di audit</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Fornitore di modelli</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">facoltativo, assistente chat</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Cartella persistente</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">config, moduli, playbook</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">job, utenti,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">credenziali</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">Container RTE</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">eseguono ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbook,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">template, job</text>
</svg>
</div>
I componenti del diagramma hanno ognuno un ruolo proprio:

| Componente | Ruolo |
|---|---|
| **Browser** | L'applicazione web Vue: i moduli, il [Designer](gui/designer-and-git.html), la cronologia dei job e le impostazioni |
| **Server di AnsibleForms** | Valuta i moduli, registra i job, esegue i workflow e le pianificazioni, passa ogni job al suo runner e lo segue, e serve l'[API REST](api/) |
| **Runner** | Dove girano i job, aggiunti in **Connessioni > Runner**: un modulo ne nomina uno con `runner: <name>`, o usa il runner predefinito del suo tipo (vedi [Runner](runners.html)) |
| **Container RTE** | Uno o più container dell'ambiente di runtime, lo stesso server avviato con `AF_ROLE=rte`: ognuno esegue `ansible-playbook` per i [moduli ansible](forms/ansible.html), con le librerie python e le collection della sua immagine, e rimanda l'output e lo stato finale al server tramite un WebSocket, senza credenziali del database (vedi [Come gira l'RTE](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Runner per template e job: i [moduli AWX](forms/awx.html) avviano un job template o un workflow template, i moduli [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) e [Jenkins](forms/jenkins.html) avviano uno dei loro job, e il server ne segue l'output |
| **MySQL / MariaDB** | Contiene i job e il loro output, gli utenti, le credenziali e le connessioni; solo il server lo legge e lo scrive |
| **Cartella persistente** | Contiene `config.yaml`, i file dei moduli, i playbook, i log e i backup |
| **Origini dati** | Riempiono i campi: [query su database](formfields/enum.html), [API REST](expressions/rest-apis.html), file e [altre funzioni](expressions/remote.html) |
| **Archivi di segreti** | Forniscono l'utente e la password di una credenziale al momento dell'uso, vedi [Archivi di segreti](secret-stores/) |
| **Repository git** | Tengono i moduli, i playbook e `config.yaml` sotto controllo di versione |
| **Provider di accesso** | Fanno accedere gli utenti: [LDAP, Entra ID e OIDC](authentication/), accanto agli utenti locali |
| **Canali di notifica** | Portano le [notifiche](forms/notifications.html) e le richieste di approvazione: [mail, Slack, Microsoft Teams, Telegram o un webhook](notification-channels.html) |
| **Server syslog** | Ricevono il log e la traccia di audit man mano che vengono scritti, vedi [Syslog](production/logs.html#syslog) |
| **Client MCP, chat** | Facoltativi, entrambi disattivati per impostazione predefinita: il [server MCP](mcp/) e l'[assistente chat](chat/), che ha bisogno di un fornitore di modelli |

Per impostazione predefinita un solo container esegue insieme il server, l'app web e il lavoro in background, accanto a un RTE. Per più nodi dell'app dietro un
load balancer, un worker che esegue il lavoro in background, e più RTE, vedi [Scalabilità](production/scaling.html).

### Costruito con

Il server e l'interfaccia web sono costruiti su questi componenti:

| Parte | Tecnologia |
|---|---|
| **Server** | Node.js ed Express |
| **Database** | MySQL o MariaDB |
| **Interfaccia web** | Vue 3, con Bootstrap 5 e Font Awesome |

---

## Cosa succede quando avvii un modulo

Un avvio passa per gli stessi passi sia che arrivi dal browser sia dall'[API REST](api/jobs.html):

1. **Caricamento** : il server invia solo i moduli consentiti dai [ruoli](config/roles.html) dell'utente, e valuta le espressioni lato server
2. **Invio** : il browser trasforma i valori dei campi in extravars e le invia a `POST /api/v2/job`
3. **Controllo** : il server ricarica il modulo per i ruoli dell'utente e, con la [validazione all'avvio](launch-validation/) attiva, controlla i valori
4. **Registrazione** : il job viene salvato con stato `running`, e il suo id viene aggiunto alle extravars come `__jobid__`
5. **Approvazione** : un modulo con un punto di [`approval`](forms/approval.html) aspetta finché un approvatore non accetta il job
6. **Credenziali** : per un playbook, l'app (mai l'RTE) legge le credenziali del modulo dal database o da un [archivio di segreti](secret-stores/)
7. **Esecuzione** : il job va al suo runner, quello che il modulo nomina con `runner:` o il predefinito del suo tipo. Per un playbook, l'app invia il job al suo
   RTE tramite il WebSocket dell'RTE, con le credenziali sigillate per esso, e l'RTE esegue `ansible-playbook` (vedi [Come gira l'RTE](rte/#how-the-rte-runs)),
   e AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins esegue un template o un job. Un [workflow](workflows/) esegue i suoi nodi, ognuno come
   job a sé sul proprio runner
8. **Monitoraggio** : il server salva l'output nel database man mano che arriva, inviato dall'RTE tramite il suo socket per un playbook, o letto dagli
   altri runner. La pagina del modulo rilegge il job ogni due secondi, e la pagina Job lo segue in tempo reale man mano che il server
   annuncia ogni cambiamento
9. **Fine** : il job riceve il suo stato finale, e le sue [`notifications`](forms/notifications.html) partono via mail e verso i suoi
   [canali di notifica](notification-channels.html) quando il modulo le richiede

---

## Dove vengono conservate le cose

AnsibleForms conserva il suo stato in due posti: il database MySQL e la cartella persistente. Fai il backup di entrambi.

### Nel database
{: .no_toc }

Il database, `AnsibleForms`, viene creato al primo avvio (a meno che `ALLOW_SCHEMA_CREATION` non sia `0`) e contiene:

* i job, le loro extravars e il loro output, le pianificazioni e i job salvati
* gli utenti locali, i gruppi e i token API
* le credenziali, cifrate con `ENCRYPTION_SECRET`, e le connessioni agli archivi di segreti
* i runner, i canali di notifica (mail compresa), i server syslog, e le impostazioni di LDAP, SSO, repository e assistente chat
* il registro di audit

### Nella cartella persistente
{: .no_toc }

È `/app/dist/persistent` nell'immagine e `server/persistent` dai sorgenti; ogni percorso ha la sua [variabile](customization/paths.html):

| Percorso predefinito | Variabile | Contenuto |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | Le categorie, i ruoli e le costanti |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | I file dei moduli, `.yaml` o `.yml`, in sottocartelle se vuoi |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | I playbook dei moduli `ansible`, e la loro directory di lavoro |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | I cloni dei repository git |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | Le copie che il Designer fa prima di salvare |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | I backup del database |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | I file caricati tramite i campi `file` |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` e `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | Il certificato e la chiave, quando `HTTPS` è `1` |
| `.env` | | Le variabili d'ambiente salvate dalle pagine delle impostazioni (a meno che `ALLOW_ENV_EDIT` non sia `0`) |

La chiave SSH generata si trova in [`HOME_PATH`](customization/paths.html#env_HOME_PATH), per impostazione predefinita fuori dalla cartella persistente.
