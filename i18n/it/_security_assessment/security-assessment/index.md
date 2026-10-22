---
layout: default
title: Panoramica
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Valutazione della sicurezza
{: .no_toc }

Per le revisioni di sicurezza: misure, sviluppo e advisory
{: .fs-6 .fw-300 }

---

## In breve

AnsibleForms esegue playbook e ne custodisce le credenziali, quindi fa parte della tua catena di fiducia:

* È **self-hosted**: gira sulla tua infrastruttura, conserva i suoi dati nel tuo database, e non invia nulla a chi lo sviluppa.
* È **open source** (GPL-3.0): il codice, le sue pipeline e ogni advisory sono pubblici.
* Ogni segreto salvato è **cifrato**, ogni modifica **registrata nell'audit**, e i **ruoli** vengono controllati a ogni richiesta.
* Le vulnerabilità vengono **segnalate in privato**, corrette in ogni release supportata, e **pubblicate**.

---

## In questa sezione

Le pagine rispondono alle domande di una revisione di sicurezza, dalla progettazione all'elenco delle CVE:

| Pagina | Cosa tratta |
|---|---|
| [Misure di sicurezza](measures.html) | Accesso, permessi, segreti salvati, la traccia di audit, il browser, il server, le connessioni e i container |
| [Sviluppo sicuro](development.html) | Come una modifica viene revisionata e testata, l'analisi del codice e delle dipendenze, come vengono costruite le immagini, le versioni supportate |
| [Segnalare una vulnerabilità](reporting.html) | Come segnalare un problema in privato, e cosa succede dopo |
| [Advisory di sicurezza](advisories.html) | Ogni vulnerabilità pubblicata, con la sua CVE, la gravità e la versione corretta |
| [FAQ sulla valutazione](faq.html) | Risposte brevi alle domande più frequenti dei questionari di sicurezza |

Per mettere in sicurezza un'istanza invece di valutarla, vedi [Sicurezza](../security/) nella guida per l'amministratore.
