---
layout: default
title: Autenticació
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Autenticació
{: .no_toc }

Tria com inicien sessió els usuaris, i com el seu compte i els seus grups porten als rols
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Mètodes d'inici de sessió

AnsibleForms admet quatre mètodes d'inici de sessió, i n'hi pot haver diversos d'actius alhora:

| Mètode | Quan fer-lo servir | Pàgina |
|---|---|---|
| Comptes locals | L'admin integrat, comptes de servei, equips petits, o com a alternativa quan el directori no està disponible. | [Comptes locals](local.html) |
| LDAP | Els usuaris i els grups són a Active Directory, OpenLDAP o un altre directori LDAP. | [LDAP](ldap.html) |
| Entra ID | Els usuaris inicien sessió amb el seu compte de Microsoft 365 / Entra ID (inici de sessió únic). | [Entra ID](entra-id.html) |
| OIDC | Inici de sessió únic a través d'un altre proveïdor OpenID Connect, com ara Keycloak. | [OIDC](oidc.html) |

Els comptes locals i LDAP es configuren a **Accés > Usuaris**, **Grups** i **LDAP**; Entra ID i OIDC a
**Accés > SSO**.

---

## Com tria el mètode un inici de sessió

La pàgina d'inici de sessió té un formulari de nom d'usuari i contrasenya, més un botó per cada proveïdor d'inici de sessió únic activat:

- **El nom d'usuari i la contrasenya** es comproven primer amb els usuaris locals. Només quan cap usuari local no té aquest nom, i LDAP
  està activat, es prova el directori. Un usuari local amb una contrasenya incorrecta es rebutja sense consultar LDAP.
- **Els botons d'Entra ID i OpenID** apareixen sota **Inicia la sessió** quan hi ha un proveïdor d'aquest tipus activat. Envien el navegador al
  proveïdor i de tornada; cap contrasenya no arriba a AnsibleForms.

Només pot haver-hi activat alhora un proveïdor Entra ID i un proveïdor OIDC: activar-ne un desactiva els altres del seu tipus.
Un inici de sessió fallit amb usuari i contrasenya mostra sempre el mateix missatge genèric; el motiu és al registre del servidor i al registre d'auditoria.

---

## Activar i desactivar l'inici de sessió únic

Des de la 7.3.0 cada proveïdor d'**Accés > SSO** té dos interruptors propis, que s'apliquen sense reiniciar:

| Interruptor | Efecte |
|---|---|
| **Activat** | Mostra el botó del proveïdor a la pàgina d'inici de sessió i n'accepta l'inici de sessió. Activar-lo desactiva els altres proveïdors del seu tipus. |
| **Salta la pàgina d'inici de sessió** | Els usuaris van directament a aquest proveïdor, sense la pàgina d'inici de sessió, mentre el proveïdor està activat. Activar-lo en un proveïdor el desactiva en els altres; apareix en gris en un proveïdor desactivat. |

El formulari d'usuari i contrasenya continua accessible a `/login?local`, per a l'admin local o quan el proveïdor falla,
i es mostra després de tancar la sessió i quan un inici de sessió únic torna amb un error.

Les variables `ENABLE_SSO` i `SSO_AUTO_LOGIN` s'eliminen a la 7.3.0. La primera arrencada de la 7.3.0 les llegeix una vegada, i
registra un avís a cada arrencada mentre continuïn definides, així que treu-les de l'entorn després de l'actualització:

| Variable abans de la 7.3.0 | Què fa l'actualització |
|---|---|
| `ENABLE_SSO=0` | Desactiva tots els proveïdors: continuen configurats, sense botó a la pàgina d'inici de sessió |
| `SSO_AUTO_LOGIN=1` | Activa **Salta la pàgina d'inici de sessió** al proveïdor activat, quan n'hi ha exactament un d'activat i `ENABLE_SSO` no és `0` |

---

## De l'usuari als rols

Cada inici de sessió produeix un usuari amb un **tipus** (`local`, `ldap`, `azuread` o `oidc`), un nom d'usuari i una llista de grups.
Cada grup rep el prefix del seu tipus, de manera que un grup d'Entra ID es desa i es mostra com a `azuread/...`:

| Mètode d'inici de sessió | Nom d'usuari | Grups |
|---|---|---|
| Local | el nom d'usuari local | `local/<group>`, un per cada grup local de l'usuari |
| LDAP, directori `main` | el valor de l'Username Attribute | `ldap/<cn>`, el CN de cada grup que retorna el directori |
| LDAP, un altre directori | `<directory>/<username>` | `ldap/<directory>/<cn>`, vegeu [Diversos directoris](ldap.html#several-directories) |
| Entra ID | el claim `upn`, o `preferred_username` quan el token no té `upn` | `azuread/<object id>` i `azuread/<display name>` de cada grup, llegits de Microsoft Graph |
| OIDC | el claim `preferred_username` | `oidc/<name>`, del claim `groups` de l'ID token |

Els [rols](../config/roles.html) de config.yaml comparen després aquests valors: un rol s'aplica quan un dels seus `groups` és un
dels grups de l'usuari, o quan el seu `users` conté `<type>/<username>`. Tots els usuaris reben també el rol `default`. Des de la 7.3.0 un
rol nomena un membre d'Entra ID com a `entraid/<group>` o `entraid/<upn>`, que coincideix amb el valor `azuread/` desat; `azuread/`
en un rol continua funcionant i s'elimina a la 8.0. El perfil i les extravars de la tasca continuen mostrant `azuread/`.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

La pàgina del **perfil** d'un usuari llista el tipus d'inici de sessió, els grups i els rols, que és la manera més ràpida de comprovar una assignació.
L'opció de rol `allowLogin` pot rebutjar l'inici de sessió dels usuaris que no coincideixen amb cap rol: posa-la a `false` a `default` i a
`true` als rols que poden iniciar sessió.
