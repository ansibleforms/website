---
layout: default
title: "La pàgina d'una credencial"
parent: Credencials
nav_order: 3
translated_from: 204eca949763c8c23625369f1d8d8d0d06545c87
---

# La pàgina d'una credencial
{: .no_toc }

Les pestanyes d'una credencial i què la utilitza
{: .fs-6 .fw-300 }

La pàgina d'una credencial mostra els passos del seu diàleg com a pestanyes, més el que la utilitza:

| Pestanya | Què conté |
|---|---|
| Detalls | Nom i descripció. |
| Tipus | Per a què serveix la credencial. |
| Accés | Tots els camps del seu tipus, com al pas **Accés** del diàleg: l'usuari, la contrasenya i on inicia sessió (host i port, la base de dades, el servidor de correu, els servidors del directori, el tenant o l'emissor, l'adreça del servidor i el seu TLS). L'AppID, el certificat de client i la clau d'una credencial CyberArk. |
| Magatzem | Base de dades o Magatzem de secrets, i el magatzem i la referència. No per a CyberArk ni HashiCorp Vault. |
| Usat per | Tot el que nomena aquesta credencial: magatzems de secrets, canals de notificació, repositoris, directoris LDAP, proveïdors SSO, runners, [bases de dades](../databases.html) (des de la 7.5.0), l'assistent de xat, formularis i els workflows del dissenyador. Una fila l'obre. |

La contrasenya s'escriu a la pestanya **Accés** i no es torna a mostrar mai un cop desada: si es deixa buida, es conserva la desada. En una credencial
CyberArk, deixa buida la clau de client per conservar la desada. A dalt a la dreta hi ha **Prova la connexió** (només credencials de base de dades),
**Suprimeix** i **Desa**.

Des de la 7.3.0, **Suprimeix** i un nom nou es rebutgen mentre **Usat per** llisti alguna cosa, vegeu [Credencials en ús](../credentials.html#credentials-in-use).

Una credencial declarada a la [llavor de configuració](../seed/) és només de lectura en aquesta pàgina: canvia-la al fitxer de la llavor.
