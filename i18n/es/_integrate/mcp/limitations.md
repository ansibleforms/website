---
layout: default
title: Limitaciones
parent: Servidor MCP
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Limitaciones
{: .no_toc }

Las expresiones se ejecutan en el servidor, y lo que no hace el servidor MCP
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Expresiones runLocal

Las expresiones `runLocal`, los campos `local` / `credential` / `html` y los valores predeterminados `evalDefault` se
evalúan en el servidor, en un contexto V8 separado: sin `process`, `require`, red ni
temporizadores, sin compilar cadenas a código, con un límite de 2 segundos y solo con las funciones
auxiliares que ofrece el navegador (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Esto protege frente a expresiones con errores o que no terminan. No es un sandbox para código hostil,
ni necesita serlo: el código viene de la definición del formulario, nunca de quien llama al MCP,
y cada valor que envía quien llama se sustituye como un literal de JavaScript.

Una expresión que usa una API del navegador (`window`, `document`, `fetch`) no puede ejecutarse aquí y
devuelve `status: error`.

Las expresiones del servidor (sin `runLocal`) pasan por las mismas reglas de
[`EXPRESSION_SANITIZER`](../customization) que para el navegador.

---

## Limitaciones

Algunos formularios y campos aún no se pueden usar a través del servidor MCP:

- **Los formularios Wizard** aún no se pueden lanzar. Sus pasos se pueden resolver con `subform`.
- **Los campos File** no se pueden rellenar; se rechaza un formulario cuyo campo File tenga un valor.
- **Las filas de una lista** (y un campo `yaml` con un subform, que es una de esas filas): cada fila que
  envías, salvo la que lleva el `deleteMarker` de la lista, se resuelve a través de su subform con
  los valores del formulario como `__parent__` y después se valida. Esto incluye las listas anidadas, donde
  `__parent__.__parent__` llega al formulario. Envía filas planas, es decir, los valores en bruto de los campos
  del subform. Las filas que fallan se listan por campo de lista en `rowErrors`
  (`vms[1].disks[0].size (missing)` en el mensaje). Se aceptan como mucho 500 filas por llamada,
  sumando todos los niveles.
- Un enum que se queda en `__auto__` nunca se rellena con su primera opción; quien llama debe elegir.
- Cada petición MCP crea una entrada en el registro de auditoría (acción "Solicitud MCP (agente de IA)"); el
  trabajo en sí se registra a nombre del usuario, como cualquier otro lanzamiento.
