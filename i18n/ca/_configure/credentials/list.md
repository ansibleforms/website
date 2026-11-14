---
layout: default
title: La pàgina de credencials
parent: Credencials
nav_order: 2
translated_from: e91c49850d61e193daa84ddbd0b841f65d8b3090
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

El pas **Accés** conté tots els camps del tipus, l'adreça inclosa; no hi ha cap pas de connexió a part. Des de la 7.6.0 alguns tipus
pregunten primer com inicien la sessió, i després mostren només el que cal (vegeu [Com inicia la sessió una credencial](types.html#how-a-credential-signs-in)):

| Tipus | Camps del pas Accés |
|---|---|
| Tots els tipus excepte CyberArk | La contrasenya, o el que en fa les funcions: la **Contrasenya** de LDAP (la seva contrasenya de bind), el **Secret del client** d'Entra ID i Open ID, el **Token** d'HashiCorp Vault i de l'RTE, el **Token d'API** de Semaphore, Rundeck i Jenkins, el **Token** o la **Contrasenya** d'AWX, AAP, Ascender i Git. Cap per a una clau privada SSH, un relay SMTP o un certificat d'Entra ID |
| Tots els tipus excepte HashiCorp Vault, RTE, Semaphore i Rundeck | L'usuari: l'AppID de CyberArk, el DN de bind de LDAP, l'ID de client d'Entra ID i Open ID. Cap amb **Token** (AWX, AAP, Ascender, Git) o **Sense inici de sessió** (SMTP) |
| SSH, Base de dades | **Amfitrió** i **Port**; per a una base de dades també el seu **Motor** i la **Base de dades** |
| SSH | Des de la 7.6.0 **Inicia la sessió amb**: **Contrasenya**, o **Clau privada** amb la **Clau privada** i la seva **Frase de pas** opcional |
| AWX, AAP, Ascender, Git | Des de la 7.6.0 **Inicia la sessió amb**: **Token** (sense usuari) o **Contrasenya** (un usuari i la seva contrasenya) |
| Usuari i contrasenya, API | Des de la 7.6.0 l'interruptor **Afegeix un host i un port**, després de la contrasenya, mostra un **Amfitrió** i un **Port** opcionals |
| SMTP | **Servidor de correu** (obligatori), **Port de correu** i **Utilitza TLS**; des de la 7.6.0 **Inicia la sessió amb**: **Sense inici de sessió** (un relay) o **Inici de sessió** (un usuari i la seva contrasenya) |
| LDAP | Els **Servidors** del directori (obligatori), el seu **Port** i **Activa TLS**; amb TLS, **Ignora els certificats**, el **Paquet de CA** i un **Certificat de client** |
| Microsoft Entra ID | **ID del tenant** (obligatori) i **URI de redirecció**; des de la 7.6.0 **Inicia la sessió amb**: **Secret** (el **Secret del client**) o **Certificat** (un **Certificat** i la seva clau privada, només correu) |
| Open ID | **Emissor** (obligatori) i **URI de redirecció** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Servidor**, l'adreça on inicia sessió, obligatori, amb **Omet la verificació del certificat** i el **Paquet de CA** |
| CyberArk | **Certificat de client** i **Clau del client** |

Amb **Apunta a una clau**, no es demanen l'usuari ni la contrasenya: els dona el magatzem. El pas **Accés** només conserva els camps d'adreça del tipus (SSH, base de dades, servidors de correu i de directori, l'adreça d'un servidor, l'amfitrió i el port opcionals d'Usuari i contrasenya i d'API des de la 7.6.0), i un accés Git no té pas **Accés**: es desa des del pas **Magatzem**.

Amb **Escriu a una clau** (des de 7.6.0), el pas **Accés** demana l'usuari i la contrasenya, i només ofereix les tries d'inici de sessió amb contrasenya (vegeu
[Com inicia la sessió una credencial](types.html#how-a-credential-signs-in)), i **Desa** els escriu al magatzem a la **Referència**; AnsibleForms només en conserva el magatzem i la referència. Només s'ofereixen els magatzems que permeten escriure, i **Afegeix un magatzem de secrets** en crea un amb l'escriptura ja activada. Una clau que ja té un secret només es reemplaça si **Sobreescriu un secret que ja hi sigui** està marcat, vegeu [Escriure credencials](../secret-stores/#writing-credentials).

Una fila obre la pàgina pròpia de la credencial. El seu menú ofereix **Edita**, **Prova la connexió** (només credencials de base de dades) i **Suprimeix**. La
contrasenya es canvia a la pàgina de la credencial, a la seva pestanya **Accés**.
