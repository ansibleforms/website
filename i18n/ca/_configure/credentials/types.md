---
layout: default
title: Tipus de credencial
parent: Credencials
nav_order: 1
translated_from: eb4f5cce55db979ca4f0d1304d797decc01192ee
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
| Usuari i contrasenya | Un usuari i una contrasenya per a qualsevol accés: una API REST amb autenticació bàsica, un servei i més, amb un host i un port opcionals. El predeterminat | Playbooks, mitjançant les `credentials` d'un formulari o un camp de credencial; [expressions REST](../expressions/credentials.html) |
| SSH | Un usuari amb una contrasenya o una clau privada per a SSH a un servidor, amb el seu host i el seu port | Playbooks, mitjançant les `credentials` o `ansibleCredentials` d'un formulari o un camp de credencial, i l'accés d'un node de workflow |
| Git | Un token, o un usuari i una contrasenya, per a repositoris git | [Repositoris](../repositories/authentication.html) |
| API | Un usuari i una contrasenya o un token per a una API REST, amb un host i un port opcionals | [Expressions REST](../expressions/credentials.html), el token d'un bot de Telegram, el bearer token d'un webhook, la clau d'API de l'assistent de xat |
| Base de dades | Un accés a base de dades, amb el seu tipus, host, port i nom de base de dades | Una [base de dades](../databases.html) que consulten els formularis (`dbConfig`), des de la 7.5.0, o directament el `dbConfig` d'un formulari; `fnCredentials`; es pot provar |
| CyberArk | L'adreça del CyberArk Central Credential Provider (CCP) i el seu TLS, i l'AppID, el certificat de client i la clau amb què accedeix un magatzem CyberArk | Un magatzem de secrets [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Un servidor de correu, el seu port i TLS, i el seu accés opcional (cap per a un relay) | Un [canal de notificació](../notification-channels.html) de correu |
| LDAP | Els servidors, el port, el TLS i els certificats d'un directori, i el seu DN i contrasenya de bind | Un [directori LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | Un registre d'aplicació: el seu ID de tenant, ID de client, secret de client o certificat, i URI de redirecció | Un [proveïdor Entra ID](../authentication/entra-id.html); un canal de correu que envia a través de [Microsoft 365](../notification-channels/microsoft-365.html) |
| Open ID | El client d'un proveïdor: el seu emissor, ID de client, secret de client i URI de redirecció | Un [proveïdor OIDC](../authentication/oidc.html) |
| RTE | El token (`RTE_TOKEN`) i l'adreça d'un RTE | Un [runner](../runners.html) RTE |
| AWX, AAP, Ascender | El token o l'accés, i l'adreça, d'aquesta plataforma | Un runner d'aquest tipus |
| Semaphore, Rundeck | El token d'API i l'adreça d'aquest producte | Un runner d'aquest tipus |
| Jenkins | Un usuari, el seu token d'API i l'adreça d'un Jenkins | Un runner Jenkins |
| HashiCorp Vault | El token i l'adreça amb què accedeix un magatzem Vault | Un magatzem de secrets [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Una credencial de base de dades pot ser de tipus MySQL, MSSQL, PostgreSQL, Oracle o MongoDB. Des de la 7.5.0 la tria una base de dades de
[Connexions > Bases de dades](../databases.html), i l'actualització a la 7.5.0 en crea una per a cadascuna, amb el mateix nom.

A l'API i a la [llavor de configuració](../seed/), els tipus són `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` i `vault`. L'actualització des de la 6
dona a cada credencial el tipus `userpass`, o `database` a una de base de dades: un formulari la utilitza com a la 6. Canvia-la a SSH per a un
accés amb què es connecta el playbook d'un node de workflow, o a API per a una API REST.

---

## Com inicia la sessió una credencial

Des de la 7.6.0 el pas **Accés** d'aquests tipus pregunta primer com inicia la sessió la credencial, i després mostra només els camps que calen:

| Tipus | Tria | Camps |
|---|---|---|
| SSH | **Inicia la sessió amb**: **Contrasenya** o **Clau privada** | Contrasenya: l'usuari i la seva contrasenya. Clau privada: l'usuari, la **Clau privada** PEM o OpenSSH i una **Frase de pas** opcional |
| AWX, AAP, Ascender | **Inicia la sessió amb**: **Token** o **Contrasenya** | Token: el **Token**, sense usuari. Contrasenya: l'usuari i la seva contrasenya |
| Git | **Inicia la sessió amb**: **Token** o **Contrasenya** | Token: el **Token**, sense usuari (git envia llavors l'usuari `oauth2`). Contrasenya: l'usuari i la seva contrasenya |
| SMTP | **Inicia la sessió amb**: **Sense inici de sessió** o **Inici de sessió** | Sense inici de sessió, per a un relay: només el **Servidor de correu**, el **Port de correu** i **Utilitza TLS**. Inici de sessió: aquests, més l'usuari i la seva contrasenya |
| Microsoft Entra ID | **Inicia la sessió amb**: **Secret** o **Certificat** | Secret: el **Secret del client**. Certificat: el **Certificat** PEM i la seva clau privada, només per al correu a través de Microsoft 365 |

Una credencial només conserva el que necessita la seva tria: una SSH mai no té alhora una contrasenya i una clau, l'altra s'elimina en desar.
Amb **Escriu a una clau** al pas **Magatzem**, només s'ofereixen les tries amb contrasenya, no **Clau privada**, **Sense inici de sessió** ni **Certificat**.

Els altres tipus inicien la sessió d'una sola manera. Una credencial d'usuari i contrasenya o d'API té l'interruptor **Afegeix un host i un port**
després de la contrasenya, vegeu [Host i port d'un accés](#host-and-port-of-a-login). El diàleg anomena la contrasenya de bind LDAP
**Contrasenya**, el token de l'RTE **Token**, i el tipus d'una base de dades **Motor**.

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

---

## Host i port d'un accés

Des de la 7.6.0 una credencial d'usuari i contrasenya o d'API també pot tenir un **Amfitrió** i un **Port**, tots dos opcionals: al seu pas
**Accés**, l'interruptor **Afegeix un host i un port** després de la contrasenya els mostra.

Arriben al playbook i a les expressions amb la credencial, com a `host` i `port`, al costat de `user` i `password`: mitjançant les
`credentials` d'un formulari i [`fn.fnCredentials`](../expressions/credentials.html). Una credencial llegida d'un magatzem de secrets
conserva el seu propi host i port, i pren els del secret només on els deixa buits. Les credencials SSH i de base de dades sempre els han tingut.

---

## La clau privada d'una credencial SSH

Des de la 7.6.0 una credencial SSH pot iniciar sessió amb una clau privada en lloc de la seva contrasenya: **Inicia la sessió amb** a **Clau privada** demana això:

| Camp | Significat |
|---|---|
| Clau privada | La clau privada PEM o OpenSSH amb què inicia sessió el playbook. Es desa xifrada i no es torna a mostrar mai: si es deixa buida, es conserva la desada. |
| Frase de pas | La frase de pas de la clau, si en té. Es desa xifrada. |

Inicia la sessió amb l'una o l'altra, mai amb les dues: en desar, una clau elimina la contrasenya desada, i **Contrasenya** elimina la clau
desada i la seva frase de pas, com diu la pàgina de la credencial. L'API no les retorna mai, i s'emmascaren a la sortida de la tasca.

Quan un formulari nomena la credencial a `ansibleCredentials`, l'RTE escriu la clau en un fitxer temporal privat (una carpeta pròpia,
llegible només pel seu usuari) i la passa al playbook com a `ansible_ssh_private_key_file`. Una clau amb frase de pas es carrega en un
`ssh-agent` iniciat només per a aquesta tasca, i el fitxer s'elimina un cop carregada. El fitxer i l'agent desapareixen quan acaba la
tasca, incloses les fallides o avortades, de manera que no queda cap clau a l'RTE.

Les imatges de l'RTE tenen `ssh-agent` i `ssh-add`; un RTE propi sense aquestes eines fa fallar, i ho diu, una tasca la clau de la qual té frase de pas.

Les `credentials` d'un formulari que nomenen una credencial SSH passen la clau al playbook com a `private_key`, i la seva frase de pas com a
`private_key_passphrase`. A la [llavor de configuració](../seed/), la clau és el `client_key` de la credencial i la seva frase de pas, `key_passphrase`.
