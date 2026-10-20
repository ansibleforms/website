---
layout: default
title: LDAP
parent: Autenticación
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Deja que los usuarios del directorio inicien sesión con su propia contraseña y dales roles a través de sus grupos del directorio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cómo funciona

AnsibleForms se conecta al directorio con una cuenta de vinculación, busca al usuario y después se vincula como ese usuario para comprobar
la contraseña:

1. El usuario inicia sesión con nombre de usuario y contraseña. Cuando ningún usuario **local** tiene ese nombre, se prueba LDAP.
2. AnsibleForms se vincula con la cuenta de vinculación de la credencial del directorio y busca en la **Base de búsqueda** una entrada cuyo
   **Atributo de nombre de usuario** sea igual al nombre de usuario.
3. Se vincula como la entrada encontrada, con la contraseña que se ha escrito.
4. Los grupos se leen de la entrada (o de una búsqueda de grupos), se filtran y se les añade el prefijo `ldap/`.

Un nombre de usuario en formato UPN (`jdoe@example.com`) que no encuentra ningún usuario se reintenta una vez con la parte anterior a la `@`, así que los usuarios
pueden iniciar sesión con cualquiera de las dos formas aunque el Atributo de nombre de usuario contenga el nombre corto. Una contraseña incorrecta nunca se reintenta.

