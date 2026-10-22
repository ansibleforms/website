---
layout: default
title: Privacy e limiti
parent: Assistente chat
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Privacy e limiti
{: .no_toc }

Cosa esce dalla rete, e i limiti per utente
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cosa esce dalla rete

Per i moduli che partecipano, al fornitore viene inviato quanto segue:

- i nomi e le descrizioni dei moduli, le etichette dei campi, i testi di aiuto, le scelte e i valori che si stanno
  compilando;
- la conversazione.

Quanto segue non viene mai inviato al fornitore, alla pagina né al log:

- le password (l'utente le inserisce nel browser), le credenziali salvate e la chiave API;
- l'output di un job, e le sue extravars salvate (l'assistente legge solo lo stato di un job, e solo
  quando **Lascia che l'assistente segua i suoi job** è attivo nelle impostazioni).

Tutto ciò che si trova sotto una chiave che sembra un segreto (`password`, `secret`, `token`, `api_key`, ...)
viene mascherato prima che il modello o la pagina lo vedano.

Per tenere i dati dei moduli in casa, usa un tuo tenant (Azure OpenAI) o un modello locale (Ollama), non un'API pubblica.

---

## Limiti

I seguenti limiti si impostano nella pagina delle impostazioni:

- **Messaggi per conversazione** (20) - dopodiché l'utente deve iniziare una nuova conversazione.
- **Cicli di strumenti per messaggio** (6) - quante volte il modello può chiamare uno strumento prima di rispondere.
- **Timeout** (60 s) - per ogni chiamata al fornitore.

I seguenti limiti sono fissi: un messaggio alla volta per conversazione, al massimo 4000 caratteri per messaggio, 60 messaggi per
utente all'ora, e 5 conversazioni per utente. Una conversazione viene scartata dopo 2 ore senza messaggi.

Una scheda di riepilogo con un pulsante **Avvia** si può usare una volta, e scade dopo 15 minuti: Avvia risponde allora che il
riepilogo è scaduto, e l'utente chiede all'assistente un riepilogo nuovo. Conversazioni e riepiloghi sono tenuti in memoria, quindi dopo
un riavvio l'utente deve iniziare una nuova conversazione.
