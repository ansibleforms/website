---
layout: default
title: Variables de seguretat
parent: Variables d'entorn
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Variables de seguretat
{: .no_toc }

Tokens, xifratge, hosts REST de sortida, emmascarament i els antics ajustos VAULT_*
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables per definir els teus propis secrets de token i de xifratge, i per limitar què poden cridar i mostrar els formularis.

---

## Exemple

Els teus propis secrets, crides REST limitades a una API i a una xarxa interna, i una clau emmascarada més. Al `.env` del projecte compose:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Defineix `ENCRYPTION_SECRET` abans de desar la primera credencial. Des de la 7.3.0, definir-la o canviar-la torna a xifrar tots els secrets
desats a la següent arrencada, amb `ENCRYPTION_SECRET_PREVIOUS` indicant la clau antiga quan era teva, vegeu
[Canviar el secret de xifratge](../security/secrets.html#changing-the-encryption-secret).

---

## Crides REST i jq

Des de la 7.3.0 les funcions auxiliars REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) comproven el
certificat de l'endpoint que criden, com qualsevol altra connexió; fins a la 7.2.0 no ho feien mai. S'hi apliquen tres ajustos:

| Variable | Predeterminat | Efecte |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` omet la comprovació del certificat: només per a endpoints amb un certificat autosignat |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Quant espera una crida REST una resposta abans de fallar per temps d'espera esgotat |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Quant pot funcionar un filtre jq abans que s'aturi; la sortida de jq també està limitada a 64 MB |

Totes tres tenen efecte en desar-les, sense reiniciar. Per a un endpoint el certificat del qual està signat per una CA privada, mantén la comprovació activada
i dona aquesta CA a Node.js: defineix `NODE_EXTRA_CA_CERTS` amb un fitxer PEM que la contingui a l'entorn de l'aplicació i reinicia l'aplicació.

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="security" %}
