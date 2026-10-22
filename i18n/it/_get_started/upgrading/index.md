---
layout: default
title: Aggiornamento
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Aggiornamento
{: .no_toc }

Porta AnsibleForms a una release più recente
{: .fs-6 .fw-300 }

---

Per gli amministratori di un'istanza in esecuzione: passa a una release più recente, con il metodo con cui l'hai installata.

---

## In questa sezione

La procedura di aggiornamento dipende da come hai installato AnsibleForms. Ogni metodo è descritto nella propria pagina:

| Pagina | Cosa tratta |
|---|---|
| [Aggiornare alla v7](../upgrade-7.html) | Cosa cambiare quando sei ancora sulla 6.5, prima di passare alla 7 |
| [Con l'installer](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, per un'installazione fatta dall'installer: backup, note di rilascio e rollback |
| [Docker](docker.html) | Scarica la nuova immagine e ricrea il container con le stesse impostazioni |
| [Docker Compose](docker-compose.html) | Scarica la nuova immagine e riavvia il progetto docker-compose |
| [Dai sorgenti](from-source.html) | Scarica il nuovo codice, ricompilalo e riavvia l'applicazione |
| [Kubernetes](kubernetes.html) | Aggiorna il repository del chart ed esegui `helm upgrade` con i tuoi valori |

{: .note }
> **Prima il backup** Fai un backup prima di aggiornare (**Impostazioni → Backup**). Lo schema del database viene aggiornato al primo
> avvio della nuova release, quindi il backup è il tuo punto di ritorno se qualcosa va storto. Dalla 7.3.0 anche il worker ne fa
> uno da sé prima di aggiornare da una release più vecchia, con il nome della release, a meno che
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) non sia `0`.

La release che ricevi dipende dal tag dell'immagine che esegui: `latest` segue la major più recente, mentre un tag come `7`
resta su quella major. Tutti i tag sono elencati in [Tag delle immagini](../installation/#image-tags).
