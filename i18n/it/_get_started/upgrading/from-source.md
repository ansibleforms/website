---
layout: default
title: Dai sorgenti
parent: Aggiornamento
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# Dai sorgenti
{: .no_toc }

Aggiorna un'installazione compilata dai sorgenti
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un'installazione compilata dai sorgenti si aggiorna facendo il checkout della nuova release, ricompilandola e riavviando
l'applicazione. Le tue impostazioni, moduli, playbook, certificati e log sono salvati in `server/persistent`, che Git e la
build non modificano.

---

## Prima di aggiornare

Prepara l'aggiornamento in modo da poter tornare indietro se qualcosa va storto:

* **Fai un backup** in **Impostazioni → Backup**. La nuova release aggiorna lo schema del database al suo primo avvio.
* **Leggi il [changelog](../changelog)** delle release tra la tua versione e quella nuova.
* **Passi a una nuova major?** Segui prima [Aggiornare alla v7](../upgrade-7.html).
* **Controlla la versione di Node.js** richiesta dalla nuova release, nel changelog.

---

## 1. Ottieni la nuova release

Scarica i tag delle release e fai il checkout della release che vuoi. I tag delle release riportano il numero di versione, e `git tag` li
elenca; il branch `main` può contenere modifiche non ancora rilasciate:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Ricompila

Ricompila con gli stessi tre passi dell'installazione. Prima ricompila il client:

```bash
cd client
npm ci
npm run build
```

Poi aggiorna le dipendenze del server:

```bash
cd ../server
npm ci --omit=dev
```

Infine copia di nuovo il client ricompilato nella cartella `views` del server:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Confronta `.env.example`, nella radice del repository, con il tuo `persistent/.env` per riprendere le eventuali impostazioni che la release aggiunge.

---

## 3. Riavvia

Riavvia l'applicazione e il suo RTE per caricare il nuovo codice. Lo schema del database viene aggiornato al primo avvio:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Se arrivi dalla 7.2, l'RTE girava in modalità database, con le impostazioni del database e `RTE_URL`, deprecata nella 7.3.0 e rimossa nella 8.0.0.
Avvialo di nuovo in modalità inbound, e dichiara il suo runner con una credenziale RTE nel seed o in **Connessioni → Runner**, come mostra
l'[installazione](../installation/from-source.html#run): `pm2 delete ansibleforms-rte`, poi il suo comando `pm2 start`.

Se esegui l'applicazione senza PM2, ferma `npm run start` e avvialo di nuovo.

---

## 4. Controlla l'aggiornamento

Segui il log dell'applicazione mentre si avvia:

```bash
pm2 logs ansibleforms
```

In AnsibleForms, **Aiuto → Informazioni** mostra la versione in esecuzione, e **Impostazioni → Stato** mostra lo stato di salute del
database, dello schema e degli altri sistemi da cui dipende AnsibleForms.

---

## Tornare indietro

Per tornare alla release che eseguivi prima, la versione che **Aiuto → Informazioni** mostrava prima dell'aggiornamento, fai il checkout del suo tag con
`git checkout <version>`, poi ricompila e riavvia come nei passi 2 e 3. Se quella release non si avvia sul database aggiornato, ripristina il backup che hai fatto in
**Impostazioni → Backup**.
