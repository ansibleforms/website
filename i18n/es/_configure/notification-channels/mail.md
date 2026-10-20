---
layout: default
title: Correo
parent: Canales de notificación
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Correo
{: .no_toc }

Los servidores SMTP, el predeterminado y su inicio de sesión
{: .fs-6 .fw-300 }

Un canal de correo es un servidor SMTP. Puedes tener varios; el marcado como **Predeterminado** es el servidor con el que la aplicación envía su
correo cuando un formulario no nombra ningún canal de correo. El primer canal de correo pasa a ser el predeterminado, y **Usar como predeterminado** lo cambia.

| Paso | Campo | Significado |
|---|---|---|
| Credenciales | Credencial | Obligatorio. Una credencial **smtp** de [Conexiones > Credenciales](../credentials.html): el servidor de correo, su puerto y TLS, y el inicio de sesión. Para un relay sin inicio de sesión, una credencial smtp sin usuario. |
| Remitente | Correo de | La dirección del remitente que ven los destinatarios. |

El interruptor **Predeterminado** de la pestaña **Detalles** de la página de un canal de correo lo convierte en el predeterminado, igual que **Usar como predeterminado**.
Los ajustes de correo de la semilla de configuración se usan mientras ningún canal de correo sea el predeterminado, o mientras el predeterminado esté desactivado.
