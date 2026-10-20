---
layout: default
title: Despliegue
parent: Validación del lanzamiento
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Despliegue
{: .no_toc }

Llevar una instancia a enforce, y las limitaciones conocidas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Despliegue

`enforce` es el valor predeterminado. En una instancia con scripts u otros sistemas que lanzan formularios por
REST, llega a él por pasos, vigilando el log antes de rechazar nada:

1. Define `LAUNCH_VALIDATION=log` para toda la instancia (antes de actualizar, en una actualización).
2. Funciona en este modo durante un tiempo y revisa el log: las advertencias `would refuse` indican lanzamientos
   que incumplen las reglas; las advertencias `extravars differ` indican formularios que calculan algo
   de forma distinta en el servidor (una marca de tiempo, datos externos). Decide para cada formulario si eso
   importa.
3. Cambia esos formularios a `launchValidation: enforce`. Quien llama enviando valores no válidos o
   extravars inventadas recibe ahora un `422` con el motivo.
4. Cuando todos los formularios se comporten como esperas, quita `LAUNCH_VALIDATION` (o defínelo como `enforce`) para toda la instancia.

---

## Limitaciones

La validación del lanzamiento todavía no lo cubre todo:

- Los **formularios con asistente** no se pueden relanzar con cambios, y un trabajo de asistente lanzado antes de la 7.0
  no se puede relanzar con `enforce` (no guardaba los valores de sus pasos). El servidor MCP
  no puede lanzar formularios con asistente.
- La **resolución de marcadores** en el navegador sigue usando su propia copia del código del servidor; en
  casos límite poco frecuentes (`__undefined__`, comillas dentro de expresiones) los dos podrían resolver un
  marcador de forma distinta. `log` revela esas diferencias.
- Las expresiones **`runLocal`** se ejecutan en el motor JavaScript del navegador en el navegador y en un
  sandbox en el servidor; el mismo código produce el mismo resultado, salvo cuando depende de
  la zona horaria o el idioma del navegador.

---

## Formularios con asistente

Un [asistente](../forms/wizard.html) se comprueba paso a paso: el navegador envía los valores de
cada paso, y el servidor comprueba cada paso que el usuario enviaría contra su propio subformulario.

- Un paso se omite cuando es `optional` y el usuario lo saltó, o cuando su `when` es false.
- Un paso lee los pasos anteriores mediante `$(__parent__.<step>.<field>)`, con sus valores comprobados.
- Los errores nombran el paso y el campo, como `<step>.<field>`.
- Con `enforce`, las extravars se construyen en el servidor, cada paso bajo su `defaultModel`.
- Los campos de archivo no se admiten en un asistente.
