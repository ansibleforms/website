---
layout: default
title: CyberArk
parent: Magatzems de secrets
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Llegeix credencials del CyberArk Central Credential Provider (CCP)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Experimental.** Encara no s'ha provat amb una instal·lació real de CyberArk; si us plau, informa del que trobis.

El CCP és la interfície REST de l'Application Access Manager de CyberArk.

---

## Camps del magatzem

A més dels [camps que té tot magatzem](./#adding-a-store), un magatzem CyberArk té aquests camps:

| Camp | Significat |
|---|---|
| Credencial | Una credencial **CyberArk** de [Connexions > Credencials](../credentials.html): la URL base del CCP, p. ex. `https://ccp.example.com` (s'hi afegeix `/AIMWebService/api/Accounts`), els seus ajustos de TLS, el seu AppID (l'aplicació definida per a AnsibleForms a CyberArk), i un certificat i una clau de client en PEM, només quan l'AppID ho requereix. |

---

## Referència del secret

La referència del secret identifica el compte com a parells clau-valor separats per `;`:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Claus permeses: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` passa la resta de la referència com a consulta nativa del CCP, amb `QueryFormat=Exact`
  tret que n'indiquis un altre.
- Un `AppID` a la referència s'ignora: sempre es fa servir l'AppID del magatzem.
- La contrasenya del compte (`Content`) passa a ser la contrasenya; `UserName`, `Address`, `Port` i
  `Database` omplen l'usuari, l'host, el port i el nom de la base de dades.

---

## Opcions addicionals

Les opcions addicionals del magatzem es defineixen com a objecte JSON:

| Clau | Significat |
|---|---|
| `reason` | S'envia com a `Reason` quan la referència no en té cap, per a l'auditoria de CyberArk. |
| `check_ref` | Una referència que **Prova la connexió** llegeix de veritat. Sense aquesta clau, la prova només verifica que el CCP respon i accepta l'AppID. |
| `timeout_ms` | Temps d'espera de la petició, per defecte 10000. |

Per exemple, per enviar un motiu i deixar que **Prova la connexió** llegeixi un compte de prova:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```

