---
layout: default
title: Immagini
parent: RTE
nav_order: 1
translated_from: 42d2358e58b374791786a5f99e571e566eca4d4a
---

# Immagini RTE
{: .no_toc }

Le tre immagini RTE pubblicate, e un RTE tuo con le collection e le librerie usate dai tuoi playbook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le immagini RTE

L'RTE è pubblicato in tre livelli, ognuno costruito su quello precedente, con gli stessi tag del controller (vedi [Tag delle immagini](../installation/#image-tags)):

| Immagine | Cosa contiene | Quando usarla |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js e il server di AnsibleForms, git, ssh e sshpass. Niente python e niente ansible, quindi da sola non esegue nessun playbook | Per costruire un RTE con le tue versioni di python e ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, più python 3.14, ansible-core e alcune librerie comuni (`jmespath`, `netaddr`, `requests`, `paramiko`). Nessuna collection | Per costruire un RTE più piccolo con solo le collection e le librerie usate dai tuoi playbook |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Il core, più il pacchetto `ansible` sullo stesso ansible-core, e ciò che aveva l'immagine di AnsibleForms 6.5: le collection NetApp, AWS e community, `pandas`, `pyvmomi`, `boto3`, il client mariadb, ytt e alcuni strumenti di sistema | **Il predefinito.** Eseguila così com'è: i playbook della 6.5 trovano ciò che usavano |

Come l'immagine del controller, ogni livello gira come utente `node` (uid 1000), e anche i playbook girano come quell'utente.

Dalla 7.6.0 ogni livello è pubblicato per `linux/amd64` e `linux/arm64` con lo stesso tag. Un RTE che costruisci tu ha
l'architettura della macchina che lo costruisce: per gli host arm64, costruiscilo su uno di essi, o con `docker buildx build --platform linux/arm64`.

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

Tieni l'immagine allineata alla versione del controller: `:7` segue il `:7` del controller. Collection e ruoli si possono anche montare invece di integrarli nell'immagine, in
`/etc/ansible/collections` e `/etc/ansible/roles`. Così non serve ricostruire a ogni modifica, ma ciò che gira dipende da quel volume;
le librerie python vanno sempre nell'immagine. Integrare tutto è riproducibile e parte in fretta, ed è quindi la strada per la produzione.

---

## Costruirlo nel Designer

Da 7.9.0 descrivi un ambiente di esecuzione nel Designer; un [builder](builder.html) ne costruisce l'immagine, la pubblica e la firma.

1. Dai a un repository l'uso **Ambienti di esecuzione** (Impostazioni > Repository); contiene le definizioni.
2. Nel Designer, apri **Ambienti di esecuzione** e fai clic su **Nuovo**: compilalo nella scheda **Visuale**, o scrivilo nella scheda **YAML**.
3. **Salva**, poi **Push** per farne il commit nel repository, e **Build**: la build è un job nella pagina **Job**, con il suo log in diretta.

Ogni ambiente di esecuzione è una cartella propria nel repository, con il suo nome, che contiene solo la sua definizione:

```text
rte-netapp/
  rte.yaml
```

Il Dockerfile, `ansible.cfg` e i file dei requisiti vengono riscritti a ogni build, a partire dalla definizione e dalla release dell'app,
quindi non sono mai superati nel repository. La scheda **File** li mostra come li riceve il builder.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

Ogni chiave tranne il nome si può omettere; la barra degli strumenti della scheda **YAML** imposta ogni parte in una finestra di dialogo.

| Chiave | Cos'è |
|---|---|
| `name` | Il nome dell'ambiente di esecuzione, della sua cartella e della sua immagine: lettere minuscole, cifre, punti, trattini e trattini bassi |
| `arch` | `all`, un'immagine per amd64 e arm64 come quelle pubblicate, o solo `amd64` o `arm64`; `all` se omessa. Un'architettura diversa da quella dell'host del builder richiede [QEMU su quell'host](builder.html#amd64-and-arm64) |
| `python` | Il python dell'immagine, da 3.11 a 3.15; 3.15 se omessa |
| `ansible_core` | Una release di ansible-core (`2.22`) o una versione (`2.22.0`) che giri su quel python; la più recente che lo fa se omessa |
| `ansible_collections` | Le collection, ognuna con il suo `name` (namespace.name) e una `version` facoltativa; l'ultima se omessa. Ciò che ogni collection richiede, il suo `requirements.txt` e `bindep.txt` (o il suo `meta/execution-environment.yml`), viene installato con essa, come fa ansible-builder |
| `python_packages` | Pacchetti python, come righe di un `requirements.txt` |
| `os_packages` | Pacchetti di Debian 13 (trixie) |
| `registry` | `credential`: una credenziale **Registro di container**, con l'indirizzo del registro e il suo login; `path`: il percorso dell'immagine al suo interno, il suo nome se omesso; `tag`: `app`, la release dell'app (`7.9.0`), così una nuova build segue ogni aggiornamento, o un tag tuo |
| `sbom` | `true` allega all'immagine una distinta base del software (SBOM) |
| `sign` | `credential`: una credenziale **Chiave di firma**, con cui il builder firma l'immagine con cosign 3; verificala con `cosign verify --key <chiave pubblica>` di cosign 3 (cosign 2 non legge le sue firme) |

Ogni ambiente di esecuzione è costruito da `ansibleforms-rte-base` della release dell'app, quindi uno con il tag `app` la cui immagine è stata
costruita per una release precedente è indicato come tale nella pagina **Ambienti di esecuzione**, con **Ricreali**.

---

## Il contratto

Ciò che il controller e un RTE devono condividere è il loro contratto, un numero che entrambi riportano. Un RTE di una versione più vecchia continua a funzionare con un controller
più recente finché entrambi parlano lo stesso contratto; quando una versione lo cambia, le sue note di rilascio dicono che gli RTE vanno aggiornati. Ogni modalità
ha il suo:

| Modalità | Contratto | In caso di discrepanza |
|---|---|---|
| In uscita, In entrata | 3, novità della 7.3.0 | Il controller chiude il socket dell'RTE con il codice `4409` e registra *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE in uscita registra *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Un job inviato con un altro contratto viene rifiutato |
| Database (deprecata) | 2, dalla 7.0.0 | L'RTE rifiuta i job del controller |

**Testa connessione** sul runner dice quale contratto parla l'RTE e quale richiede il controller (vedi
[Testa connessione](../runners/runner-page.html#test-connection)), e la riga **Runner** della pagina **Stato** esegue lo stesso controllo.
