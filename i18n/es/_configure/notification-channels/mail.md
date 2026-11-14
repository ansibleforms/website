---
layout: default
title: Correo
parent: Canales de notificación
nav_order: 1
translated_from: 912c390487fa6b9e65cd83eb1e626c18c44f981a
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
| Credenciales | Credencial | Una credencial **smtp** de [Conexiones > Credenciales](../credentials.html) (el servidor de correo, su puerto y TLS, y su inicio de sesión, o **Sin inicio de sesión** para un relay), o una credencial **Microsoft Entra ID** para enviar a través de [Microsoft 365](microsoft-365.html). Obligatoria para un canal nuevo; el paso no pide nada más del servidor. |
| Credenciales | Servidor de correo, Puerto de correo, Usar TLS | No están en el diálogo. Solo en la página de un canal sin credencial, o cuya credencial smtp no tiene servidor, ver más abajo. |
| Credenciales | Enviar a través de | Solo con una credencial Microsoft Entra ID: **Microsoft Graph** (el predeterminado) o **SMTP (OAuth2)**, consulta [Microsoft 365](microsoft-365.html). |
| Remitente | Correo de | La dirección del remitente que ven los destinatarios. Con Microsoft 365, el buzón como el que se envía el correo. |

---

## Un relay sin inicio de sesión

Un servidor de correo que acepta correo sin inicio de sesión (un relay) se puede usar de dos formas, y ambas envían sin autenticación:

- **Una credencial smtp con Sin inicio de sesión** (desde la 7.6.0): solo tiene el **Servidor de correo**, el **Puerto de correo** y **Usar TLS**, sin usuario ni contraseña.
- **Ninguna credencial**: un canal sin ella (de antes, o el relay de la actualización, ver más abajo) conserva en su página su propio **Servidor de correo**, **Puerto de correo** y **Usar TLS**.

Un canal cuya credencial smtp no tiene servidor (creada antes de que las credenciales lo guardaran) también conserva en su página su propio
servidor, puerto y TLS, donde inicia sesión su credencial. Un canal que nombra una credencial con su propio servidor olvida el que tenía antes.

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
