---
layout: default
title: Aggiungere un repository
parent: Repository Git
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Aggiungere un repository
{: .no_toc }

La pagina Repository, ogni campo di un repository, e come dichiararne uno nel config seed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La pagina Repository

I repository si gestiscono in **Impostazioni > Connessioni > Repository**, che richiede l'[opzione di ruolo](../config/roles.html#role-options) `showSettings` o, dalla 7.3.0,
`showConnectionsSettings`. Alcune modifiche sono riservate a un amministratore, vedi [sotto](#who-may-change-a-repository).

![Repository](../assets/screenshots/git.jpg)

L'elenco mostra **Nome**, **Descrizione**, **Branch**, **Head** (l'hash breve del commit su cui è fatto il checkout), **Pull** e
**Push**. La scheda **Dettagli** di un repository mostra gli stessi badge Pull e Push sopra il suo head:

| Colonna | Cosa dice |
|---|---|
| **Pull** | L'ultimo clone, pull o reset: **In esecuzione** mentre git lavora, poi **Riuscito** o **Fallito**; un trattino prima del primo |
| **Push** | **Fallito** quando l'ultimo push non è riuscito; **Modifiche in sospeso** quando le modifiche salvate qui, dal designer, non sono ancora state inviate al remoto; **Riuscito** quando non c'è nulla in attesa; un trattino prima del primo push |

**Riuscito** nella colonna Push significa solo che non c'è nulla in attesa di push: il remoto potrebbe comunque contenere commit più recenti che un
pull porta dentro. Il menu di ogni riga contiene queste azioni:

| Azione | Cosa fa |
|---|---|
| **Modifica** | Cambia i campi qui sotto |
| **Pull** | Clona il repository, o ne fa il pull quando la copia di lavoro esiste già |
| **Push** | Fa il commit e il push della copia di lavoro; solo sui repository usati per moduli, configurazione, playbook, workflow o inventari, e attivo solo finché ci sono modifiche non ancora inviate |
| **Reimposta** | Elimina la copia di lavoro e la clona di nuovo, scartando le modifiche locali |
| **Modifica credenziali** | Apre la scheda **Credenziali** del repository, per scegliere la credenziale che usa git |
| **Mostra output dell'ultimo pull** | Mostra l'output di git dell'ultimo clone, pull o reset, con la password mascherata |
| **Mostra output dell'ultimo push** | Mostra l'output di git dell'ultimo push, con la password mascherata |
| **Elimina** | Rimuove il record e la sua copia di lavoro sotto `REPO_PATH`; riservato a un amministratore |

**Pull di tutti**, sopra l'elenco, fa il pull di tutti i repository in una volta.

Su un repository gira una sola operazione git alla volta. Una seconda viene rifiutata con
`Repository '<name>' not found or already running, try again later`.

---

## Aggiungere un repository

Fai clic su **Aggiungi repository**: un wizard chiede i campi in quattro passi (**Repository**, **Credenziali**, **Utilizzo**, **Pianificazione
del pull**), e AnsibleForms avvia il clone in background appena salvi.

![Modifica repository](../assets/screenshots/git-edit.jpg)

| Campo | Obbligatorio | Significato |
|---|---|---|
| **Nome** | sì | Il nome della cartella sotto `REPO_PATH`; lettere, cifre, trattino, trattino basso e punto |
| **Branch** | sì | Il branch da clonare, da cui fare il pull e su cui fare il push, per esempio `main`; obbligatorio dalla 7.3.0. Solo un repository del config seed può ometterlo, per clonare il branch predefinito del remoto |
| **Credenziale** | no | Una credenziale di [Connessioni > Credenziali](../credentials.html) con l'utente e la password o il token che usa git; **Aggiungi credenziale** ne crea una |
| **URI** | sì | Il remoto, `https://...` o SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Attiva il pull pianificato** | no | Fa il pull del repository secondo una pianificazione |
| **Pianificazione del pull** | no | Quando fare il pull, come espressione cron; compare quando il pull pianificato è attivo |
| **Descrizione** | sì | Una descrizione a testo libero |
| **Usare per configurazione?** ... **Usare per gli inventari?** | no | Cosa contiene il repository, vedi [sopra](./#what-a-repository-is-for) |
| **Pull all'avvio dell'app** | no | Clona il repository, o ne fa il pull, ogni volta che AnsibleForms si avvia |

Rinominare un repository sposta la sua copia di lavoro nella nuova cartella e sposta con essa la sua pianificazione del pull. Un repository di
prima della 7 che ha ancora un proprio utente lo segnala nella sua scheda **Credenziali**: scegli una credenziale per sostituirlo.

---

## Chi può modificare un repository

Il contenuto di un repository diventa ciò che AnsibleForms carica ed esegue, quindi dalla 7.3.0 un utente senza il ruolo `admin` non può più:

- aggiungere o eliminare un repository;
- cambiarne l'**URI** o il **Branch**;
- attivare o disattivare uno qualsiasi dei suoi flag **Usare per**.

Può comunque cambiarne la descrizione, la pianificazione del pull e la credenziale, e farne il pull, il push o il reset. Una credenziale usata da un runner,
una connessione o un metodo di accesso non può essere scelta da lui; il rifiuto la nomina, e non dice nulla di ciò che contiene.

---

## Dichiarare repository nel config seed

I repository si possono dichiarare anche nel [config seed](../seed/), così una nuova istanza li clona al primo avvio.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

I campi sono quelli della pagina, compresi `credential` (una credenziale del seed o dell'app), `rebase_on_start` (**Pull all'avvio
dell'app**) e `cron` (la pianificazione del pull); `user` e `password` sono ancora accettati al posto di una credenziale. Un
repository del seed è in sola lettura nell'interfaccia, e viene clonato di nuovo all'avvio quando manca la sua copia di lavoro; vedi
[Oggetti gestiti](../seed/managed-objects.html).
