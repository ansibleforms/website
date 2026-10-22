---
layout: default
title: HTTPS
parent: Seguretat
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

Serveix HTTPS des de la mateixa aplicació, i substitueix el certificat d'exemple
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## On acaba el TLS

El TLS pot acabar en un de tres llocs, i només el primer té a veure amb els ajustos d'aquesta pàgina:

* **a AnsibleForms**, amb `HTTPS=1` : HTTPS al [`PORT`](../customization/server.html#env_PORT) amb els fitxers de més avall, com fa docker-compose al 443.
* **en un proxy invers**, amb `HTTPS=0` al darrere : vegeu [Proxy invers](../production/reverse-proxy.html).
* **en un ingress de Kubernetes** : vegeu la pestanya Ingress de [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) i el README del chart.

Pots combinar el primer amb els altres dos per xifrar també el tram entre el proxy i l'aplicació.

---

## Els ajustos

Tres variables controlen l'HTTPS a l'aplicació:

| Variable | Predeterminat | Significat |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` serveix HTTPS, `0` HTTP sense xifrar |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | La clau privada, en PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | El certificat del servidor, en PEM |

A la imatge del contenidor la carpeta persistent és `/app/dist/persistent`, de manera que els fitxers predeterminats són
`/app/dist/persistent/certificates/key.pem` i `cert.pem`. Amb el projecte docker-compose és `data/certificates/`
a l'amfitrió.

---

## El certificat d'exemple

Quan `HTTPS=1` i falta algun dels dos fitxers en arrencar, AnsibleForms registra `httpsKey or httpsCert not found, copying from
templates` i copia una clau i un certificat d'exemple de la imatge als camins configurats. Si aquesta còpia falla, l'aplicació
s'atura.

Aquest certificat és autosignat per a `CN=ansibleforms`, i és **el mateix a totes les instal·lacions**: la seva clau privada
ve dins de la imatge pública. Serveix per a una primera ullada, però els navegadors n'avisen i qualsevol pot desxifrar el trànsit
que protegeix. Substitueix-lo abans que la instància contingui credencials reals.

---

## Substituir el certificat

Fes servir un certificat emès per al nom de host que escriuen els usuaris, per la teva CA o per un client ACME, en format PEM.
El fitxer del certificat pot contenir tota la cadena: primer el certificat del servidor, i després els intermedis.

1. Copia els fitxers a la carpeta persistent, o a qualsevol lloc on l'aplicació els pugui llegir:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. Si són en un altre lloc, posa a `HTTPS_KEY` i `HTTPS_CERT` els seus camins **dins del contenidor**.

3. Reinicia l'aplicació, que llegeix tots dos fitxers en arrencar.

Per a un certificat autosignat propi ràpid (una instància de prova, o el tram darrere d'un proxy), `openssl` en crea un:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Renovar sense reiniciar

Canviar `HTTPS_KEY` o `HTTPS_CERT` a les pàgines de configuració torna a carregar la clau i el certificat al servidor en execució.
Les connexions noves reben el certificat nou, i les obertes conserven l'antic. Si els fitxers nous no es poden llegir o no formen un parell
vàlid, el certificat actual es manté i es registra un avís.

Això només funciona quan les pàgines de configuració poden escriure l'entorn ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
és `1`) i la variable no està definida a l'entorn real. Quan una renovació substitueix els fitxers als mateixos
camins, reinicia l'aplicació.

