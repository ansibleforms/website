---
layout: default
title: Entra ID
parent: Autenticación
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Inicio de sesión único con Microsoft Entra ID (Azure AD), con roles según los grupos de Entra ID del usuario
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cómo funciona

Con un proveedor Entra ID habilitado, la página de inicio de sesión muestra un botón de Entra ID debajo de **Entrar**. Un inicio de sesión sigue estos pasos:

1. El botón envía el navegador a `/api/v2/auth/entraid`, que lo redirige a Microsoft.
2. El usuario inicia sesión en Microsoft, que lo redirige de vuelta a la **URI de redirección** con un código de autorización. El servidor
   intercambia ese código con Microsoft por el ID token y un access token para Microsoft Graph.
3. El servidor lee los grupos del usuario de Microsoft Graph (`/v1.0/me/transitiveMemberOf`), así que los grupos anidados también cuentan.
4. Los grupos se filtran con el **Filtro de grupo** sobre su nombre para mostrar, y cada grupo que se conserva se guarda dos veces,
   como `azuread/<object id>` y como `azuread/<display name>`.

El nombre de usuario es el claim `upn` del token, p. ej. `jdoe@example.com`, o el claim `preferred_username` cuando el token
no tiene `upn`; en una cuenta profesional ambos contienen el mismo valor.

---

## Registrar la aplicación

AnsibleForms necesita un registro de aplicación en el Entra admin center, en **App registrations > New registration**:

1. Dale un nombre, elige **Accounts in this organizational directory only** como tipos de cuenta admitidos y añade un
   URI de redirección de tipo **Web**: `https://af.example.com/api/v2/auth/entraid/callback`.
2. En **Certificates & secrets**, crea un secreto de cliente y copia su valor; solo se muestra una vez.
3. En **API permissions**, añade los permisos **delegated** de Microsoft Graph `User.Read` y `GroupMember.Read.All`,
   y concede el consentimiento de administrador para ellos.
4. En la página **Overview**, anota el **Application (client) ID** y el **Directory (tenant) ID**.

