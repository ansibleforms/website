---
layout: default
title: Job salvati
parent: Job
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
---

# Job salvati
{: .no_toc }

Conservare i dati di un modulo per ricaricarli più tardi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Job salvati

I job salvati conservano i valori di un modulo così puoi ricaricarli, invece di compilare ogni volta gli stessi campi.

Per salvare, compila il modulo, apri il menu a tendina accanto a **Invia** e scegli **Salva**. In **Salva dati modulo**, inserisci un
**Nome**, una **Descrizione** facoltativa e quando viene **Rimosso** (vedi [Quando viene rimosso](#when-it-is-removed)), poi salva. I campi password e
costante non vengono mai salvati. Un sottomodulo ha la stessa azione **Salva** accanto al suo pulsante **Salva**, e conserva i valori non completati
senza validarli.

Per caricare, seleziona **Carica da archivio** in cima al modulo. **Carica modulo salvato** elenca i tuoi job salvati per quel modulo, con
le date di creazione e di scadenza; selezionane uno per compilare il modulo con i suoi valori. Non gira nulla finché non invii.

I job salvati vengono conservati nel database di AnsibleForms (tabella `stored_jobs`), con il nome del modulo, il tuo utente come
`<type>/<username>` (per esempio `local/admin`) e i valori in JSON. Un nome deve essere univoco per utente e modulo; salvarne
un secondo con lo stesso nome fallisce con "A saved form with this name already exists".

---

## Gestire i job salvati

La pagina **Job salvati** elenca i job salvati con il loro modulo, utente, data di creazione e di scadenza, e richiede `allowStoredJobs`.

Dalla 7.6.0 basta `allowStoredJobs` per **Job > Salvati** e **Aggiungi job salvato**, che prima chiedevano anche `showSettings` o
`allowScheduledJobs`. La lista **Modulo** offre i moduli aperti dai tuoi ruoli; con `showSettings` o `allowScheduledJobs` li offre tutti.

Dalla 7.7.0 l'elenco ha una colonna ordinabile **Ultimo uso**, così i job salvati ancora in uso si distinguono da quelli abbandonati.

- **Modifica** apre la pagina del job salvato: i suoi **Dettagli** (nome, descrizione, modulo, utente, quando è stato creato e usato l'ultima volta,
  e quando viene rimosso), i suoi **Valori**, i valori dei campi salvati in YAML, che lì si possono modificare e salvare, e le sue **Esecuzioni**.
- **Apri nel modulo** apre il suo modulo con i valori salvati già compilati; non gira nulla finché non invii.
- **Elimina** lo rimuove. Puoi eliminare i tuoi job salvati; gli utenti con `showSettings` possono eliminarne qualsiasi.

---

## Ultimo uso ed esecuzioni

Dalla 7.7.0 un job salvato registra il suo ultimo uso e i job avviati da esso, così puoi capire quali sono ancora in uso.

Questi avvii contano come un uso di un job salvato:

| Avvio | Quando conta |
|---|---|
| Il modulo aperto da esso (**Apri nel modulo**), o compilato con **Carica da archivio** | Quando il job viene avviato |
| **Esegui più tardi** da quel modulo | Quando parte l'esecuzione pianificata, non quando viene pianificata |
| Un **rilancio** di un job avviato da esso | Quando parte il rilancio, con gli stessi valori o con valori modificati |
| `launch_job` o `plan_job` di MCP con esso | Come sopra |

Le esecuzioni di una pianificazione non contano mai, nemmeno di una creata da un job salvato: una pianificazione tiene una propria copia dei valori.
Un avvio conta solo se l'utente può vedere il job salvato; uno eliminato o nascosto nel frattempo viene saltato e il job viene eseguito comunque.

La pagina del job indica il job salvato da cui è stato avviato, con un link, quando puoi vederlo. La scheda **Esecuzioni** della pagina del job
salvato elenca i job avviati da esso che puoi vedere, con stato, inizio, fine e durata.

---

## Quando viene rimosso

Ogni job salvato indica quando viene rimosso: mai, in una data, o dopo un certo numero di giorni senza uso.

| Scelta | Cosa fa |
|---|---|
| **Mai** | Lo conserva finché qualcuno non lo elimina. Non offerta mentre `STORED_JOB_UNUSED_DAYS` è impostata |
| **In una data** | Lo rimuove in quella data |
| **Se inutilizzato per N giorni** | Lo rimuove quando nessun job è stato avviato da esso per quel numero di giorni |

Un admin può impostare [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS)
(Impostazioni > Generale > Conservazione). Allora rimuove ogni job salvato rimasto inutilizzato per quel numero di giorni, i giorni propri di un job
salvato possono solo essere meno, la finestra Salva parte da quel valore, e uno rimosso in una data viene rimosso anche quando resta inutilizzato
così a lungo. I giorni contano dall'ultimo uso o, per un job salvato mai usato, da quando è stato salvato. Il suo valore predefinito, 0, non ne
rimuove mai uno perché inutilizzato.

I job salvati vengono rimossi ogni giorno alle 04:00 (in `LOG_TZ`), alla prima scadenza tra la loro data e i loro giorni.
