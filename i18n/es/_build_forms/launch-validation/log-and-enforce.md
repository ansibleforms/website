---
layout: default
title: Registrar e imponer
parent: Validación del lanzamiento
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Registrar e imponer
{: .no_toc }

Qué hace cada modo con un lanzamiento que incumple las reglas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qué hace `log`

Se comprueba cada lanzamiento, pero para el usuario no cambia nada. Se escribe una advertencia en el log cuando:

- el lanzamiento **se rechazaría**, con el motivo (solo nombres de campos y tipos de regla, nunca
  valores):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- las extravars que envió el cliente **difieren** de las que construye el servidor, con las
  claves de primer nivel que difieren:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Ejecuta primero `log` durante un tiempo en una instancia real. Muestra qué formularios se rechazarían y
cuáles calculan valores distintos en el servidor, antes de que afecte a nadie.

---

## Qué hace `enforce`

Con `enforce`, un lanzamiento no válido se rechaza, y uno válido se ejecuta con las extravars que construye
el servidor.

### Un lanzamiento que incumple las reglas se rechaza

`POST /api/v2/job` responde `422` con los campos que fallan:

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing` - campos obligatorios sin valor;
- `invalid` - campos que incumplen una regla, elecciones que no son una de las opciones, y campos
  de lista con una fila que falla;
- `waiting` - campos que no se pudieron evaluar (un campo del que dependen nunca recibió un valor);
- `validationErrors` - por campo, cada regla que falla con el mensaje que muestra el navegador;
- `rowErrors` - por campo de lista, las filas que fallan (consulta [Filas de una lista](list-rows-and-subforms.html));
- `uploads` - campos de archivo cuya subida no se pudo verificar.

Un lanzamiento **sin `rawFormData`** también se rechaza: sus valores no se pueden comprobar.

### Un lanzamiento válido se ejecuta con las extravars del servidor

El trabajo no se ejecuta con las extravars que envió el cliente. El servidor las construye a partir de los
valores comprobados, con el mismo código que el navegador, y ejecuta esas. Quien llama enviando un
`rawFormData` válido junto con unas `extravars` distintas obtiene las extravars que corresponden a los valores, no
las que envió.

De la petición, el servidor conserva `__verbose__` (solo para usuarios a los que se permite el modo detallado). Las
claves reservadas (`__playbook__`, `__inventory__`, ...) vienen del formulario, como siempre, y
`ansibleforms_user` es el usuario que lanza.

### Lo que vio el usuario no siempre es lo que se ejecuta

Construir las extravars significa evaluar de nuevo el formulario: cada expresión y cada consulta se ejecuta
otra vez en el servidor, un momento después de que lo hiciera el navegador, como el usuario que lanza. Un valor
que depende de **cuándo** o **dónde** se evalúa puede diferir, y en ese caso se usa el
valor del servidor:

| Qué | Por qué puede diferir | Cuánto |
|---|---|---|
| `fn.fnTime()`, una marca de tiempo, un nombre construido a partir de la hora | se evalúa de nuevo, unos segundos después | solo importa en el cambio de segundo o de fecha. `fnTime` ya se ejecuta en el servidor también en el flujo del navegador, con la misma zona horaria (el `TZ` del contenedor) |
| una consulta, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, la lectura de un archivo | los datos externos cambiaron entretanto | solo cuando cambiaron |
| una expresión `runLocal` que usa `new Date()`, `toLocaleString`, `Intl` | el navegador usa la zona horaria y el idioma del usuario, el servidor los suyos | solo esas expresiones |

Lo mismo se aplica a la **validación**: una regla que lee un campo así (`notIn` contra el resultado de una
consulta, `validIf` sobre un indicador calculado) se comprueba contra el valor del servidor. Los formularios cuyas
extravars difieren aparecen en las advertencias de `log` descritas arriba; revísalas antes de imponer la validación.
