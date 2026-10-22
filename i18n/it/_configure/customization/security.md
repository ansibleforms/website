---
layout: default
title: Variabili di sicurezza
parent: Variabili d'ambiente
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Variabili di sicurezza
{: .no_toc }

Token, cifratura, host REST in uscita, mascheramento e le vecchie impostazioni VAULT_*
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale per impostare i tuoi segreti per i token e la cifratura, e per limitare cosa possono chiamare e mostrare i moduli.

---

## Esempio

I tuoi segreti, chiamate REST limitate a una sola API e a una rete interna, e una chiave mascherata in più. Nel `.env` del progetto compose:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Imposta `ENCRYPTION_SECRET` prima di salvare la prima credenziale. Dalla 7.3.0, impostarla o cambiarla ricifra ogni segreto
salvato al successivo avvio, con `ENCRYPTION_SECRET_PREVIOUS` che indica la vecchia chiave quando era una tua, vedi
[Cambiare il segreto di cifratura](../security/secrets.html#changing-the-encryption-secret).

---

## Chiamate REST e jq

Dalla 7.3.0 le funzioni helper REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) verificano il
certificato dell'endpoint che chiamano, come ogni altra connessione; fino alla 7.2.0 non lo facevano mai. Si applicano loro tre impostazioni:

| Variabile | Predefinito | Effetto |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` salta la verifica del certificato: solo per endpoint con un certificato autofirmato |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Quanto attende una risposta una chiamata REST prima di fallire per timeout |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Quanto può girare un filtro jq prima di essere fermato; l'output di jq è inoltre limitato a 64 MB |

Tutte e tre hanno effetto al salvataggio, senza riavvio. Per un endpoint il cui certificato è firmato da una CA privata, lascia attiva la verifica
e fornisci invece quella CA a Node.js: imposta `NODE_EXTRA_CA_CERTS` su un file PEM che la contiene nell'ambiente dell'app, poi riavvia l'app.

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="security" %}
