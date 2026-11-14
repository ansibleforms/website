---
layout: default
title: "La pàgina d'una credencial"
parent: Credencials
nav_order: 3
translated_from: e6bb8581b39ffc997504889b1b6e8d245cd51d13
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
| Accés | Tots els camps del seu tipus, com al pas **Accés** del diàleg: l'usuari, la contrasenya i on inicia sessió (host i port, la base de dades, el servidor de correu, els servidors del directori, el tenant o l'emissor, l'adreça del servidor i el seu TLS). L'AppID, el certificat de client i la clau d'una credencial CyberArk. Des de la 7.6.0, la tria de com inicia la sessió, i la clau privada i la frase de pas d'una credencial SSH. |
| Magatzem | Base de dades o Magatzem de secrets, i el magatzem i la referència. No per a CyberArk ni HashiCorp Vault. |
| Usat per | Tot el que nomena aquesta credencial: magatzems de secrets, canals de notificació, repositoris, directoris LDAP, proveïdors SSO, runners, [bases de dades](../databases.html) (des de la 7.5.0), l'assistent de xat, formularis i els workflows del dissenyador. Una fila l'obre. |

La contrasenya s'escriu a la pestanya **Accés** i no es torna a mostrar mai un cop desada: si es deixa buida, es conserva la desada. El mateix
val per a la clau de client d'una credencial CyberArk i, des de la 7.6.0, per a la clau privada i la frase de pas d'una credencial SSH.

Des de la 7.6.0 això només val mentre la tria d'inici de sessió no canvia. Si canvia (una **Clau privada** SSH a **Contrasenya** i a l'inrevés,
un SMTP **Sense inici de sessió** a **Inici de sessió**, un **Certificat** d'Entra ID a **Secret** i a l'inrevés, un **Token** a una **Contrasenya**
i a l'inrevés), res del que hi ha desat hi encaixa: el secret nou que necessita és obligatori, i **Desa** el demana. Una credencial SSH canviada a
**Contrasenya** elimina la clau privada desada i la seva frase de pas en fer **Desa**, com diu la pestanya sota la tria. Amb **Escriu a una clau**
a la pestanya **Magatzem**, només s'ofereixen les tries amb contrasenya, vegeu [Com inicia la sessió una credencial](types.html#how-a-credential-signs-in).

A dalt a la dreta hi ha **Prova la connexió** (només credencials de base de dades), **Suprimeix** i **Desa**.

Des de la 7.3.0, **Suprimeix** i un nom nou es rebutgen mentre **Usat per** llisti alguna cosa, vegeu [Credencials en ús](../credentials.html#credentials-in-use).

Una credencial declarada a la [llavor de configuració](../seed/) és només de lectura en aquesta pàgina: canvia-la al fitxer de la llavor.
