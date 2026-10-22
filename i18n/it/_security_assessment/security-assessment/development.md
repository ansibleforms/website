---
layout: default
title: Sviluppo sicuro
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Sviluppo sicuro
{: .no_toc }

Come le modifiche vengono controllate e rilasciate, e cosa è supportato
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Il codice sorgente

AnsibleForms è open source, quindi tutto ciò che c'è in questa pagina si può verificare nel repository stesso:

* Il codice, la sua storia e le sue pipeline di build sono pubblici su [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* La [licenza](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) è GPL-3.0.
* Il [changelog](../changelog.html) elenca ogni modifica di ogni release, correzioni di sicurezza comprese.

---

## Come viene integrata una modifica

Ogni modifica arriva su `main` tramite una pull request, sotto un ruleset che nessuno può aggirare:

| Regola | Cosa significa |
|---|---|
| Pull request obbligatoria | Nulla viene inviato direttamente su `main` |
| Controlli obbligatori | La pull request viene integrata solo quando passano tutti i controlli qui sotto |
| Niente force push, niente eliminazione | La storia di `main` non può essere riscritta né rimossa |
| Storia lineare | Ogni pull request diventa un solo commit, così ogni modifica si può tracciare e annullare singolarmente |

I controlli che una pull request deve superare:

| Controllo | Cosa fa |
|---|---|
| Client, Server | I test unitari dell'interfaccia web e del server |
| CodeQL | L'analisi statica di GitHub del codice JavaScript e TypeScript, per injection, cross-site scripting e altre debolezze |
| Public schema is up to date | Lo schema di database che il codice si aspetta corrisponde a quello che distribuisce |
| Title, Branch | La pull request rispetta le regole di denominazione, così il changelog resta accurato |

Altri due girano su ogni pull request e ne riportano l'esito:

* **Database** testa il server su MySQL e MariaDB, e **Browser** pilota l'interfaccia in un browser.
* **Dependency review** blocca una nuova dipendenza con una vulnerabilità nota di gravità alta o critica.

---

## Analisi del codice e dipendenze

Il codice e ciò da cui dipende vengono controllati di nuovo dopo l'integrazione:

* **CodeQL** analizza anche ogni push su `main` e sui branch di release, e l'intero codice ogni settimana:
  così una nuova regola di CodeQL controlla anche il codice integrato prima di essa.
* **Dependabot** apre una pull request per ogni nuova versione di una dipendenza: i pacchetti npm del server e
  dell'interfaccia, i pacchetti Python dell'ambiente di esecuzione e le GitHub Actions delle pipeline ogni settimana, e
  le immagini base dei container ogni giorno.
* Le immagini base sono fissate per digest (`node:26-trixie-slim@sha256:...`), così una build usa esattamente l'immagine revisionata.
  Dependabot aggiorna il digest quando l'immagine viene ricostruita a monte.

---

## Release e immagini

Una release viene costruita e pubblicata solo da GitHub Actions, mai dal computer di uno sviluppatore:

* Una release viene creata da `main` (o da `release/6.x`), con un changelog costruito dalle sue pull request.
* Le immagini vengono costruite dal [workflow Publish](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  e inviate al GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, con accanto le immagini dell'ambiente
  di esecuzione. Il workflow e i suoi log sono pubblici, così chiunque può vedere cosa è entrato in un'immagine.
* Le immagini dell'applicazione e dell'ambiente di esecuzione girano con l'utente non privilegiato `node` (uid 1000), mai come root.

---

## Versioni supportate

Le correzioni di sicurezza vanno nella release più recente di ogni linea supportata:

| Versione | Riceve correzioni di sicurezza |
|---|---|
| 7.x | Sì |
| 6.5.x | Sì |
| Precedenti alla 6.5 | No: la correzione è aggiornare |

La [guida all'aggiornamento](../upgrading/) spiega come passare a una release più recente, e [Aggiornare alla v7](../upgrade-7.html) il passaggio dalla 6.5.
