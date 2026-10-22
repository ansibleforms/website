---
layout: default
title: Kubernetes
parent: Installazione
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Installa AnsibleForms e il suo database MySQL con il chart Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Il chart Helm distribuisce AnsibleForms con MySQL e l'RTE che esegue i playbook (vedi il [riferimento dei valori](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
Anche l'[installer](installer.html) installa il chart, a partire da poche domande, e aggiorna una release che non ha installato lui. Lo stesso
chart installa anche un Runner da solo, per un AnsibleForms che gira altrove (vedi [Un Runner su Kubernetes](#a-runner-on-kubernetes)).

---

## Prerequisiti

Prima di iniziare ti servono:

* **Cluster Kubernetes** : con `kubectl` configurato per raggiungerlo
* **Helm 3** : per installare e aggiornare il chart
* **Storage** : una StorageClass per il provisioning dinamico, o dei PersistentVolume creati in anticipo
* **Ingress controller** : solo se vuoi esporre AnsibleForms tramite un ingress

---

## 1. Ottieni i valori del chart

Scarica i valori predefiniti del chart in un tuo file, dal repository del chart o dal registry OCI:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Repository del chart</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">Registry OCI</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

Nessun repository da aggiungere: il chart viene scaricato dal GitHub Container Registry.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Configura lo storage

Sia AnsibleForms sia MySQL salvano i loro dati su un volume persistente. Imposta la StorageClass e la dimensione di ciascuno:

```yaml
storages:
  server:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
  mysql:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
```

Un `className` vuoto usa la StorageClass predefinita del cluster. La modalità di accesso predefinita è `ReadWriteMany`, che molte classi
di storage non offrono; `ReadWriteOnce` va bene con una sola replica. Per i PersistentVolume creati in anticipo, vedi il
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart.

---

## 3. Imposta le credenziali

AnsibleForms ha bisogno di un account admin, di una password del database e di un `ENCRYPTION_SECRET`, la chiave che cifra le credenziali
salvate in AnsibleForms. Per cambiare quella chiave in seguito, imposta [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
su quella vecchia per un avvio: ogni segreto salvato viene allora cifrato di nuovo con la nuova chiave. Forniscile in uno di tre modi:

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">Nel file dei valori</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Generate dal chart</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Secret esistente</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Impostale in `my_values.yaml`. Il chart le salva in un Secret chiamato `<release>-secrets`:

```yaml
applications:
  server:
    env:
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: a-strong-password
      ENCRYPTION_SECRET: a-random-string-of-32-characters
  mysql:
    password: a-strong-database-password
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="generate" markdown="1" hidden>

Lascia che il chart generi quello che non fornisci, alla prima installazione. In seguito mantiene gli stessi valori a ogni
aggiornamento:

```bash
--set secrets.generate=true
```

Questo non funziona con Argo CD o Flux, che fanno il render del chart senza accesso al cluster. Il Secret generato
sopravvive a `helm uninstall`; fanne un backup, perché `ENCRYPTION_SECRET` non si può recuperare.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Fai puntare il chart a un Secret che gestisci tu, per esempio con External Secrets, Sealed Secrets o SOPS. Il chart
allora non ne crea nessuno:

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

Il Secret deve contenere `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` e `ADMIN_PASSWORD`.

</div>
</div>

---

## 4. Scegli l'immagine RTE

AnsibleForms 7 non esegue da sé nessun playbook: lo fa l'RTE (ambiente di runtime). Il chart lo esegue come secondo container nel
pod del server, sullo stesso volume, e lo registra come runner predefinito `rte`, così i moduli playbook funzionano senza alcuna configurazione. Dalla 7.3.0
l'app lo contatta su `127.0.0.1` e tiene aperto un WebSocket (`RTE_MODE=inbound`, vedi [Modalità](../rte/modes.html)): l'RTE non riceve
impostazioni del database né chiave di cifratura. Il config seed del chart dichiara una credenziale RTE con il token e quell'indirizzo, e
il runner, in modalità inbound, che accede con essa.

L'immagine predefinita, `ghcr.io/ansibleforms/ansibleforms-rte-full`, contiene ansible con le sue collection e le librerie Python che aveva l'immagine 6.5.
Per averne di più, o di meno, crea la tua su uno dei tre livelli RTE (`ansibleforms-rte-base`, `-rte-core` o `-rte-full`, vedi
[Le immagini RTE](../rte/images.html)) e fai puntare il chart a essa:

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

Il token tra l'app e l'RTE, e la chiave che firma le sessioni, vengono generati alla prima installazione nel
Secret `<release>-keys` e mantenuti a ogni aggiornamento. Con un tuo config seed, aggiungici quella credenziale e quel runner: le note che Helm stampa dopo l'installazione mostrano come
(vedi il [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart).

---

## 5. Installa il chart

Installa il chart nel suo namespace con i tuoi valori:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

Con il registry OCI, usa `oci://ghcr.io/ansibleforms/charts/ansibleforms` come chart. In tutto ciò che gira senza interazione,
fissa la versione del chart con `--version`, così una nuova release non viene mai installata da sola.

---

## 6. Controlla l'installazione

Il chart include un test che controlla sia il server web sia la connessione al database:

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

Il test termina con `OK` quando AnsibleForms risponde e il suo database accetta connessioni.

---

## 7. Apri AnsibleForms

Come raggiungi AnsibleForms dipende da come è esposto il server:

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Con il servizio `ClusterIP` predefinito e senza ingress, nulla è esposto fuori dal cluster. Inoltra una porta locale per
dare un'occhiata:

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Poi apri `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Imposta `services.server.type: LoadBalancer` (eventualmente con un indirizzo fisso in `services.server.loadbalancer.ip`),
poi aspetta che il servizio ottenga il suo indirizzo:

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Abilita l'ingress e imposta il nome host che porta al tuo ingress controller:

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

Il [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart tratta il TLS dietro un ingress, compresa l'impostazione del backend necessaria per l'HTTPS sul
server.

</div>
</div>

---

## 8. Accedi

Accedi come utente admin, `admin` per impostazione predefinita. Per leggere la password dal Secret:

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Con `secrets.existingSecret`, leggila invece dal tuo Secret.

---

## Un Runner su Kubernetes

Con `runner.enabled`, il chart installa solo un RTE: un Runner per un AnsibleForms installato altrove, in un altro namespace, in un altro
cluster o su una VM. Contatta l'app e tiene aperto un WebSocket (`RTE_MODE=outbound`, vedi [Modalità](../rte/modes.html)), quindi non ha bisogno
di database, chiave di cifratura né porta in ingresso. Non crea app, MySQL, Service né Ingress:

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Valore | Cosa fa |
|---|---|
| `runner.enabled` | Installa solo il Runner: niente app, niente MySQL, niente Service, niente Ingress |
| `runner.appUrl` | L'indirizzo dell'app come lo aprono le persone, con il suo `BASE_URL` se presente. Obbligatorio |
| `runner.name` | Il nome di runner con cui si unisce (`RTE_NAME`). Vuoto: il nome della release |
| `runner.joinToken` | Un [token di adesione](../runners/registration.html#join-tokens) creato nell'app, letto al primo avvio per approvare subito il Runner |
| `runner.appTlsVerify` | `false` accetta il certificato autofirmato dell'app (`APP_TLS_VERIFY=0`), solo all'interno di una rete fidata |

Senza un token di adesione, il Runner chiede di unirsi e aspetta che un admin lo approvi in **Connessioni > Runner**. Una volta approvato,
accede con il suo `RTE_TOKEN`, conservato nel Secret `<release>-keys`: conserva quel Secret insieme alla release. Anche
l'[installer](installer.html#kubernetes) installa questa modalità runner, quando scegli il ruolo Runner e Kubernetes.

---

## Prossimi passi

Il [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart tratta il resto della configurazione:

* **Il tuo database** : imposta `mysql.enabled: false` e fai puntare AnsibleForms a un server MySQL esistente
* **Moduli da ConfigMap** : fornisci `config.yaml` e i file dei moduli tramite ConfigMap
* **HTTPS dietro un ingress**, risorse, posizionamento sui nodi e registry privati
* **L'RTE** : il suo token, una tua immagine RTE, o nessun RTE

Per passare a una release più recente, vedi [Aggiornamento su Kubernetes](../upgrading/kubernetes.html).
