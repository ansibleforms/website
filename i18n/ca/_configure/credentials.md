---
layout: default
title: Credencials
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 08110077a1cf59a4a52e078fc2ebc252f7cae48d
---

# Credencials
{: .no_toc }

Desa els accessos amb què es connecten els formularis, els repositoris, els magatzems de secrets i els canals de notificació
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: afegeix els usuaris, les contrasenyes i els tokens amb què es connecta AnsibleForms, desats xifrats o llegits d'un magatzem de secrets.

---

## En aquesta secció

| Pàgina | Què hi trobaràs |
|---|---|
| [Tipus de credencial](credentials/types.html) | Què conté cada tipus i on es pot triar |
| [La pàgina de credencials](credentials/list.html) | La llista de credencials i el diàleg que n'afegeix una |
| [La pàgina d'una credencial](credentials/credential-page.html) | Les pestanyes d'una credencial i què la utilitza |

---

## Com funciona

Una **credencial** és un accés amb nom, que s'afegeix a **Connexions > Credencials**. Els formularis i els altres objectes d'administració
s'hi refereixen pel seu nom, de manera que la contrasenya mai no apareix en un formulari. El seu usuari i la seva contrasenya o bé es desen a la
base de dades d'AnsibleForms, xifrats amb `ENCRYPTION_SECRET`, o bé es llegeixen d'un [magatzem de secrets](secret-stores/) cada vegada que
s'utilitza la credencial.

---

## Qui pot canviar una credencial

Des de la 7.3.0, una credencial de la qual depèn una connexió o un inici de sessió només la pot afegir, canviar o suprimir un admin:

| Credencials | Per què |
|---|---|
| Tipus de connexió: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` i `cyberark` | Un runner o un magatzem de secrets en pren l'adreça i el secret |
| Tipus d'inici de sessió: `oidc`, `entraid` i `ldap` | Un proveïdor SSO o un directori LDAP hi inicia la sessió dels usuaris |
| Qualsevol credencial que nomeni un runner | El runner hi inicia sessió, i un canvi del mateix runner també necessita un admin |

Els altres usuaris amb accés a les credencials les veuen només de lectura. Un usuari que pogués apuntar una credencial d'aquest tipus a un altre
servidor rebria tots els secrets que s'hi envien, i per això la regla segueix la dels runners. Tres regles més
mantenen aquests usuaris lluny de secrets que d'una altra manera no podrien llegir:

- **Nomenar una credencial protegida**: només un admin pot nomenar una d'aquestes credencials en un altre lloc, com ara en un repositori,
  un canal de notificació o la configuració de l'assistent de xat. Una credencial que llegeix la seva contrasenya d'un magatzem de secrets està
  protegida de la mateixa manera, sigui quin sigui el seu tipus.
- **Triar un magatzem de secrets**: només un admin pot apuntar una credencial a un [magatzem de secrets](secret-stores/), o canviar el
  magatzem o la referència que llegeix; un altre usuari encara els pot tornar a enviar sense canvis, o buidar-los tots.
- **Moure una credencial**: quan un altre usuari canvia on inicia sessió una credencial (el seu host, port, emissor, tenant o
  adreça del servidor) sense tornar a escriure'n la contrasenya, la contrasenya desada s'esborra, i també la referència del magatzem de secrets
  que llegeix, de manera que el secret antic mai no va al nou destí.

---

## Credencials en ús

Una credencial que encara nomenen altres registres no es pot suprimir ni reanomenar, perquè quedarien apuntant a res.
El rebuig indica quants registres la utilitzen; la pestanya **Usat per** de [la seva pàgina](credentials/credential-page.html) els llista.
Apunta'ls primer a una altra credencial, i després suprimeix-la o reanomena-la.
