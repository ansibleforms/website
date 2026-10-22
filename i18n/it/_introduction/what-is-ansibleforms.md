---
layout: default
title: Cos'è AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# Cos'è AnsibleForms
{: .no_toc }

Moduli self-service davanti ad Ansible e AWX, e quando ti servono
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cosa fa

AnsibleForms mette un modulo web davanti a un playbook, a un workflow, o a un template o un job su AWX, AAP, Ascender, Semaphore, Rundeck
o Jenkins, così le persone possono eseguire automazioni senza la riga di comando.

Un modulo raccoglie l'input, lo controlla, lo trasforma in extravars e avvia il job. I dati di un modulo possono provenire da database,
API REST, file e altri campi, e ogni avvio viene registrato nella cronologia dei job con il suo output.

---

## Usi tipici

I team usano AnsibleForms per affidare l'automazione di routine alle persone che la richiedono:

* **Richieste self-service** : una macchina virtuale, un volume di storage, una condivisione o un account utente, compilati da chi li richiede
* **Operazioni protette** : azioni con punti di approvazione, così una seconda persona dà il via libera prima che il job parta
* **Scelte guidate dai dati** : menu a tendina riempiti da una CMDB, un database o un'API REST, a cascata da un campo all'altro
* **Job ricorrenti** : moduli eseguiti più tardi o secondo una pianificazione cron, ogni volta con lo stesso input validato
* **Automazione per strumenti e agenti** : l'API REST, il server MCP e l'assistente chat avviano gli stessi moduli

---

## AnsibleForms o i survey di AWX?

AWX, AAP e Ascender hanno i loro survey. Quale sia adatto dipende da ciò di cui hanno bisogno le persone che avviano i job.

Un **survey** basta quando:

* le domande sono fisse: testo, numeri, password e scelte da un elenco statico
* gli utenti lavorano già in AWX, AAP o Ascender, e i suoi permessi vanno bene per loro
* non vuoi eseguire e mantenere un'altra applicazione e un altro database

**AnsibleForms** aiuta quando:

* le scelte vengono da altrove: un database, un'API REST, un file, o un altro campo (menu a tendina a cascata)
* l'input ha bisogno di validazione, struttura (liste, oggetti annidati) o valori calcolati prima di arrivare al playbook
* i job hanno bisogno di punti di approvazione, pianificazione, o di un workflow che concateni playbook, template e approvazioni da un solo modulo
* gli utenti non dovrebbero vedere affatto AWX, o esegui anche playbook senza AWX

AnsibleForms avvia template di AWX, AAP e Ascender, quindi i due lavorano insieme: i moduli raccolgono e modellano l'input, e
AWX continua a eseguire i job.

---

## Dove andare dopo

Il resto di questa sezione spiega le parti in gioco prima dell'installazione:

| Pagina | Cosa tratta |
|---|---|
| [Come funziona](how-it-works.html) | L'architettura, i passi di un avvio, e dove vengono conservati i dati |
| [Tour dell'interfaccia](gui/) | Screenshot di ogni schermata, dall'accesso alle pagine di amministrazione |
| [Concetti](concepts.html) | I termini usati in questa documentazione |
| [Prerequisiti](prerequisites.html) | Cosa ti serve prima di installare |
