---
layout: default
title: Canales de notificación
nav_order: 10
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1756db6ff7b9197f88b34a0c089953a68493e008
---

# Canales de notificación
{: .no_toc }

Envía solicitudes de aprobación y notificaciones de trabajos por correo, a Slack, Microsoft Teams, Telegram o a cualquier webhook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: añade los servidores de correo y los canales de chat a los que los formularios envían sus notificaciones y aprobaciones.

---

## En esta sección

| Página | Qué trata |
|---|---|
| [Correo](notification-channels/mail.html) | Los servidores SMTP, el predeterminado y su inicio de sesión |
| [Slack y Microsoft Teams](notification-channels/slack-and-teams.html) | El webhook de un canal de Slack o de Teams |
| [Telegram](notification-channels/telegram.html) | Un bot que publica en un chat de Telegram |
| [Webhook](notification-channels/webhook.html) | Una petición JSON a cualquier endpoint HTTP |
| [Usar canales en un formulario](notification-channels/in-a-form.html) | Cómo nombrar canales en las notificaciones y aprobaciones |
| [Probar un canal](notification-channels/testing.html) | Enviar prueba, y qué demuestra |


---

## Cómo funciona

Un **canal de notificación** es un destino de las notificaciones, que se añade en **Conexiones > Notificaciones**. Cada canal es
de uno de estos tipos:

| Tipo | Qué envía |
|---|---|
| Correo | Correo a través de un servidor SMTP: solicitudes de aprobación y notificaciones de trabajos. |
| Slack | Un mensaje en un canal de Slack, mediante su webhook entrante, con un botón que lleva al trabajo. |
| Microsoft Teams | Una tarjeta en un canal de Teams, mediante un webhook de Workflows, con un botón que lleva al trabajo. |
| Telegram | Un mensaje de un bot en un chat de Telegram, con un enlace al trabajo. |
| Webhook | Una petición JSON a cualquier endpoint HTTP, construida a partir de una plantilla. |

Un formulario nombra sus canales en sus [notificaciones](forms/notifications.html) y en su [aprobación](forms/approval.html),
con `channels:`. Una notificación que no se puede enviar se escribe en el log; nunca hace fallar el trabajo ni la aprobación.

---

## La página de notificaciones

La página de **Conexiones > Notificaciones** lista todos los canales con estas columnas:

| Columna | Significado |
|---|---|
| Activado | Si se le envían notificaciones, consulta [Usar canales en un formulario](notification-channels/in-a-form.html). |
| Nombre | Cómo lo nombran los formularios en `channels:`. |
| Tipo | Correo, Slack, Microsoft Teams, Telegram o Webhook. El canal de correo predeterminado muestra una etiqueta **Predeterminado** tras su tipo. |
| Descripción | Para qué sirve el canal. |

**Añadir canal de notificación** abre un diálogo: **Canal** (nombre y descripción), **Tipo** y después los pasos del tipo
elegido. El tipo se fija al crear el canal y ya no cambia. Una fila abre la página del canal, con los mismos pasos como
pestañas tras **Detalles**, y **Enviar prueba**, **Eliminar** y **Guardar** arriba a la derecha. El menú de la fila ofrece
**Editar**, **Activar** o **Desactivar** (según corresponda), **Usar como predeterminado** (correo), **Enviar prueba** y **Eliminar**.

La pestaña **Detalles** de la página de un canal contiene el interruptor **Activado**, que se guarda al momento, y para el correo el interruptor
**Predeterminado**, que se guarda con **Guardar**.

Un usuario que abre estas páginas con `showConnectionsSettings` pero sin el rol de administrador no puede elegir una credencial que solo
un administrador puede nombrar, consulta [Quién puede cambiar una credencial](credentials.html#who-may-change-a-credential). Cuando ese usuario cambia
adónde envía un canal (la url de un webhook o su comprobación del certificado, la dirección de la Bot API de Telegram), el canal pierde la
credencial que nombraba, salvo que elija una en el mismo cambio.

Un canal declarado en la [semilla de configuración](seed/) es de solo lectura en esta página, y aun así se puede probar.

