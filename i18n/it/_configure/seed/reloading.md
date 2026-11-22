---
layout: default
title: Ricaricamento e avvio
parent: Config seed
nav_order: 3
translated_from: d6cc2dfaf45589a284b52223737ed04ac4330e67
---

# Ricaricamento e avvio
{: .no_toc }

Modificare il file senza riavvio, e cosa succede all'avvio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Modificare il file senza riavviare

Il seed viene riletto ogni `CONFIG_SEED_RELOAD_SECONDS` (60 per impostazione predefinita, `0` lo disattiva)
e riapplicato quando il suo contenuto è cambiato. Una modifica di cui si fa commit in git raggiunge quindi
automaticamente un'istanza in esecuzione: su Kubernetes, una `ConfigMap` viene rimontata nel pod entro
circa un minuto, e il controllo successivo la rileva. Non c'è nessun rollout né riavvio, e nessun
hook deve chiamare nulla.

Per un file invariato, il controllo calcola un hash e si ferma, quindi non riscrive mai una riga che ha
già applicato.

Per applicare subito il file invece di attendere il controllo successivo, usa uno di questi:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Entrambi **forzano** un'applicazione anche quando il file non è cambiato. Un'applicazione forzata reimpone un
record gestito che è stato modificato direttamente nel database, e riclona un repository dichiarato
il cui working tree manca.

{: .note }
> Un ricaricamento non è **mai fatale**, a differenza dell'applicazione all'avvio. Un'istanza che sta già
> servendo mantiene la sua configurazione attuale, il motivo viene registrato, e la riga *Seed di configurazione*
> nella pagina Stato diventa rossa e lo indica. Un errore di battitura inviato a git non deve poter mettere
> fuori servizio un'istanza in esecuzione senza alcun intervento di un operatore.
>
> Lo stesso contenuto errato inoltre non viene ritentato a ogni controllo; altrimenti una sola modifica sbagliata
> scriverebbe lo stesso errore nel log all'infinito. Correggi il file, o chiama l'endpoint per ritentare
> subito.

---

## Un seed errato si rifiuta di partire

Un file illeggibile, uno YAML non valido, un campo sconosciuto, un nome duplicato o una
`${VARIABLE}` non risolta fanno **uscire** il server invece di farlo partire. Questo vale solo per il percorso di **avvio**:
vedi la nota qui sopra per cosa fa lo stesso file a un'istanza già in funzione.

È voluto. Continuare con la configurazione precedente lascerebbe un'istanza il cui
comportamento non corrisponde più al manifest che dovrebbe descriverla, senza che nulla
segnali la discrepanza. Il motivo viene scritto sullo standard error oltre che nel file di log, così
`kubectl logs` e `docker logs` lo mostrano.

La validazione è rigorosa: i campi sconosciuti vengono rifiutati invece che ignorati, e l'errore indica
la chiave incriminata:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Un database vuoto si configura da solo

Con `ALLOW_SCHEMA_CREATION` attiva (il predefinito), un database che non contiene **nessuna tabella
di AnsibleForms** riceve il suo schema all'avvio. Un nuovo deployment parte quindi
senza che nessuno debba chiamare a mano l'endpoint `/schema`.

La condizione è rigorosa di proposito: creare lo schema **elimina prima ogni tabella**, quindi
viene eseguita solo su un database completamente vuoto. Un database a cui manca
una colonna, o che ha tabelle ma nessun account utente, *non* è vuoto e non viene toccato;
quei casi li gestiscono le patch dello schema.
