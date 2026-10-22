---
layout: default
title: HTTPS
parent: Beveiliging
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

HTTPS vanuit de applicatie zelf bedienen, en het voorbeeldcertificaat vervangen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Waar TLS eindigt

TLS kan op een van drie plaatsen eindigen, en alleen bij de eerste spelen de instellingen op deze pagina een rol:

* **in AnsibleForms**, met `HTTPS=1` : HTTPS op [`PORT`](../customization/server.html#env_PORT) met de bestanden hieronder, zoals docker-compose op 443 doet.
* **in een reverse proxy**, met `HTTPS=0` erachter : zie [Reverse proxy](../production/reverse-proxy.html).
* **in een Kubernetes-ingress** : zie het tabblad Ingress van [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) en de README van de chart.

Je kunt de eerste combineren met de andere twee om ook het traject tussen de proxy en de applicatie te versleutelen.

---

## De instellingen

Drie variabelen sturen HTTPS in de applicatie:

| Variabele | Standaard | Betekenis |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` bedient HTTPS, `0` gewone HTTP |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | De privésleutel, PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | Het servercertificaat, PEM |

In de containerimage is de persistente map `/app/dist/persistent`, dus de standaardbestanden zijn
`/app/dist/persistent/certificates/key.pem` en `cert.pem`. Met het docker-compose-project is dat `data/certificates/`
op de host.

---

## Het voorbeeldcertificaat

Als `HTTPS=1` en een van beide bestanden bij het opstarten ontbreekt, logt AnsibleForms `httpsKey or httpsCert not found, copying from
templates` en kopieert een voorbeeldsleutel en -certificaat uit de image naar de geconfigureerde paden. Als die kopie mislukt, stopt de
applicatie.

Dat certificaat is zelfondertekend voor `CN=ansibleforms`, en het is **op elke installatie hetzelfde**: de privésleutel ervan
zit in de openbare image. Het is prima om eens rond te kijken, maar browsers waarschuwen ervoor en iedereen kan verkeer ontsleutelen
dat ermee is beschermd. Vervang het voordat de instantie echte referenties bevat.

---

## Het certificaat vervangen

Gebruik een certificaat dat is uitgegeven voor de hostnaam die gebruikers typen, door je CA of een ACME-client, in PEM-formaat.
Het certificaatbestand mag de volledige keten bevatten: eerst het servercertificaat, daarna de tussencertificaten.

1. Kopieer de bestanden naar de persistente map, of naar een andere plek waar de applicatie ze kan lezen:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. Als ze elders staan, stel `HTTPS_KEY` en `HTTPS_CERT` dan in op hun paden **binnen de container**.

3. Herstart de applicatie, die beide bestanden bij het opstarten leest.

Voor een snel eigen zelfondertekend certificaat (een testinstantie, of het traject achter een proxy) maakt `openssl` er een aan:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Vernieuwen zonder herstart

Als je `HTTPS_KEY` of `HTTPS_CERT` op de instellingenpagina's wijzigt, worden de sleutel en het certificaat in de draaiende server opnieuw geladen.
Nieuwe verbindingen krijgen het nieuwe certificaat, open verbindingen houden het oude. Als de nieuwe bestanden niet kunnen worden gelezen of geen geldig
paar vormen, blijft het huidige certificaat staan en wordt een waarschuwing gelogd.

Dat werkt alleen als de instellingenpagina's de omgeving mogen schrijven ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
is `1`) en de variabele niet in de echte omgeving is ingesteld. Als een vernieuwing de bestanden onder dezelfde
paden vervangt, herstart dan de applicatie.
