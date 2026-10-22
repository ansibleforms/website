---
layout: default
title: Tipus de credencial
parent: Credencials
nav_order: 1
translated_from: 1f21f8fc1ae73953922d8c9f21de6db05b3b1a87
---

# Tipus de credencial
{: .no_toc }

Què conté cada tipus i on es pot triar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Els tipus

El tipus indica per a què serveix una credencial. Decideix quins camps demana el diàleg i on es pot triar:

| Tipus | Què conté | Usat per |
|---|---|---|
| Usuari i contrasenya | Un usuari i una contrasenya per a qualsevol accés: una API REST amb autenticació bàsica, un servei i més. El predeterminat | Playbooks, mitjançant les `credentials` d'un formulari o un camp de credencial; [expressions REST](../expressions/credentials.html) |
| SSH | Un usuari i una contrasenya per a SSH a un servidor, amb el seu host i el seu port | Playbooks, mitjançant les `credentials` o `ansibleCredentials` d'un formulari o un camp de credencial, i l'accés d'un node de workflow |
| Git | Un usuari i una contrasenya o un token per a repositoris git | [Repositoris](../repositories/authentication.html) |
| API | Un usuari i una contrasenya o un token per a una API REST | [Expressions REST](../expressions/credentials.html), el token d'un bot de Telegram, el bearer token d'un webhook, la clau d'API de l'assistent de xat |
| Base de dades | Un accés a base de dades, amb el seu tipus, host, port i nom de base de dades | Consultes de formularis (`dbConfig`) i `fnCredentials`; es pot provar |
| CyberArk | L'adreça del CyberArk Central Credential Provider (CCP) i el seu TLS, i l'AppID, el certificat de client i la clau amb què accedeix un magatzem CyberArk | Un magatzem de secrets [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Un servidor de correu, el seu port i TLS, i el seu accés (cap per a un relay) | Un [canal de notificació](../notification-channels.html) de correu |
| LDAP | Els servidors, el port, el TLS i els certificats d'un directori, i el seu DN i contrasenya de bind | Un [directori LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | El registre d'aplicació d'un proveïdor: el seu ID de tenant, ID de client, secret de client i URI de redirecció | Un [proveïdor Entra ID](../authentication/entra-id.html) |
| Open ID | El client d'un proveïdor: el seu emissor, ID de client, secret de client i URI de redirecció | Un [proveïdor OIDC](../authentication/oidc.html) |
| RTE | El token (`RTE_TOKEN`) i l'adreça d'un RTE | Un [runner](../runners.html) RTE |
| AWX, AAP, Ascender | El token o l'accés, i l'adreça, d'aquesta plataforma | Un runner d'aquest tipus |
| Semaphore, Rundeck | El token d'API i l'adreça d'aquest producte | Un runner d'aquest tipus |
| Jenkins | Un usuari, el seu token d'API i l'adreça d'un Jenkins | Un runner Jenkins |
| HashiCorp Vault | El token i l'adreça amb què accedeix un magatzem Vault | Un magatzem de secrets [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Una credencial de base de dades pot ser de tipus MySQL, MSSQL, PostgreSQL, Oracle o MongoDB.

A l'API i a la [llavor de configuració](../seed/), els tipus són `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` i `vault`. L'actualització des de la 6
dona a cada credencial el tipus `userpass`, o `database` a una de base de dades: un formulari la utilitza com a la 6. Canvia-la a SSH per a un
accés amb què es connecta el playbook d'un node de workflow, o a API per a una API REST.

---

## Adreces a les credencials

Des de la 7.3.0, un accés que funciona en un servidor porta amb si aquest servidor, de manera que el registre que l'utilitza només nomena la credencial:

| Registre | Què ha passat a la seva credencial |
|---|---|
| Un directori LDAP | Els seus servidors, port, TLS, certificats i compte de bind, a una credencial `ldap` anomenada `<directory>-ldap` |
| Un proveïdor SSO | El seu ID de client i secret, tenant o emissor, i URI de redirecció, a una credencial `entraid` o `oidc` anomenada `<provider>-sso` |
| Un runner | La seva adreça i TLS, i el seu token o accés, a una credencial del seu tipus, `<runner>-token` o `<runner>-login` |
| Un magatzem de secrets | La seva adreça i TLS, i el seu token (`<store>-token`) o l'AppID i el certificat de CyberArk (`<store>-appid`) |
| Un canal de correu | El seu servidor, port i TLS, a la seva credencial `smtp`, o a una de nova anomenada `<channel>-smtp` |

L'actualització a la 7.3.0 fa aquests trasllats una sola vegada. Un registre que ja nomenava una credencial la conserva, i en rep una còpia quan
un altre registre utilitzava el mateix accés amb un altre servidor. Els registres declarats a la [llavor de configuració](../seed/) es deixen tal com els té la llavor.
Les credencials de les connexions i dels inicis de sessió només les pot canviar un admin, vegeu [Qui pot canviar una credencial](../credentials.html#who-may-change-a-credential).
