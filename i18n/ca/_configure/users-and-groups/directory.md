---
layout: default
title: Usuaris i grups del directori
parent: Usuaris i grups
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Usuaris i grups del directori
{: .no_toc }

Usuaris i grups de LDAP, Entra ID i OIDC, tal com es van veure per últim cop
{: .fs-6 .fw-300 }

Un usuari de LDAP, Entra ID o OIDC té la seva pàgina a `/settings/users/<source>/<name>`, amb `ldap`, `azuread` o `oidc`
com a origen, per exemple `/settings/users/ldap/jdoe`. Mostra el que es va registrar al darrer inici de sessió de l'usuari, només de lectura,
ja que és el directori o el proveïdor d'identitat qui decideix qui és l'usuari i quins són els seus grups.

Les seves pestanyes són les d'un usuari local. **Detalls** té l'interruptor **Permet l'inici de sessió**, el nom d'usuari, l'origen, el nom,
el correu, quan es va veure l'usuari per primer cop i el seu darrer inici de sessió. **Grups** llista els grups del darrer inici de sessió.
**Tokens d'API** llista els tokens d'API de l'usuari, i **Revoca** n'acaba un a l'instant.

A dalt a la dreta, **Tanca les sessions** tanca ara mateix la sessió de l'usuari a tot arreu. **Oblida** elimina el registre, que torna
al seu proper inici de sessió; les seves tasques, tasques desades i programacions es conserven. Un usuari bloquejat no es pot oblidar, perquè
això el deixaria tornar a entrar: el servidor respon `409`, així que primer permet-ne l'inici de sessió.

Els grups d'aquest registre són també els grups amb què treballa la sessió de l'usuari, llegits en directe. Oblidar un usuari que té la sessió
iniciada el deixa sense grups, i sense els rols que donen aquests grups, fins que torna a iniciar sessió.

Un grup del directori té la seva pàgina a `/settings/groups/<source>/<name>`, només de lectura, amb les pestanyes **Detalls**,
**Usuaris** (els usuaris que s'hi han vist al seu darrer inici de sessió), **Rols** i **Formularis**.
