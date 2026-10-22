---
layout: default
title: Ruoli
parent: config.yaml
nav_order: 2
translated_from: c23a8fb9203e85e81cd128d2c129228c0a207f6c
---

# Ruoli
{: .no_toc }

Associa utenti e gruppi ai ruoli, e stabilisci cosa può fare ogni ruolo.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'attributo roles

La lista `roles` di primo livello di config.yaml:

{% include config_attribute.html name="roles" %}

---

## Il ruolo default

Ogni utente che ha effettuato l'accesso ha il ruolo `default`, quindi un modulo con `roles: [default]` è aperto a chiunque possa accedere. Non
esiste un accesso anonimo: nessuno riceve questo ruolo senza accedere.

Il ruolo non contiene gruppi né utenti, perché si applica già a tutti. Le sue `options` sono i valori predefiniti di tutti, come
descritto in [Opzioni dei ruoli](#role-options) più sotto. `config.yaml` deve avere un ruolo `admin` e un ruolo `default`, e la
pagina dei ruoli li mostra entrambi come **Obbligatorio**.

`default` si chiamava `public` prima della 7.0.0, e il vecchio nome continua a funzionare:

- **In un modulo**, `roles: [public]` corrisponde ancora a ogni utente, quindi i moduli nei tuoi repository non vanno modificati.
- **In `config.yaml`**, un ruolo chiamato `public` viene rinominato `default` nel file quando la configurazione viene caricata. Cambia solo il
  nome, prima si fa un backup della configurazione, e una configurazione tenuta in un repository ha poi una modifica da fare push.
- **In un template ytt**, il template non viene riscritto: viene rinominata la configurazione che produce, e un avviso nel log ti chiede
  di rinominare il ruolo anche nel template. La versione 8 rifiuta lì un ruolo `public`.

Una configurazione con sia un ruolo `default` sia un ruolo `public` viene rifiutata, perché sono lo stesso ruolo.

---

## Oggetto Role

Ogni voce della lista `roles`:

{% include config_object.html name="Role" %}

---

## Opzioni dei ruoli

Le `options` di un ruolo attivano o disattivano funzionalità per i suoi membri. Dalla 7.3.0 la pagina del ruolo le mostra in quattro gruppi,
ogni opzione con una (i) che dice cosa concede, lo stesso testo mostrato dalla vista **Permessi** del profilo:

| Opzione | Permette all'utente di | Predefinito |
|---|---|---|
| **Impostazioni** | | |
| `showSettings` | Vedere e modificare ogni pagina delle impostazioni; il log del server e i backup hanno opzioni proprie | Solo admin |
| `showAppearanceSettings` | Modificare le impostazioni dell'aspetto, senza le altre impostazioni (dalla 7.3.0) | Disattivato |
| `showConnectionsSettings` | Gestire le impostazioni delle connessioni (credenziali, runner e altro), senza le altre impostazioni (dalla 7.3.0) | Disattivato |
| `showLogs` | Vedere il log del server | Solo admin |
| `showAuditLog` | Vedere il log di audit, senza le altre impostazioni (dalla 7.3.0) | Solo admin |
| `allowBackupOps` | Fare il backup del database e ripristinarlo | Solo admin |
| **Designer** | | |
| `showDesigner` | Vedere e usare il designer | Solo admin |
| `allowFormDesign` | Modificare la configurazione dei moduli nel designer: categorie, costanti e moduli. Senza, sola lettura (dalla 7.3.0) | Attivo |
| `allowPlaybookDesign` | Modificare i playbook nel designer: salvarli, crearli, rimuoverli e farne push. Senza, sola lettura | Attivo |
| `allowWorkflowDesign` | Modificare i workflow nel designer: salvarli, crearli, rimuoverli e farne push. Senza, sola lettura | Attivo |
| `allowInventoryDesign` | Modificare gli inventari nel designer: salvarli, crearli, rimuoverli e farne push. Senza, sola lettura | Attivo |
| `allowVarsFileDesign` | Modificare i file di variabili nel designer: salvarli, crearli, rimuoverli e farne push. Senza, sola lettura | Attivo |
| **Job** | | |
| `showJobs` | Vedere la pagina dei job | Attivo |
| `showAllJobLogs` | Vedere i job di tutti gli utenti, non solo i propri | Solo admin |
| `manageAllJobs` | Interrompere, eliminare e rilanciare i job di tutti gli utenti; eliminare e rilanciare richiedono anche le due opzioni qui sotto (dalla 7.3.0) | Solo admin |
| `showExtravars` | Vedere le extravars di un modulo e di un job | Attivo |
| `showDebugButtons` | Vedere i pulsanti di debug in un modulo | Attivo |
| `showArtifacts` | Vedere gli artifact di un job: ciò che restituisce un job AWX, o ciò che un playbook ha raccolto con `set_stats` | Attivo |
| `allowVerboseMode` | Eseguire i job in modalità verbose | Attivo |
| `allowJobRelaunch` | Rilanciare un job con i dati del modulo di un'esecuzione precedente | Solo admin |
| `allowJobDeletion` | Eliminare i job: i propri, o quelli di tutti gli utenti con `manageAllJobs`. Senza, la cronologia dei job resta intera (dalla 7.3.0) | Attivo |
| `allowScheduledJobs` | Creare e gestire pianificazioni ricorrenti e una tantum, nella pagina **Pianificazioni** (vedi l'avviso qui sotto) | Solo admin |
| `allowPlannedJobs` | Pianificare un job da eseguire una volta a un'ora stabilita (**Esegui più tardi**) | Attivo |
| `allowStoredJobs` | Salvare i dati di un modulo e caricarli di nuovo in seguito | Attivo |
| **Accesso e integrazioni** | | |
| `allowLogin` | Accedere ad AnsibleForms | Attivo |
| `allowChat` | Usare l'[assistente chat](../chat/), quando è abilitato | Attivo |
| `allowMcp` | Usare il [server MCP](../mcp/) da un agente IA, quando è abilitato | L'`allowChat` del ruolo |
| `allowFileUploads` | Caricare file tramite i campi file di un modulo (dalla 7.3.0) | Attivo |
| `allowApiTokens` | Creare [token API](../profile/api-token.html) per gli script, fino alla durata massima consentita dall'istanza (dalla 7.3.0) | Disattivato |
| `extendedTokenExpiration` | Creare anche token API che non scadono mai; richiede `allowApiTokens` | Disattivato |

Alcune opzioni ne includono altre, e la pagina del ruolo mostra quelle incluse attive e in grigio:

- **`showSettings`** concede anche `showAppearanceSettings`, `showConnectionsSettings` e `showAuditLog`.
- **`manageAllJobs`** concede anche `showAllJobLogs`, perché agire sui job di tutti gli utenti significa vederli.
- **Le opzioni di design** contano solo con `showDesigner`, e `extendedTokenExpiration` solo con `allowApiTokens`.

Fino alla 7.2.0, `showAllJobLogs` permetteva anche a un utente di interrompere ed eliminare i job che mostrava; dalla 7.3.0 serve `manageAllJobs`.
Un ruolo di prima della 7.3.0 con `extendedTokenExpiration` e senza `allowApiTokens` riceve `allowApiTokens`, così mantiene i suoi token.

**Solo admin** significa attivo per gli utenti che hanno il ruolo `admin`, e disattivo per tutti gli altri. Quando un utente corrisponde a più ruoli,
le opzioni si combinano così:

- **Tra i ruoli dell'utente**, un'opzione è attiva solo quando tutti i ruoli che la impostano sono d'accordo: vince un `false` esplicito.
- **Il ruolo `default`** completa le opzioni che nessuno degli altri ruoli dell'utente imposta, quindi può contenere i valori predefiniti per tutti.
- **Le opzioni non impostate da nessuna parte** prendono il valore predefinito della tabella.

`showExtraVars`, con la V maiuscola, è accettata come grafia alternativa di `showExtravars`; quando una delle due grafie è `false`,
l'opzione è disattivata.

{: .warning }
> Considera `allowScheduledJobs` un'opzione di livello admin. Le pianificazioni non appartengono all'utente che le ha create: ogni utente con
> l'opzione vede e può modificare tutte le pianificazioni. Una pianificazione inoltre viene eseguita con diritti di admin, per qualsiasi modulo, qualunque sia
> l'accesso di chi l'ha creata. Concedila solo ai ruoli di cui ti fideresti come admin.

{: .warning }
> `allowLogin: false` sul ruolo `default` blocca fuori ogni utente i cui altri ruoli non impostano `allowLogin: true`, compresi
> gli admin. Riconcedila ai ruoli che devono accedere prima di salvare.
