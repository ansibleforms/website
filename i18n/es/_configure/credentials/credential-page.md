---
layout: default
title: "La página de una credencial"
parent: Credenciales
nav_order: 3
translated_from: e6bb8581b39ffc997504889b1b6e8d245cd51d13
---

# La página de una credencial
{: .no_toc }

Las pestañas de una credencial y qué la usa
{: .fs-6 .fw-300 }

La página de una credencial muestra los pasos de su diálogo como pestañas, más lo que la usa:

| Pestaña | Qué contiene |
|---|---|
| Detalles | Nombre y descripción. |
| Tipo | Para qué sirve la credencial. |
| Acceso | Todos los campos de su tipo, como en el paso **Acceso** del diálogo: el usuario, la contraseña y dónde inicia sesión (host y puerto, la base de datos, el servidor de correo, los servidores del directorio, el inquilino o el emisor, la dirección del servidor y su TLS). El AppID, el certificado de cliente y la clave de una credencial CyberArk. Desde la 7.6.0, la opción de cómo inicia sesión, y la clave privada y la frase de contraseña de una credencial SSH. |
| Almacén | Base de datos o Almacén de secretos, y el almacén y la referencia. No para CyberArk ni HashiCorp Vault. |
| Usado por | Todo lo que nombra esta credencial: almacenes de secretos, canales de notificación, repositorios, directorios LDAP, proveedores SSO, runners, [bases de datos](../databases.html) (desde la 7.5.0), el asistente de chat, formularios y los workflows del diseñador. Una fila lo abre. |

La contraseña se escribe en la pestaña **Acceso** y nunca se vuelve a mostrar una vez guardada: si se deja vacía, se mantiene la guardada. Lo mismo
vale para la clave de cliente de una credencial CyberArk y, desde la 7.6.0, para la clave privada y la frase de contraseña de una credencial SSH.

Desde la 7.6.0 eso solo vale mientras la opción de inicio de sesión no cambia. Si cambia (una SSH de **Clave privada** a **Contraseña** y al
revés, una SMTP de **Sin inicio de sesión** a **Inicio de sesión**, una Entra ID de **Certificado** a **Secreto** y al revés, un **Token** a una
**Contraseña** y al revés), nada guardado le sirve: el nuevo secreto que pide es obligatorio, y **Guardar** lo pide. Una credencial SSH que pasa
a **Contraseña** elimina su clave privada y su frase de contraseña guardadas al pulsar **Guardar**, como dice la pestaña bajo la opción. Con
**Escribir en una clave** en la pestaña **Almacén**, solo se ofrecen las opciones con contraseña, consulta [Cómo inicia sesión una credencial](types.html#how-a-credential-signs-in).

Arriba a la derecha están **Probar conexión** (solo credenciales de base de datos), **Eliminar** y **Guardar**.

Desde la 7.3.0, **Eliminar** y un nombre nuevo se rechazan mientras **Usado por** liste algo, consulta [Credenciales en uso](../credentials.html#credentials-in-use).

Una credencial declarada en la [semilla de configuración](../seed/) es de solo lectura en esta página: cámbiala en el archivo de la semilla.
