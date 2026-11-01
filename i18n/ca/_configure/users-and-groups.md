---
layout: default
title: Usuaris i grups
nav_order: 16
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 07178b6b66a60d91e5a8ff3c417da3771730bc5e
---

# Usuaris i grups
{: .no_toc }

Els usuaris i grups locals, al costat dels de LDAP i d'inici de sessió únic, i com bloquejar un inici de sessió
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: gestiona qui pot iniciar sessió a **Configuració > Accés > Usuaris** i **Grups**, amb l'opció de rol `showSettings`.

L'admin integrat, l'ordre d'inici de sessió i l'assignació de rols dels comptes locals són a [Comptes locals](authentication/local.html).

---

## En aquesta secció

| Pàgina | Què hi trobaràs |
|---|---|
| [Un usuari local](users-and-groups/local-user.html) | Afegir un usuari local, i les pestanyes de la seva pàgina |
| [Diversos grups](users-and-groups/several-groups.html) | Un usuari local en diversos grups, i els seus rols |
| [Un grup local](users-and-groups/local-group.html) | La pàgina d'un grup local i les seves pestanyes |
| [Usuaris i grups del directori](users-and-groups/directory.html) | Usuaris i grups de LDAP, Entra ID i OIDC, tal com es van veure per últim cop |
| [Bloquejar un inici de sessió](users-and-groups/blocking-a-sign-in.html) | Permet l'inici de sessió: bloqueja un usuari sense suprimir res |


---

## Les llistes

Les llistes **Usuaris** i **Grups** mostren els usuaris i grups locals i, al seu costat, els de LDAP i d'inici de sessió únic.

Un usuari o un grup de LDAP, Entra ID o OIDC apareix a la llista quan ha iniciat sessió (o s'ha vist en un inici de sessió), o quan un rol el nomena.
La columna **Origen** indica d'on ve cadascun: Local, LDAP, Microsoft Entra ID o OIDC. Des de la 7.3.0 la llista **Usuaris** també
té una columna **Darrer inici de sessió**, que indica quan va iniciar sessió cada usuari per última vegada.

Una fila obre la pàgina del seu usuari o grup. **Afegeix un usuari** i **Afegeix un grup** en creen un de local.

---

## Comptes que donen admin

El rol admin de config.yaml nomena grups i usuaris locals, així que només un admin pot canviar els comptes i els grups que nomena.

Un usuari amb `showSettings` però sense el rol admin no pot canviar, bloquejar, canviar de grup, posar la contrasenya ni suprimir un
compte local que el rol admin nomena (directament o a través d'un dels seus grups). Tampoc no pot crear, reanomenar ni suprimir un grup
que el rol admin nomena, ni posar-hi un usuari. El mateix val per a un usuari LDAP o SSO que s'assigna al rol admin: bloquejar-lo,
tancar-ne les sessions, oblidar-lo i revocar-ne els tokens d'API són cosa d'un admin. El servidor respon a una petició així amb `403`.

