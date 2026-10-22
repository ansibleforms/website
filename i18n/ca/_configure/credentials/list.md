---
layout: default
title: La pàgina de credencials
parent: Credencials
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
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
| Accés | Amb què i on inicia sessió el tipus, vegeu més avall. |
| Magatzem | On es desen l'usuari i la contrasenya: **Base de dades** (xifrats a la base de dades d'AnsibleForms) o **Magatzem de secrets**, amb el magatzem i la **Referència** que hi ha dins. No per a CyberArk ni HashiCorp Vault, amb els quals inicia sessió un magatzem de secrets. |

El pas **Tipus** llista els tipus pel seu nom: AAP, API, Ascender, AWX, CyberArk, Base de dades, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH i Usuari i contrasenya (vegeu [Tipus de credencial](types.html)).

El pas **Accés** conté tots els camps del tipus, l'adreça inclosa; no hi ha cap pas de connexió a part:

| Tipus | Camps del pas Accés |
|---|---|
| Tots els tipus excepte CyberArk | La contrasenya, o el que en fa les funcions: la contrasenya de bind de LDAP, el secret de client d'Entra ID i Open ID, el token d'HashiCorp Vault, el token de l'RTE, el token d'API de Semaphore, Rundeck i Jenkins, un token o una contrasenya per a AWX, AAP i Ascender |
| Tots els tipus excepte HashiCorp Vault, RTE, Semaphore i Rundeck | L'usuari: l'AppID de CyberArk, el DN de bind de LDAP, l'ID de client d'Entra ID i Open ID, opcional per a AWX, AAP i Ascender |
| SSH, Base de dades | **Amfitrió** i **Port**; per a una base de dades també el **Tipus de base de dades** i la **Base de dades** |
| SMTP | **Servidor de correu** (obligatori), el seu **Port** i **Utilitza TLS** |
| LDAP | Els **Servidors** del directori (obligatori), el seu **Port** i **Activa TLS**; amb TLS, **Ignora els certificats**, el **Paquet de CA** i un **Certificat de client** |
| Microsoft Entra ID | **ID del tenant** (obligatori) i **URI de redirecció** |
| Open ID | **Emissor** (obligatori) i **URI de redirecció** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Servidor**, l'adreça on inicia sessió, obligatori, amb **Omet la verificació del certificat** i el **Paquet de CA** |
| CyberArk | **Certificat de client** i **Clau del client** |

Una fila obre la pàgina pròpia de la credencial. El seu menú ofereix **Edita**, **Prova la connexió** (només credencials de base de dades) i **Suprimeix**. La
contrasenya es canvia a la pàgina de la credencial, a la seva pestanya **Accés**.
