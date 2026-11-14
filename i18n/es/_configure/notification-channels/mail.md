---
layout: default
title: Correo
parent: Canales de notificación
nav_order: 1
translated_from: 8348d14d37bdc4afc9b68869be9fe8021197597e
---

# Correo
{: .no_toc }

Los servidores de correo, el predeterminado y cómo inician sesión
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El canal de correo

Un canal de correo es el servidor a través del cual la aplicación envía su correo: un servidor SMTP, o Microsoft 365 desde la 7.6.0. Puedes tener
varios; el marcado como **Predeterminado** es el servidor con el que la aplicación envía su correo cuando un formulario no nombra ningún canal de correo:

| Paso | Campo | Significado |
|---|---|---|
| Credenciales | Credencial | Una credencial **smtp** de [Conexiones > Credenciales](../credentials.html) (el servidor de correo, su puerto y TLS, y el inicio de sesión), o una credencial **Microsoft Entra ID** para enviar a través de [Microsoft 365](microsoft-365.html). Opcional desde la 7.6.0: sin ninguna, se envía a través del servidor de correo propio del canal, ver más abajo. |
| Credenciales | Servidor de correo, Puerto de correo, Usar TLS | Solo sin credencial: el servidor a través del cual el canal envía sin inicio de sesión (un relay). **Servidor de correo** es entonces obligatorio. |
| Credenciales | Enviar a través de | Solo con una credencial Microsoft Entra ID: **Microsoft Graph** (el predeterminado) o **SMTP (OAuth2)**, consulta [Microsoft 365](microsoft-365.html). |
| Remitente | Correo de | La dirección del remitente que ven los destinatarios. Con Microsoft 365, el buzón como el que se envía el correo. |

---

## Un relay sin inicio de sesión

Un servidor de correo que acepta correo sin inicio de sesión (un relay) se puede usar de dos formas, y ambas envían sin autenticación:

- **Una credencial smtp con solo su servidor**: su **Usuario (opcional)** y su **Contraseña (opcional)** se quedan vacíos.
- **Ninguna credencial** (desde la 7.6.0): el paso **Credenciales** pide el **Servidor de correo**, el **Puerto de correo** y **Usar TLS** propios del canal.

Un canal que nombra una credencial con su propio servidor olvida el servidor que se había escrito antes en el canal.

---

## El canal predeterminado

El primer canal de correo pasa a ser el predeterminado, y **Usar como predeterminado** en el menú de la fila lo cambia a otro. El interruptor
**Predeterminado** de la pestaña **Detalles** de la página de un canal de correo hace lo mismo.

Desde la 7.6.0, la aplicación no envía ningún correo mientras ningún canal de correo sea el predeterminado, o mientras el predeterminado esté
desactivado. Antes, recurría a los ajustes de correo de la página de ajustes o de la semilla de configuración. La actualización a la 7.6.0
convierte esos ajustes en el canal de correo predeterminado `default` cuando todavía no había ningún canal de correo activo: con un inicio de
sesión, nombra una nueva credencial smtp `mail-login`; para un relay, tiene su propio servidor y ninguna credencial. En la
[semilla de configuración](../seed/), declara un canal de correo en `notification_channels:` (consulta [Ejemplo](../seed/example.html)):
las antiguas claves `mail_*` de `settings:` siguen funcionando, pero están obsoletas.
