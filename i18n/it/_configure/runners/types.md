---
layout: default
title: Tipi di runner
parent: Runner
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# Tipi di runner
{: .no_toc }

I prodotti che un runner può essere, il loro indirizzo e il loro accesso
{: .fs-6 .fw-300 }

Il passaggio **Tipo** offre una scelta per prodotto, ognuna con un suggerimento; quello dell'RTE ne scrive il nome per esteso, *Ambiente di esecuzione*. AAP e
Ascender sono salvati come runner di tipo `awx` con una variante (`aap` o `ascender`), che è anche ciò che usa il config seed:

| Tipo | Esempio di URI | Progetto | Autenticazione |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | Il `RTE_TOKEN` dell'RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Un token API, o un utente e una password |
| Ascender | `https://ascender.example.com/api/v2` | | Un token API, o un utente e una password |
| AWX | `https://awx.example.com/api/v2` | | Un token API, o un utente e una password |
| Jenkins | `https://jenkins.example.com` | La cartella in cui si trovano i job (facoltativa) | Un utente e il token API di quell'utente |
| Rundeck | `https://rundeck.example.com` | Il nome del progetto | Il token API di un utente |
| Semaphore | `https://semaphore.example.com` | L'id del progetto, il numero in `/project/<id>` | Il token API di un utente |

Un indirizzo AWX, AAP o Ascender porta il suo percorso API: `/api/v2`, o `/api/controller/v2` per AAP 2.5 e successive.
Un RTE è l'immagine di AnsibleForms avviata con `AF_ROLE=rte`; come eseguirne uno è descritto in
[Ambienti di esecuzione](../rte/).
