---
layout: default
title: Oggetti gestiti
parent: Config seed
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Oggetti gestiti
{: .no_toc }

Come il seed possiede gli oggetti che elenca, e come tiene fuori i segreti
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le sezioni a riga singola sono tutto o niente

`ldap`, `settings` e `chat_assistant` (`chat` prima della 7.8.0) sono ciascuna una **riga singola**, quindi il seed deve dichiararne tutti i campi.

Un seed che omette un campo si rifiuta di partire e lo indica:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Dichiara esplicitamente un valore vuoto con `""` o `false`. Alcuni campi sono facoltativi, e uno omesso resta invariato:

| Sezione | Campi facoltativi |
|---|---|
| `ldap` | `description`, `credential` (una credenziale con cui fare il bind) e `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, e `credential` dalla 7.8.0 |
| `settings` | Le chiavi `mail_*`, deprecate dalla 7.6.0 (vedi [Esempio](example.html)) |

`settings` copre solo l'URL, e le chiavi mail deprecate; tutte le altre impostazioni restano modificabili.

---

## Il file non contiene segreti

Ogni `${VARIABLE}` viene sostituita con quella variabile d'ambiente (su Kubernetes, da un `Secret`), così il file può stare in Git.

Una variabile non impostata è un **errore fatale**, così un segnaposto non può mai finire salvato come password.

Le credenziali possono anche usare un [archivio di segreti](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` sparirà nella 8.

---

## Oggetti gestiti

Un oggetto delle sezioni a lista (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` e `labels`) o di una sezione a riga singola che viene dal seed è contrassegnato come **gestito**:

- Viene imposto a **ogni** avvio, così il file resta la fonte autorevole.
- È in sola lettura: l'API risponde **403**, l'interfaccia disabilita Modifica ed Elimina, e la sua pagina dice che viene dal file
  del config seed ed è in sola lettura.
- Solo il seed può impostare o togliere il contrassegno.

Gli oggetti creati a mano non vengono **mai toccati**, a meno che il seed non dichiari lo stesso nome. Quel record viene allora **adottato**:
i campi dichiarati vengono imposti e diventa in sola lettura. L'adozione viene registrata come avviso e nella traccia di audit.

Applicare il seed è idempotente: i record che corrispondono già vengono lasciati stare, quindi un riavvio di norma riporta `0 updated`.

Un repository dichiarato il cui working tree manca viene **clonato di nuovo** a ogni avvio, così un primo clone non riuscito viene
ritentato. La riga *Repository* della pagina Stato mostra qualsiasi repository senza working tree.

Dalla 7.8.0 un [repository git](../repositories/) può contenere gli stessi tipi di oggetti. Un oggetto che un repository contiene resta
del repository: l'elemento del seed per esso non viene applicato, e il log del server lo dice. Un repository che il seed dichiara resta del seed.

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

Togliere `CONFIG_SEED_PATH` disattiva il seed: l'avvio successivo rilascia ogni record e ogni campo che il seed gestiva, come farebbe un
seed vuoto applicato. I record mantengono i loro valori e tornano modificabili, e il log del server e il log di audit dicono cosa è
stato rilasciato.

Un `CONFIG_SEED_PATH` il cui file manca non rilascia nulla: il server invece si rifiuta di partire, perché un file montato può solo
essere in ritardo.

---

## Impostazioni che il seed dichiara

Le sezioni aggiunte nella 7.8.0 sono possedute in modo meno rigido degli oggetti gestiti, in due modi.

| Sezioni | Come il seed le possiede |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Campo per campo: ogni campo dichiarato è in sola lettura nella sua pagina, con un avviso, e l'API rifiuta di modificarlo (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Creati o modificati a ogni applicazione, mai bloccati né eliminati |

Un campo di `defaults`, `logo`, `icon`, `name`, `links` o `mcp` che il seed non dichiara più viene rilasciato, e lo sono tutti quando il
seed viene disattivato. Un logo o un'icona del seed non si possono caricare né rimuovere nell'app. Quando un repository contiene la stessa
pagina, il seed mantiene i campi che dichiara e il repository contiene gli altri.

Un utente, un gruppo, un annuncio, una versione del disclaimer o la chiave SSH e gli host conosciuti del seed restano modificabili
nell'app, e l'applicazione successiva riscrive i valori del seed dove differiscono. Rimuovere un elemento dal file lo lascia nell'app, e
`prune` non ne elimina nessuno.