Una misma configuración sirve para Active Directory, OpenLDAP y otros; desde la 7.3.0 puede haber [varios directorios](#several-directories).

---

## Configuración

Desde la 7.3.0 la configuración es por directorio. **Acceso > LDAP** lista los directorios, en el orden en que se busca un nombre de usuario sin directorio:

![Acceso > LDAP](../assets/screenshots/ldap.jpg)

| Menú de fila | Qué hace |
|---|---|
| Editar | Abre la página del directorio |
| Probar conexión | Prueba un inicio de sesión con un usuario y una contraseña de prueba, consulta [Probar la conexión](#testing-the-connection) |
| Activar, Desactivar | Activa o desactiva el directorio; `main` se desactiva en lugar de eliminarse |
| Subir, Bajar | Cambia su lugar en el orden de búsqueda |
| Eliminar | Quita el directorio; se muestra pero desactivado en `main` |

Añadir un directorio pide sus campos en cuatro pasos, las pestañas de su página. **Detalles** contiene **Activado**, el **Nombre** y una **Descripción**:

| Pestaña | Ajuste | Significado |
|---|---|---|
| Credenciales | Credencial | Obligatorio. Una credencial `ldap` de [Conexiones > Credenciales](../credentials.html), que contiene la conexión, ver más abajo |
| Usuarios | Base de búsqueda | DN donde empieza la búsqueda de usuarios, p. ej. `OU=Users,DC=example,DC=com`. También se buscan los subárboles |
| Usuarios | Atributo de nombre de usuario | Atributo que se compara con el nombre de inicio de sesión: `sAMAccountName` en AD (el predeterminado), `uid` en OpenLDAP |
| Usuarios | Atributo de correo | Atributo que contiene la dirección de correo, normalmente `mail` |
| Usuarios | Dominios de inicio de sesión | Dominios cuyos inicios de sesión `user@domain` van directamente a este directorio, consulta [Varios directorios](#several-directories) |
| Grupos | Atributo de grupos | Atributo de la entrada del usuario que contiene los grupos (`memberOf`, el predeterminado), o `groups` con una búsqueda de grupos |
| Grupos | Base de búsqueda de grupos | DN donde empieza la búsqueda de grupos |
| Grupos | Clase de grupo | objectClass de los grupos, p. ej. `group`, `groupOfNames` o `posixGroup` |
| Grupos | Atributo de miembro de grupo | Atributo de un grupo que lista sus miembros, p. ej. `member`, `uniqueMember` o `memberUid`; predeterminado `member` |
| Grupos | Atributo de Usuario de Miembro de Grupo | Atributo del usuario que contienen esos valores de miembro, p. ej. `dn` o `uid`; predeterminado `dn` |
| Grupos | Filtro de grupo | Expresión regular; solo se conservan los grupos cuyo nombre coincide. Vacío conserva todos los grupos |

Los valores predeterminados de los tres últimos campos de grupo solo se aplican cuando se usa la búsqueda de grupos, consulta la sección siguiente.

La credencial `ldap` contiene cómo se llega al directorio y con qué cuenta se busca:

| Campo | Significado |
|---|---|
| Servidores | Uno por campo, como `host`, `host:port` o `ldaps://host:port`, probados en este orden: cuando no se puede llegar a uno, se prueba el siguiente |
| Puerto | `389` para LDAP sin cifrar, `636` para LDAPS |
| Habilitar TLS | Conectar con LDAPS (`ldaps://`). StartTLS en el puerto 389 no está soportado |
| Ignorar certificados | Omitir la validación del certificado del servidor. Solo se muestra con **Habilitar TLS** |
| Certificado | El certificado de cliente que AnsibleForms presenta a los servidores, en PEM, cuando se comprueban los certificados |
| Paquete CA | El certificado o certificados de CA que firmaron el certificado del servidor, en PEM, cuando se comprueban los certificados |
| DN de usuario de vinculación | El DN de la cuenta de servicio que busca en el directorio |
| Contraseña de usuario de vinculación | Su contraseña, guardada cifrada o leída de un [almacén de secretos](../secret-stores/) |

Solo un admin puede añadir o cambiar una credencial `ldap`, consulta [Quién puede cambiar una credencial](../credentials.html#who-may-change-a-credential).
Hasta la 7.2.0 los servidores, TLS y la cuenta de vinculación eran campos de la configuración LDAP. La actualización a la 7.3.0 los traslada a una credencial,
consulta [Direcciones en las credenciales](../credentials/types.html#addresses-in-credentials):

| El directorio antes de la actualización | Adónde van sus servidores |
|---|---|
| Su propio DN y contraseña de vinculación, sin credencial | Una nueva credencial `ldap` llamada `<directory>-ldap`, como `main-ldap` |
| Una credencial sin servidores | A esa credencial |
| Una credencial que ya contiene otros servidores | Una copia de la credencial llamada `<credential>-<directory>`, que pasa a usar el directorio |

Un nombre ya ocupado recibe `-2`, `-3`, etc. Un directorio de la semilla de configuración se deja como está: la semilla es su dueña.

---

## Grupos

Los grupos vienen de uno de dos sitios, y el **Atributo de grupos** decide cuál se usa:

- **Un atributo de la entrada del usuario**, normalmente `memberOf`. Es la configuración habitual para Active Directory, y para
  OpenLDAP con el overlay `memberof`.
- **Una búsqueda de grupos**, para directorios sin `memberOf`. Solo se ejecuta cuando **Base de búsqueda de grupos** y **Clase de grupo**
  están definidos: AnsibleForms busca entonces grupos de esa clase cuyo **Atributo de miembro de grupo** contenga el
  **Atributo de Usuario de Miembro de Grupo** del usuario, y guarda el resultado en el atributo `groups`. Pon **Atributo de grupos** a `groups`
  para usarla.

{: .note }
> Con **Atributo de grupos** `memberOf`, una búsqueda de grupos configurada se ejecuta pero su resultado no se usa para los roles.

Cada grupo es un DN, y AnsibleForms conserva su primer CN: `CN=AF-Admins,OU=Groups,DC=example,DC=com` pasa a ser `AF-Admins`.
Después se aplica el **Filtro de grupo** a ese nombre, y los grupos que quedan reciben el prefijo `ldap/`: `ldap/AF-Admins`.

En directorios grandes el filtro mantiene pequeños los tokens y los trabajos; una expresión regular no válida conserva todos los grupos y se registra en el log.

---

## Asignación a roles

En config.yaml, un grupo LDAP es `ldap/<group CN>` y un usuario LDAP es `ldap/<username>`, ambos distinguen mayúsculas y minúsculas:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

El nombre de usuario es el valor del **Atributo de nombre de usuario** tal como lo devuelve el directorio, no como lo escribió el usuario.
Consulta [Roles](../config/roles.html) para las opciones de los roles.

---

## Varios directorios

Desde la 7.3.0 puede haber varios directorios, cada uno con sus propios servidores, usuarios y grupos. Sus nombres distinguen a sus miembros:

| Directorio | Nombre de usuario | Grupos | En un rol |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Cualquier otro, como `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Un usuario nombra el directorio al iniciar sesión como `corp\jdoe` o `corp/jdoe`, o inicia sesión con una dirección de un dominio que el directorio
posee. Un nombre de usuario sin directorio se prueba en cada directorio habilitado, en su orden, y lo mismo un nombre como `other\jdoe` cuando ningún
directorio se llama `other`: entonces se busca tal como se escribió.

Decide el primer directorio que conoce al usuario: una contraseña incorrecta allí es la respuesta, y no se prueba el siguiente
directorio, ya que podría contener a otra persona con ese nombre. Un directorio al que no se puede llegar se omite.

El directorio llamado `default` hasta la 7.2.0 se llama `main` desde la 7.3.0: la actualización lo renombra, y una instalación nueva empieza
con `main`. Sus miembros conservan sus nombres cortos, así que los roles que los nombran no necesitan cambios. El directorio `main` no se puede
renombrar, y el nombre de un directorio solo contiene letras, dígitos, `-` y `_`.

---

## Probar la conexión

**Probar conexión** pide un usuario y una contraseña de prueba, e intenta un inicio de sesión con la configuración de la pantalla, guardada o no.
Si sale bien, muestra la entrada del usuario en el directorio, que te indica los nombres exactos de los atributos y los DN de los grupos que debes usar.

Un usuario de prueba que no existe también informa de éxito: la conexión y la cuenta de vinculación funcionan, solo que el usuario no se
encuentra. Errores habituales:

| Mensaje | Causa |
|---|---|
| `Bad server or port (connection failed)` | El nombre de host no se resuelve o no se puede llegar al puerto. |
| `Wrong binding credentials` | El DN o la contraseña de vinculación de la credencial del directorio son incorrectos. |
| `Unable to verify the certificate` | El certificado del servidor no está firmado por el Paquete CA de la credencial. |
| `Certificate is not valid` | El Certificado o el Paquete CA de la credencial no contienen un certificado PEM válido. |

---

## Ejemplo con Active Directory

Este ejemplo se conecta a dos controladores de dominio por LDAPS y conserva solo los grupos cuyo nombre empieza por `AF-`:

| Ajuste | Valor |
|---|---|
| Credencial > Servidores | `dc01.example.com`, y después `dc02.example.com` |
| Credencial > Puerto | `636` |
| Credencial > Habilitar TLS | activado |
| Credencial > Ignorar certificados | desactivado, con un certificado de cliente y la cadena de CA de la CA empresarial |
| Credencial > DN de usuario de vinculación | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Base de búsqueda | `OU=Users,DC=example,DC=com` |
| Atributo de correo | `mail` |
| Atributo de nombre de usuario | `sAMAccountName` |
| Atributo de grupos | `memberOf` |
| Filtro de grupo | `^AF-` |

Los miembros de `CN=AF-Operators,…` coinciden con los roles que usan `ldap/AF-Operators`, e inician sesión como `jdoe` o `jdoe@example.com`.

---

## Ejemplo con OpenLDAP

Este ejemplo usa una búsqueda de grupos sobre entradas `groupOfNames`, así que funciona sin el overlay `memberof`:

| Ajuste | Valor |
|---|---|
| Credencial > Servidores | `ldap.example.com` |
| Credencial > Puerto | `636` |
| Credencial > Habilitar TLS | activado |
| Credencial > DN de usuario de vinculación | `cn=readonly,dc=example,dc=com` |
| Base de búsqueda | `ou=people,dc=example,dc=com` |
| Atributo de correo | `mail` |
| Atributo de nombre de usuario | `uid` |
| Atributo de grupos | `groups` |
| Base de búsqueda de grupos | `ou=groups,dc=example,dc=com` |
| Clase de grupo | `groupOfNames` |
| Atributo de miembro de grupo | `member` |
| Atributo de Usuario de Miembro de Grupo | `dn` |

Un usuario listado en `cn=af-admins,ou=groups,dc=example,dc=com` recibe el grupo `ldap/af-admins`. Para grupos `posixGroup`,
usa **Atributo de miembro de grupo** `memberUid` y **Atributo de Usuario de Miembro de Grupo** `uid`.

Con el overlay `memberof`, deja vacíos los campos de búsqueda de grupos y pon **Atributo de grupos** a `memberOf`.

---

## Errores habituales

La mayoría de los problemas con LDAP se reducen a uno de estos:

- **Un usuario local con el mismo nombre.** Los usuarios locales se comprueban primero, así que nunca se consulta el directorio para ese nombre.
- **Sin grupos, o con grupos equivocados.** El Atributo de grupos debe existir (`groups` con una búsqueda de grupos); `memberOf` no sigue el anidamiento.
- **Nombres de grupo que no coinciden.** Usa `ldap/<CN>` con las mismas mayúsculas y comprueba que el Filtro de grupo conserva el grupo.
- **DN de grupo que no empiezan por un CN.** Solo se usa el primer valor `CN=` como nombre del grupo, así que todo DN de grupo
  debe empezar por `CN=` (o `cn=`).
- **Certificados.** TLS necesita los dos campos de certificado de la credencial y un nombre de servidor que coincida; Ignorar certificados es solo para pruebas.
- **Una configuración que no se puede guardar.** Cuando un directorio viene de la [semilla de configuración](../seed/managed-objects.html), su página
  es de solo lectura: cambia el archivo de la semilla.

Un inicio de sesión fallido muestra un mensaje genérico. El servidor registra el motivo y lo guarda en el registro de auditoría, y para Active
Directory se traduce a partir del código del directorio, p. ej. `Wrong password`, `Account locked` o `Password expired`.
