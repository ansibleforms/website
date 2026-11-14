---
layout: default
title: La pàgina de credencials
parent: Credencials
nav_order: 2
translated_from: 6e745bbf0a6688646a821d2bec900e5f0406f4ba
---

# La pàgina de credencials
{: .no_toc }

La llista de credencials i el diàleg que n'afegeix una
{: .fs-6 .fw-300 }

La pàgina de **Connexions > Credencials** llista totes les credencials amb el seu **Nom**, **Tipus**, **Descripció** i **Usat per**, el
nombre de registres, formularis i workflows que la nomenen (vegeu [Credencials en ús](../credentials.html#credentials-in-use)).

**Afegeix credencial** obre un diàleg per passos:

| Pas | Camps |
|---|---|
| Credencial | Nom i descripció, tots dos obligatoris. |
| Tipus | Un de 18 tipus, vegeu més avall. |
| Magatzem | On es guarden l'usuari i la contrasenya: **Base de dades** (xifrats a la base de dades d'AnsibleForms) o **Magatzem de secrets**. Sota **Magatzem de secrets**, **Apunta a una clau** llegeix un secret que ja és al magatzem, i **Escriu a una clau** escriu al magatzem, en **Desar**, l'usuari i la contrasenya escrits al pas **Accés**. Després tria el magatzem i omple la **Referència**; el seu exemple segueix el magatzem: un camí de HashiCorp Vault o un compte de CyberArk. No per a CyberArk ni HashiCorp Vault, amb els quals inicia la sessió un magatzem de secrets. |
| Accés | Amb què i on inicia sessió el tipus, vegeu més avall. |

El pas **Tipus** llista els tipus pel seu nom: AAP, API, Ascender, AWX, CyberArk, Base de dades, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH i Usuari i contrasenya (vegeu [Tipus de credencial](types.html)).

El pas **Accés** conté tots els camps del tipus, l'adreça inclosa; no hi ha cap pas de connexió a part:

| Tipus | Camps del pas Accés |
|---|---|
| Tots els tipus excepte CyberArk | La contrasenya, o el que en fa les funcions: la contrasenya de bind de LDAP, el secret de client d'Entra ID i Open ID, el token d'HashiCorp Vault, el token de l'RTE, el token d'API de Semaphore, Rundeck i Jenkins, un token o una contrasenya per a AWX, AAP i Ascender |
| Tots els tipus excepte HashiCorp Vault, RTE, Semaphore i Rundeck | L'usuari: l'AppID de CyberArk, el DN de bind de LDAP, l'ID de client d'Entra ID i Open ID, opcional per a AWX, AAP i Ascender |
| SSH, Base de dades | **Amfitrió** i **Port**; per a una base de dades també el **Tipus de base de dades** i la **Base de dades** |
| SSH | **Clau privada** i la seva **Frase de pas**, des de la 7.6.0; amb una clau, la contrasenya és opcional |
| Usuari i contrasenya, API | **Amfitrió** i **Port**, tots dos opcionals, des de la 7.6.0 |
| SMTP | **Servidor de correu** (obligatori), el seu **Port** i **Utilitza TLS**; des de la 7.6.0 l'usuari i la contrasenya són opcionals, buits per a un relay |
| LDAP | Els **Servidors** del directori (obligatori), el seu **Port** i **Activa TLS**; amb TLS, **Ignora els certificats**, el **Paquet de CA** i un **Certificat de client** |
| Microsoft Entra ID | **ID del tenant** (obligatori) i **URI de redirecció**; des de la 7.6.0 **Inicia la sessió amb**: **Secret de client** o **Certificat** (només correu) |
| Open ID | **Emissor** (obligatori) i **URI de redirecció** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Servidor**, l'adreça on inicia sessió, obligatori, amb **Omet la verificació del certificat** i el **Paquet de CA** |
| CyberArk | **Certificat de client** i **Clau del client** |

Amb **Apunta a una clau**, no es demanen l'usuari ni la contrasenya: els dona el magatzem. El pas **Accés** només conserva els camps d'adreça del tipus (SSH, base de dades, servidors de correu i de directori, l'adreça d'un servidor, l'amfitrió i el port opcionals d'Usuari i contrasenya i d'API des de la 7.6.0), i un accés Git no té pas **Accés**: es desa des del pas **Magatzem**.

Amb **Escriu a una clau** (des de 7.6.0), el pas **Accés** demana l'usuari i la contrasenya, i **Desa** els escriu al magatzem a la **Referència**; AnsibleForms només en conserva el magatzem i la referència. Només s'ofereixen els magatzems que permeten escriure, i **Afegeix un magatzem de secrets** en crea un amb l'escriptura ja activada. Una clau que ja té un secret només es reemplaça si **Sobreescriu un secret que ja hi sigui** està marcat, vegeu [Escriure credencials](../secret-stores/#writing-credentials).

Una fila obre la pàgina pròpia de la credencial. El seu menú ofereix **Edita**, **Prova la connexió** (només credencials de base de dades) i **Suprimeix**. La
contrasenya es canvia a la pàgina de la credencial, a la seva pestanya **Accés**.
