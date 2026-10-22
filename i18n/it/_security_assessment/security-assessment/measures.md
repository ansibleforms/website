---
layout: default
title: Misure di sicurezza
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Misure di sicurezza
{: .no_toc }

Come sono protetti accesso, permessi, segreti e connessioni
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dove gira

AnsibleForms è self-hosted, sulla tua infrastruttura, con i suoi dati in un database che gestisci tu.

* Non esiste un servizio cloud di AnsibleForms né un server di licenze, e non c'è telemetria né controllo degli aggiornamenti.
* L'interfaccia viene servita dall'applicazione stessa e non carica nulla da altri siti.
* L'applicazione si connette solo ai sistemi configurati da un amministratore, elencati in [Connessioni in uscita](#outbound-connections).

Le componenti e cosa contiene ciascuna:

| Componente | Cosa fa | Cosa contiene |
|---|---|---|
| Applicazione | L'interfaccia web, la REST API, lo scheduler | Nessun dato proprio: è tutto nel database |
| MySQL o MariaDB | Il database dell'applicazione | Utenti, gruppi, credenziali (cifrate), job con le loro extravars e il loro output, il registro di audit |
| Ambiente di esecuzione (RTE) | Esegue i playbook, nel proprio container | I file dei job che esegue, e i segreti di un job solo mentre quel job gira |
| Cartella persistente | La configurazione, i moduli, i playbook e i file caricati | I file usati dai moduli e dai playbook |

Vedi [Come funziona](../how-it-works.html) per il quadro completo, e [RTE](../rte/) per l'ambiente di esecuzione.

---

## Accesso

Ogni pagina e chiamata API che legge o modifica dati richiede un utente autenticato. I pochi endpoint aperti senza autenticazione servono
l'accesso stesso, la versione, il nome e il logo dell'istanza, la documentazione delle API, e la configurazione del database al primo avvio,
che [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` chiude:

| Metodo | Come funziona |
|---|---|
| Account locali | Password con hash bcrypt, una [lunghezza minima](../security/hardening.html#sign-in-limits-and-passwords), e la password admin predefinita pubblica va cambiata al primo accesso |
| LDAP / Active Directory | La directory verifica la password, e i suoi gruppi vengono associati ai ruoli. Vedi [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Single sign-on tramite il tuo provider di identità, che porta con sé anche la propria autenticazione a più fattori. Vedi [Autenticazione](../authentication/) |

* Gli accessi falliti [bloccano l'account](../security/hardening.html#sign-in-limits-and-passwords), e l'accesso ha un limite di frequenza.
* Un accesso restituisce un access token firmato valido 30 minuti e un refresh token valido 24 ore.
* I token si possono terminare prima della scadenza: l'uscita, un cambio di password, un utente bloccato e un token API revocato li terminano
  su tutti i nodi contemporaneamente, vedi [Token](../security/secrets.html#tokens).
* AnsibleForms non ha un'autenticazione a più fattori propria: usa il single sign-on dove è richiesta.

---

## Permessi

Ciò che un utente può fare deriva dai ruoli dei suoi gruppi, controllati dal server a ogni richiesta:

* I ruoli si definiscono in [config.yaml](../config/roles.html): quali moduli vede un utente, e quali opzioni ha,
  come il designer, le pagine delle impostazioni o i job degli altri utenti.
* Il server controlla ogni avvio rispetto alle regole del modulo (i suoi campi, i loro valori e l'accesso dell'utente), compresi
  gli avvii tramite la REST API, vedi [Validazione all'avvio](../launch-validation/).
* Il ruolo admin esegue qualsiasi playbook per progettazione. Gli altri ruoli ottengono solo ciò che viene concesso: un utente con più ruoli ottiene un'opzione
  solo quando nessuno di quei ruoli la rifiuta, quindi basta un ruolo restrittivo per negarla.

---

## Segreti salvati

Password, token e chiavi vengono cifrati prima di essere scritti nel database:

* Ogni segreto salvato, credenziali, la password di bind LDAP, i token dei runner, i client secret del single sign-on, gli indirizzi
  dei webhook e le chiavi API, viene cifrato con AES-256 e un vettore di inizializzazione casuale per ogni valore, con
  l'[`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) che imposti tu.
