---
layout: default
title: OIDC
parent: Autenticación
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Inicio de sesión único con un proveedor OpenID Connect como Keycloak, con roles según un claim de grupos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cómo funciona

Con un proveedor OIDC habilitado, la página de inicio de sesión muestra un botón de OpenID debajo de **Entrar**. Un inicio de sesión sigue estos pasos:

1. El botón envía el navegador a `/api/v2/auth/oidc`, que lo redirige al proveedor (flujo de código de autorización
   con PKCE).
2. El usuario inicia sesión en el proveedor, que lo redirige de vuelta a la **URI de redirección**.
3. El servidor intercambia el código por tokens y lee los claims del ID token.
4. El nombre de usuario es el claim `preferred_username`, y cada valor del claim `groups` que pasa el
   **Filtro de grupo** se convierte en un grupo `oidc/<value>`.

AnsibleForms solicita los scopes `openid profile email`; los scopes no son configurables. Cerrar sesión en AnsibleForms
también envía el navegador al endpoint de fin de sesión del proveedor, cuando el proveedor publica uno.

{: .note }
> OIDC se ha probado con Keycloak. Otros proveedores funcionan cuando cumplen los requisitos siguientes.

---

## Requisitos del proveedor

El proveedor debe ofrecer el descubrimiento de OpenID Connect y un cliente confidencial para AnsibleForms:

- **Descubrimiento**: AnsibleForms lee `<issuer>/.well-known/openid-configuration`, así que el emisor debe ser accesible desde
  el servidor de AnsibleForms, por HTTPS.
- **Un cliente confidencial** con el flujo de código de autorización, un ID de cliente y un secreto de cliente.
- **El URI de redirección** `https://af.example.com/api/v2/auth/oidc/callback`, es decir, la dirección con la que los usuarios llegan a
  AnsibleForms seguida de `/api/v2/auth/oidc/callback`. Con [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms`, pasa a ser `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Un claim `groups` en el ID token**, con una lista de nombres de grupo. Sin él, el usuario no recibe grupos OIDC.
- **Un claim `preferred_username`**, que se convierte en el nombre de usuario.

---

## Ejemplo con Keycloak

Este ejemplo usa un realm `example` en `https://keycloak.example.com`; el emisor es entonces
`https://keycloak.example.com/realms/example`. En ese realm:

1. En **Clients**, crea un cliente OpenID Connect con el client ID `ansibleforms`. Activa **Client authentication**,
   mantén **Standard flow** y pon en **Valid redirect URIs** `https://af.example.com/api/v2/auth/oidc/callback`.
2. En la pestaña **Credentials** del cliente, copia el **Client secret**.
3. En la pestaña **Client scopes**, abre `ansibleforms-dedicated` y añade un mapper **By configuration > Group Membership**,
   con **Token Claim Name** `groups`, **Full group path** desactivado y **Add to ID token** activado.

Con **Full group path** activado, el claim contiene rutas como `/af-admins`, y entonces el rol debe usar `oidc//af-admins`.

---

## Añadir el proveedor

Añade el proveedor en **Acceso > SSO**: un asistente pide sus campos en cuatro pasos, con **Open ID** en el paso **Tipo**:

| Paso | Campo | Significado |
|---|---|---|
| Detalles | Nombre, Descripción | Un nombre único para el proveedor y una descripción opcional |
| Tipo | Proveedor | **Open ID**; se fija al crearlo y no cambia |
| Credenciales | Credencial | Una credencial **Open ID** de [Conexiones > Credenciales](../credentials.html), ver más abajo |
| Grupos | Filtro de grupo | Expresión regular; solo se conservan los valores del claim `groups` que coinciden. Vacío conserva todos los grupos |

La credencial contiene el cliente, así que solo un admin puede añadirla o cambiarla:

| Campo | Significado |
|---|---|
| Emisor | Obligatorio. La URL del emisor, p. ej. `https://keycloak.example.com/realms/example` |
| ID de cliente | El ID de cliente en el proveedor, p. ej. `ansibleforms` |
| Secreto de cliente | El secreto de cliente, guardado cifrado o leído de un [almacén de secretos](../secret-stores/) |
| URI de redirección | Tal como está registrado, p. ej. `https://af.example.com/api/v2/auth/oidc/callback`. Vacío: la URL de la aplicación y la ruta de retorno |

Hasta la 7.2.0 el emisor, el ID de cliente, el secreto y la URL de redirección eran campos del proveedor. La actualización a la 7.3.0 los traslada a una
credencial llamada `<provider>-sso`, consulta [Direcciones en las credenciales](../credentials/types.html#addresses-in-credentials).
Elige una credencial para cada proveedor nuevo: el servidor sigue aceptando un proveedor con su propio ID de cliente y secreto de
antes de la 7.3.0, que inicia sesión con ellos hasta que se elige una credencial.

Solo hay un proveedor OIDC habilitado a la vez, aquel con el que inicia sesión el botón de OpenID. **Activar** en el menú de fila de otro,
o su interruptor **Activado**, desactiva los demás de su tipo; la columna **Activado** de la lista muestra cuál está en uso.
Un proveedor también puede saltarse la página de inicio de sesión, consulta [Activar y desactivar el inicio de sesión único](./#switching-single-sign-on).

Guardar el proveedor lo aplica de inmediato. Cuando no se puede llegar al emisor, el servidor registra
`Failed to initialize OIDC strategy` y los inicios de sesión OIDC fallan hasta que se vuelve a guardar el proveedor o se reinicia el servidor.

---

## Asignación a roles

En config.yaml, un grupo OIDC es `oidc/<group>` y un usuario es `oidc/<preferred_username>`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

Los valores se comparan exactamente, incluidas mayúsculas y minúsculas. Consulta [Roles](../config/roles.html) para las opciones de los roles.

---

## Limitaciones

Los usuarios OIDC inician sesión en el proveedor, así que algunas cosas funcionan de forma distinta que con las cuentas locales y LDAP:

- No tienen contraseña en AnsibleForms, así que no pueden cambiarla allí; desde la 7.2.0 un [token de API](../profile/api-token.html)
  se crea desde su sesión.
- Mantén corto el claim `groups`: envía solo los grupos que importan a AnsibleForms, por ejemplo con un client scope dedicado
  o una estructura de grupos en el proveedor, o fíltralos con el **Filtro de grupo**. Desde la 7.1.0 el token de inicio
  de sesión de AnsibleForms ya no lleva los grupos; antes, un usuario con cien grupos o más podía no ver ningún formulario, consulta
  [Formularios y trabajos vacíos tras un inicio de sesión único](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
