---
layout: default
title: Kubernetes
parent: Aggiornamento
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Aggiorna un'installazione fatta con il chart Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ogni versione del chart distribuisce una release di AnsibleForms. Un aggiornamento installa una versione più recente del chart con i tuoi valori esistenti;
i dati sui volumi persistenti vengono conservati. Un aggiornamento che non cambia nulla lascia intatti i pod.

---

## Prima di aggiornare

Prepara l'aggiornamento in modo da poter tornare indietro se qualcosa va storto:

* **Fai un backup** in **Impostazioni → Backup**. La nuova release aggiorna lo schema del database al suo primo avvio.
* **Leggi il [changelog](../changelog)** delle release tra la tua versione e quella nuova.
* **Passi a una nuova major?** Segui prima [Aggiornare alla v7](../upgrade-7.html).
* **Leggi il [changelog](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) del chart** per le modifiche ai valori.
* **Con credenziali generate** (`secrets.generate`), fai il backup del Secret `<release>-secrets`: `ENCRYPTION_SECRET` non si può recuperare.
* **Arrivi dalla 7.2?** L'RTE nel pod del server cambia modalità: vedi [Dalla 7.2 alla 7.3](#from-72-to-73).

---

## Dalla 7.2 alla 7.3

Il chart 7.3.0 porta l'RTE accanto all'app fuori dalla modalità database, deprecata nella 7.3.0 e rimossa nella 8.0.0. L'app lo contatta su
`127.0.0.1` e tiene aperto un WebSocket (`RTE_MODE=inbound`, vedi [Modalità](../rte/modes.html)):

* Il container RTE non riceve più `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` né `RTE_URL`, e prende i file del job dal
  volume condiviso (`RTE_FILES=local`)
* Il config seed del chart dichiara una credenziale RTE con il token e l'indirizzo, e il runner, `rte_mode: inbound`, che accede
  con essa. Con il seed del chart, non c'è nulla da fare
* Con `containers.rte.seedRunner: false`, o con un tuo config seed (`CONFIG_SEED_PATH`), l'RTE non si aggiunge più come runner.
  Dichiaralo tu, nel tuo seed o in **Connessioni → Runner**: una credenziale RTE con `http://127.0.0.1:<port>` e il token,
  e un runner di tipo RTE con `rte_mode: inbound` che la nomina. Le note che Helm stampa dopo l'aggiornamento mostrano come

Dalla 7.3.0 il chart installa anche un Runner da solo, con `runner.enabled` (vedi
[Un Runner su Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Trova la nuova versione del chart

Aggiorna il repository del chart ed elenca le versioni del chart disponibili:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Aggiorna la release

Esegui lo stesso comando `helm upgrade` dell'installazione, con il tuo file dei valori e la nuova versione del chart:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

Con il registry OCI, usa `oci://ghcr.io/ansibleforms/charts/ansibleforms` come chart.

---

## 3. Controlla l'aggiornamento

Aspetta i nuovi pod, poi esegui il test del chart, che controlla sia il server web sia la connessione al database:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

In AnsibleForms, **Aiuto → Informazioni** mostra la versione in esecuzione, e **Impostazioni → Stato** mostra lo stato di salute del
database, dello schema e degli altri sistemi da cui dipende AnsibleForms.

---

## Tornare indietro

Helm conserva la cronologia della release. Per tornare alla revisione precedente:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Se non si avvia sul database aggiornato, ripristina il tuo backup (vedi il [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart).
