---
layout: default
title: Backup
parent: In produzione
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Backup
{: .no_toc }

Backup notturni, cosa contengono, ripristini, e cos'altro conservare
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Backup notturni

AnsibleForms fa il backup di se stesso ogni notte a mezzanotte, nel fuso orario di [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(UTC per impostazione predefinita). Queste impostazioni lo controllano:

| Variabile | Predefinito | Significato |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Dove si scrivono i backup, ognuno in una cartella con data e ora |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Quanti backup notturni si conservano, `0` li conserva tutti |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | Il comando che fa il dump del database |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | Il comando che riapplica un dump durante il ripristino |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Per quanto tempo possono girare il dump e il ripristino |

Gli utenti con l'opzione di ruolo `allowBackupOps` possono anche fare un backup in qualsiasi momento nella pagina **Backup**. La conservazione
rimuove solo i backup notturni, e contano solo i backup con un dump utilizzabile, così una serie di notti
fallite non spinge mai fuori l'ultimo backup buono.

Prima che un aggiornamento modifichi il database, il worker fa prima un backup normale, una volta per versione, chiamato *Before the upgrade to
&lt;version&gt;*. Compare nella pagina **Backup** e la conservazione notturna non lo rimuove mai. Se non riesce (nessuno strumento di dump,
`BACKUP_PATH` non scrivibile), l'aggiornamento si ferma e dice perché, così l'app non parte mai su un database aggiornato a metà.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` aggiorna senza backup.

I comandi possono essere wrapper come `docker exec <container> mysqldump`, se la loro prima parola esiste in locale. Dalla 7.3.0 girano
senza shell: le virgolette e `$NAME` dall'ambiente del comando funzionano, ma `;`, `|`, `&&`, `>` e `<` vengono rifiutati.

---

## Diritti sul database

Il dump gira come [`DB_USER`](../customization/server.html#env_DB_USER), e non richiede più diritti di quelli di cui ha bisogno l'applicazione stessa:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Il dump si fa con `--no-tablespaces`, quindi il diritto `PROCESS` a livello di server non serve, e salta le tabelle
che descrivono i processi in esecuzione (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). Il ripristino lo riapplica con lo stesso utente.
La pagina **Stato** mostra un avviso nel suo controllo **Utente del database** quando l'utente ha diritti su ogni database, come li ha `root`.

---

## Cosa contiene un backup

Ogni backup è una cartella sotto `BACKUP_PATH`, chiamata con la sua data e ora UTC (`YYYYMMDDHHmmss`), che contiene:

| File | Contenuto |
|------|---------|
| `ansibleforms.sql` | Il dump del database `AnsibleForms`: utenti, gruppi, credenziali, job, impostazioni, la traccia di audit |
| `config.yaml` | Il file in [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | La cartella in [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | Il file di ambiente che scrivono le pagine delle impostazioni, senza `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` e `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | La descrizione del backup |

Un backup il cui dump non riesce viene rimosso di nuovo e registrato come errore. La pagina **Stato** avvisa quando non c'è nessun backup,
quando il più recente ha più di due giorni, o quando non ha un dump utilizzabile, e verifica che lo strumento di dump esista.

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) conserva invece i punti di ripristino del designer (60 giorni per impostazione predefinita).

---

## Ripristinare un backup

Ripristina dalla [pagina **Backup**](../gui/administration.html#restore), con **Crea un nuovo backup prima del ripristino** spuntato. Un ripristino:

* riapplica `ansibleforms.sql`, che sostituisce l'intero database; dalla 7.3.0 un backup di una versione più vecchia viene poi aggiornato
  di nuovo, come all'avvio di una nuova versione, e una patch che non riesce viene segnalata
* ricopia `config.yaml`, e sostituisce la cartella `forms/` con quella del backup: dalla 7.3.0 i moduli che non sono nel backup vengono
  rimossi invece che conservati, i collegamenti e i permessi della cartella restano, e una copia non riuscita riporta la cartella allo stato precedente
* **non** ripristina `managed.env`, perché descrive l'host da cui proviene il backup. Il pulsante **Ripristina ambiente**
  lo rimette a richiesta, conserva il file attuale come `.env.bak`, e richiede un riavvio.

Un backup senza un dump utilizzabile viene rifiutato; dopo un ripristino interrotto, correggi la causa e ripristina di nuovo.

Su un nuovo host, imposta lo stesso `ENCRYPTION_SECRET` prima di ripristinare, altrimenti le credenziali salvate non si possono decifrare.

---

## Cos'altro mettere nel backup

Il backup notturno copre il database, la configurazione e i moduli, ma nient'altro della cartella persistente:

* **`ENCRYPTION_SECRET` e `ACCESS_TOKEN_SECRET`** : mai in un backup, per scelta. Tienili nel tuo gestore di segreti;
  senza il segreto di cifratura un dump del database è inutile per le credenziali.
* **i backup stessi** : stanno sullo stesso volume dell'istanza. Copia `BACKUP_PATH` su un altro host.
* **il resto della cartella persistente** : playbook, caricamenti, file di variabili, repository clonati, certificati e log.
  Con il progetto docker-compose, fai il backup dell'intera cartella `data/`, che contiene anche la chiave SSH, le funzioni
  personalizzate e i ruoli e le collection di Ansible.

Il contenuto che arriva da git (repository, moduli in un repository) si può clonare di nuovo, quindi il suo backup conta meno.
