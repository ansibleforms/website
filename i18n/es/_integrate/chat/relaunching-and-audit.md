---
layout: default
title: Relanzamiento y auditoría
parent: Asistente de chat
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Relanzamiento y auditoría
{: .no_toc }

Relanzar desde el chat, el registro de auditoría y las limitaciones
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Relanzar

Una petición como "Vuelve a ejecutar el trabajo 1234" (el usuario debe escribir el ID del trabajo) prepara una vista previa del relanzamiento
con las mismas reglas que el `relaunch_job` del servidor MCP, incluida la regla de las contraseñas de la
[validación del lanzamiento](../launch-validation), y muestra un resumen **Relanzar**; el botón
lo lanza una vez. "Vuelve a ejecutar el trabajo 1234 con el servidor web02" cambia solo ese campo.

---

## Auditoría

Cada lanzamiento desde el chat se registra como **chat.launch** con el usuario, el trabajo, el formulario,
el proveedor y el hash del payload del resumen que se aprobó. Los cambios en los ajustes del chat se
registran como cualquier otro cambio de ajustes.

---

## Limitaciones

El asistente de chat todavía no hace todo lo que hace un navegador:

- Los **formularios Wizard** no pueden participar (`enableForChat` se rechaza en ellos), ni tampoco
  los campos que el asistente no rellena: contraseñas y subidas de archivos.
- Las respuestas llegan de una sola vez; todavía no se admite el streaming.
- El modelo puede malinterpretar una petición. La tarjeta de resumen muestra exactamente lo que se enviará;
  revísala antes de hacer clic en **Lanzar**.
