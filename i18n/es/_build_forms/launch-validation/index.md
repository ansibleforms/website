---
layout: default
title: Validación del lanzamiento
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Validación del lanzamiento
{: .no_toc }

Comprueba en el servidor cada lanzamiento de un formulario
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores y autores de formularios: haz que el servidor compruebe cada lanzamiento, sus reglas y sus extravars, lo envíe quien lo envíe.

La comprobación se aplica sea quien sea quien lance el formulario: el navegador, un script que llama a la API REST
o un agente de IA a través del servidor MCP.

---

## Por qué existe

Las reglas de un formulario (`required`, `regex`, `minValue`, `sameAs`, ...) siempre se han comprobado
en el navegador. Después, el navegador envía dos cosas a `POST /api/v2/job`:

- `rawFormData`: los valores de los campos tal como los rellenó el usuario;
- `extravars`: lo que recibe el playbook, construido a partir de esos valores en el navegador.

Sin validación del lanzamiento, el servidor se fía de ambos. Cualquiera con un token válido puede llamar
directamente a ese endpoint y enviar cualquier extravars, sin que se aplique ninguna regex, campo obligatorio
ni regla de lista. Para un formulario que solo se usa en el navegador puede ser aceptable; para un
formulario que otros sistemas lanzan por REST, significa que sus reglas no se aplican en absoluto.

Además, el servidor no tiene forma de distinguir una petición del navegador de una enviada por un
script: ambas usan el mismo endpoint, el mismo token y el mismo cuerpo, y los usuarios pueden modificar
cualquier petición que envíe su propio navegador. Solo se puede confiar en una comprobación hecha en el servidor, y la validación
del lanzamiento es esa comprobación.

---

## Las tres vías de entrada

Cómo se valida un lanzamiento depende de cómo llega y del modo de validación del lanzamiento:

| Lanzado por | Validado | Extravars con las que se ejecuta el trabajo |
|---|---|---|
| **Servidor MCP** (agente de IA) | siempre, en el servidor | siempre las construye el servidor |
| **Navegador** o **API REST**, validación del lanzamiento `off` | solo en el navegador | las que envió el navegador (o quien llama) |
| **Navegador** o **API REST**, validación del lanzamiento `log` | en el servidor, los rechazos solo se registran | las enviadas; las diferencias se registran |
| **Navegador** o **API REST**, validación del lanzamiento `enforce` | en el servidor, se rechaza si no es válido | **las construye el servidor** |

El navegador, el servidor MCP y la validación del lanzamiento usan el mismo código para las reglas (el
motor de formularios compartido): las mismas reglas, en el mismo orden, con los mismos mensajes. Un error que
muestra el navegador lo rechaza el servidor con el mismo texto.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Activarlo](switching-it-on.html) | Para toda la instancia o para un formulario |
| [Registrar e imponer](log-and-enforce.html) | Qué hace cada modo con un lanzamiento que incumple las reglas |
| [Filas de una lista](list-rows-and-subforms.html) | Cómo se validan las filas de los campos de lista |
| [Subida de archivos](file-uploads.html) | Cómo se validan los campos de archivo |
| [Contraseñas](passwords.html) | Cómo se validan los campos de contraseña y cómo se mantienen fuera de las APIs |
| [Relanzar](relaunching.html) | Cómo se valida un trabajo relanzado |
| [Despliegue](rolling-it-out.html) | Llevar una instancia a enforce, y las limitaciones conocidas |
