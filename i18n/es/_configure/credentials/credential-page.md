---
layout: default
title: "La página de una credencial"
parent: Credenciales
nav_order: 3
translated_from: 0269b5c0d313622bea6c910b96231f41ffd852d7
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
| Acceso | Todos los campos de su tipo, como en el paso **Acceso** del diálogo: el usuario, la contraseña y dónde inicia sesión (host y puerto, la base de datos, el servidor de correo, los servidores del directorio, el inquilino o el emisor, la dirección del servidor y su TLS). El AppID, el certificado de cliente y la clave de una credencial CyberArk. |
| Almacén | Base de datos o Almacén de secretos, y el almacén y la referencia. No para CyberArk ni HashiCorp Vault. |
| Usado por | Todo lo que nombra esta credencial: almacenes de secretos, canales de notificación, repositorios, directorios LDAP, proveedores SSO, runners, el asistente de chat, formularios y los workflows del diseñador. Una fila lo abre. |

La contraseña se escribe en la pestaña **Acceso** y nunca se vuelve a mostrar una vez guardada: si se deja vacía, se mantiene la guardada. En una credencial
CyberArk, deja vacía la clave de cliente para mantener la guardada. Arriba a la derecha están **Probar conexión** (solo credenciales de base de datos),
**Eliminar** y **Guardar**.

Desde la 7.3.0, **Eliminar** y un nombre nuevo se rechazan mientras **Usado por** liste algo, consulta [Credenciales en uso](../credentials.html#credentials-in-use).

Una credencial declarada en la [semilla de configuración](../seed/) es de solo lectura en esta página: cámbiala en el archivo de la semilla.
