---
layout: default
title: HTTPS
parent: Sicurezza
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

Servi HTTPS dall'applicazione stessa, e sostituisci il certificato di esempio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dove termina il TLS

Il TLS può terminare in uno di tre posti, e solo il primo riguarda le impostazioni di questa pagina:

* **in AnsibleForms**, con `HTTPS=1` : HTTPS su [`PORT`](../customization/server.html#env_PORT) con i file qui sotto, come fa docker-compose sulla 443.
* **in un reverse proxy**, con `HTTPS=0` dietro di esso : vedi [Reverse proxy](../production/reverse-proxy.html).
* **in un ingress Kubernetes** : vedi la scheda Ingress di [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) e il README del chart.

Puoi combinare il primo con gli altri due per cifrare anche il tratto tra il proxy e l'applicazione.

---

## Le impostazioni

Tre variabili controllano HTTPS nell'applicazione:

| Variabile | Predefinito | Significato |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` serve HTTPS, `0` HTTP semplice |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | La chiave privata, PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | Il certificato del server, PEM |

Nell'immagine del container la cartella persistente è `/app/dist/persistent`, quindi i file predefiniti sono
`/app/dist/persistent/certificates/key.pem` e `cert.pem`. Con il progetto docker-compose questo corrisponde a `data/certificates/`
sull'host.

---

## Il certificato di esempio

Quando `HTTPS=1` e uno dei due file manca all'avvio, AnsibleForms registra `httpsKey or httpsCert not found, copying from
templates` e copia una chiave e un certificato di esempio dall'immagine ai percorsi configurati. Se quella copia non riesce,
l'applicazione si ferma.

Quel certificato è autofirmato per `CN=ansibleforms`, ed è **lo stesso su ogni installazione**: la sua chiave privata
è inclusa nell'immagine pubblica. Va bene per una prima occhiata, ma i browser lo segnalano e chiunque può decifrare il traffico
protetto da esso. Sostituiscilo prima che l'istanza contenga credenziali reali.

---

## Sostituire il certificato

Usa un certificato emesso per il nome host che digitano gli utenti, dalla tua CA o da un client ACME, in formato PEM.
Il file del certificato può contenere l'intera catena: prima il certificato del server, poi gli intermedi.

1. Copia i file nella cartella persistente, o in qualsiasi posto in cui l'applicazione possa leggerli:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. Se si trovano altrove, imposta `HTTPS_KEY` e `HTTPS_CERT` con i loro percorsi **all'interno del container**.

3. Riavvia l'applicazione, che legge entrambi i file all'avvio.

Per un rapido certificato autofirmato tuo (un'istanza di test, o il tratto dietro un proxy), `openssl` ne crea uno:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Rinnovare senza riavvio

Cambiare `HTTPS_KEY` o `HTTPS_CERT` nelle pagine delle impostazioni ricarica la chiave e il certificato nel server in esecuzione.
Le nuove connessioni ricevono il nuovo certificato, quelle aperte mantengono il vecchio. Se i nuovi file non si possono leggere o non formano una
coppia valida, il certificato attuale resta al suo posto e viene registrato un avviso.

Questo funziona solo quando le pagine delle impostazioni possono scrivere l'ambiente ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
è `1`) e la variabile non è impostata nell'ambiente reale. Quando un rinnovo sostituisce i file negli stessi
percorsi, riavvia l'applicazione.