El URI de redirección es la dirección con la que los usuarios llegan a AnsibleForms, seguida de `/api/v2/auth/entraid/callback`.
Con [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms`, pasa a ser
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Debe coincidir exactamente con la **URI de redirección** de la
credencial del proveedor.

Hasta la 7.2.0 la ruta era `/api/v2/auth/azureadoauth2/callback`. Sigue funcionando desde la 7.3.0, así que un registro existente
no necesita cambios; una credencial con la **URI de redirección** vacía usa la ruta nueva, así que en ese caso añádela al registro.

AnsibleForms lee los grupos de Graph y no usa un claim de grupos en el token, así que no hace falta configurar ningún claim de grupos
en el registro.

---

## Añadir el proveedor

Añade el proveedor en **Acceso > SSO**: un asistente pide sus campos en cuatro pasos, con **Microsoft Entra ID** en el paso **Tipo**:

| Paso | Campo | Significado |
|---|---|---|
| Detalles | Nombre, Descripción | Un nombre único para el proveedor y una descripción opcional |
| Tipo | Proveedor | **Microsoft Entra ID**; se fija al crearlo y no cambia |
| Credenciales | Credencial | Una credencial **Microsoft Entra ID** de [Conexiones > Credenciales](../credentials.html), ver más abajo |
| Grupos | Filtro de grupo | Expresión regular; solo se conservan los grupos cuyo nombre para mostrar coincide. Vacío conserva todos los grupos |

La credencial contiene el registro de la aplicación, así que solo un admin puede añadirla o cambiarla:

| Campo | Significado |
|---|---|
| ID de inquilino | Obligatorio. El Directory (tenant) ID, un GUID, o uno de los dominios del inquilino. Solo los usuarios de ese inquilino pueden iniciar sesión |
| ID de cliente | El Application (client) ID |
| Secreto de cliente | El valor del secreto de cliente, guardado cifrado o leído de un [almacén de secretos](../secret-stores/) |
| URI de redirección | Tal como está registrado, p. ej. `https://af.example.com/api/v2/auth/entraid/callback`. Vacío: la URL de la aplicación y la ruta de retorno |

Una credencial con el ID de inquilino vacío se rechaza al guardarla. Los endpoints multiinquilino `common`, `organizations`
y `consumers` se rechazan al guardar el proveedor que usa la credencial, porque permitirían iniciar sesión a usuarios de cualquier
inquilino de Microsoft. Al iniciar sesión, el servidor comprueba además que el token viene del inquilino configurado. Un proveedor
guardado antes sin ID de inquilino no deja entrar a nadie: hasta que se rellena el ID de inquilino, el servidor registra
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Hasta la 7.2.0 el inquilino, el ID de cliente, el secreto y la URL de redirección eran campos del proveedor. La actualización a la 7.3.0 los traslada a una
credencial llamada `<provider>-sso`, consulta [Direcciones en las credenciales](../credentials/types.html#addresses-in-credentials).
Elige una credencial para cada proveedor nuevo: el servidor sigue aceptando un proveedor con su propio ID de cliente y secreto de
antes de la 7.3.0, que inicia sesión con ellos hasta que se elige una credencial.

Solo hay un proveedor Entra ID habilitado a la vez, aquel con el que inicia sesión el botón de Entra ID. **Activar** en el menú de fila de otro,
o su interruptor **Activado**, desactiva los demás de su tipo; la columna **Activado** de la lista muestra cuál está en uso. Un proveedor
también puede saltarse la página de inicio de sesión, consulta [Activar y desactivar el inicio de sesión único](./#switching-single-sign-on). Al guardar se aplica al instante, sin reiniciar.

---

## Asignación a roles

En config.yaml, un grupo de Entra ID es `entraid/<object id>` o `entraid/<display name>`, y un usuario es `entraid/<upn>`.
El object id es único en el inquilino, así que es la opción más segura; un nombre para mostrar es más fácil de leer:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

Hasta la 7.2.0 el prefijo era `azuread/`. En un rol sigue coincidiendo con los mismos miembros desde la 7.3.0 y se elimina en la 8.0; el
editor de roles escribe `entraid/`. Solo los roles aceptan `entraid/`: los grupos del usuario se guardan como `azuread/<object id>` y
`azuread/<display name>`, y así los muestran la página del perfil y la extravar `ansibleforms_user`. Un **Filtro de grupo** como `^AF-` conserva solo los grupos que usan tus roles; consulta [Roles](../config/roles.html). Desde la 7.1.0
el token de inicio de sesión ya no lleva los grupos, así que su tamaño ya no crece con ellos. El filtro sigue siendo importante para
usuarios con muchos grupos: en cada inicio de sesión se comparan menos grupos con los roles, y el
[registro del directorio](../users-and-groups/directory.html) del usuario lista solo los grupos que cuentan. Antes de la 7.1.0,
un usuario con cien grupos o más lo necesita para ver algún formulario, consulta
[Formularios y trabajos vacíos tras un inicio de sesión único](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Endpoint de Microsoft Graph

El servidor inicia la sesión de los usuarios en `https://login.microsoftonline.com` y llama a Microsoft Graph en `https://graph.microsoft.com` por defecto:

| Variable | Qué cambia |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | La autoridad de inicio de sesión, para una nube nacional como `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | El endpoint de Graph del que se leen los grupos, como `https://graph.microsoft.us` |

Ambas reciben un URI base sin barra final y son nuevas en la 7.3.0. `AZURE_AUTHORITY_URI` y `AZURE_GRAPH_URI` se siguen leyendo
cuando no están definidas, con un aviso en el log, y se eliminan en la 8.0. El servidor debe poder llegar a Graph: un inicio de sesión falla cuando no se pueden leer los grupos.

---

## Limitaciones

Los usuarios de Entra ID inician sesión con Microsoft, así que algunas cosas funcionan de forma distinta que con las cuentas locales y LDAP:

- No tienen contraseña en AnsibleForms, así que no pueden cambiarla allí; un [token de API](../profile/api-token.html) se crea desde su sesión.
- Los nombres para mostrar no son únicos en Entra ID: dos grupos con el mismo nombre corresponden al mismo rol. Nombra el grupo por su
  object id en el rol, `entraid/<object id>`, para que coincida solo con ese grupo.
