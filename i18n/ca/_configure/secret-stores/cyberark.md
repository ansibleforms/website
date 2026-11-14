---
layout: default
title: CyberArk
parent: Magatzems de secrets
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

Llegir credencials a través del CCP de CyberArk, escriure-les a través del seu PVWA
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

## Escriure credencials

Des de 7.6.0, l'usuari i la contrasenya d'una credencial es poden escriure a CyberArk en **Desar** (vegeu [Escriure credencials](./#writing-credentials)).
El CCP només llegeix, així que AnsibleForms escriu a través de l'API REST del PVWA, amb una credencial pròpia.

Activa **Permet l'escriptura** a les **Opcions** del magatzem i omple:

| Camp | Significat |
|---|---|
| Permet l'escriptura | Permet que una credencial escrigui el seu usuari i contrasenya en aquest magatzem en **Desar**. Desactivat per defecte. |
| Caixes fortes on escriure | Les caixes fortes on es poden escriure credencials, separades per comes, p. ex. `Linux, DB`. Obligatori amb l'escriptura activada. |
| Adreça del PVWA | L'URL base del PVWA, p. ex. `https://pvwa.example.com`. Obligatòria. |
| Credencial del PVWA | Una credencial pròpia de tipus **Usuari i contrasenya** o **API**, mai llegida d'un magatzem de secrets, que pot afegir comptes a aquestes caixes fortes i canviar-ne les contrasenyes. Obligatòria. |
| Mètode d'inici de sessió | Com inicia la sessió la credencial del PVWA: CyberArk (per defecte), LDAP, RADIUS o Windows. |
| ID de plataforma | La plataforma dels comptes que afegeix, p. ex. `UnixSSH`. Necessari per afegir un compte nou. |

La referència anomena el compte com en llegir, `Safe=Linux;Object=srv01-root`, amb `Address=srv01.example.com` quan la seva plataforma en necessita una.

- Un compte nou s'afegeix a la caixa forta amb la plataforma, el nom d'usuari i la contrasenya.
- Un compte existent només es canvia si **Sobreescriu un secret que ja hi sigui** està marcat: primer el nom d'usuari, després la contrasenya.
- La sessió del PVWA es tanca després de cada escriptura. L'inici de sessió OAuth de Privilege Cloud no és compatible.

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

