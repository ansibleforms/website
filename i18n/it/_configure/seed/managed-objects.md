---
layout: default
title: Oggetti gestiti
parent: Config seed
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Oggetti gestiti
{: .no_toc }

Come il seed possiede gli oggetti che elenca, e come tiene fuori i segreti
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le sezioni a riga singola sono tutto o niente

`ldap`, `settings` e `chat` sono ciascuna una **riga singola**, quindi il seed deve dichiararne tutti i campi; le altre sezioni sono liste.

Un seed che omette un campo si rifiuta di partire e lo indica:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Dichiara esplicitamente un valore vuoto con `""` o `false`. Alcuni campi sono facoltativi, e uno omesso resta invariato:

| Sezione | Campi facoltativi |
|---|---|
| `ldap` | `description`, `credential` (una credenziale con cui fare il bind) e `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` ed `extra_headers` |
| `settings` | Nessuno |

`settings` copre solo i campi mail e l'URL; tutte le altre impostazioni restano modificabili.

---

## Il file non contiene segreti

Ogni `${VARIABLE}` viene sostituita con quella variabile d'ambiente (su Kubernetes, da un `Secret`), così il file può stare in Git.

Una variabile non impostata è un **errore fatale**, così un segnaposto non può mai finire salvato come password.

Le credenziali possono anche usare un [archivio di segreti](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` sparirà nella 8.

---

## Oggetti gestiti

Un oggetto che viene dal seed è contrassegnato come **gestito**:

- Viene imposto a **ogni** avvio, così il file resta la fonte autorevole.
- È in sola lettura: l'API risponde **403**, l'interfaccia disabilita Modifica ed Elimina, e la sua pagina dice che viene dal file
  del config seed ed è in sola lettura.
- Solo il seed può impostare o togliere il contrassegno.

Gli oggetti creati a mano non vengono **mai toccati**, a meno che il seed non dichiari lo stesso nome. Quel record viene allora **adottato**:
i campi dichiarati vengono imposti e diventa in sola lettura. L'adozione viene registrata come avviso e nella traccia di audit.

Applicare il seed è idempotente: i record che corrispondono già vengono lasciati stare, quindi un riavvio di norma riporta `0 updated`.

Un repository dichiarato il cui working tree manca viene **clonato di nuovo** a ogni avvio, così un primo clone non riuscito viene
ritentato. La riga *Repository* della pagina Stato mostra qualsiasi repository senza working tree.

### Rimuovere un oggetto

Rimuovere un oggetto dal file lo **rilascia**: il record resta e torna modificabile. Eliminare un'intera sezione
fa lo stesso.

Aggiungi `prune: true` a una sezione a lista per **eliminare** i record gestiti che il file non dichiara più:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` non elimina mai un record creato a mano.

### Disattivare il seed

Togliere `CONFIG_SEED_PATH` **non** rilascia nulla: il seed non viene più applicato, e i record che gestiva restano gestiti
e in sola lettura. Per modificarli di nuovo, rilasciali prima: punta `CONFIG_SEED_PATH` a un file senza di essi (un file vuoto non dichiara
nulla e rilascia ogni record), lascia che si applichi a un avvio o a un ricaricamento, poi togli la variabile. I record rilasciati restano come
sono, e diventano modificabili.
