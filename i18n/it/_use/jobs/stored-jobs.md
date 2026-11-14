---
layout: default
title: Job salvati
parent: Job
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: 90ae6acdb80d10401ea24f37de675b9a2901bdf9
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
**Nome**, una **Descrizione** facoltativa e una data in **Scade il (opzionale)**, poi salva. I campi password e costante non vengono
mai salvati. Un sottomodulo ha la stessa azione **Salva** accanto al suo pulsante **Salva**, e conserva i valori non completati senza
validarli.

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

- **Modifica** apre la pagina del job salvato: i suoi **Dettagli** (nome, modulo, scadenza) e i suoi **Valori**, i valori dei
  campi salvati in YAML, che lì si possono modificare e salvare.
- **Apri nel modulo** apre il suo modulo con i valori salvati già compilati; non gira nulla finché non invii.
- **Elimina** lo rimuove. Puoi eliminare i tuoi job salvati; gli utenti con `showSettings` possono eliminarne qualsiasi.
- I job salvati con una data **Scade il** nel passato vengono eliminati automaticamente ogni giorno alle 04:00 (in `LOG_TZ`).
