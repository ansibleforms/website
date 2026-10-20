---
layout: default
title: Contraseñas
parent: Validación del lanzamiento
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Contraseñas
{: .no_toc }

Cómo se validan y se guardan los campos de contraseña, y cómo se mantienen fuera de las APIs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un campo de contraseña se valida como cualquier otro campo. Sin embargo, su valor se queda en el servidor y nunca se devuelve a
un cliente.

---

## Dónde se guarda una contraseña

El servidor guarda la contraseña con el trabajo, en sus extravars:

* Así, una **aprobación** puede continuar el trabajo con la contraseña que introdujo el usuario.
* Un **relanzamiento tal como se ejecutó** puede reproducirla, cuando la validación del lanzamiento no es `enforce`.

La contraseña guardada solo se usa en el servidor.

---

## Qué devuelven las APIs

Ninguna API devuelve nunca una contraseña:

* Un trabajo leído a través de la API REST o del `get_job` del servidor MCP enmascara todos los campos `password` de su formulario, también dentro de
  filas de lista y subformularios YAML.
* `MASK_EXTRAVARS_REGEX` (por defecto `password|secret|token`) enmascara además cada extravar cuyo nombre coincida, para
  secretos que no son campos de contraseña.

---

## Qué recibe un relanzamiento

Para rellenar de antemano un relanzamiento, el navegador recibe los datos de formulario sin procesar del trabajo. Esos datos nunca contienen una contraseña, ni siquiera dentro de
filas de lista o subformularios YAML, así que el usuario vuelve a introducir la contraseña.

Un campo de contraseña que ocultan las dependencias del formulario no es necesario, y no hay que volver a introducirlo.
