---
layout: default
title: Immagini
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# Immagini RTE
{: .no_toc }

Le tre immagini RTE pubblicate, e un RTE tuo con le collection e le librerie usate dai tuoi playbook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le immagini RTE

L'RTE è pubblicato in tre livelli, ognuno costruito su quello precedente, con gli stessi tag dell'app (vedi [Tag delle immagini](../installation/#image-tags)):

| Immagine | Cosa contiene | Quando usarla |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js e il server di AnsibleForms, git, ssh e sshpass. Niente python e niente ansible, quindi da sola non esegue nessun playbook | Per costruire un RTE con le tue versioni di python e ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, più python 3.14, ansible-core e alcune librerie comuni (`jmespath`, `netaddr`, `requests`, `paramiko`). Nessuna collection | Per costruire un RTE più piccolo con solo le collection e le librerie usate dai tuoi playbook |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Il core, più il pacchetto `ansible` sullo stesso ansible-core, e ciò che aveva l'immagine di AnsibleForms 6.5: le collection NetApp, AWS e community, `pandas`, `pyvmomi`, `boto3`, il client mariadb, ytt e alcuni strumenti di sistema | **Il predefinito.** Eseguila così com'è: i playbook della 6.5 trovano ciò che usavano |

Come l'immagine dell'app, ogni livello gira come utente `node` (uid 1000), e anche i playbook girano come quell'utente.

---

## Costruire il tuo RTE

Parti da `ansibleforms-rte-core` e aggiungi le collection e le librerie python usate dai tuoi playbook. Questo esempio NetApp è uno dei
Dockerfile in [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

L'ambiente python e la cartella delle collection appartengono a `node`, quindi queste installazioni non richiedono root. Un livello che installa pacchetti
di sistema passa a `USER root` per farlo e torna a `USER node` alla fine. Per portare il tuo python e il tuo ansible, parti da
`ansibleforms-rte-base` (`Dockerfile.own-ansible` nella stessa cartella).

Tieni l'immagine allineata alla versione dell'app: `:7` segue il `:7` dell'app. Collection e ruoli si possono anche montare invece di integrarli nell'immagine, in
`/etc/ansible/collections` e `/etc/ansible/roles`. Così non serve ricostruire a ogni modifica, ma ciò che gira dipende da quel volume;
le librerie python vanno sempre nell'immagine. Integrare tutto è riproducibile e parte in fretta, ed è quindi la strada per la produzione.

---

## Il contratto

Ciò che l'app e un RTE devono condividere è il loro contratto, un numero che entrambi riportano. Un RTE di una versione più vecchia continua a funzionare con un'app
più recente finché entrambi parlano lo stesso contratto; quando una versione lo cambia, le sue note di rilascio dicono che gli RTE vanno aggiornati. Ogni modalità
ha il suo:

| Modalità | Contratto | In caso di discrepanza |
|---|---|---|
| In uscita, In entrata | 3, novità della 7.3.0 | L'app chiude il socket dell'RTE con il codice `4409` e registra *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE in uscita registra *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Un job inviato con un altro contratto viene rifiutato |
| Database (deprecata) | 2, dalla 7.0.0 | L'RTE rifiuta i job dell'app |

**Testa connessione** sul runner dice quale contratto parla l'RTE e quale richiede l'app (vedi
[Testa connessione](../runners/runner-page.html#test-connection)), e la riga **Runner** della pagina **Stato** esegue lo stesso controllo.
