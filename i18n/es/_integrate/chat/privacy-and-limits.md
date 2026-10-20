---
layout: default
title: Privacidad y límites
parent: Asistente de chat
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Privacidad y límites
{: .no_toc }

Qué sale de la red, y los límites por usuario
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qué sale de la red

De los formularios que participan, se envía al proveedor lo siguiente:

- los nombres y descripciones de los formularios, las etiquetas de los campos, los textos de ayuda, las opciones y los valores que
  se están rellenando;
- la conversación.

Nunca se envía al proveedor, a la página ni al log lo siguiente:

- las contraseñas (el usuario las introduce en el navegador), las credenciales guardadas y la clave API;
- la salida de un trabajo, ni sus extravars guardadas (el asistente solo lee el estado de un trabajo, y solo
  cuando **Dejar que el asistente siga sus jobs** está activado en los ajustes).

Todo lo que esté bajo una clave que parezca un secreto (`password`, `secret`, `token`, `api_key`, ...)
se enmascara antes de que lo vean el modelo o la página.

Para que los datos de los formularios no salgan de casa, usa tu propio tenant (Azure OpenAI) o un modelo local (Ollama), no una API pública.

---

## Límites

Los siguientes límites se definen en la página de ajustes:

- **Mensajes por conversación** (20): después, el usuario debe empezar una conversación nueva.
- **Rondas de herramientas por mensaje** (6): cuántas veces puede llamar el modelo a una herramienta antes de responder.
- **Tiempo de espera** (60 s): por cada llamada al proveedor.

Los siguientes límites son fijos: un mensaje a la vez por conversación, como máximo 4000 caracteres por mensaje, 60 mensajes por
usuario y hora, y 5 conversaciones por usuario. Una conversación se descarta tras 2 horas sin mensajes.

Una tarjeta de resumen con un botón **Lanzar** se puede usar una vez, y caduca a los 15 minutos: entonces Lanzar responde que el
resumen ha caducado, y el usuario pide al asistente uno nuevo. Las conversaciones y los resúmenes se guardan en memoria, así que tras
un reinicio el usuario debe empezar una conversación nueva.
