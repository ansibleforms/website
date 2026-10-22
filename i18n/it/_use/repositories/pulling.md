---
layout: default
title: Fare il pull delle modifiche
parent: Repository Git
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Fare il pull delle modifiche
{: .no_toc }

Pull pianificati, manuali e via API, e modifiche locali
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fare il pull delle modifiche

Il pull di un repository avviene secondo la sua pianificazione, all'avvio, dalla pagina, o tramite l'API; non esiste un endpoint per i webhook.

| Attivazione | Come |
|---|---|
| Pianificazione | **Attiva il pull pianificato** e una **Pianificazione del pull**, per esempio `0 * * * *` per ogni ora |
| Avvio | **Pull all'avvio dell'app** clona il repository, o ne fa il pull se è già clonato |
| Pagina delle impostazioni | **Pull** nel menu della riga, o **Pull di tutti** sopra l'elenco |
| Designer | **Carica (repository)**, che fa il pull dei repository dei moduli e ricarica il designer; anche prendere il blocco del designer fa prima il pull di ogni repository di moduli |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` o `showConnectionsSettings`) oppure `POST /api/v2/forms-repos/pull/<name>` (vedi sotto) |

### Pull da una pipeline o da un webhook

AnsibleForms non ha un ricevitore di webhook dedicato, ma un job di CI o un webhook del server git può chiamare l'endpoint di pull.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Crea il token come descritto in [Token API](../profile/api-token.html), per un utente il cui ruolo ha `showSettings` o
`showConnectionsSettings`. `/api/v2/forms-repos/pull/<name>` richiede invece `showDesigner` e `allowFormDesign`, con il designer
attivo ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` restituisce
`head`, `status` e `output`, così una pipeline può verificare quale commit esegue l'istanza dopo un pull.

### Modifiche locali

Un pull non sovrascrive mai il lavoro non ancora inviato con push, quindi un pull pianificato controlla la copia di lavoro prima di girare.

Un pull pianificato viene saltato finché la copia di lavoro ha modifiche non committate o commit non inviati, e finché un designer
detiene il blocco del designer. Un pull manuale di una copia di lavoro con modifiche in conflitto fallisce con:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Invia le modifiche con push, oppure scartale con **Reimposta** nel menu della riga, che elimina la copia di lavoro e la clona di nuovo.
