---
layout: default
title: Tipos de credencial
parent: Credenciales
nav_order: 1
translated_from: 1f21f8fc1ae73953922d8c9f21de6db05b3b1a87
---

# Tipos de credencial
{: .no_toc }

Qué contiene cada tipo y dónde se puede elegir
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Los tipos

El tipo indica para qué sirve una credencial. Decide qué campos pide el diálogo y dónde se puede elegir:

| Tipo | Qué contiene | Usado por |
|---|---|---|
| Usuario y contraseña | Un usuario y una contraseña para cualquier acceso: una API REST con autenticación básica, un servicio y más. El predeterminado | Playbooks, mediante las `credentials` de un formulario o un campo de credencial; [expresiones REST](../expressions/credentials.html) |
| SSH | Un usuario y una contraseña para SSH a un servidor, con su host y su puerto | Playbooks, mediante las `credentials` o `ansibleCredentials` de un formulario o un campo de credencial, y el acceso de un nodo de workflow |
| Git | Un usuario y una contraseña o un token para repositorios git | [Repositorios](../repositories/authentication.html) |
| API | Un usuario y una contraseña o un token para una API REST | [Expresiones REST](../expressions/credentials.html), el token de un bot de Telegram, el bearer token de un webhook, la clave de API del asistente de chat |
| Base de datos | Un acceso a base de datos, con su tipo, host, puerto y nombre de base de datos | Consultas de formularios (`dbConfig`) y `fnCredentials`; se puede probar |
| CyberArk | La dirección del CyberArk Central Credential Provider (CCP) y su TLS, y el AppID, el certificado de cliente y la clave con los que accede un almacén CyberArk | Un almacén de secretos [CyberArk](../secret-stores/cyberark.html) |
| SMTP | Un servidor de correo, su puerto y TLS, y su acceso (ninguno para un relay) | Un [canal de notificación](../notification-channels.html) de correo |
| LDAP | Los servidores, el puerto, el TLS y los certificados de un directorio, y su DN y contraseña de vinculación | Un [directorio LDAP](../authentication/ldap.html) |
| Microsoft Entra ID | El registro de aplicación de un proveedor: su ID de inquilino, ID de cliente, secreto de cliente y URI de redirección | Un [proveedor Entra ID](../authentication/entra-id.html) |
| Open ID | El cliente de un proveedor: su emisor, ID de cliente, secreto de cliente y URI de redirección | Un [proveedor OIDC](../authentication/oidc.html) |
| RTE | El token (`RTE_TOKEN`) y la dirección de un RTE | Un [runner](../runners.html) RTE |
| AWX, AAP, Ascender | El token o el acceso, y la dirección, de esa plataforma | Un runner de ese tipo |
| Semaphore, Rundeck | El token de API y la dirección de ese producto | Un runner de ese tipo |
| Jenkins | Un usuario, su token de API y la dirección de un Jenkins | Un runner Jenkins |
| HashiCorp Vault | El token y la dirección con los que accede un almacén Vault | Un almacén de secretos [HashiCorp Vault](../secret-stores/hashicorp-vault.html) |

Una credencial de base de datos puede ser de tipo MySQL, MSSQL, PostgreSQL, Oracle o MongoDB.

En la API y en la [semilla de configuración](../seed/), los tipos son `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` y `vault`. La actualización desde la 6
da a cada credencial el tipo `userpass`, o `database` a una de base de datos: un formulario la usa como en la 6. Cámbiala a SSH para un
acceso con el que se conecta el playbook de un nodo de workflow, o a API para una API REST.

---

## Direcciones en las credenciales

Desde la 7.3.0 un acceso que funciona en un servidor lleva consigo ese servidor, así que el registro que lo usa solo nombra la credencial:

| Registro | Qué pasó a su credencial |
|---|---|
| Un directorio LDAP | Sus servidores, puerto, TLS, certificados y cuenta de vinculación, a una credencial `ldap` llamada `<directory>-ldap` |
| Un proveedor SSO | Su ID de cliente y secreto, inquilino o emisor, y URI de redirección, a una credencial `entraid` u `oidc` llamada `<provider>-sso` |
| Un runner | Su dirección y TLS, y su token o acceso, a una credencial de su tipo, `<runner>-token` o `<runner>-login` |
| Un almacén de secretos | Su dirección y TLS, y su token (`<store>-token`) o el AppID y el certificado de CyberArk (`<store>-appid`) |
| Un canal de correo | Su servidor, puerto y TLS, a su credencial `smtp`, o a una nueva llamada `<channel>-smtp` |

La actualización a la 7.3.0 hace estos traslados una vez. Un registro que ya nombraba una credencial la conserva, y recibe una copia de ella cuando
otro registro usaba el mismo acceso con otro servidor. Los registros declarados en la [semilla de configuración](../seed/) se dejan como los tiene la semilla.
Las credenciales de las conexiones y de los inicios de sesión solo las puede cambiar un admin, consulta [Quién puede cambiar una credencial](../credentials.html#who-may-change-a-credential).
