---
layout: default
title: Credenciales
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 08110077a1cf59a4a52e078fc2ebc252f7cae48d
---

# Credenciales
{: .no_toc }

Guarda los accesos con los que se conectan los formularios, los repositorios, los almacenes de secretos y los canales de notificación
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: añade los usuarios, contraseñas y tokens con los que se conecta AnsibleForms, guardados cifrados o leídos de un almacén de secretos.

---

## En esta sección

| Página | Qué trata |
|---|---|
| [Tipos de credencial](credentials/types.html) | Qué contiene cada tipo y dónde se puede elegir |
| [La página de credenciales](credentials/list.html) | La lista de credenciales y el diálogo que añade una |
| [La página de una credencial](credentials/credential-page.html) | Las pestañas de una credencial y qué la usa |

---

## Cómo funciona

Una **credencial** es un acceso con nombre, que se añade en **Conexiones > Credenciales**. Los formularios y los demás objetos de administración
se refieren a ella por su nombre, así que la contraseña nunca aparece en un formulario. Su usuario y su contraseña se guardan en la
base de datos de AnsibleForms, cifrados con `ENCRYPTION_SECRET`, o se leen de un [almacén de secretos](secret-stores/) cada vez que se
usa la credencial.

---

## Quién puede cambiar una credencial

Desde la 7.3.0 una credencial de la que depende una conexión o un inicio de sesión solo la puede añadir, cambiar o eliminar un admin:

| Credenciales | Por qué |
|---|---|
| Tipos de conexión: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` y `cyberark` | Un runner o un almacén de secretos toma de ella su dirección y su secreto |
| Tipos de inicio de sesión: `oidc`, `entraid` y `ldap` | Un proveedor SSO o un directorio LDAP inicia la sesión de los usuarios con ella |
| Cualquier credencial que nombre un runner | El runner inicia sesión con ella, y un cambio del propio runner también necesita un admin |

Los demás usuarios con acceso a las credenciales las ven en solo lectura. Un usuario que pudiera apuntar una credencial así a otro
servidor recibiría todos los secretos enviados a través de ella, y por eso la regla sigue la de los runners. Otras tres reglas
mantienen a esos usuarios lejos de secretos que de otro modo no podrían leer:

- **Nombrar una credencial protegida**: solo un admin puede nombrar una de estas credenciales en otro sitio, como en un repositorio,
  un canal de notificación o la configuración del asistente de chat. Una credencial que lee su contraseña de un almacén de secretos está
  protegida igual, sea cual sea su tipo.
- **Elegir un almacén de secretos**: solo un admin puede apuntar una credencial a un [almacén de secretos](secret-stores/), o cambiar el
  almacén o la referencia que lee; otro usuario puede seguir enviándolos sin cambios, o vaciarlos todos.
- **Mover una credencial**: cuando otro usuario cambia dónde inicia sesión una credencial (su host, puerto, emisor, inquilino o
  dirección del servidor) sin volver a escribir su contraseña, la contraseña guardada se borra, y también la referencia del almacén de secretos
  que lee, de modo que el secreto antiguo nunca va al nuevo destino.

---

## Credenciales en uso

Una credencial que todavía nombran otros registros no se puede eliminar ni renombrar, ya que quedarían apuntando a nada.
El rechazo indica cuántos registros la usan; la pestaña **Usado por** de [su página](credentials/credential-page.html) los lista.
Apúntalos antes a otra credencial y después elimínala o renómbrala.