* Nessuna chiamata API o pagina delle impostazioni mostra un segreto salvato, e i backup omettono i segreti principali.
* I segreti possono restare nel tuo vault: [HashiCorp Vault e CyberArk](../secret-stores/) vengono letti quando un job ne ha bisogno.
* I segreti di un job arrivano all'ambiente di esecuzione sigillati con AES-256-GCM, con una chiave derivata dal suo token.
* Le extravars il cui nome sembra quello di un segreto vengono mascherate nella vista del job, e i campi password lo sono sempre, vedi [Dati dei job](../security/hardening.html#job-data).

Il resto del database, i job, le loro extravars e il loro output, viene salvato così com'è: proteggilo con la cifratura a riposo
e il controllo degli accessi del database stesso, vedi [Il database](../security/hardening.html#the-database).

---

## Traccia di audit

Ogni modifica, e ogni tentativo rifiutato, viene registrato:

* Ogni creazione, modifica ed eliminazione, tramite l'interfaccia o l'API, viene scritta nel registro di audit con l'utente, il suo
  indirizzo, l'azione, l'oggetto e l'esito. Vengono registrati anche i rifiuti e gli accessi, compresi quelli falliti.
* I valori che sembrano segreti vengono oscurati prima di essere scritti.
* Il registro viene conservato per 365 giorni per impostazione predefinita, e può essere copiato su syslog via UDP, TCP o TLS.

---

## Nel browser

L'interfaccia è protetta contro il codice iniettato in una pagina:

* Una [Content-Security-Policy](../security/hardening.html#the-content-security-policy) consente solo gli script e i frame dell'applicazione stessa.
* Ogni risposta porta header di protezione: nosniff, protezione dai frame, e HSTS su HTTPS.
* L'HTML dei moduli, dei testi di aiuto e delle risposte della chat viene sanitizzato, e l'output dei job viene sottoposto a escape.

---

## Sul server

Il codice che gestisce l'input degli utenti evita le classiche injection:

* Le query al database passano i loro valori come parametri, mai come testo incollato nella query.
* I comandi, git compreso, girano da un elenco di argomenti, mai da una shell, quindi i caratteri della shell non hanno effetto.
* Le espressioni lato server passano da un [sanitizzatore delle espressioni](../security/hardening.html#expressions-and-outbound-calls), e le loro chiamate REST da un filtro degli host.
* Il [server MCP](../mcp/), l'[assistente chat](../chat/) e l'endpoint delle metriche sono disattivati finché non li attivi.

---

## Connessioni

Il traffico da e verso AnsibleForms può essere cifrato da un capo all'altro:

* L'applicazione serve [HTTPS](../security/https.html) direttamente, oppure sta dietro il tuo reverse proxy.
* Un ambiente di esecuzione comunica con l'applicazione tramite un WebSocket, `wss://` con un indirizzo HTTPS, e l'applicazione
  fissa il certificato di uno in ingresso, vedi [Modalità dell'RTE](../rte/modes.html).
* LDAP, il single sign-on, i runner, git, gli archivi di segreti e le chiamate REST delle espressioni verificano il certificato del
  server che raggiungono, a meno che un amministratore non disattivi la verifica per un server con un certificato autofirmato.

### Connessioni in uscita

AnsibleForms si connette solo a ciò che configura un amministratore:

| Connessione | Quando |
|---|---|
| LDAP, OpenID Connect, Entra ID (login Microsoft e Graph) | Quando quel metodo di accesso è configurato |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Quando un modulo gira su quel runner |
| Server Git | Quando è configurato un repository |
| Server di posta, Slack, Teams, Telegram, webhook | Quando è configurato un canale di notifica |
| HashiCorp Vault, CyberArk | Quando è configurato un archivio di segreti |
| Un fornitore di modelli (Anthropic, OpenAI e altri) | Solo con l'[assistente chat](../chat/) attivo, che per impostazione predefinita è disattivato |
| Host e API indicati nei moduli | Quando le espressioni di un modulo o un playbook li chiamano |
| Server syslog | Quando è configurato l'inoltro dell'audit o dei log |

---

## I container

Le immagini sono costruite per girare con il minimo dei privilegi possibile:

* L'applicazione e l'ambiente di esecuzione girano con l'utente non privilegiato `node`, non come root.
* Sono costruite su immagini Debian slim fissate per digest, vedi [Sviluppo sicuro](development.html#code-analysis-and-dependencies).
* L'applicazione resta in ascolto su una sola porta, la 8000.

Per i passi che mettono in sicurezza una nuova istanza, segui [Hardening](../security/hardening.html).
